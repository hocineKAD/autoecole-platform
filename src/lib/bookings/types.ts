export type VehicleType = "auto" | "moto";
export type BookingStatus = "pending" | "approved" | "refused";
export type PreferredSlot = "morning" | "afternoon" | "evening";
export type TrainingStage = "code" | "stationnement" | "conduite";

export const VEHICLE_CONFIG: Record<
  VehicleType,
  { label: string; description: string; emoji: string }
> = {
  auto: {
    label: "Permis B — Voiture",
    description: "Formation à la conduite automobile",
    emoji: "🚗",
  },
  moto: {
    label: "Permis A — Moto",
    description: "Formation à la conduite moto",
    emoji: "🏍️",
  },
};

export const SLOT_LABELS: Record<PreferredSlot, string> = {
  morning: "Matin (8h–12h)",
  afternoon: "Après-midi (12h–17h)",
  evening: "Soir (17h–20h)",
};

export const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; classes: string }
> = {
  pending: {
    label: "En attente",
    classes:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  approved: {
    label: "Validé",
    classes:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  refused: {
    label: "Refusé",
    classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

export const STAGE_CONFIG: Record<
  TrainingStage,
  { label: string; description: string; emoji: string; badge: string; dot: string }
> = {
  code: {
    label: "Code de la route",
    description: "Apprentissage théorique du code",
    emoji: "📖",
    badge: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    dot: "bg-primary-400",
  },
  stationnement: {
    label: "Stationnement",
    description: "Manœuvres et stationnement (moto)",
    emoji: "🏍️",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  conduite: {
    label: "Conduite",
    description: "Conduite sur route avec moniteur",
    emoji: "🛣️",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    dot: "bg-emerald-400",
  },
};

export const STAGE_ORDER: Record<VehicleType, TrainingStage[]> = {
  auto: ["code", "conduite"],
  moto: ["code", "stationnement", "conduite"],
};

export const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
export const DAY_NAMES_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
export const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export interface WeeklySchedule {
  id?: string;
  school_id: string;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  slot_duration_min: number;
  is_active: boolean;
  lunch_break_start?: number | null;
  lunch_break_end?: number | null;
}

export interface ScheduleException {
  id: string;
  school_id: string;
  exception_date: string;
  is_closed: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  school_id: string;
  candidate_id: string;
  vehicle_type: VehicleType;
  preferred_date: string;
  preferred_slot: PreferredSlot | null;
  slot_time: string | null;
  stage: TrainingStage | null;
  candidate_note: string | null;
  status: BookingStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithProfile extends Booking {
  profiles: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

export function formatSlotTime(
  slotTime: string | null,
  preferredSlot: PreferredSlot | null
): string {
  if (slotTime) return slotTime.slice(0, 5) + "h";
  if (preferredSlot) return SLOT_LABELS[preferredSlot];
  return "—";
}
