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
    return { success: false, error: parsed.error.issues[0].message || "Validation failed" };
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
          data: { firstName, lastName, email, matricNumber, departmentId, level, id: Date.now().toString() },
        }),
        prisma.institution.update({
          where: { id: institution.id },
          data: { matricSerialTracker: nextSerial }
        })
      ]);
    } else {
      if (!matricNumber) return { success: false, error: "Matric Number is required in Manual Mode" };
      await prisma.student.create({
        data: { firstName, lastName, email, matricNumber, departmentId, level, id: Date.now().toString() },
      });
    }

    revalidatePath("/admin/students");
    return { success: true, message: "Student created successfully!" };
  } catch (error: unknown) {
    console.error("Student Creation Error:", error);
    const err = error as Record<string, unknown>;
    if (err.code === 'P2002') return { success: false, error: "Student with this Matric Number or Email already exists" };
    return { success: false, error: "Failed to create Student" };
  }
}

// Update and delete will go here too
export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete({ where: { id } });
    revalidatePath("/admin/students");
    return { success: true, message: "Student deleted successfully." };
  } catch (error) {
    return { success: false, error: "Failed to delete Student" };
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
    return { success: true, message: "Student updated successfully!" };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    if (err.code === 'P2002') return { success: false, error: "Matric Number already in use" };
    return { success: false, error: "Failed to update Student" };
  }
}

export async function getStudents({ departmentId, level }: { departmentId: string, level: string }) {
  try {
    const students = await prisma.student.findMany({
      where: { departmentId, level },
      include: { department: true },
      orderBy: { lastName: 'asc' }
    });
    return { success: true, students };
  } catch (error) {
    return { success: false, error: "Failed to fetch Students" };
  }
}

export async function uploadStudentsCSV(records: Array<Record<string, unknown>>, departmentId: string, level: string) {
  if (!departmentId || !level || !records || records.length === 0) {
    return { success: false, error: "Invalid data or missing selections" };
  }

  try {
    const institution = await prisma.institution.findUnique({ where: { id: "global" } });
    const isAuto = institution?.matricMode === "AUTO";
    let currentSerial = institution?.matricSerialTracker || 0;
    const year = new Date().getFullYear();

    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        const firstName = record.firstName as string;
        const lastName = record.lastName as string;
        if (!firstName || !lastName) {
          throw new Error("CSV missing required columns");
        }

        let matricNumber = record.matricNumber as string | undefined;
        if (isAuto) {
          currentSerial++;
          matricNumber = `${year}${String(currentSerial).padStart(5, '0')}`;
        } else if (!matricNumber) {
          throw new Error("Matric Number missing in Manual Mode");
        }

        await tx.student.create({
          data: {
            firstName,
            lastName,
            matricNumber: matricNumber || `${year}${String(currentSerial).padStart(5, '0')}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.local`,
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
    return { success: true, message: "CSV Uploaded successfully!" };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    if (err.code === 'P2002') {
      return { success: false, error: "Upload failed: Duplicate Matric Number detected." };
    }
    return { success: false, error: (err as any)?.message || "Failed to bulk upload students" };
  }
}
