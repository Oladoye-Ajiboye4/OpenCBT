"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { signUpSchema, stripHtml } from "@/lib/validations";

export async function signup(formData: FormData) {
  const email = stripHtml((formData.get("email") as string) || "");
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  const validation = signUpSchema.safeParse({ email, password, confirmPassword });
  if (!validation.success) {
    return { error: "Validation failed on the server. Please check your inputs." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message }; 
  }

  if (!data.user) {
    return { error: "Failed to create user." };
  }

  // Database Sync 
  try {
    await prisma.user.create({
      data: {
        id: data.user.id, 
        email: email,
        role: "ADMIN"  // Extremely hardcoded strict initialization barrier
      }
    });
  } catch (e) {
    console.error("Database User Sync Failed: ", e);
    return { error: "Account created but failed to synchronize with public database." };
  }

  return { success: true };
}
