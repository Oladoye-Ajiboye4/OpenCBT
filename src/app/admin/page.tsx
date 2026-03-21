import { prisma } from "@/lib/prisma";
import { AdminOverviewClient } from "./AdminOverviewClient";

export default async function AdminOverview() {
  let totalStudents = 0;
  let activeFaculty = 0;
  let provisionedCourses = 0;
  let dbError = false;

  try {
    [totalStudents, activeFaculty, provisionedCourses] = await Promise.all([
      prisma.student.count(),
      prisma.user.count({ where: { role: "LECTURER" } }),
      prisma.course.count(),
    ]);
  } catch (err) {
    console.error("[AdminOverview] Database fetch failed:", err);
    dbError = true;
  }

  return (
    <AdminOverviewClient
      stats={{ totalStudents, activeFaculty, provisionedCourses }}
      dbError={dbError}
    />
  );
}
