import Link from "next/link";
import { LayoutDashboard, Users, UserCheck, BookOpen, Settings, ClipboardCheck } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const navLinks = [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { href: "/admin/lecturers", label: "Lecturers", icon: <UserCheck className="w-5 h-5" /> },
    { href: "/admin/students", label: "Students", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/courses", label: "Courses", icon: <BookOpen className="w-5 h-5" /> },
    { href: "/admin/results", label: "Results", icon: <ClipboardCheck className="w-5 h-5" /> },
    { href: "/admin/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-accent text-secondary flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-accent flex flex-col items-center py-8 shadow-sm shrink-0">
        <div className="w-full px-6 mb-10 text-center">
          <h1 className="text-3xl font-black text-primary tracking-tight">OpenCBT</h1>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-3 w-full px-6">
          {navLinks.map(({ href, label, icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 font-bold ${isActive
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

        <div className="mt-auto w-full px-6 pt-10 pb-4">
          <LogoutButton
            className="flex items-center justify-center gap-3 w-full p-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/85 transition-all shadow-md shadow-primary/20 group"
            iconClassName="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
