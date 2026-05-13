import { createClient } from "@/lib/supabase/server";
import { BookOpen, TrendingUp, Sparkles, ChevronRight, History, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { MODE_CONFIG, type QuizMode } from "@/lib/quiz/types";
import { VEHICLE_CONFIG, type VehicleType, type TrainingStage } from "@/lib/bookings/types";
import { StageProgress } from "@/components/candidate/stage-progress";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, current_stage, driving_schools(vehicle_type, name)")
    .eq("id", user!.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "candidat";
  const school = profile?.driving_schools as unknown as
    | { vehicle_type: string; name: string }
    | null;
  const currentStage = (profile as { current_stage?: string | null } | null)?.current_stage as TrainingStage | null ?? null;

  // Stats : récupère les attempts terminés
  const { data: finishedAttempts } = await supabase
    .from("quiz_attempts")
    .select("score, total_questions, mode, category, finished_at")
    .eq("candidate_id", user!.id)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false });

  // Attempt en cours (non terminé)
  const { data: ongoing } = await supabase
    .from("quiz_attempts")
    .select("id, mode, started_at")
    .eq("candidate_id", user!.id)
    .is("finished_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const totalAttempts = finishedAttempts?.length ?? 0;
  const avgScorePct =
    totalAttempts > 0
      ? Math.round(
          (finishedAttempts!.reduce(
            (acc, a) => acc + (a.score ?? 0) / Math.max(a.total_questions, 1),
            0
          ) /
            totalAttempts) *
            100
        )
      : null;

  const lastAttempt = finishedAttempts?.[0];

  return (
    <div className="container-narrow py-10">
      {/* Hello */}
      <div className="mb-8">
        <div className="text-sm font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Tableau de bord
        </div>
        <h1 className="mt-2 text-3xl font-bold text-navy-900 dark:text-navy-50 md:text-4xl">
          Bonjour {firstName} 👋
        </h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          Continuez votre préparation au permis de conduire.
        </p>
      </div>

      {/* Bandeau type de formation */}
      {school && (
        <div className="mb-6 flex items-center gap-3 rounded-3xl border-2 border-primary-100 bg-primary-50 px-5 py-3.5 dark:border-primary-900 dark:bg-primary-900/20">
          <span className="text-2xl">
            {VEHICLE_CONFIG[(school.vehicle_type as VehicleType) ?? "auto"].emoji}
          </span>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
              Votre formation
            </span>
            <div className="font-bold text-navy-900 dark:text-navy-50">
              {VEHICLE_CONFIG[(school.vehicle_type as VehicleType) ?? "auto"].label}{" "}
              <span className="font-normal text-navy-500 dark:text-navy-400">
                — {school.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progression par étapes */}
      {school && currentStage && (
        <StageProgress
          currentStage={currentStage}
          vehicleType={(school.vehicle_type as VehicleType) ?? "auto"}
        />
      )}

      {/* Bandeau "QCM en cours" si applicable */}
      {ongoing && (
        <Link
          href={`/dashboard/code/quiz/${ongoing.id}`}
          className="mb-6 flex items-center justify-between rounded-3xl bg-primary-500 p-5 text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-white/90">
                QCM en cours
              </div>
              <div className="font-bold">
                Reprendre votre {MODE_CONFIG[ongoing.mode as QuizMode]?.label.toLowerCase() ?? "QCM"}
              </div>
            </div>
          </div>
          <ChevronRight className="h-6 w-6" />
        </Link>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          label="QCM passés"
          value={totalAttempts.toString()}
          color="primary"
        />
        <StatCard
          label="Score moyen"
          value={avgScorePct !== null ? `${avgScorePct}%` : "—"}
          color="teal"
        />
        <StatCard
          label="Dernier score"
          value={
            lastAttempt
              ? `${lastAttempt.score}/${lastAttempt.total_questions}`
              : "—"
          }
          color="cream"
        />
      </div>

      {/* Cards d'accès aux modules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/code"
          className="group rounded-3xl bg-white p-6 shadow-card transition-transform hover:-translate-y-1 dark:bg-navy-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-navy-900 dark:text-navy-50">
            Mon code
          </h3>
          <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">
            QCM par catégorie, examens blancs, suivi de progression.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:gap-3 dark:text-primary-400">
            Commencer →
          </div>
        </Link>

        <Link
          href="/dashboard/code/history"
          className="group rounded-3xl bg-white p-6 shadow-card transition-transform hover:-translate-y-1 dark:bg-navy-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-200 text-primary-700 dark:bg-navy-700 dark:text-primary-300">
            <History className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-navy-900 dark:text-navy-50">
            Mon historique
          </h3>
          <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">
            Tous vos QCM passés, scores, points faibles.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:gap-3 dark:text-primary-400">
            Voir l&apos;historique →
          </div>
        </Link>

        <Link
          href="/dashboard/reservations"
          className="group rounded-3xl bg-white p-6 shadow-card transition-transform hover:-translate-y-1 dark:bg-navy-800"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/20 text-teal-600">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-navy-900 dark:text-navy-50">
            Mes heures de conduite
          </h3>
          <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">
            Réservez un créneau de conduite sur les horaires disponibles.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 group-hover:gap-3 dark:text-teal-400">
            Réserver →
          </div>
        </Link>
      </div>

      {/* Bandeau motivation */}
      {totalAttempts === 0 && (
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Prêt à commencer ?</h2>
              <p className="mt-2 text-white/90">
                Lancez votre premier QCM en mode apprentissage. 10 questions, correction immédiate, pas de pression.
              </p>
              <Link
                href="/dashboard/code"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary-700 transition-colors hover:bg-cream-100"
              >
                Démarrer mon premier QCM
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "primary" | "teal" | "cream";
}) {
  const colorClasses = {
    primary: "bg-primary-50 dark:bg-primary-900/30",
    teal: "bg-teal-400/10 dark:bg-teal-600/20",
    cream: "bg-cream-100 dark:bg-navy-800",
  };

  return (
    <div className={`rounded-3xl p-5 shadow-card ${colorClasses[color]}`}>
      <div className="text-sm font-medium text-navy-600 dark:text-navy-300">
        {label}
      </div>
      <div className="mt-1 text-3xl font-extrabold text-navy-900 dark:text-navy-50">
        {value}
      </div>
    </div>
  );
}
