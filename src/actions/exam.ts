"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExam(data: FormData) {
  const title = data.get("title") as string;
  const courseId = data.get("courseId") as string;
  const duration = parseInt(data.get("duration") as string, 10);
  const scheduledDateStr = data.get("scheduledDate") as string;
  
  if (!title || !courseId || isNaN(duration) || !scheduledDateStr) {
    return { error: "Invalid inputs." };
  }

  try {
    const exam = await prisma.exam.create({
      data: {
        title,
        courseId,
        duration,
        scheduledDate: new Date(scheduledDateStr)
      }
    });
    revalidatePath("/lecturer/exams");
    revalidatePath("/lecturer/courses");
    return { success: true, exam };
  } catch(e) {
    return { error: "Failed to create exam" };
  }
}

export async function updateExamStatus(id: string, status: string) {
    try {
        await prisma.exam.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/lecturer/exams");
        return { success: true };
    } catch(e) {
        return { error: "Failed to update exam status" };
    }
}
