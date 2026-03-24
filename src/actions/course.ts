"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"

const courseSchema = z.object({
  code: z.string().min(3, "Course code must be at least 3 characters long."),
  title: z.string().min(3, "Course title must be at least 3 characters long."),
  departmentId: z.string().min(1, "Please select a department."),
  level: z.string().min(1, "Please select a level."),
  adminId: z.string().min(1, "Admin ID is required."),
  lecturerId: z.string().optional()
})

export async function getFaculties() {
  return await prisma.faculty.findMany({
    orderBy: { name: "asc" }
  })
}

export async function getDepartments(facultyId?: string) {
  return await prisma.department.findMany({
    where: facultyId ? { facultyId } : undefined,
    orderBy: { name: "asc" }
  })
}

export async function getLecturers(departmentId: string) {
  return await prisma.user.findMany({
    where: { 
      role: "LECTURER",
      departmentId
    },
    select: {
      id: true,
      name: true,
      staffId: true,
      email: true
    },
    orderBy: { name: "asc" }
  })
}

export async function getCourses(filters: { facultyId?: string, departmentId?: string, level?: string }) {
  const { facultyId, departmentId, level } = filters;
  
  if (!facultyId || !departmentId || !level) return [];
  
  return await prisma.course.findMany({
    where: {
      departmentId,
      level,
      department: {
        facultyId
      }
    },
    include: {
      lecturer: true,
      department: true
    },
    orderBy: { code: "asc" }
  })
}

export async function createCourse(data: {
  code: string,
  title: string,
  level: string,
  departmentId: string,
  adminId: string,
  lecturerId?: string | null
}) {
  try {
    const parsed = courseSchema.safeParse({
      ...data,
      lecturerId: data.lecturerId || undefined
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message || "Validation failed" }; 
    }

    const payload = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Smart Level Check
    const codeFirstDigit = payload.code.replace(/[^0-9]/g, "").charAt(0);
    const levelFirstDigit = payload.level.replace(/[^0-9]/g, "").charAt(0);

    // If both digits were found and they don't match
    if (codeFirstDigit && levelFirstDigit && codeFirstDigit !== levelFirstDigit) {
       return { success: false, error: `Level mismatch: A ${codeFirstDigit}00-level course cannot be assigned to ${payload.level}.` };
    }

    const existing = await prisma.course.findUnique({
      where: { code: payload.code.toUpperCase() }
    });

    if (existing) {
      return { success: false, error: "Course Code already exists." };
    }

    await prisma.course.create({
      data: {
        code: payload.code.toUpperCase(),
        title: payload.title,
        level: payload.level,
        departmentId: payload.departmentId,
        lecturerId: payload.lecturerId || null
      }
    });

    revalidatePath("/admin/courses");
    return { success: true, message: "Course created successfully!" };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    if (err?.code === 'P2002') {
       return { success: false, error: "Course Code already exists." };
    }
    console.error("Failed to create course:", error);
    return { success: false, error: "An unexpected database error occurred. Please try again." };
  }
}

export async function bulkUploadCourses(data: {
  courseCode: string,
  courseTitle: string,
  staffId?: string,
  adminId: string,
  departmentId: string,
  level: string
}[]) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const row of data) {
        let finalLecturerId = null;

        if (row.staffId) {
          const lecturer = await tx.user.findUnique({
            where: { staffId: row.staffId }
          });
          if (lecturer && lecturer.role === "LECTURER") {
            finalLecturerId = lecturer.id;
          }
        }

        await tx.course.create({
          data: {
            code: row.courseCode.toUpperCase(),
            title: row.courseTitle,
            departmentId: row.departmentId,
            level: row.level,
            lecturerId: finalLecturerId
          }
        });
      }
    });

    revalidatePath("/admin/courses");
    return { success: true, message: "Bulk upload successful!" };
  } catch (error: unknown) {
    console.error("Bulk upload error:", error);
    const err = error as Record<string, unknown>;
    if (err.code === 'P2002') {
      return { success: false, error: "Upload failed: Duplicate Course Code detected." };
    }
    return { success: false, error: "An error occurred during bulk upload." };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await prisma.course.delete({
      where: { id: courseId }
    });
    revalidatePath("/admin/courses");
    return { success: true, message: "Course deleted successfully!" };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { success: false, error: "An error occurred while deleting." };
  }
}
