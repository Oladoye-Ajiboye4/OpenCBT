"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { signInSchema, stripHtml } from "@/lib/validations";

export async function login(formData: FormData) {
  const identifier = stripHtml((formData.get("identifier") as string) || "");
  const password = (formData.get("password") as string) || "";
  
  const validation = signInSchema.safeParse({ identifier, password });
  if (!validation.success) {
    return { error: "Validation failed on the server. Please check your inputs." };
  }

  let email = identifier;

  // Resolution Engine catching alphanumeric institutional staff formats intrinsically mapping back to generic email pools
  if (!identifier.includes("@")) {
    try {
      const lecturer = await prisma.user.findUnique({
        where: { staffId: identifier }
      });
      if (!lecturer || !lecturer.email) return { error: "Faculty Staff ID not registered." };
      email = lecturer.email;
    } catch (e) {
      console.error("Staff Identity Database resolution failure: ", e);
      return { error: "Internal resolution failed extracting Staff identity mappings." };
    }
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Strict check before any routing
  if (error) {
    return { error: error.message };
  }

  let destination = "/portal"; 
  if (data.user) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: data.user.id }
      });
      if (dbUser?.role === "ADMIN") destination = "/admin";
      else if (dbUser?.role === "LECTURER") destination = "/lecturer";
      else return { error: "Unidentified role grouping prevented internal progression securely." };
    } catch (e) {
      console.error(e);
    }
  }

  return { success: true, destination };
}
