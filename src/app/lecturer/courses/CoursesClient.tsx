"use client";

import { useState } from "react";
import { BookOpen, Users, Building2, Calendar, ChevronRight, X } from "lucide-react";
import Link from "next/link";

type Exam = { id: string; title: string; status: string; scheduledDate: Date };
type Course = {
  id: string;
  title: string;
  code: string;
  level: string;
  department: { name: string } | null;
  students: { id: string }[];
  exams: Exam[];
};

export function CoursesClient({ courses }: { courses: Course[] }) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.level]) acc[course.level] = [];
    acc[course.level].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-20">
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
        <div className="space-y-12">
          {Object.entries(groupedCourses).map(([level, levelCourses]) => (
            <div key={level}>
              <h2 className="text-xl font-bold text-[#4A3131] mb-6 flex items-center gap-3">
                <span className="bg-[#E4D4CC]/40 px-3 py-1 rounded-lg text-sm tracking-widest uppercase">{level} Level</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levelCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] flex flex-col transition hover:shadow-lg hover:shadow-[#4A3131]/5 hover:-translate-y-1 cursor-pointer group"
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

                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-[#E4D4CC]/50">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#5D6065] shrink-0" />
                        <span className="text-[#5D6065] font-bold text-sm tracking-wide">
                          {course.students.length} Enrolled
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#E4D4CC] group-hover:text-[#4A3131] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3131]/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-[#E4D4CC] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E4D4CC] flex items-start justify-between bg-[#F4EFEA]/30">
              <div>
                <span className="px-3 py-1 bg-[#E4D4CC]/50 text-[#4A3131] rounded-lg font-bold text-xs uppercase tracking-widest mb-3 inline-block">
                  {selectedCourse.code}
                </span>
                <h3 className="text-2xl font-black text-[#4A3131] leading-tight">{selectedCourse.title}</h3>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-[#E4D4CC]/50 rounded-xl transition text-[#5D6065] hover:text-[#4A3131]">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#F4EFEA] rounded-2xl border border-[#E4D4CC]">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-[#E4D4CC]">
                  <Users className="w-6 h-6 text-[#4A3131]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#5D6065] uppercase tracking-widest">Total Enrollment</p>
                  <p className="text-2xl font-black text-[#4A3131]">{selectedCourse.students.length} Students</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#5D6065] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Associated Exams
                </h4>
                {selectedCourse.exams.length === 0 ? (
                  <p className="text-sm font-medium text-[#5D6065] bg-[#F9F6F4] p-4 rounded-xl border border-[#E4D4CC]/50 italic">No exams scheduled.</p>
                ) : (
                  <ul className="space-y-3">
                    {selectedCourse.exams.map(exam => (
                      <li key={exam.id} className="p-4 bg-white border border-[#E4D4CC] rounded-xl shadow-sm flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#4A3131]">{exam.title}</p>
                          <p className="text-xs font-medium text-[#5D6065]">{new Date(exam.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${exam.status === 'UPCOMING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : exam.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                          {exam.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#E4D4CC] bg-[#F4EFEA]/30">
              <Link href={`/lecturer/courses/${selectedCourse.id}/roster`} className="block w-full text-center py-3 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition active:scale-[0.98] shadow-md shadow-[#4A3131]/20">
                View Cohort Roster
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
