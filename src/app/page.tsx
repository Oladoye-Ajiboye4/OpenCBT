"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ShieldCheck, Users, WifiOff } from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function HomePage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero elements entrance
    gsap.from(".hero-anim", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.2,
    });
    
    // Feature cards entrance
    gsap.from(".feature-card", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.2,
      delay: 0.6,
    });
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#F4EFEA] font-sans overflow-hidden">
      {/* Navbar Minimal */}
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
        <div className="text-2xl font-black text-[#4A3131] tracking-tighter">OpenCBT</div>
        <div className="flex gap-4">
          <Link href="/sign-in" className="px-5 py-2.5 font-bold text-[#5D6065] hover:text-[#4A3131] transition">Log In</Link>
          <Link href="/sign-up" className="px-5 py-2.5 font-bold bg-[#4A3131] text-white rounded-xl shadow-md hover:bg-[#5a3f3f] transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
           <div className="w-[800px] h-[800px] bg-[#E4D4CC] rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <span className="hero-anim px-4 py-1.5 mb-6 text-sm font-bold bg-[#E4D4CC]/50 text-[#4A3131] border border-[#E4D4CC] rounded-full uppercase tracking-wider">
            Now in Early Access
          </span>
          <h1 className="hero-anim text-5xl md:text-7xl font-black text-[#4A3131] tracking-tight leading-[1.1] mb-6">
            Academic Integrity for the Distance Learning Era.
          </h1>
          <p className="hero-anim text-xl md:text-2xl text-[#5D6065] font-medium max-w-2xl mb-12">
            A secure, multi-tenant CBT platform featuring Google Drive-style course delegation and advanced AI proctoring.
          </p>
          
          <div className="hero-anim flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/sign-up" className="px-8 py-4 bg-[#4A3131] text-white text-lg font-bold rounded-xl shadow-xl shadow-[#4A3131]/20 hover:-translate-y-1 hover:shadow-2xl hover:bg-[#5a3f3f] transition-all duration-300">
              Start Free Trial
            </Link>
            <Link href="/sign-in" className="px-8 py-4 bg-transparent border-2 border-[#E4D4CC] text-[#4A3131] text-lg font-bold rounded-xl hover:bg-[#E4D4CC]/30 hover:border-[#4A3131]/30 transition-all duration-300">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="feature-card bg-[#E4D4CC]/40 border border-[#E4D4CC] p-10 rounded-3xl hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Users className="w-8 h-8 text-[#4A3131]" />
            </div>
            <h3 className="text-2xl font-bold text-[#4A3131] mb-3">Granular Course Delegation</h3>
            <p className="text-[#5D6065] text-lg leading-relaxed font-medium">
              Super Admins can invite Lecturers via email, granting strictly scoped access to specific courses instantly. Avoid monolithic permissions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card bg-[#E4D4CC]/40 border border-[#E4D4CC] p-10 rounded-3xl hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-[#4A3131]" />
            </div>
            <h3 className="text-2xl font-bold text-[#4A3131] mb-3">Real-Time AI Proctoring</h3>
            <p className="text-[#5D6065] text-lg leading-relaxed font-medium">
              Continuously monitor students using face-loss and tab-switch heuristics. Every infraction is securely logged immediately to the automated dashboard.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card bg-[#E4D4CC]/40 border border-[#E4D4CC] p-10 rounded-3xl hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <WifiOff className="w-8 h-8 text-[#4A3131]" />
            </div>
            <h3 className="text-2xl font-bold text-[#4A3131] mb-3">Offline-Resilient Exam Portal</h3>
            <p className="text-[#5D6065] text-lg leading-relaxed font-medium">
              Students experience a highly optimized examination environment that caches critical state to survive brief dropouts in network connectivity gracefully.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
