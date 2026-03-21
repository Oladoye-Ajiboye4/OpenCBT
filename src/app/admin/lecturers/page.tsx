import { prisma } from "@/lib/prisma";
import { LecturersClient } from "./LecturersClient";

export default async function ManageLecturersPage() {
  const faculties = await prisma.faculty.findMany({
    include: { departments: true },
    orderBy: { name: 'asc' }
  });

  return <LecturersClient faculties={faculties} />;
}
