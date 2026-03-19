"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { BookOpen } from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function LecturerCourses() {
  const container = useRef<HTMLDivElement>(null);
  const courses = [
    { id: "1", code: "CSC301", title: "Data Structures", students: 140 },
    { id: "2", code: "CSC305", title: "Operating Systems", students: 110 }
  ];

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  return (
    <div ref={container} className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="anim-item">
        <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Assigned Courses</h1>
        <p className="text-[#5D6065] text-lg mt-2 font-medium">Enterprise registries localized strictly to your faculty deployment matrix.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="anim-item bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] flex flex-col h-max transition hover:shadow-lg hover:shadow-[#4A3131]/5 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-[#F4EFEA] rounded-2xl flex items-center justify-center border border-[#E4D4CC]">
                 <BookOpen className="w-6 h-6 text-[#4A3131]" />
              </div>
              <span className="px-3 py-1.5 bg-[#E4D4CC]/40 text-[#4A3131] rounded-lg font-bold text-xs uppercase tracking-widest">{course.code}</span>
            </div>
            <h2 className="text-2xl font-black text-[#4A3131] mb-2">{course.title}</h2>
            <div className="flex items-center gap-2 mt-auto pt-6 border-t border-[#E4D4CC]/50">
               <span className="text-[#5D6065] font-bold text-sm tracking-wide">{course.students} Enrolled Students</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
