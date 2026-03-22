import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProvisionClient } from "./ProvisionClient";

export default async function ProvisionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const lecturer = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  });

  if (!lecturer) redirect("/sign-in");

  // Fetch all UPCOMING exams assigned to this lecturer, including course + department info
  const upcomingExams = await prisma.exam.findMany({
    where: {
      status: "UPCOMING",
      course: { lecturerId: lecturer.id },
    },
    include: {
      course: {
        include: { department: true },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  return <ProvisionClient exams={upcomingExams} />;
}
