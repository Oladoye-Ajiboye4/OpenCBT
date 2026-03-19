"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { verifyExamToken } from "./actions";
import { Shield, ShieldAlert, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(useGSAP);

export default function ExamPortalLogin() {
  const container = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useGSAP(() => {
    gsap.from(".portal-anim", {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.15,
    });
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await verifyExamToken(formData);
      
      if (response?.error) {
        triggerErrorAnim(response.error);
      } else if (response?.success) {
        router.push("/exam/active");
      }
    } catch (err) {
      triggerErrorAnim("Network is slow. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerErrorAnim = (msg: string) => {
    setError(msg);
    if (errorRef.current) {
      gsap.fromTo(errorRef.current, 
        { opacity: 0, y: -10, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
      );
    }
  };

  return (
    <div ref={container} className="min-h-screen flex items-center justify-center bg-[#F4EFEA] p-6 font-sans relative overflow-hidden">
      {/* Decorative Background Shadow Blur */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.15]">
           <div className="w-[600px] h-[600px] bg-[#4A3131] rounded-full blur-[120px]"></div>
      </div>

      <div className="portal-anim relative z-10 bg-white p-12 rounded-[2rem] shadow-2xl shadow-[#4A3131]/10 border border-[#E4D4CC] max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#F4EFEA] rounded-2xl flex items-center justify-center border border-[#E4D4CC] shadow-sm">
             <Shield className="w-8 h-8 text-[#4A3131]" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-[#4A3131] tracking-tight mb-2 text-center">Secure Exam Portal</h1>
        <p className="text-[#5D6065] text-center mb-10 font-medium leading-relaxed">Enter your designated One-Time PIN to securely authenticate and begin your examination.</p>

        <div 
          ref={errorRef} 
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 text-red-600 border border-red-200 ${error ? 'block' : 'hidden'}`}
        >
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2 uppercase tracking-wider" htmlFor="matricNumber">Matriculation Number</label>
            <input 
              id="matricNumber" 
              name="matricNumber" 
              required 
              disabled={isSubmitting} 
              placeholder="e.g. CBT-2026-X"
              className="w-full p-4 border-2 border-[#E4D4CC] rounded-xl focus:outline-none focus:border-[#4A3131] transition text-[#4A3131] font-bold text-lg disabled:opacity-60 placeholder:text-[#E4D4CC] placeholder:font-medium" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2 uppercase tracking-wider" htmlFor="pin">Exam PIN</label>
            <input 
              id="pin" 
              name="pin" 
              required 
              disabled={isSubmitting} 
              placeholder="6-Digit Alphanumeric"
              className="w-full p-4 border-2 border-[#E4D4CC] rounded-xl focus:outline-none focus:border-[#4A3131] transition text-[#4A3131] font-mono font-bold text-xl tracking-widest uppercase disabled:opacity-60 placeholder:text-[#E4D4CC] placeholder:tracking-normal placeholder:font-sans placeholder:font-medium" 
              maxLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 mt-4 bg-[#4A3131] text-white font-bold text-lg rounded-xl hover:bg-[#5a3f3f] hover:-translate-y-1 transition-all shadow-xl shadow-[#4A3131]/20 active:scale-[0.98] disabled:opacity-80 disabled:pointer-events-none flex justify-center items-center h-16"
          >
            {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : "Verify Identity & Start"}
          </button>
        </form>
      </div>
    </div>
  );
}
