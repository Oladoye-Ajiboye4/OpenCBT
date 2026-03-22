"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Users, UserCheck, BookOpen, AlertCircle } from "lucide-react";

gsap.registerPlugin(useGSAP);

interface AdminOverviewClientProps {
  stats: {
    totalStudents: number;
    activeFaculty: number;
    provisionedCourses: number;
  };
  dbError?: boolean;
  institutionName: string;
}

export function AdminOverviewClient({ stats, dbError, institutionName }: AdminOverviewClientProps) {
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
    <div ref={container} className="max-w-6xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-4xl font-black text-primary tracking-tight">Welcome to {institutionName} Admin Portal</h1>
        <p className="text-secondary text-lg mt-2 font-medium">Monitor your institutional performance and active deployments natively.</p>
      </div>

      {dbError && (
        <div className="metric-card bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-bold">Network error: Unable to load live metrics. Displaying default values.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card bg-white p-8 rounded-3xl shadow-sm border border-accent flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 border border-accent">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-secondary font-bold text-sm uppercase tracking-widest mb-1">Total Students</h3>
          <p className="text-4xl font-black text-primary">{stats.totalStudents}</p>
        </div>

        <div className="metric-card bg-white p-8 rounded-3xl shadow-sm border border-accent flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 border border-accent">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-secondary font-bold text-sm uppercase tracking-widest mb-1">Active Faculty</h3>
          <p className="text-4xl font-black text-primary">{stats.activeFaculty}</p>
        </div>

        <div className="metric-card bg-white p-8 rounded-3xl shadow-sm border border-accent flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 border border-accent">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-secondary font-bold text-sm uppercase tracking-widest mb-1">Provisioned Courses</h3>
          <p className="text-4xl font-black text-primary">{stats.provisionedCourses}</p>
        </div>
      </div>
    </div>
  );
}
