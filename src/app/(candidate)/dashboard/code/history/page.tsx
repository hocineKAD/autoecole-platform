import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MODE_CONFIG,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  type QuizMode,
  type QuestionCategory,
} from "@/lib/quiz/types";
import { ArrowLeft, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Récupère les tentatives terminées
  const { data: attempts, count } = await supabase
    .from("quiz_attempts")
    .select(
      "id, mode, category, score, total_questions, started_at, finished_at",
      { count: "exact" }
    )
    .eq("candidate_id", user.id)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="container-narrow py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-primary-600 dark:text-navy-300 dark:hover:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-navy-50 md:text-4xl">
          Mon historique
        </h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          {count ?? 0} QCM passé{(count ?? 0) > 1 ? "s" : ""}
        </p>
      </div>

      {/* LISTE */}
      {!attempts || attempts.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-card dark:bg-navy-800">
          <p className="text-navy-600 dark:text-navy-300">
            Aucun QCM terminé pour l&apos;instant.
          </p>
          <Link
            href="/dashboard/code"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 font-bold text-white shadow-soft transition-all hover:bg-primary-600"
          >
            Commencer un QCM
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => {
            const config = MODE_CONFIG[a.mode as QuizMode];
            const score = a.score ?? 0;
            const total = a.total_questions;
            const passed = score >= config.passingScore;

            return (
              <Link
                key={a.id}
                href={`/dashboard/code/results/${a.id}`}
                className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-card transition-transform hover:-translate-y-0.5 dark:bg-navy-800"
              >
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                    passed
                      ? "bg-success-500/15 text-success-600"
                      : "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  )}
                >
                  <Trophy className="h-7 w-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-900 dark:text-navy-50">
                      {config.label}
                    </span>
                    <span className="rounded-full bg-cream-100 px-2 py-0.5 text-xs font-medium text-navy-600 dark:bg-navy-700 dark:text-navy-300">
                      {a.category
                        ? `${CATEGORY_EMOJIS[a.category as QuestionCategory]} ${CATEGORY_LABELS[a.category as QuestionCategory]}`
                        : "🎲 Mix"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-navy-500 dark:text-navy-400">
                    <Clock className="h-3 w-3" />
                    {formatDate(a.finished_at!)}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={cn(
                      "text-2xl font-extrabold",
                      passed
                        ? "text-success-600"
                        : "text-navy-900 dark:text-navy-50"
                    )}
                  >
                    {score}/{total}
                  </div>
                  <div className="text-xs text-navy-500 dark:text-navy-400">
                    {Math.round((score / total) * 100)}%
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/dashboard/code/history?page=${page - 1}`}
              className="rounded-full border-2 border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:border-primary-400 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-200"
            >
              Précédent
            </Link>
          )}
          <span className="rounded-full bg-cream-100 px-4 py-2 text-sm font-medium text-navy-700 dark:bg-navy-800 dark:text-navy-200">
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/dashboard/code/history?page=${page + 1}`}
              className="rounded-full border-2 border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:border-primary-400 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-200"
            >
              Suivant
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
