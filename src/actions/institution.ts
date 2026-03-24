"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createFaculty(data: FormData) {
  const name = data.get("name") as string;
  if (!name) return { success: false, error: "Faculty name is required" };

  try {
    await prisma.faculty.create({
      data: { name },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/lecturers");
    return { success: true, message: "Faculty added successfully!" };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    if (err.code === 'P2002') return { success: false, error: "Faculty already exists" };
    return { success: false, error: "Failed to create Faculty" };
  }
}

export async function deleteFaculty(id: string) {
  try {
    await prisma.faculty.delete({ where: { id } });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/lecturers");
    return { success: true, message: "Faculty deleted successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to delete Faculty" };
  }
}

export async function createDepartment(data: FormData) {
  const name = data.get("name") as string;
  const facultyId = data.get("facultyId") as string;
  
  if (!name || !facultyId) return { success: false, error: "Name and Faculty are required" };

  try {
    await prisma.department.create({
      data: { name, facultyId },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/lecturers");
    return { success: true, message: "Department added successfully!" };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    if (err.code === 'P2002') return { success: false, error: "Department already exists" };
    return { success: false, error: "Failed to create Department" };
  }
}

export async function deleteDepartment(id: string) {
  try {
    await prisma.department.delete({ where: { id } });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/students");
    revalidatePath("/admin/lecturers");
    return { success: true, message: "Department deleted successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to delete Department" };
  }
}

export async function getInstitutionProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };

    const profile = await prisma.institution.findUnique({ where: { adminId: user.id } });
    return { success: true, profile };
  } catch (error) {
    return { success: false, error: "Failed to fetch Institution Profile" };
  }
}

export async function updateInstitutionProfile(data: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const name = data.get("name") as string;
  const ictEmail = data.get("ictEmail") as string;
  const matricMode = data.get("matricMode") as string || "MANUAL";
  const currentAcademicYear = data.get("currentAcademicYear") as string || undefined;
  const currentTerm = data.get("currentTerm") as string || undefined;

  if (!name || !ictEmail) return { success: false, error: "All fields are required" };

  try {
    await prisma.institution.update({
      where: { adminId: user.id },
      data: { name, ictEmail, matricMode, currentAcademicYear, currentTerm }
    });
    revalidatePath("/admin/settings");
    return { success: true, message: "Institution Profile updated!" };
  } catch (error) {
    return { success: false, error: "Failed to update Institution Profile" };
  }
}

