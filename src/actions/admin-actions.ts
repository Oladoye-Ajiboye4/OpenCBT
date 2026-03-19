"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignLecturerToCourse(courseId: string, email: string) {
  try {
    // Check if the lecturer user exists with that email and role
    const lecturer = await prisma.user.findUnique({
      where: { email },
    });

    if (!lecturer) {
      return { success: false, message: "User with this email not found." };
    }

    if (lecturer.role !== "LECTURER") {
      return { success: false, message: "User is not a lecturer." };
    }

    // Upsert or create CourseLecturer assignment
    // (Using create since unique constraint is on courseId, lecturerId)
    // Wait, check if assignment already exists
    const existing = await prisma.courseLecturer.findUnique({
      where: {
        courseId_lecturerId: {
          courseId,
          lecturerId: lecturer.id,
        },
      },
    });

    if (existing) {
      return { success: false, message: "Lecturer is already assigned to this course." };
    }

    await prisma.courseLecturer.create({
      data: {
        courseId,
        lecturerId: lecturer.id,
      },
    });

    revalidatePath("/admin");
    return { success: true, message: "Lecturer successfully assigned to course!" };
  } catch (error) {
    console.error("Failed to assign lecturer:", error);
    return { success: false, message: "An error occurred while assigning the lecturer." };
  }
}
