import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { MODE_CONFIG, type QuizMode } from "@/lib/quiz/types";

export default async function QuizPage({
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

  // Récupère l'attempt
  const { data: attempt, error } = await supabase
    .from("quiz_attempts")
    .select(
      "id, candidate_id, mode, time_limit_sec, question_ids, total_questions, started_at, finished_at, category"
    )
    .eq("id", attemptId)
    .single();

  if (error || !attempt) notFound();
  if (attempt.candidate_id !== user.id) notFound();

  // Si déjà terminé → rediriger vers les résultats
  if (attempt.finished_at) {
    redirect(`/dashboard/code/results/${attemptId}`);
  }

  // Charge toutes les questions de l'attempt avec leurs options
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select(
      `
      id,
      category,
      text,
      image_url,
      explanation,
      answer_options (
        id,
        text,
        position,
        is_correct
      )
    `
    )
    .in("id", attempt.question_ids);

  if (qErr || !questions) {
    throw new Error("Impossible de charger les questions.");
  }

  // Réordonne selon question_ids (l'ordre choisi à la création)
  type Question = (typeof questions)[number];
  const orderedQuestions: Question[] = (attempt.question_ids as string[])
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is Question => !!q)
    .map((q) => ({
      ...q,
      answer_options: [...q.answer_options].sort(
        (a, b) => a.position - b.position
      ),
    }));

  // Récupère les réponses déjà données (pour reprendre où on en était)
  const { data: existingAnswers } = await supabase
    .from("quiz_answers")
    .select("question_id, selected_option_id, is_correct")
    .eq("attempt_id", attemptId);

  const config = MODE_CONFIG[attempt.mode as QuizMode];

  return (
    <QuizPlayer
      attemptId={attemptId}
      mode={attempt.mode as QuizMode}
      timeLimitSec={attempt.time_limit_sec}
      startedAt={attempt.started_at}
      questions={orderedQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        explanation: q.explanation,
        options: q.answer_options.map((o) => ({
          id: o.id,
          text: o.text,
        })),
      }))}
      existingAnswers={existingAnswers ?? []}
      immediateFeedback={config.immediateFeedback}
    />
  );
}
