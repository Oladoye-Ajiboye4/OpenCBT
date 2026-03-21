"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { signUpSchema, stripHtml } from "@/lib/validations";

export async function signup(formData: FormData) {
  const institutionName = stripHtml((formData.get("institutionName") as string) || "");
  const email = stripHtml((formData.get("email") as string) || "");
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  const validation = signUpSchema.safeParse({ institutionName, email, password, confirmPassword });
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Validation failed. Please check your inputs." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Failed to create user." };

  // Database Sync
  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: email,
        role: "ADMIN",
      },
    });

    await prisma.institution.upsert({
      where: { id: "global" },
      update: { name: institutionName },
      create: { id: "global", name: institutionName, ictEmail: email },
    });
  } catch (e) {
    console.error("Database User Sync Failed: ", e);
    return { error: "Account created but failed to synchronize with the database." };
  }

  return { success: true };
}
