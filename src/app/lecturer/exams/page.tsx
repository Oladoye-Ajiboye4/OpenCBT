import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ExamsClient } from "./ExamsClient";

export default async function LecturerExams() {
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
    select: { id: true, title: true, code: true },
    orderBy: { createdAt: "desc" }
  });

  const courseIds = courses.map(c => c.id);

  const exams = await prisma.exam.findMany({
    where: { courseId: { in: courseIds } },
    include: { course: { select: { code: true } } },
    orderBy: { scheduledDate: "asc" }
  });

  return <ExamsClient courses={courses} initialExams={exams} />;
}
