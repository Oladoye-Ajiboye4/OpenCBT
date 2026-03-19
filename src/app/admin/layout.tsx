"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, BookOpen } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#5D6065] flex font-sans">
      {/* Sidebar - Pure White */}
      <aside className="w-64 bg-white border-r border-[#E4D4CC] flex flex-col items-center py-8 shadow-sm shrink-0">
        <h2 className="text-2xl font-black mb-10 text-[#4A3131]">Admin Panel</h2>
        <nav className="flex flex-col gap-3 w-full px-6">
          <Link
            href="/admin"
            className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 font-bold ${
              pathname === "/admin"
                ? "bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20"
                : "text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          <Link
            href="/admin/lecturers"
            className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 font-bold ${
              pathname.startsWith("/admin/lecturers")
                ? "bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20"
                : "text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]"
            }`}
          >
            <UserCheck className="w-5 h-5" />
            Lecturers
          </Link>
          <Link
            href="/admin/students"
            className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 font-bold ${
              pathname.startsWith("/admin/students")
                ? "bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20"
                : "text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]"
            }`}
          >
            <Users className="w-5 h-5" />
            Students
          </Link>
          <Link
            href="/admin/courses"
            className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 font-bold ${
              pathname.startsWith("/admin/courses")
                ? "bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20"
                : "text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Courses
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
