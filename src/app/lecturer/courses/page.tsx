import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CoursesClient } from "./CoursesClient";

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
      exams: { select: { id: true, title: true, status: true, scheduledDate: true } }
    },
    orderBy: { level: "asc" },
  });

  return <CoursesClient courses={courses} />;
}
