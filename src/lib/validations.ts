import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string().min(1, "Please enter your Email or Staff ID."),
  password: z.string().min(1, "Password cannot be empty.")
});

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  confirmPassword: z.string().min(1, "Please confirm your password.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

// Utility to block XSS payloads from form data directly
export const stripHtml = (text: string) => text.replace(/<[^>]*>?/gm, '');
