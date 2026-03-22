import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProvisionClient } from "./ProvisionClient";

export default async function ProvisionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const lecturer = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, departmentId: true },
  });

  if (!lecturer) redirect("/sign-in");

  const courses = await prisma.course.findMany({
    where: { lecturerId: lecturer.id },
    select: { id: true, title: true, code: true },
    orderBy: { createdAt: "desc" }
  });

  return <ProvisionClient courses={courses} />;
}
