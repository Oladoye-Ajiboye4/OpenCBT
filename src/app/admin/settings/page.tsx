import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const profileRecord = await prisma.institution.findUnique({ where: { id: "global" } });
  
  const faculties = await prisma.faculty.findMany({
    include: {
      departments: true,
    },
    orderBy: { name: 'asc' }
  });

  const departments = await prisma.department.findMany({
    include: {
      faculty: true,
    },
    orderBy: { name: 'asc' }
  });

  return (
    <SettingsClient 
      initialFaculties={faculties} 
      initialDepartments={departments}
      initialProfile={profileRecord}
    />
  );
}
