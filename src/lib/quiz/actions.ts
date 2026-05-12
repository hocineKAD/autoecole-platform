"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MODE_CONFIG, type QuizMode, type QuestionCategory } from "./types";

/**
 * Démarre un nouveau QCM.
 * - Sélectionne N questions selon mode + catégorie.
 * - Crée un quiz_attempt en base.
 * - Redirige vers la page du quiz.
 */
export async function startQuiz(formData: FormData) {
  const mode = formData.get("mode") as QuizMode;
  const categoryRaw = formData.get("category") as string;
  const category =
    categoryRaw === "mix" ? null : (categoryRaw as QuestionCategory);

  if (!mode || !MODE_CONFIG[mode]) {
    throw new Error("Mode invalide");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const config = MODE_CONFIG[mode];

  // Sélection des questions selon catégorie
  let query = supabase.from("questions").select("id");
  if (category) {
    query = query.eq("category", category);
  }

  const { data: questions, error: qErr } = await query;
  if (qErr || !questions || questions.length === 0) {
    throw new Error("Aucune question trouvée pour cette catégorie.");
  }

  // Mélange + sélection des N premières
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, config.questionCount);

  if (selected.length < config.questionCount) {
    // Pas assez de questions, on prend ce qu'on a (utile pour les catégories peu peuplées)
    console.warn(
      `Seulement ${selected.length} questions disponibles pour ce mode/catégorie.`
    );
  }

  // Récupère le school_id du candidat
  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  // Création de l'attempt
  const { data: attempt, error: aErr } = await supabase
    .from("quiz_attempts")
    .insert({
      candidate_id: user.id,
      school_id: profile?.school_id ?? null,
      total_questions: selected.length,
      category: category,
      mode: mode,
      time_limit_sec: config.timeLimitSec,
      question_ids: selected.map((q) => q.id),
    })
    .select("id")
    .single();

  if (aErr || !attempt) {
    console.error(aErr);
    throw new Error("Impossible de démarrer le QCM.");
  }

  redirect(`/dashboard/code/quiz/${attempt.id}`);
}

/**
 * Soumet une réponse pour une question dans un attempt.
 * Côté serveur : on calcule is_correct nous-mêmes (pas de triche client).
 */
export async function submitAnswer(args: {
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null; // null = pas répondu (timeout)
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non authentifié");

  // Vérifie que l'attempt appartient bien au candidat et n'est pas terminé
  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("id, candidate_id, finished_at")
    .eq("id", args.attemptId)
    .single();

  if (!attempt || attempt.candidate_id !== user.id) {
    throw new Error("Attempt introuvable");
  }
  if (attempt.finished_at) {
    throw new Error("Ce QCM est déjà terminé");
  }

  // Calcule is_correct côté serveur
  let isCorrect = false;
  let correctOptionId: string | null = null;
  if (args.selectedOptionId) {
    const { data: opt } = await supabase
      .from("answer_options")
      .select("id, is_correct, question_id")
      .eq("id", args.selectedOptionId)
      .single();

    if (opt && opt.question_id === args.questionId) {
      isCorrect = opt.is_correct;
    }
  }

  // Upsert la réponse (un candidat ne peut répondre qu'une fois par question dans un attempt)
  // On utilise on_conflict sur (attempt_id, question_id)
  const { error } = await supabase.from("quiz_answers").upsert(
    {
      attempt_id: args.attemptId,
      question_id: args.questionId,
      selected_option_id: args.selectedOptionId,
      is_correct: isCorrect,
    },
    { onConflict: "attempt_id,question_id" }
  );

  if (error) {
    console.error(error);
    throw new Error("Impossible d'enregistrer la réponse.");
  }

  // Récupère la bonne réponse pour le feedback (mode apprentissage/entraînement)
  const { data: correctOpt } = await supabase
    .from("answer_options")
    .select("id")
    .eq("question_id", args.questionId)
    .eq("is_correct", true)
    .single();

  correctOptionId = correctOpt?.id ?? null;

  return { isCorrect, correctOptionId };
}

/**
 * Termine un QCM : calcule le score final et marque finished_at.
 */
export async function finishQuiz(attemptId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Non authentifié");

  // Vérifie ownership
  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("id, candidate_id, finished_at, total_questions")
    .eq("id", attemptId)
    .single();

  if (!attempt || attempt.candidate_id !== user.id) {
    throw new Error("Attempt introuvable");
  }

  // Si déjà terminé, on ne fait rien (idempotent)
  if (attempt.finished_at) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/code");
    return;
  }

  // Calcule le score à partir des réponses
  const { count: correctCount } = await supabase
    .from("quiz_answers")
    .select("*", { count: "exact", head: true })
    .eq("attempt_id", attemptId)
    .eq("is_correct", true);

  const { error } = await supabase
    .from("quiz_attempts")
    .update({
      finished_at: new Date().toISOString(),
      score: correctCount ?? 0,
    })
    .eq("id", attemptId);

  if (error) {
    console.error(error);
    throw new Error("Impossible de terminer le QCM.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/code");
  revalidatePath("/dashboard/code/history");
}
