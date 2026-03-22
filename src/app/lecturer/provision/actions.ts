"use server";

import { prisma } from "@/lib/prisma";
import { sendExamCredentialEmail } from "@/lib/mail";

/**
 * Generates a cryptographically random 6-character alphanumeric PIN.
 */
function generatePin(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pin = "";
  for (let i = 0; i < 6; i++) {
    pin += chars[Math.floor(Math.random() * chars.length)];
  }
  return pin;
}

/**
 * Smart Sync: provisions an exam roster by pulling all students
 * from the Global Registry that match the exam's course level and department.
 */
export async function provisionExamRoster(examId: string): Promise<{
  success?: true;
  count?: number;
  error?: string;
}> {
  if (!examId) return { error: "No exam selected." };

  // ──────────────────────────────────────────────
  // Step A: Fetch the exam and its associated course
  // ──────────────────────────────────────────────
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: {
        include: { department: true },
      },
    },
  });

  if (!exam) return { error: "Exam not found." };
  if (!exam.course) return { error: "This exam has no associated course." };

  const { course } = exam;

  // ──────────────────────────────────────────────
  // Step B: Match students from the Global Registry
  // ──────────────────────────────────────────────
  const students = await prisma.student.findMany({
    where: {
      departmentId: course.departmentId,
      level: course.level,
    },
  });

  if (students.length === 0) {
    return {
      error: `No students found in the global registry for this department and level.`,
    };
  }

  // ──────────────────────────────────────────────
  // Step C: Provision — generate PINs, save tokens, enroll
  // ──────────────────────────────────────────────
  const provisions: { student: typeof students[number]; pin: string }[] = [];
  const expiresAt = new Date(exam.scheduledDate.getTime() + 4 * 60 * 60 * 1000); // 4 h after exam

  for (const student of students) {
    // Idempotency: check if a token already exists for this student + exam
    const existingToken = await prisma.examToken.findFirst({
      where: { examId, matricNumber: student.matricNumber },
    });

    let pin: string;
    if (existingToken) {
      // Already provisioned — reuse the existing PIN for the email dispatch
      pin = existingToken.pin;
    } else {
      // Generate a collision-free unique PIN
      pin = generatePin();
      let attempts = 0;
      while (attempts < 5) {
        const collision = await prisma.examToken.findUnique({ where: { pin } });
        if (!collision) break;
        pin = generatePin();
        attempts++;
      }

      await prisma.examToken.create({
        data: {
          examId,
          matricNumber: student.matricNumber,
          pin,
          expiresAt,
        },
      });
    }

    // Enroll student in the course if not already enrolled
    await prisma.enrollment.upsert({
      where: {
        courseId_studentId: {
          courseId: course.id,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        courseId: course.id,
        studentId: student.id,
      },
    });

    provisions.push({ student, pin });
  }

  // ──────────────────────────────────────────────
  // Step D: Dispatch credential emails
  // ──────────────────────────────────────────────
  await Promise.allSettled(
    provisions.map(({ student, pin }) =>
      sendExamCredentialEmail(
        student.email,
        student.firstName,
        student.matricNumber,
        exam.title,
        pin,
        exam.scheduledDate
      )
    )
  );

  return { success: true, count: provisions.length };
}
