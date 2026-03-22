"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { z } from "zod";

const createStudentSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  departmentId: z.string().min(1, "Department is required"),
  level: z.string().min(1, "Level is required"),
});

export async function createStudent(data: FormData) {
  const parsed = createStudentSchema.safeParse({
    firstName: data.get("firstName"),
    lastName: data.get("lastName"),
    email: data.get("email"),
    departmentId: data.get("departmentId"),
    level: data.get("level"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { firstName, lastName, email, departmentId, level } = parsed.data;
  let matricNumber = data.get("matricNumber") as string;

  try {
    // Note: Assuming Admin ID or Global ID based on new schema fixes, we should fetch institution robustly
    const user = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!user) throw new Error("No Admin found for system parameters");

    const institution = await prisma.institution.findUnique({ where: { adminId: user.id } }) || await prisma.institution.findFirst();

    if (institution?.matricMode === "AUTO") {
      const year = new Date().getFullYear();
      const nextSerial = institution.matricSerialTracker + 1;
      matricNumber = `${year}${String(nextSerial).padStart(5, '0')}`;

      await prisma.$transaction([
        prisma.student.create({
          data: { firstName, lastName, email, matricNumber, departmentId, level, id: Date.now().toString() }, // Ensure dummy ID or let Supabase auth insert ID. For admin inserts, if no auth is hooked, we need a unique ID.
        }),
        prisma.institution.update({
          where: { id: institution.id },
          data: { matricSerialTracker: nextSerial }
        })
      ]);
    } else {
      if (!matricNumber) return { error: "Matric Number is required in Manual Mode" };
      await prisma.student.create({
        data: { firstName, lastName, email, matricNumber, departmentId, level, id: Date.now().toString() },
      });
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: any) {
    console.error("Student Creation Error:", error);
    if (error.code === 'P2002') return { error: "Student with this Matric Number or Email already exists" };
    return { error: "Failed to create Student" };
  }
}

// Update and delete will go here too
export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete({ where: { id } });
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete Student" };
  }
}

export async function updateStudent(id: string, data: FormData) {
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const matricNumber = data.get("matricNumber") as string;

  try {
    await prisma.student.update({
      where: { id },
      data: { firstName, lastName, matricNumber },
    });
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Matric Number already in use" };
    return { error: "Failed to update Student" };
  }
}

export async function getStudents({ departmentId, level }: { departmentId: string, level: string }) {
  try {
    const students = await prisma.student.findMany({
      where: { departmentId, level },
      include: { department: true },
      orderBy: { lastName: 'asc' }
    });
    return { students };
  } catch (error) {
    return { error: "Failed to fetch students" };
  }
}

export async function uploadStudentsCSV(records: any[], departmentId: string, level: string) {
  if (!departmentId || !level || !records || records.length === 0) {
    return { error: "Invalid data or missing selections" };
  }

  try {
    const institution = await prisma.institution.findUnique({ where: { id: "global" } });
    const isAuto = institution?.matricMode === "AUTO";
    let currentSerial = institution?.matricSerialTracker || 0;
    const year = new Date().getFullYear();

    await prisma.$transaction(async (tx: any) => {
      for (const record of records) {
        if (!record.firstName || !record.lastName) {
          throw new Error("CSV missing required columns");
        }

        let matricNumber = record.matricNumber;
        if (isAuto) {
          currentSerial++;
          matricNumber = `${year}${String(currentSerial).padStart(5, '0')}`;
        } else if (!matricNumber) {
          throw new Error("Matric Number missing in Manual Mode");
        }

        await tx.student.create({
          data: {
            firstName: record.firstName,
            lastName: record.lastName,
            matricNumber,
            departmentId,
            level
          }
        });
      }

      if (isAuto) {
        await tx.institution.update({
          where: { id: "global" },
          data: { matricSerialTracker: currentSerial }
        });
      }
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Upload failed: Duplicate Matric Number detected." };
    }
    return { error: error.message || "Failed to bulk upload students" };
  }
}
