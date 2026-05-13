import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { schoolConfig } from "@/config/school";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Clock,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Phone,
  MessageCircle,
  XCircle,
} from "lucide-react";

// ─── Vue : compte en attente de validation ────────────────────────────────────
function PendingApprovalView({ fullName }: { fullName: string | null }) {
  const first = fullName?.split(" ")[0] ?? "là";
  return (
    <main className="container-narrow py-16">
      {/* Statut */}
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 dark:bg-amber-900/30">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-navy-900 dark:text-navy-50 md:text-3xl">
          Bonjour {first}, votre inscription est en cours de validation
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-navy-600 dark:text-navy-300">
          Un administrateur va examiner votre demande très prochainement.
          Dès validation, vous aurez accès à l&apos;ensemble des fonctionnalités
          de la plateforme.
        </p>
      </div>

      {/* Ce qui vous attend */}
      <div className="mt-14">
        <p className="mb-5 text-center text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Ce qui vous attend après validation
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Entraînement au code"
            description="QCM par catégorie, examens blancs et suivi de progression en temps réel."
            color="primary"
          />
          <FeatureCard
            icon={<CalendarCheck className="h-6 w-6" />}
            title="Réservation de créneaux"
            description="Choisissez vos heures de conduite directement sur le planning de l'auto-école."
            color="teal"
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Suivi personnalisé"
            description="Visualisez votre progression, vos scores et vos points faibles à travailler."
            color="amber"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="mx-auto mt-14 max-w-sm rounded-3xl bg-white p-6 text-center shadow-card dark:bg-navy-800">
        <p className="font-semibold text-navy-900 dark:text-navy-50">
          Une question ? Contactez-nous
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <a
            href={`tel:${schoolConfig.phone}`}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-navy-700 dark:text-navy-300"
          >
            <Phone className="h-4 w-4" />
            {schoolConfig.phone}
          </a>
          <a
            href={`https://wa.me/${schoolConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}

// ─── Vue : inscription refusée ────────────────────────────────────────────────
function RejectedView({ fullName }: { fullName: string | null }) {
  const first = fullName?.split(" ")[0] ?? "là";
  return (
    <main className="container-narrow py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-900/30">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-navy-900 dark:text-navy-50">
        Bonjour {first}, votre inscription n&apos;a pas été validée
      </h1>
      <p className="mx-auto mt-3 max-w-md text-navy-600 dark:text-navy-300">
        Pour plus d&apos;informations ou pour régulariser votre dossier,
        contactez directement l&apos;auto-école.
      </p>
      <div className="mx-auto mt-10 max-w-xs space-y-3">
        <a
          href={`tel:${schoolConfig.phone}`}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-navy-700 dark:text-navy-300"
        >
          <Phone className="h-4 w-4" />
          {schoolConfig.phone}
        </a>
        <a
          href={`https://wa.me/${schoolConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "teal" | "amber";
}) {
  const colorMap = {
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300",
    teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  };
  return (
    <div className="rounded-3xl bg-white p-6 shadow-card dark:bg-navy-800">
      <div
        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${colorMap[color]}`}
      >
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-navy-900 dark:text-navy-50">{title}</h3>
      <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">{description}</p>
    </div>
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────
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
    .select("full_name, role, status")
    .eq("id", user.id)
    .single();

  // Les admins ont leur propre espace
  if (profile?.role === "school_admin") {
    redirect("/admin");
  }

  const status = (profile as { status?: string } | null)?.status ?? "pending";

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
            {status === "pending" && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                En attente
              </span>
            )}
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      {status === "pending" ? (
        <PendingApprovalView fullName={profile?.full_name ?? null} />
      ) : status === "rejected" ? (
        <RejectedView fullName={profile?.full_name ?? null} />
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}
