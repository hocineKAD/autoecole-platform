"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setCandidateStage } from "@/lib/admin/stage-actions";
import {
  STAGE_CONFIG,
  STAGE_ORDER,
  type TrainingStage,
  type VehicleType,
} from "@/lib/bookings/types";

interface Props {
  candidateId: string;
  currentStage: TrainingStage | null;
  vehicleType: VehicleType;
}

export function StageSelector({ candidateId, currentStage, vehicleType }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const stages = STAGE_ORDER[vehicleType];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStage = e.target.value as TrainingStage;
    if (newStage === currentStage) return;
    startTransition(async () => {
      await setCandidateStage(candidateId, newStage);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={currentStage ?? ""}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-xl border border-navy-200 bg-white px-2 py-1 text-xs text-navy-800 transition-colors focus:border-primary-400 focus:outline-none disabled:opacity-60 dark:border-navy-600 dark:bg-navy-700 dark:text-navy-100"
      >
        {currentStage === null && <option value="">—</option>}
        {stages.map((s) => (
          <option key={s} value={s}>
            {STAGE_CONFIG[s].emoji} {STAGE_CONFIG[s].label}
          </option>
        ))}
      </select>
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />}
    </div>
  );
}
