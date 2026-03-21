import { prisma } from "@/lib/prisma";
import { AdminOverviewClient } from "./AdminOverviewClient";

export default async function AdminOverview() {
  const [totalStudents, activeFaculty, provisionedCourses] = await Promise.all([
    prisma.student.count(),
    prisma.user.count({ where: { role: 'LECTURER' } }),
    prisma.course.count()
  ]);

  return (
    <AdminOverviewClient 
      stats={{
        totalStudents,
        activeFaculty,
        provisionedCourses
      }} 
    />
  );
}
