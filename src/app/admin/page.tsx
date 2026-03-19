"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Users, UserCheck, BookOpen } from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function AdminOverview() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".metric-card", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out"
    });
  }, { scope: container });

  return (
    <div ref={container} className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Admin Overview</h1>
        <p className="text-[#5D6065] text-lg mt-2 font-medium">Monitor your institutional performance and active deployments natively.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#F4EFEA] rounded-2xl flex items-center justify-center mb-4 border border-[#E4D4CC]">
            <Users className="w-8 h-8 text-[#4A3131]" />
          </div>
          <h3 className="text-[#5D6065] font-bold text-sm uppercase tracking-widest mb-1">Total Students</h3>
          <p className="text-4xl font-black text-[#4A3131]">-</p>
        </div>

        <div className="metric-card bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#F4EFEA] rounded-2xl flex items-center justify-center mb-4 border border-[#E4D4CC]">
            <UserCheck className="w-8 h-8 text-[#4A3131]" />
          </div>
          <h3 className="text-[#5D6065] font-bold text-sm uppercase tracking-widest mb-1">Active Faculty</h3>
          <p className="text-4xl font-black text-[#4A3131]">-</p>
        </div>

        <div className="metric-card bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#F4EFEA] rounded-2xl flex items-center justify-center mb-4 border border-[#E4D4CC]">
            <BookOpen className="w-8 h-8 text-[#4A3131]" />
          </div>
          <h3 className="text-[#5D6065] font-bold text-sm uppercase tracking-widest mb-1">Provisioned Courses</h3>
          <p className="text-4xl font-black text-[#4A3131]">-</p>
        </div>
      </div>
    </div>
  );
}
