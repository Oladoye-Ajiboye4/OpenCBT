"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, Key, ShieldAlert, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

const navLinks = [
  { href: "/lecturer", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
  { href: "/lecturer/courses", label: "Assigned Courses", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/lecturer/exams", label: "Exams", icon: <FileText className="w-5 h-5" /> },
  { href: "/lecturer/provision", label: "Kiosk Provisioner", icon: <Key className="w-5 h-5" /> },
  { href: "/lecturer/results", label: "Student Results", icon: <ShieldAlert className="w-5 h-5" /> },
];

type Props = {
  name: string;
  staffId: string;
};

export function LecturerNavbar({ name, staffId }: Props) {
  const pathname = usePathname();

  return (
    <header className="h-20 bg-white border-b border-[#E4D4CC] flex items-center justify-between px-10 shadow-sm z-10 shrink-0">
      {/* Left: Identity */}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#5D6065] uppercase tracking-widest">Lecturer Portal</span>
        <span className="text-lg font-black text-[#4A3131] leading-tight">Welcome, {name}</span>
      </div>

      {/* Center: Nav Links */}
      <nav className="flex gap-1 items-center">
        {navLinks.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2.5 rounded-xl transition duration-300 font-bold flex items-center gap-2 ${
                isActive
                  ? "bg-[#4A3131] text-white shadow-md shadow-[#4A3131]/20"
                  : "text-[#5D6065] hover:bg-[#E4D4CC]/50 hover:text-[#4A3131]"
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right: Staff ID badge + Logout */}
      <div className="flex items-center gap-4">
        <div className="px-3 py-1.5 bg-[#F4EFEA] border border-[#E4D4CC] rounded-lg">
          <span className="text-xs font-bold text-[#5D6065] uppercase tracking-widest">Staff ID</span>
          <p className="font-mono font-black text-[#4A3131] text-sm leading-tight">{staffId}</p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition-all shadow-[#4A3131]/20 shadow-md flex items-center gap-2 group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
