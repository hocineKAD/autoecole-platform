import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { schoolConfig } from "@/config/school";
import { LogoutButton } from "@/app/(candidate)/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "school_admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950">
      <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/80 backdrop-blur-md dark:border-navy-800 dark:bg-navy-950/80">
        <div className="container-narrow flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500 font-bold text-white">
                L
              </div>
              <span className="text-lg font-bold text-navy-800 dark:text-navy-100">
                {schoolConfig.shortName}
              </span>
            </Link>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-navy-600 dark:text-navy-300 md:inline">
              {profile?.full_name ?? user.email}
            </span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* Navigation admin */}
        <div className="container-narrow border-t border-cream-200 dark:border-navy-800">
          <nav className="flex gap-1 py-2">
            <Link
              href="/admin"
              className="rounded-xl px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/reservations"
              className="rounded-xl px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-100"
            >
              Réservations
            </Link>
            <Link
              href="/admin/planning"
              className="rounded-xl px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-900 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-100"
            >
              Planning
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
