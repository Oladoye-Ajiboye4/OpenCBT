"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { KeyRound, Loader2 } from "lucide-react";
import { updatePassword } from "@/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
      const res = await updatePassword(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Password successfully reset! You can now sign in.");
        setTimeout(() => router.push("/sign-in"), 1500);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={container} className="min-h-screen bg-[#F4EFEA] flex flex-col items-center justify-center p-6 relative font-sans">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-[#E4D4CC] text-center anim-item">
        <div className="w-16 h-16 bg-[#F4EFEA] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#E4D4CC] anim-item">
          <KeyRound className="w-8 h-8 text-[#4A3131]" />
        </div>
        <h1 className="text-3xl font-black text-[#4A3131] mb-2 anim-item">Set New Password</h1>
        <p className="text-[#5D6065] font-medium mb-8 anim-item">
          Create a strong, new password for your account. Make sure it's at least 8 characters long.
        </p>

        <form onSubmit={handleSubmit} className="text-left space-y-5 anim-item">
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2">New Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••" 
              className="w-full p-4 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none transition text-[#4A3131] font-medium bg-[#F9F6F4]" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              required 
              placeholder="••••••••" 
              className="w-full p-4 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none transition text-[#4A3131] font-medium bg-[#F9F6F4]" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 mt-4 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition shadow-md shadow-[#4A3131]/20 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving Password...</> : "Save Password & Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
