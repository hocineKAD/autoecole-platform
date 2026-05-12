import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  MODE_CONFIG,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  type QuizMode,
  type QuestionCategory,
} from "@/lib/quiz/types";
import { Trophy, RotateCcw, Home, Check, X, ChevronRight } from "lucide-react";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Charge l'attempt
  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select(
      "id, candidate_id, mode, score, total_questions, finished_at, started_at, category"
    )
    .eq("id", attemptId)
    .single();

  if (!attempt || attempt.candidate_id !== user.id) notFound();
  if (!attempt.finished_at) {
    // Pas encore terminé — rediriger vers la page de quiz
    redirect(`/dashboard/code/quiz/${attemptId}`);
  }

  const mode = attempt.mode as QuizMode;
  const config = MODE_CONFIG[mode];
  const score = attempt.score ?? 0;
  const total = attempt.total_questions;
  const percent = Math.round((score / total) * 100);
  const passed = score >= config.passingScore;

  // Charge les réponses + questions associées (pour afficher les erreurs)
  const { data: answers } = await supabase
    .from("quiz_answers")
    .select(
      `
      question_id,
      selected_option_id,
      is_correct,
      questions (
        id,
        text,
        category,
        explanation,
        answer_options (
          id,
          text,
          is_correct,
          position
        )
      )
    `
    )
    .eq("attempt_id", attemptId);

  const wrongAnswers =
    (answers ?? [])
      .filter((a) => !a.is_correct)
      .map((a) => ({
        questionId: a.question_id,
        selectedOptionId: a.selected_option_id,
        // @ts-expect-error - Supabase typing
        question: a.questions as {
          id: string;
          text: string;
          category: string;
          explanation: string | null;
          answer_options: Array<{
            id: string;
            text: string;
            is_correct: boolean;
            position: number;
          }>;
        },
      })) ?? [];

  // Durée
  const durationMs =
    new Date(attempt.finished_at).getTime() -
    new Date(attempt.started_at).getTime();
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);

  return (
    <div className="container-narrow py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-primary-600 dark:text-navy-300 dark:hover:text-primary-400"
      >
        <Home className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      {/* HERO RÉSULTAT */}
      <div
        className={`overflow-hidden rounded-3xl p-8 text-white shadow-card md:p-12 ${
          passed
            ? "bg-gradient-to-br from-success-500 to-success-600"
            : "bg-gradient-to-br from-primary-500 to-primary-600"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Trophy className="h-8 w-8" />
          </div>

          <div className="mt-4 text-sm font-semibold uppercase tracking-wider text-white/80">
            {config.label} · {attempt.category ? CATEGORY_LABELS[attempt.category as QuestionCategory] : "Mix"}
          </div>

          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            {passed ? "Bravo !" : "Continuez !"}
          </h1>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-7xl font-black md:text-8xl">{score}</span>
            <span className="text-3xl font-bold text-white/70">/ {total}</span>
          </div>
          <div className="mt-1 text-xl font-bold text-white/90">
            {percent}% de réussite
          </div>

          <p className="mt-4 max-w-md text-white/90">
            {passed
              ? `Excellent travail, vous avez atteint le niveau requis pour ce mode (${config.passingScore}/${total}).`
              : `Il faut ${config.passingScore}/${total} pour valider ce mode. Continuez à vous entraîner !`}
          </p>

          {/* Stats secondaires */}
          <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-4 border-t border-white/20 pt-6">
            <div>
              <div className="text-2xl font-bold">{durationMin}m {durationSec}s</div>
              <div className="text-sm text-white/80">Durée</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{total - score}</div>
              <div className="text-sm text-white/80">
                Erreur{total - score > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard/code"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 font-bold text-white shadow-soft transition-all hover:bg-primary-600 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          Refaire un QCM
        </Link>
        <Link
          href="/dashboard/code/history"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-navy-200 bg-white px-6 py-3 font-bold text-navy-800 transition-all hover:border-primary-400 hover:text-primary-600 active:scale-95 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
        >
          Mon historique
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      {/* ERREURS — uniquement si mode examen ou s'il y a des erreurs */}
      {wrongAnswers.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-navy-900 dark:text-navy-50">
            À revoir ({wrongAnswers.length})
          </h2>
          <p className="mt-1 text-navy-600 dark:text-navy-300">
            Voici les questions sur lesquelles vous vous êtes trompé.
          </p>

          <div className="mt-6 space-y-4">
            {wrongAnswers.map((a) => {
              const correctOpt = a.question.answer_options.find(
                (o) => o.is_correct
              );
              const selectedOpt = a.question.answer_options.find(
                (o) => o.id === a.selectedOptionId
              );

              return (
                <div
                  key={a.questionId}
                  className="rounded-3xl bg-white p-6 shadow-card dark:bg-navy-800"
                >
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy-600 dark:bg-navy-700 dark:text-navy-300">
                    <span>
                      {CATEGORY_EMOJIS[a.question.category as QuestionCategory] ?? "📚"}
                    </span>
                    <span>
                      {CATEGORY_LABELS[a.question.category as QuestionCategory] ??
                        a.question.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-navy-900 dark:text-navy-50">
                    {a.question.text}
                  </h3>

                  <div className="mt-4 space-y-2">
                    {selectedOpt && (
                      <div className="flex items-start gap-3 rounded-2xl bg-error-500/10 p-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error-500 text-white">
                          <X className="h-3 w-3" strokeWidth={3} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-error-600">
                            Votre réponse
                          </div>
                          <div className="text-navy-800 dark:text-navy-100">
                            {selectedOpt.text}
                          </div>
                        </div>
                      </div>
                    )}

                    {correctOpt && (
                      <div className="flex items-start gap-3 rounded-2xl bg-success-500/10 p-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-500 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-success-600">
                            Bonne réponse
                          </div>
                          <div className="text-navy-800 dark:text-navy-100">
                            {correctOpt.text}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {a.question.explanation && (
                    <div className="mt-4 rounded-2xl bg-cream-100 p-4 text-sm text-navy-700 dark:bg-navy-900 dark:text-navy-200">
                      💡 {a.question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
