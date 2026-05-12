import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { schoolConfig } from "@/config/school";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950">
      <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/80 backdrop-blur-md dark:border-navy-800 dark:bg-navy-950/80">
        <div className="container-narrow flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500 font-bold text-white">
              L
            </div>
            <span className="text-lg font-bold text-navy-800 dark:text-navy-100">
              {schoolConfig.shortName}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-navy-600 dark:text-navy-300 md:inline">
              {profile?.full_name ?? user.email}
            </span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
