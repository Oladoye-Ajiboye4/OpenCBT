"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, Key, ShieldAlert } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

const navLinks = [
  { href: "/lecturer", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
  { href: "/lecturer/courses", label: "Assigned Courses", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/lecturer/exams", label: "Exams", icon: <FileText className="w-5 h-5" /> },
  { href: "/lecturer/provision", label: "Enrollment & Provisioning", icon: <Key className="w-5 h-5" /> },
  { href: "/lecturer/flags", label: "Proctoring Flags", icon: <ShieldAlert className="w-5 h-5" /> },
];

type Props = {
  name: string;
  staffId: string;
};

export function LecturerNavbar({ name, staffId }: Props) {
  const pathname = usePathname();

  return (
    <header className="h-20 bg-white border-b border-accent flex items-center justify-between px-10 shadow-sm z-10 shrink-0">
      {/* Left: Branding & Identity */}
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-black text-primary tracking-tight">OpenCBT</h1>
        <div className="h-8 w-px bg-accent"></div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Lecturer Portal</span>
          <span className="text-lg font-black text-primary leading-tight">Welcome, {name}</span>
        </div>
      </div>

      {/* Center: Nav Links */}
      <nav className="flex gap-1 items-center">
        {navLinks.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2.5 rounded-xl transition duration-300 font-bold flex items-center gap-2 ${isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-secondary hover:bg-accent/50 hover:text-primary"
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
        <div className="px-3 py-1.5 bg-accent border border-accent rounded-lg">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Staff ID</span>
          <p className="font-mono font-black text-primary text-sm leading-tight">{staffId}</p>
        </div>

        <LogoutButton
          className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/85 transition-all shadow-primary/20 shadow-md flex items-center gap-2 group"
          iconClassName="w-4 h-4 group-hover:-translate-x-1 transition-transform"
        />
      </div>
    </header>
  );
}
