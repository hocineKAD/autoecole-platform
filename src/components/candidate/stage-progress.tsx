import { Check } from "lucide-react";
import { STAGE_CONFIG, STAGE_ORDER, type TrainingStage, type VehicleType } from "@/lib/bookings/types";

interface Props {
  currentStage: TrainingStage | null;
  vehicleType: VehicleType;
}

export function StageProgress({ currentStage, vehicleType }: Props) {
  const stages = STAGE_ORDER[vehicleType];
  const currentIndex = currentStage ? stages.indexOf(currentStage) : -1;

  return (
    <div className="mb-6 rounded-3xl border-2 border-navy-100 bg-white px-6 py-5 shadow-card dark:border-navy-700 dark:bg-navy-800">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-navy-500 dark:text-navy-400">
        Votre progression
      </div>
      <div className="flex items-start">
        {stages.map((stage, i) => {
          const config = STAGE_CONFIG[stage];
          const isDone = currentIndex > i;
          const isCurrent = currentIndex === i;

          return (
            <div key={stage} className="flex flex-1 items-start">
              {/* Connector line (between steps) */}
              {i > 0 && (
                <div className={`mt-5 h-0.5 flex-1 ${isDone || isCurrent ? "bg-primary-300 dark:bg-primary-700" : "bg-navy-200 dark:bg-navy-600"}`} />
              )}

              {/* Step node */}
              <div className="flex flex-col items-center gap-2 px-1">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg ${
                    isDone
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : isCurrent
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-navy-100 text-navy-400 dark:bg-navy-700 dark:text-navy-500"
                  }`}
                >
                  {isDone ? <Check className="h-5 w-5 stroke-[2.5]" /> : <span>{config.emoji}</span>}
                </div>
                <div className="text-center">
                  <div
                    className={`text-xs font-semibold leading-tight ${
                      isDone
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isCurrent
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-navy-400 dark:text-navy-500"
                    }`}
                  >
                    {config.label}
                  </div>
                  {isCurrent && (
                    <div className="mt-0.5 text-[10px] font-medium text-primary-500 dark:text-primary-400">
                      En cours
                    </div>
                  )}
                  {isDone && (
                    <div className="mt-0.5 text-[10px] font-medium text-emerald-500 dark:text-emerald-400">
                      Terminé
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
