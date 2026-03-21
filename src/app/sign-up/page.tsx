"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { signup } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import { signUpSchema } from "@/lib/validations";

gsap.registerPlugin(useGSAP);

export default function SignUpPage() {
  const container = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useGSAP(() => {
    gsap.from(".auth-fade", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.1 });
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const validation = signUpSchema.safeParse({ email, password, confirmPassword });
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.errors.forEach((err: any) => {
        if (err.path[0]) formattedErrors[err.path[0].toString()] = err.message;
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await signup(formData);
      if (response?.error) {
        let hrError = response.error;
        if (hrError.toLowerCase().includes("timeout") || hrError.toLowerCase().includes("fetch failed")) hrError = "Network is slow. Please check your connection and try again.";
        else if (hrError.toLowerCase().includes("already registered") || hrError.toLowerCase().includes("exists")) hrError = "This email is already registered. Please sign in instead.";
        triggerErrorAnim(hrError);
      } else if (response?.success) {
        router.push("/admin");
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
        <h1 className="text-3xl font-black text-[#4A3131] tracking-tight mb-2 text-center">School Admin Registration</h1>
        <p className="text-[#5D6065] text-center mb-8 font-medium">Provision your institution on OpenCBT.</p>

        <div ref={errorRef} className={`mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 text-red-600 border border-red-200 ${error ? 'block' : 'hidden'}`}>
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2" htmlFor="email">Institute Email</label>
            <input id="email" name="email" type="email" required disabled={isSubmitting} className="w-full p-3.5 border-2 border-[#E4D4CC] rounded-xl focus:outline-none focus:border-[#4A3131] transition text-[#4A3131] font-medium disabled:opacity-60" />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1.5 font-bold">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2" htmlFor="password">Administrator Password</label>
            <input id="password" name="password" type="password" required disabled={isSubmitting} className={`w-full p-3.5 border-2 ${fieldErrors.password ? 'border-red-400' : 'border-[#E4D4CC]'} rounded-xl focus:outline-none focus:border-[#4A3131] transition text-[#4A3131] font-medium disabled:opacity-60`} />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1.5 font-bold">{fieldErrors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5D6065] mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required disabled={isSubmitting} className={`w-full p-3.5 border-2 ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-[#E4D4CC]'} rounded-xl focus:outline-none focus:border-[#4A3131] transition text-[#4A3131] font-medium disabled:opacity-60`} />
            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-bold">{fieldErrors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] hover:-translate-y-0.5 transition-all shadow-md active:scale-[0.98] disabled:opacity-80 flex justify-center items-center h-14">
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Deploy Instance"}
          </button>
        </form>

        <p className="mt-8 text-center text-[#5D6065] font-medium text-sm">
          Already registered? <Link href="/sign-in" className="text-[#4A3131] font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
