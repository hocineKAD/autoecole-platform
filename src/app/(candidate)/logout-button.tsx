"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Se déconnecter"
      className="flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium text-navy-700 transition-colors hover:bg-cream-100 dark:text-navy-200 dark:hover:bg-navy-700"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden md:inline">Déconnexion</span>
    </button>
  );
}
