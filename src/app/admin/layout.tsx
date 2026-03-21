"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, BookOpen, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

export default function AdminLayout({
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
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 font-bold ${
              pathname.startsWith("/admin/settings")
                ? "bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20"
                : "text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Settings
          </Link>
        </nav>
        <div className="mt-auto w-full px-6 pt-10 pb-4">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full p-3.5 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition-all shadow-md shadow-[#4A3131]/20 group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
