"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFaculty(data: FormData) {
  const name = data.get("name") as string;
  if (!name) return { error: "Faculty name is required" };

  try {
    await prisma.faculty.create({
      data: { name },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/lecturers");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Faculty already exists" };
    return { error: "Failed to create Faculty" };
  }
}

export async function deleteFaculty(id: string) {
  try {
    await prisma.faculty.delete({ where: { id } });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/lecturers");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete Faculty" };
  }
}

export async function createDepartment(data: FormData) {
  const name = data.get("name") as string;
  const facultyId = data.get("facultyId") as string;
  
  if (!name || !facultyId) return { error: "Name and Faculty are required" };

  try {
    await prisma.department.create({
      data: { name, facultyId },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/lecturers");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Department already exists" };
    return { error: "Failed to create Department" };
  }
}

export async function deleteDepartment(id: string) {
  try {
    await prisma.department.delete({ where: { id } });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/lecturers");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete Department" };
  }
}

export async function getInstitutionProfile() {
  try {
    let profile = await prisma.institution.findUnique({ where: { id: "global" } });
    if (!profile) {
      profile = await prisma.institution.create({
        data: { id: "global", name: "Institution Name", ictEmail: "admin@institution.edu" }
      });
    }
    return { profile };
  } catch (error) {
    return { error: "Failed to fetch Institution Profile" };
  }
}

export async function updateInstitutionProfile(data: FormData) {
  const name = data.get("name") as string;
  const ictEmail = data.get("ictEmail") as string;
  const matricMode = data.get("matricMode") as string || "MANUAL";

  if (!name || !ictEmail) return { error: "All fields are required" };

  try {
    await prisma.institution.upsert({
      where: { id: "global" },
      update: { name, ictEmail, matricMode },
      create: { id: "global", name, ictEmail, matricMode }
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update Institution Profile" };
  }
}

