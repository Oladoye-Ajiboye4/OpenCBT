import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LecturerNavbar } from "./LecturerNavbar";

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const lecturer = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, name: true, staffId: true },
  });

  if (!lecturer) redirect("/sign-in");

  const displayName = lecturer.name || user.email || "Lecturer";
  const staffId = lecturer.staffId || "N/A";

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#5D6065] flex flex-col font-sans">
      <LecturerNavbar name={displayName} staffId={staffId} />

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto relative">
        {children}
      </main>
    </div>
  );
}
