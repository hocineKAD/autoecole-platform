/**
 * Domaine QCM — types et constantes partagés client/serveur.
 */

export type QuestionCategory =
  | "panneaux"
  | "priorites"
  | "signalisation"
  | "conduite"
  | "mecanique"
  | "secourisme"
  | "reglementation"
  | "autres";

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  panneaux: "Panneaux",
  priorites: "Priorités",
  signalisation: "Signalisation",
  conduite: "Conduite",
  mecanique: "Mécanique",
  secourisme: "Secourisme",
  reglementation: "Réglementation",
  autres: "Autres",
};

export const CATEGORY_EMOJIS: Record<QuestionCategory, string> = {
  panneaux: "🚸",
  priorites: "⚠️",
  signalisation: "🚦",
  conduite: "🚗",
  mecanique: "🔧",
  secourisme: "🚑",
  reglementation: "📋",
  autres: "📚",
};

/** Modes du QCM. */
export type QuizMode = "learning" | "training" | "exam";

export const MODE_CONFIG: Record<
  QuizMode,
  {
    label: string;
    description: string;
    questionCount: number;
    timeLimitSec: number | null; // null = pas de chrono
    immediateFeedback: boolean;
    passingScore: number; // score minimal pour réussir
  }
> = {
  learning: {
    label: "Apprentissage",
    description: "10 questions, correction immédiate après chaque réponse.",
    questionCount: 10,
    timeLimitSec: null,
    immediateFeedback: true,
    passingScore: 7, // 7/10
  },
  training: {
    label: "Entraînement",
    description: "20 questions, correction immédiate. Format moyen.",
    questionCount: 20,
    timeLimitSec: null,
    immediateFeedback: true,
    passingScore: 14, // 14/20
  },
  exam: {
    label: "Examen blanc",
    description: "40 questions chronométrées (30 min). Corrections à la fin.",
    questionCount: 40,
    timeLimitSec: 30 * 60,
    immediateFeedback: false,
    passingScore: 32, // 32/40 — proche de l'officiel
  },
};

export const MODE_ORDER: QuizMode[] = ["learning", "training", "exam"];
