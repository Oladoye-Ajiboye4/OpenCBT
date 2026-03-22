"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createHmac } from "crypto";

// ─── Zod schema ──────────────────────────────────────────────────────────────
const authSchema = z.object({
  matricNumber: z
    .string()
    .min(2, "Matriculation number is required.")
    .transform((v) => v.trim().toUpperCase()),
  pin: z
    .string()
    .length(6, "PIN must be exactly 6 characters.")
    .transform((v) => v.trim().toUpperCase()),
});

// ─── Cookie helpers ───────────────────────────────────────────────────────────
const SESSION_COOKIE = "cbt_session";
const SECRET = process.env.SESSION_SECRET ?? "opencbt-default-secret-change-me";

function signPayload(payload: object): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

// ─── Server Action ────────────────────────────────────────────────────────────
export async function authenticateStudentExam(formData: FormData): Promise<{
  error?: string;
}> {
  // Step 1: Validate inputs with Zod
  const parse = authSchema.safeParse({
    matricNumber: formData.get("matricNumber"),
    pin: formData.get("pin"),
  });

  if (!parse.success) {
    const msg = parse.error.issues[0]?.message ?? "Invalid input.";
    return { error: msg };
  }

  const { matricNumber, pin } = parse.data;

  // Step 2: Look up the ExamToken that strictly matches BOTH matricNumber AND pin
  const token = await prisma.examToken.findFirst({
    where: { matricNumber, pin },
  });

  if (!token) {
    return { error: "Invalid Matriculation Number or Exam PIN." };
  }

  // Step 3: Fetch the linked Exam to check status
  const exam = await prisma.exam.findUnique({
    where: { id: token.examId },
  });

  if (!exam) {
    return { error: "Invalid Matriculation Number or Exam PIN." };
  }

  const questionCountRows = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM "Question"
    WHERE "examId" = ${exam.id}
  `;

  const questionCount = Number(questionCountRows[0]?.count ?? 0);
  if (questionCount < 1) {
    return {
      error: "This examination has not been configured with questions yet. Contact your lecturer.",
    };
  }

  // Step 4: Guard — only UPCOMING/ACTIVE exams can enter the waiting pipeline
  if (exam.status !== "ACTIVE" && exam.status !== "UPCOMING") {
    return {
      error: `This examination is currently ${exam.status}. You cannot enter the hall right now.`,
    };
  }

  // Step 5: Fetch the student record to get the studentId
  const student = await prisma.student.findUnique({
    where: { matricNumber },
    select: { id: true },
  });

  if (!student) {
    return { error: "Student record not found. Please contact your lecturer." };
  }

  // Step 6: Set a signed HMAC HTTP-only cookie with the session payload
  const sessionPayload = { studentId: student.id, examId: exam.id };
  const signed = signPayload(sessionPayload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 4, // 4 hours — matches token expiry window
    path: "/",
  });

  // Step 7: Redirect to waiting room for pre-flight checks and launch gate
  redirect("/portal/waiting-room");
}
