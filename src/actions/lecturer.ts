"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { sendLecturerWelcomeEmail } from "@/lib/mail";

const lecturerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  staffId: z.string().min(3, "Staff ID must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  departmentId: z.string().min(1, "Department is required")
});

export async function createLecturer(data: FormData) {
  try {
    const rawData = {
      name: data.get("name") as string,
      staffId: data.get("staffId") as string,
      email: data.get("email") as string,
      password: data.get("password") as string,
      departmentId: data.get("departmentId") as string,
    };

    const parsed = lecturerSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues?.[0]?.message || "Validation failed" };
    }

    const { name, staffId, email, password, departmentId } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    let authUserId: string;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (authError) return { error: "Auth Error: " + authError.message };
      authUserId = authData.user.id;
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) return { error: "Auth Error: " + authError.message };
      if (!authData.user) return { error: "Failed to create Auth User" };
      authUserId = authData.user.id;
    }

    await prisma.user.create({
      data: {
        id: authUserId,
        email,
        staffId,
        role: "LECTURER",
        departmentId,
        name
      },
    });

    await sendLecturerWelcomeEmail(email, name, staffId, password);

    revalidatePath("/admin/lecturers");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Lecturer with this Email or Staff ID already exists." };
    return { error: error.message || "Failed to provision Lecturer" };
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

export async function resendLecturerEmail(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.email || !user.staffId) {
      return { error: "Lecturer not found or missing required data." };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseKey) {
      return { error: "SUPABASE_SERVICE_ROLE_KEY is required to reset credentials." };
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    let newPassword = "";
    for (let i = 0; i < 8; i++) newPassword += chars.charAt(Math.floor(Math.random() * chars.length));

    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      password: newPassword,
    });

    if (authError) return { error: "Auth Error: " + authError.message };

    await sendLecturerWelcomeEmail(user.email, user.name || "Faculty Member", user.staffId, newPassword);

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to resend credentials" };
  }
}

