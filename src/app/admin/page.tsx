import { prisma } from "@/lib/prisma";
import { AdminOverviewClient } from "./AdminOverviewClient";
import { createClient } from "@/utils/supabase/server";

export default async function AdminOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let totalStudents = 0;
  let activeFaculty = 0;
  let provisionedCourses = 0;
  let dbError = false;
  let institutionName = "OpenCBT";

  if (user) {
    try {
      const institution = await prisma.institution.findUnique({
        where: { adminId: user.id },
      });
      if (institution) {
        institutionName = institution.name;
      }

      [totalStudents, activeFaculty, provisionedCourses] = await Promise.all([
        prisma.student.count(),
        prisma.user.count({ where: { role: "LECTURER" } }),
        prisma.course.count({ where: { adminId: user.id } }),
      ]);
    } catch (err) {
      console.error("[AdminOverview] Database fetch failed:", err);
      dbError = true;
    }
  }

  return (
    <AdminOverviewClient
      stats={{ totalStudents, activeFaculty, provisionedCourses }}
      dbError={dbError}
      institutionName={institutionName}
    />
  );
}
