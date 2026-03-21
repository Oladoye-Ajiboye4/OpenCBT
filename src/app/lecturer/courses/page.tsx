import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookOpen, Users, Building2 } from "lucide-react";

export default async function LecturerCourses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const lecturer = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  });

  if (!lecturer) redirect("/sign-in");

  const courses = await prisma.course.findMany({
    where: { lecturerId: lecturer.id },
    include: {
      department: { select: { name: true } },
      students: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Assigned Courses</h1>
        <p className="text-[#5D6065] text-lg mt-2 font-medium">
          Enterprise registries localized strictly to your faculty deployment matrix.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E4D4CC] p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-[#F4EFEA] rounded-2xl border border-[#E4D4CC] flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-[#4A3131]/40" />
          </div>
          <h3 className="text-xl font-bold text-[#4A3131] mb-1">No Courses Assigned Yet</h3>
          <p className="text-[#5D6065] font-medium text-sm max-w-sm">
            Contact the administrator to have courses assigned to your profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] flex flex-col transition hover:shadow-lg hover:shadow-[#4A3131]/5 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-[#F4EFEA] rounded-2xl flex items-center justify-center border border-[#E4D4CC]">
                  <BookOpen className="w-6 h-6 text-[#4A3131]" />
                </div>
                <span className="px-3 py-1.5 bg-[#E4D4CC]/40 text-[#4A3131] rounded-lg font-bold text-xs uppercase tracking-widest">
                  {course.code}
                </span>
              </div>

              <h2 className="text-xl font-black text-[#4A3131] mb-2 leading-snug">{course.title}</h2>

              {course.department && (
                <div className="flex items-center gap-2 text-[#5D6065] text-sm font-medium mb-3">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>{course.department.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-auto pt-5 border-t border-[#E4D4CC]/50">
                <Users className="w-4 h-4 text-[#5D6065] shrink-0" />
                <span className="text-[#5D6065] font-bold text-sm tracking-wide">
                  {course.students.length} Enrolled Student{course.students.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
