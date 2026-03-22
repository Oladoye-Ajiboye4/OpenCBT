"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { resetPasswordForEmail } from "@/actions/auth";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".anim-item", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    });
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await resetPasswordForEmail(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Check your email for the reset link!");
        e.currentTarget.reset();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={container} className="min-h-screen bg-accent flex flex-col items-center justify-center p-6 relative font-sans">
      <Link href="/sign-in" className="absolute top-8 left-8 flex items-center gap-2 text-secondary hover:text-primary font-bold transition-colors anim-item">
        <ArrowLeft className="w-5 h-5" /> Back to Sign In
      </Link>

      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-accent text-center anim-item">
        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent anim-item">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-primary mb-2 anim-item">Recover Password</h1>
        <p className="text-secondary font-medium mb-8 anim-item">
          Enter your registered email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="text-left space-y-6 anim-item">
          <div>
            <label className="block text-sm font-bold text-secondary mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="e.g. yourname@institution.edu" 
              className="w-full p-4 border-2 border-accent rounded-xl focus:border-primary outline-none transition text-primary font-medium bg-accent" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/85 transition shadow-md shadow-primary/20 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending Link...</> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
