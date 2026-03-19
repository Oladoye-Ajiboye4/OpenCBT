"use server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function verifyExamToken(formData: FormData) {
  const matricNumber = formData.get("matricNumber") as string;
  const pin = formData.get("pin") as string;

  if (!matricNumber || !pin) {
    return { error: "Both Matriculation Number and PIN are required." };
  }

  const cleanMatric = matricNumber.trim().toUpperCase();
  const cleanPin = pin.trim().toUpperCase();

  try {
    const token = await prisma.examToken.findUnique({
      where: { pin: cleanPin }
    });

    if (!token || token.matricNumber !== cleanMatric) {
      return { error: "Invalid, used, or expired credentials." };
    }

    if (token.isUsed) {
      return { error: "Invalid, used, or expired credentials." };
    }

    if (new Date() > token.expiresAt) {
      return { error: "Invalid, used, or expired credentials." };
    }

    // Success Check! Generate secure session tracking wrapper
    const cookieStore = await cookies();
    cookieStore.set('active_exam_session', token.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    // Mark Token as actively verified to prevent distributed parallel logins on different machines natively
    await prisma.examToken.update({
      where: { id: token.id },
      data: { isUsed: true }
    });

    return { success: true };
  } catch (error) {
    console.error("Token Verification Error:", error);
    return { error: "System error occurred during verification." };
  }
}
