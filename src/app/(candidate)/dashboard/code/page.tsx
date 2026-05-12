import { createClient } from "@/lib/supabase/server";
import {
  MODE_CONFIG,
  MODE_ORDER,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  type QuestionCategory,
} from "@/lib/quiz/types";
import { startQuiz } from "@/lib/quiz/actions";
import { ArrowLeft, Clock, BookOpen, Target } from "lucide-react";
import Link from "next/link";

export default async function CodeHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Stats par catégorie
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("category, score, total_questions")
    .eq("candidate_id", user!.id)
    .not("finished_at", "is", null);

  // Calcul du % de réussite par catégorie
  const statsByCategory = new Map<string, { correct: number; total: number }>();
  for (const a of attempts ?? []) {
    const key = a.category ?? "mix";
    const cur = statsByCategory.get(key) ?? { correct: 0, total: 0 };
    cur.correct += a.score ?? 0;
    cur.total += a.total_questions;
    statsByCategory.set(key, cur);
  }

  // Récupère les catégories disponibles (avec questions)
  const { data: questionsByCategory } = await supabase
    .from("questions")
    .select("category");

  const availableCategories = Array.from(
    new Set((questionsByCategory ?? []).map((q) => q.category))
  ).filter((c): c is QuestionCategory => !!c);

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
          Mon code
        </h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          Choisissez un mode et une catégorie pour commencer.
        </p>
      </div>

      {/* MODES */}
      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Choisissez un mode
        </h2>

        <form action={startQuiz}>
          <ModeSelector />

          {/* CATÉGORIES */}
          <div className="mt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              Choisissez une catégorie
            </h2>

            <CategoryPicker
              categories={availableCategories}
              statsByCategory={statsByCategory}
            />
          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-10 py-4 text-lg font-bold text-white shadow-soft transition-all hover:bg-primary-600 active:scale-95"
            >
              Commencer le QCM
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

/* ============================================
   ModeSelector — radio cards
   ============================================ */
function ModeSelector() {
  const icons = {
    learning: BookOpen,
    training: Target,
    exam: Clock,
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {MODE_ORDER.map((mode, idx) => {
        const config = MODE_CONFIG[mode];
        const Icon = icons[mode];
        return (
          <label
            key={mode}
            className="group relative cursor-pointer rounded-3xl border-2 border-navy-100 bg-white p-6 shadow-card transition-all hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:border-navy-700 dark:bg-navy-800 dark:hover:border-primary-500 dark:has-[:checked]:border-primary-400 dark:has-[:checked]:bg-primary-900/20"
          >
            <input
              type="radio"
              name="mode"
              value={mode}
              defaultChecked={idx === 0}
              className="sr-only"
            />
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-navy-900 dark:text-navy-50">
                  {config.questionCount}
                </div>
                <div className="text-xs uppercase tracking-wider text-navy-500 dark:text-navy-400">
                  questions
                </div>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy-900 dark:text-navy-50">
              {config.label}
            </h3>
            <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">
              {config.description}
            </p>
            {config.timeLimitSec && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-error-500/10 px-3 py-1 text-xs font-semibold text-error-600">
                <Clock className="h-3 w-3" />
                Chrono : {Math.floor(config.timeLimitSec / 60)} min
              </div>
            )}
          </label>
        );
      })}
    </div>
  );
}

/* ============================================
   CategoryPicker — radio chips
   ============================================ */
function CategoryPicker({
  categories,
  statsByCategory,
}: {
  categories: QuestionCategory[];
  statsByCategory: Map<string, { correct: number; total: number }>;
}) {
  const items: Array<{
    value: string;
    label: string;
    emoji: string;
    pct: number | null;
  }> = [
    {
      value: "mix",
      label: "Mix toutes catégories",
      emoji: "🎲",
      pct: getCategoryPct(statsByCategory, "mix"),
    },
    ...categories.map((cat) => ({
      value: cat,
      label: CATEGORY_LABELS[cat],
      emoji: CATEGORY_EMOJIS[cat],
      pct: getCategoryPct(statsByCategory, cat),
    })),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item, idx) => (
        <label
          key={item.value}
          className="group cursor-pointer rounded-2xl border-2 border-navy-100 bg-white p-4 shadow-sm transition-all hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:border-navy-700 dark:bg-navy-800 dark:hover:border-primary-500 dark:has-[:checked]:border-primary-400 dark:has-[:checked]:bg-primary-900/20"
        >
          <input
            type="radio"
            name="category"
            value={item.value}
            defaultChecked={idx === 0}
            className="sr-only"
          />
          <div className="flex items-center gap-3">
            <div className="text-2xl">{item.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold text-navy-900 dark:text-navy-50">
                {item.label}
              </div>
              {item.pct !== null && (
                <div className="text-xs text-navy-500 dark:text-navy-400">
                  Réussite : {item.pct}%
                </div>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}

function getCategoryPct(
  stats: Map<string, { correct: number; total: number }>,
  key: string
): number | null {
  const s = stats.get(key);
  if (!s || s.total === 0) return null;
  return Math.round((s.correct / s.total) * 100);
}
