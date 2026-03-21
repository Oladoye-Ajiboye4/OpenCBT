"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, Key, ShieldAlert, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#5D6065] flex flex-col font-sans">
      {/* Header Navbar - Pure White */}
      <header className="h-20 bg-white border-b border-[#E4D4CC] flex items-center justify-between px-10 shadow-sm z-10 shrink-0">
        <h1 className="text-2xl font-black text-[#4A3131]">Lecturer Portal</h1>
        <nav className="flex gap-2">
          <Link
            href="/lecturer"
            className={`px-4 py-2.5 rounded-xl transition duration-300 font-bold flex items-center gap-2 ${
              pathname === '/lecturer'
                ? 'bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20'
                : 'text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Overview
          </Link>
          <Link
            href="/lecturer/courses"
            className={`px-4 py-2.5 rounded-xl transition duration-300 font-bold flex items-center gap-2 ${
              pathname.startsWith('/lecturer/courses')
                ? 'bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20'
                : 'text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]'
            }`}
          >
            <BookOpen className="w-5 h-5" /> Assigned Courses
          </Link>
          <Link
            href="/lecturer/exams"
            className={`px-4 py-2.5 rounded-xl transition duration-300 font-bold flex items-center gap-2 ${
              pathname.startsWith('/lecturer/exams')
                ? 'bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20'
                : 'text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]'
            }`}
          >
            <FileText className="w-5 h-5" /> Exams
          </Link>
          <Link
            href="/lecturer/provision"
            className={`px-4 py-2.5 rounded-xl transition duration-300 font-bold flex items-center gap-2 ${
              pathname.startsWith('/lecturer/provision')
                ? 'bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20'
                : 'text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]'
            }`}
          >
            <Key className="w-5 h-5" /> Kiosk Provisioner
          </Link>
          <Link
            href="/lecturer/results"
            className={`px-4 py-2.5 rounded-xl transition duration-300 font-bold flex items-center gap-2 ${
              pathname.startsWith('/lecturer/results')
                ? 'bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20'
                : 'text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]'
            }`}
          >
            <ShieldAlert className="w-5 h-5" /> Student Results
          </Link>
          <button onClick={handleLogout} className="ml-4 px-5 py-2.5 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition-all shadow-[#4A3131]/20 shadow-md flex items-center gap-2 group">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto relative">
        {children}
      </main>
    </div>
  );
}
