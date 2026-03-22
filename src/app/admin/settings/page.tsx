import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const profileRecord = user ? await prisma.institution.findUnique({ where: { adminId: user.id } }) : null;
  
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
