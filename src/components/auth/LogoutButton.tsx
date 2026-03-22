"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  iconClassName?: string;
}

export function LogoutButton({ className, iconClassName }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/sign-in");
  };

  return (
    <button onClick={handleLogout} className={className}>
      <LogOut className={iconClassName} />
      Logout
    </button>
  );
}
