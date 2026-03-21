import { prisma } from "@/lib/prisma";
import { StudentsClient } from "./StudentsClient";

export default async function ManageStudentsPage() {
  const institution = await prisma.institution.findUnique({ where: { id: "global" } });
  
  const faculties = await prisma.faculty.findMany({
    include: { departments: true },
    orderBy: { name: 'asc' }
  });

  return <StudentsClient faculties={faculties} matricMode={institution?.matricMode || "MANUAL"} />;
}
