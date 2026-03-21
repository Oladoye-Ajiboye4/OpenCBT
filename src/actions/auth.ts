"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// Assumes supabase client setup or we can just use the standard setup if it exists
// Let's create a minimal supabase admin client if no central one exists
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function logout() {
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function resetPasswordForEmail(data: FormData) {
  const email = data.get("email") as string;
  if (!email) return { error: "Email is required" };
  
  // Actually, we probably should be using the server-side auth helper if they have it, but standard JS client works for public endpoints
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/reset-password",
  });
  
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(data: FormData) {
  const password = data.get("password") as string;
  const confirmPassword = data.get("confirmPassword") as string;
  
  if (!password || password !== confirmPassword) return { error: "Passwords must match and cannot be empty" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };

  const { error } = await supabase.auth.updateUser({ password });
  
  if (error) return { error: error.message };
  return { success: true };
}
