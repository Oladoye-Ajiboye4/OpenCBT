import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookOpen, FileText, ShieldAlert } from "lucide-react";

export default async function LecturerOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const lecturer = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, name: true },
  });

  if (!lecturer) redirect("/sign-in");

  const [totalCourses, activeExams] = await Promise.all([
    prisma.course.count({ where: { lecturerId: lecturer.id } }),
    prisma.exam.count({
      where: {
        course: { lecturerId: lecturer.id },
        status: "ACTIVE"
      }
    }),
  ]);

  const metrics = [
    {
      label: "My Courses",
      value: totalCourses,
      icon: <BookOpen className="w-8 h-8 text-[#4A3131]" />,
      bg: "bg-[#F4EFEA]",
      border: "border-[#E4D4CC]",
      color: "text-[#4A3131]",
      labelColor: "text-[#5D6065]",
    },
    {
      label: "Active Exams",
      value: activeExams,
      icon: <FileText className="w-8 h-8 text-[#4A3131]" />,
      bg: "bg-[#F4EFEA]",
      border: "border-[#E4D4CC]",
      color: "text-[#4A3131]",
      labelColor: "text-[#5D6065]",
    },
    {
      label: "Unresolved Flags",
      value: 0,
      icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
      bg: "bg-red-50",
      border: "border-red-100",
      color: "text-red-600",
      labelColor: "text-red-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">
          Welcome, {lecturer.name || "Lecturer"}
        </h1>
        <p className="text-[#5D6065] text-lg mt-2 font-medium">
          Monitor your assigned courses, active provisions, and AI proctoring anomalies seamlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] flex flex-col items-center text-center hover:shadow-md transition`}
          >
            <div className={`w-16 h-16 ${m.bg} rounded-2xl flex items-center justify-center mb-4 border ${m.border}`}>
              {m.icon}
            </div>
            <h3 className={`${m.labelColor} font-bold text-sm uppercase tracking-widest mb-1`}>{m.label}</h3>
            <p className={`text-4xl font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
