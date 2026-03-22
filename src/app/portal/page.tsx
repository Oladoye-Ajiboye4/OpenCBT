"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { authenticateStudentExam } from "./actions";
import { Shield, ShieldAlert, Loader2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

gsap.registerPlugin(useGSAP);

export default function ExamPortalLogin() {
  const container = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useGSAP(
    () => {
      gsap.from(".portal-anim", {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
      });
    },
    { scope: container }
  );

  const triggerErrorAnim = (msg: string) => {
    setError(msg);
    if (errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, y: -8, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.7)" }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const toastId = toast.loading("Authenticating...");

    try {
      const response = await authenticateStudentExam(formData);

      // If we get here (no redirect), it means there was an error
      if (response?.error) {
        toast.dismiss(toastId);
        triggerErrorAnim(response.error);
      }
    } catch (err: unknown) {
      // NEXT_REDIRECT is thrown by redirect() — let it propagate naturally
      if (
        err instanceof Error &&
        (err.message === "NEXT_REDIRECT" ||
          (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
      ) {
        toast.success("Identity verified! Launching exam...", { id: toastId });
        return;
      }
      toast.dismiss(toastId);
      triggerErrorAnim(
        "A network error occurred. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={container}
      className="min-h-screen flex items-center justify-center bg-[#F4EFEA] p-6 font-sans relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] bg-[#4A3131] rounded-full blur-[160px] opacity-[0.07]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header above card */}
        <div className="portal-anim text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl border border-[#E4D4CC] shadow-sm mb-4">
            <Shield className="w-8 h-8 text-[#4A3131]" />
          </div>
          <h1 className="text-3xl font-black text-[#4A3131] tracking-tight">
            OpenCBT Student Portal
          </h1>
          <p className="text-[#5D6065] mt-2 font-medium text-base leading-relaxed">
            Enter your credentials to authenticate and launch your examination.
          </p>
        </div>

        {/* Main Card */}
        <div className="portal-anim bg-white rounded-[2rem] shadow-xl shadow-[#4A3131]/8 border border-[#E4D4CC] p-8">
          {/* Error Banner */}
          <div
            ref={errorRef}
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 text-red-700 border border-red-200 transition-all ${
              error ? "block" : "hidden"
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-bold leading-snug">{error}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Matriculation Number */}
            <div>
              <label
                className="block text-xs font-bold text-[#5D6065] mb-2 uppercase tracking-widest"
                htmlFor="matricNumber"
              >
                Matriculation Number
              </label>
              <input
                id="matricNumber"
                name="matricNumber"
                required
                autoComplete="off"
                disabled={isSubmitting}
                placeholder="e.g. 21/CSC/001"
                className="w-full p-4 border-2 border-[#E4D4CC] rounded-xl focus:outline-none focus:border-[#4A3131] transition-colors text-[#4A3131] font-bold text-base disabled:opacity-60 placeholder:text-[#C5B9B3] placeholder:font-normal bg-[#FDFAF8]"
              />
            </div>

            {/* PIN */}
            <div>
              <label
                className="block text-xs font-bold text-[#5D6065] mb-2 uppercase tracking-widest"
                htmlFor="pin"
              >
                Exam PIN
              </label>
              <div className="relative">
                <input
                  id="pin"
                  name="pin"
                  required
                  autoComplete="off"
                  disabled={isSubmitting}
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  className="w-full p-4 pl-12 border-2 border-[#E4D4CC] rounded-xl focus:outline-none focus:border-[#4A3131] transition-colors text-[#4A3131] font-mono font-black text-2xl tracking-[0.4em] uppercase disabled:opacity-60 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal placeholder:text-[#C5B9B3] placeholder:text-base bg-[#FDFAF8]"
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D6065]/50 pointer-events-none" />
              </div>
              <p className="text-xs text-[#5D6065]/70 mt-1.5 font-medium">
                6-character alphanumeric code from your credentials email.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 h-16 bg-[#4A3131] text-white font-black text-lg rounded-xl hover:bg-[#3a2626] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#4A3131]/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Authenticate & Launch Exam"
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="portal-anim text-center text-xs text-[#5D6065]/60 font-medium mt-6">
          Your credentials were sent to your institution email. Contact your
          lecturer if you did not receive them.
        </p>
      </div>
    </div>
  );
}
