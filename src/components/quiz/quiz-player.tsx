"use client";

import { useState, useEffect, useCallback, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ChevronRight, Clock, Loader2 } from "lucide-react";
import { submitAnswer, finishQuiz } from "@/lib/quiz/actions";
import { CATEGORY_LABELS, CATEGORY_EMOJIS, type QuestionCategory, type QuizMode } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  text: string;
  category: string;
  explanation: string | null;
  options: { id: string; text: string }[];
};

type ExistingAnswer = {
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
};

type Props = {
  attemptId: string;
  mode: QuizMode;
  timeLimitSec: number | null;
  startedAt: string;
  questions: Question[];
  existingAnswers: ExistingAnswer[];
  immediateFeedback: boolean;
};

type LocalAnswer = {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  correctOptionId: string | null;
};

export function QuizPlayer({
  attemptId,
  mode,
  timeLimitSec,
  startedAt,
  questions,
  existingAnswers,
  immediateFeedback,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Index courant : on reprend là où l'utilisateur s'était arrêté
  const initialIndex = useMemo(() => {
    if (existingAnswers.length === 0) return 0;
    // On reprend au premier index sans réponse
    for (let i = 0; i < questions.length; i++) {
      const ans = existingAnswers.find((a) => a.question_id === questions[i].id);
      if (!ans) return i;
    }
    return questions.length - 1;
  }, [existingAnswers, questions]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Réponses locales (pour le feedback immédiat sans refetch)
  const [localAnswers, setLocalAnswers] = useState<LocalAnswer[]>(() =>
    existingAnswers.map((a) => ({
      questionId: a.question_id,
      selectedOptionId: a.selected_option_id,
      isCorrect: a.is_correct,
      correctOptionId: null, // sera reset au render
    }))
  );

  // État UI : a-t-on déjà répondu à la question courante ?
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer (uniquement mode examen)
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (!timeLimitSec) return null;
    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    );
    return Math.max(0, timeLimitSec - elapsed);
  });

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;
  const correctSoFar = localAnswers.filter((a) => a.isCorrect).length;

  // ============================================
  // Timer countdown
  // ============================================
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      // Time's up : finish quiz
      handleFinish();
      return;
    }
    const t = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // ============================================
  // Reset état UI quand on change de question
  // ============================================
  useEffect(() => {
    setShowFeedback(false);
    setSelectedOption(null);
    setError(null);
  }, [currentIndex]);

  // ============================================
  // Soumettre une réponse
  // ============================================
  const handleSubmit = useCallback(
    (optionId: string | null) => {
      if (!currentQuestion) return;
      setSelectedOption(optionId);
      setError(null);

      startTransition(async () => {
        try {
          const result = await submitAnswer({
            attemptId,
            questionId: currentQuestion.id,
            selectedOptionId: optionId,
          });

          // Met à jour le state local (remplace ou ajoute)
          setLocalAnswers((prev) => {
            const filtered = prev.filter(
              (a) => a.questionId !== currentQuestion.id
            );
            return [
              ...filtered,
              {
                questionId: currentQuestion.id,
                selectedOptionId: optionId,
                isCorrect: result.isCorrect,
                correctOptionId: result.correctOptionId,
              },
            ];
          });

          if (immediateFeedback) {
            setShowFeedback(true);
          } else {
            // Mode examen : on passe direct à la suivante
            handleNext();
          }
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Erreur lors de l'enregistrement"
          );
        }
      });
    },
    [attemptId, currentQuestion, immediateFeedback]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  );

  // ============================================
  // Question suivante
  // ============================================
  const handleNext = useCallback(() => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentIndex((i) => i + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLast]);

  // ============================================
  // Terminer le QCM
  // ============================================
  const handleFinish = useCallback(() => {
    startTransition(async () => {
      try {
        await finishQuiz(attemptId);
        router.push(`/dashboard/code/results/${attemptId}`);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Erreur à la fin du QCM"
        );
      }
    });
  }, [attemptId, router]);

  // ============================================
  // Affichage : récupère l'état de la question courante
  // ============================================
  const currentLocalAnswer = localAnswers.find(
    (a) => a.questionId === currentQuestion?.id
  );

  if (!currentQuestion) {
    return (
      <div className="container-narrow py-10 text-center">
        <p>Aucune question dans ce QCM.</p>
      </div>
    );
  }

  const progressPct = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-cream-50 pb-32 dark:bg-navy-950">
      {/* ====================== HEADER STICKY ====================== */}
      <div className="sticky top-16 z-30 border-b border-cream-200 bg-cream-50/95 backdrop-blur-md dark:border-navy-800 dark:bg-navy-950/95">
        <div className="container-narrow py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold text-navy-700 dark:text-navy-200">
              Question{" "}
              <span className="text-primary-600 dark:text-primary-400">
                {currentIndex + 1}
              </span>{" "}
              / {totalQuestions}
            </div>

            <div className="flex items-center gap-3">
              {timeLeft !== null && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold",
                    timeLeft < 60
                      ? "animate-timer-pulse bg-error-500/15 text-error-600"
                      : "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                  )}
                >
                  <Clock className="h-4 w-4" />
                  {formatTime(timeLeft)}
                </div>
              )}

              {immediateFeedback && (
                <div className="rounded-full bg-cream-100 px-3 py-1.5 text-sm font-bold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                  Score : {correctSoFar}/{currentIndex + (showFeedback ? 1 : 0)}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ====================== QUESTION ====================== */}
      <div className="container-narrow py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy-600 dark:bg-navy-800 dark:text-navy-300">
            <span>{CATEGORY_EMOJIS[currentQuestion.category as QuestionCategory] ?? "📚"}</span>
            <span>
              {CATEGORY_LABELS[currentQuestion.category as QuestionCategory] ??
                currentQuestion.category}
            </span>
          </div>

          <h1 className="text-xl font-bold leading-tight text-navy-900 dark:text-navy-50 md:text-2xl">
            {currentQuestion.text}
          </h1>

          {/* OPTIONS */}
          <div className="mt-6 space-y-3">
            {currentQuestion.options.map((opt, idx) => (
              <OptionButton
                key={opt.id}
                letter={String.fromCharCode(65 + idx)}
                text={opt.text}
                onClick={() => !showFeedback && handleSubmit(opt.id)}
                state={getOptionState({
                  optionId: opt.id,
                  selectedOption,
                  showFeedback,
                  currentLocalAnswer,
                  pending,
                })}
                disabled={pending || showFeedback}
              />
            ))}
          </div>

          {/* Erreur */}
          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* FEEDBACK (mode apprentissage / entraînement) */}
          {showFeedback && currentLocalAnswer && (
            <div
              className={cn(
                "mt-6 animate-bounce-once rounded-3xl p-6 shadow-card",
                currentLocalAnswer.isCorrect
                  ? "bg-success-500/10 ring-2 ring-success-500/30"
                  : "bg-error-500/10 ring-2 ring-error-500/30"
              )}
            >
              <div className="flex items-center gap-3">
                {currentLocalAnswer.isCorrect ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-500 text-white">
                      <Check className="h-5 w-5" strokeWidth={3} />
                    </div>
                    <div className="text-lg font-bold text-success-600">
                      Bonne réponse !
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-500 text-white">
                      <X className="h-5 w-5" strokeWidth={3} />
                    </div>
                    <div className="text-lg font-bold text-error-600">
                      Mauvaise réponse
                    </div>
                  </>
                )}
              </div>
              {currentQuestion.explanation && (
                <p className="mt-3 leading-relaxed text-navy-700 dark:text-navy-200">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ====================== FOOTER FIXE — bouton "Suivant" ====================== */}
      {showFeedback && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-cream-200 bg-cream-50/95 p-4 backdrop-blur-md dark:border-navy-800 dark:bg-navy-950/95">
          <div className="container-narrow flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-8 py-3 font-bold text-white shadow-soft transition-all hover:bg-primary-600 active:scale-95 disabled:opacity-50"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLast ? "Voir mes résultats" : "Question suivante"}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   OptionButton — un choix de réponse
   ============================================ */
function OptionButton({
  letter,
  text,
  onClick,
  state,
  disabled,
}: {
  letter: string;
  text: string;
  onClick: () => void;
  state: "idle" | "selected-pending" | "correct" | "incorrect" | "correct-revealed" | "neutral";
  disabled: boolean;
}) {
  const stateClasses: Record<typeof state, string> = {
    idle:
      "border-navy-200 bg-white hover:border-primary-400 hover:bg-primary-50 dark:border-navy-700 dark:bg-navy-800 dark:hover:border-primary-400 dark:hover:bg-primary-900/20",
    "selected-pending":
      "border-primary-400 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/30",
    correct:
      "border-success-500 bg-success-500/10 dark:border-success-500 dark:bg-success-500/20",
    incorrect:
      "border-error-500 bg-error-500/10 dark:border-error-500 dark:bg-error-500/20",
    "correct-revealed":
      "border-success-500 bg-success-500/10 ring-2 ring-success-500/30 dark:border-success-500 dark:bg-success-500/20",
    neutral:
      "border-navy-100 bg-white opacity-50 dark:border-navy-800 dark:bg-navy-800",
  };

  const letterClasses: Record<typeof state, string> = {
    idle: "bg-cream-100 text-navy-700 dark:bg-navy-700 dark:text-navy-200",
    "selected-pending": "bg-primary-500 text-white",
    correct: "bg-success-500 text-white",
    incorrect: "bg-error-500 text-white",
    "correct-revealed": "bg-success-500 text-white",
    neutral: "bg-cream-100 text-navy-500 dark:bg-navy-700 dark:text-navy-400",
  };

  const Icon = state === "correct" || state === "correct-revealed" ? Check : state === "incorrect" ? X : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
        stateClasses[state],
        !disabled && "cursor-pointer active:scale-[0.99]"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold transition-colors",
          letterClasses[state]
        )}
      >
        {Icon ? <Icon className="h-5 w-5" strokeWidth={3} /> : letter}
      </div>
      <span className="flex-1 text-navy-900 dark:text-navy-100">{text}</span>
    </button>
  );
}

/* ============================================
   Helpers
   ============================================ */
function getOptionState({
  optionId,
  selectedOption,
  showFeedback,
  currentLocalAnswer,
  pending,
}: {
  optionId: string;
  selectedOption: string | null;
  showFeedback: boolean;
  currentLocalAnswer: LocalAnswer | undefined;
  pending: boolean;
}): "idle" | "selected-pending" | "correct" | "incorrect" | "correct-revealed" | "neutral" {
  if (!showFeedback) {
    if (pending && selectedOption === optionId) return "selected-pending";
    return "idle";
  }
  // showFeedback = true
  if (!currentLocalAnswer) return "idle";

  if (currentLocalAnswer.selectedOptionId === optionId) {
    return currentLocalAnswer.isCorrect ? "correct" : "incorrect";
  }
  if (
    !currentLocalAnswer.isCorrect &&
    currentLocalAnswer.correctOptionId === optionId
  ) {
    return "correct-revealed";
  }
  return "neutral";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
