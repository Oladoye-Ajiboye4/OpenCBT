"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStudent(data: FormData) {
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  let matricNumber = data.get("matricNumber") as string;
  const departmentId = data.get("departmentId") as string;
  const level = data.get("level") as string;

  if (!firstName || !lastName || !departmentId || !level) {
    return { error: "Required fields missing" };
  }

  try {
    const institution = await prisma.institution.findUnique({ where: { id: "global" } });
    
    if (institution?.matricMode === "AUTO") {
      const year = new Date().getFullYear();
      const nextSerial = institution.matricSerialTracker + 1;
      matricNumber = `${year}${String(nextSerial).padStart(5, '0')}`;
      
      await prisma.$transaction([
        prisma.student.create({
          data: { firstName, lastName, matricNumber, departmentId, level },
        }),
        prisma.institution.update({
          where: { id: "global" },
          data: { matricSerialTracker: nextSerial }
        })
      ]);
    } else {
      if (!matricNumber) return { error: "Matric Number is required in Manual Mode" };
      await prisma.student.create({
        data: { firstName, lastName, matricNumber, departmentId, level },
      });
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Student with this Matric Number already exists" };
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
