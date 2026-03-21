"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function resetPasswordForEmail(data: FormData) {
  const email = data.get("email") as string;
  if (!email) return { error: "Email is required" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(data: FormData) {
  const password = data.get("password") as string;
  const confirmPassword = data.get("confirmPassword") as string;

  if (!password || password !== confirmPassword) return { error: "Passwords must match and cannot be empty" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };
  return { success: true };
}
