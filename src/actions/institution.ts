"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    const profile = await prisma.institution.findUnique({ where: { adminId: user.id } });
    return { profile };
  } catch (error) {
    return { error: "Failed to fetch Institution Profile" };
  }
}

export async function updateInstitutionProfile(data: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const name = data.get("name") as string;
  const ictEmail = data.get("ictEmail") as string;
  const matricMode = data.get("matricMode") as string || "MANUAL";
  const currentAcademicYear = data.get("currentAcademicYear") as string || undefined;
  const currentTerm = data.get("currentTerm") as string || undefined;

  if (!name || !ictEmail) return { error: "All fields are required" };

  try {
    await prisma.institution.update({
      where: { adminId: user.id },
      data: { name, ictEmail, matricMode, currentAcademicYear, currentTerm }
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update Institution Profile" };
  }
}

