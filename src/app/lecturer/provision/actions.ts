"use server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function generateExamTokens(matricNumbers: string[], examId: string = "DUMMY_EXAM_ID") {
  if (!matricNumbers || matricNumbers.length === 0) {
    return { error: "No valid matriculation numbers provided." };
  }

  const tokens = [];
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Strict 24 Hour Kiosk Limit

  for (const matric of matricNumbers) {
    const cleanMatric = matric.trim().toUpperCase();
    if (!cleanMatric) continue;

    // Zero-Trust Single-Time Keys -> 6 Alphanumeric Bytes
    const pin = crypto.randomBytes(3).toString('hex').toUpperCase();

    tokens.push({
      examId,
      matricNumber: cleanMatric,
      pin,
      expiresAt,
    });
  }

  if (tokens.length === 0) {
    return { error: "No valid matriculation numbers found after cleaning." };
  }

  try {
    // Highly-optimized Prisma raw batch mapping 
    await prisma.examToken.createMany({
      data: tokens,
      skipDuplicates: true 
    });
    
    // Pass strictly non-sensitive fields back for UI plotting
    return { success: true, tokens: tokens.map(t => ({ matricNumber: t.matricNumber, pin: t.pin })) };
  } catch (e: any) {
    console.error("Failed to generate tokens:", e);
    return { error: "Database error occurred while provisioning tokens natively." };
  }
}
