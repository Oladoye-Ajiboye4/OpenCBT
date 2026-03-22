"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { login } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function SignInPage() {
  const container = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useGSAP(() => {
    gsap.from(".auth-fade", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.1,
    });
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await login(formData);
      if (response?.error) {
        let hrError = response.error;
        if (hrError.toLowerCase().includes("timeout") || hrError.toLowerCase().includes("fetch failed")) hrError = "Network is slow. Please check your connection and try again.";
        else if (hrError.toLowerCase().includes("invalid login") || hrError.toLowerCase().includes("credentials")) hrError = "The credentials you entered are incorrect.";
        triggerErrorAnim(hrError);
      } else if (response?.success && response?.destination) {
        router.push(response.destination);
      }
    } catch (err) {
      triggerErrorAnim("Network is slow. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerErrorAnim = (msg: string) => {
    setError(msg);
    if (errorRef.current) gsap.fromTo(errorRef.current, { opacity: 0, y: -10, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" });
  };

  return (
    <div ref={container} className="min-h-screen flex items-center justify-center bg-[#F4EFEA] p-6 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-[#4A3131]/5 border border-[#E4D4CC] max-w-md w-full auth-fade">
        <h1 className="text-3xl font-black text-[#4A3131] tracking-tight mb-2 text-center">Faculty Sign In</h1>
        <p className="text-[#5D6065] text-center mb-8 font-medium">Log into your institutional OpenCBT deployment.</p>

        <div ref={errorRef} className={`mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 text-red-600 border border-red-200 ${error ? 'block' : 'hidden'}`}>
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2" htmlFor="identifier">Email (Admin) or Staff ID (Lecturer)</label>
            <input id="identifier" name="identifier" required disabled={isSubmitting} className="w-full p-4 border-2 border-[#E4D4CC] rounded-xl focus:outline-none focus:border-[#4A3131] transition text-[#4A3131] font-bold disabled:opacity-60 placeholder:font-normal placeholder:text-[#8c8e91]" placeholder="e.g. FAC-2023 or email" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required disabled={isSubmitting} className="w-full p-4 border-2 border-[#E4D4CC] rounded-xl focus:outline-none focus:border-[#4A3131] transition text-[#4A3131] font-medium disabled:opacity-60" />
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-sm text-[#4A3131] font-bold hover:underline">Forgot Password?</Link>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] hover:-translate-y-0.5 transition-all shadow-md active:scale-[0.98] disabled:opacity-80 disabled:pointer-events-none flex justify-center items-center h-14">
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authenticate Session"}
          </button>
        </form>

        <p className="mt-8 text-center text-[#5D6065] font-medium text-sm">
          Are you a University Administrator? <Link href="/sign-up" className="text-[#4A3131] font-bold hover:underline">Deploy an Instance</Link>
        </p>
      </div>
    </div>
  );
}
