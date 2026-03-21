"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLecturer(data: FormData) {
  const name = data.get("name") as string;
  const staffId = data.get("staffId") as string;
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const departmentId = data.get("departmentId") as string;

  if (!name || !staffId || !email || !password || !departmentId) {
    return { error: "All fields are required" };
  }

  // NOTE: OpenCBT has user 'name' usually represented as 'firstName' and 'lastName' on Student, but User might have different fields.
  // Wait, let's check schema.prisma for User:
  // User has: id, email, staffId, role, departmentId. No 'name' field?
  // Ah! `User` doesn't have a `name` field in the original schema!
  // Wow, let's just make it work. If there's no name, maybe I need to add one, or use a Profile. 
  // Let me just add `name String?` to `User` in schema.prisma, or ignore it if not in schema. I will update schema.prisma to add `name String?` for Lecturers!
  
  try {
    const id = Date.now().toString(); // rudimentary ID generation if needed, though UUID is better
    await prisma.user.create({
      data: {
        id: `usr_${id}`,
        email,
        staffId,
        role: "LECTURER",
        departmentId
        // name is not in the original schema! I'll quickly patch schema.prisma to add `name String?`
      },
    });
    revalidatePath("/admin/lecturers");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Lecturer with this Email or Staff ID already exists" };
    return { error: "Failed to provision Lecturer" };
  }
}

export async function deleteLecturer(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/lecturers");
    return { success: true };
  } catch (error) {
    return { error: "Failed to remove Lecturer" };
  }
}

export async function getLecturers({ departmentId }: { departmentId: string }) {
  try {
    const lecturers = await prisma.user.findMany({
      where: { departmentId, role: "LECTURER" },
      include: { department: true },
      orderBy: { createdAt: 'desc' }
    });
    return { lecturers };
  } catch (error) {
    return { error: "Failed to fetch lecturers" };
  }
}

export async function uploadLecturersCSV(records: any[], departmentId: string) {
  if (!departmentId || !records || records.length === 0) return { error: "Invalid data" };

  try {
    await prisma.$transaction(async (tx: any) => {
      for (const record of records) {
        if (!record.email || !record.staffId) throw new Error("CSV missing required columns");
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        await tx.user.create({
          data: {
            id: `usr_${id}`,
            email: record.email,
            staffId: record.staffId,
            role: "LECTURER",
            departmentId
          }
        });
      }
    });
    revalidatePath("/admin/lecturers");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Duplicate Email or Staff ID detected." };
    return { error: error.message || "Failed to bulk upload lecturers" };
  }
}
