"use client";

import { useState, useTransition } from "react";
import { saveWeeklySchedule } from "@/lib/bookings/schedule-actions";
import { DAY_NAMES, type WeeklySchedule } from "@/lib/bookings/types";
import { CheckCircle, Loader2 } from "lucide-react";

const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6h → 24h

interface Props {
  schoolId: string;
  initialSchedules: WeeklySchedule[];
}

export function WeeklyScheduleEditor({ schoolId, initialSchedules }: Props) {
  const [schedules, setSchedules] = useState<WeeklySchedule[]>(() => {
    const existing = new Map(initialSchedules.map((s) => [s.day_of_week, s]));
    return Array.from({ length: 7 }, (_, i) =>
      existing.get(i) ?? {
        school_id: schoolId,
        day_of_week: i,
        start_hour: 9,
        end_hour: 17,
        slot_duration_min: 60,
        is_active: i >= 1 && i <= 5,
        lunch_break_start: null,
        lunch_break_end: null,
      }
    );
  });

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = (
    dayIndex: number,
    field: keyof WeeklySchedule,
    value: unknown
  ) => {
    setSaved(false);
    setSchedules((prev) =>
      prev.map((s, i) => (i === dayIndex ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      await saveWeeklySchedule(schedules);
      setSaved(true);
    });
  };

  return (
    <div className="space-y-3">
      {schedules.map((s, i) => {
        const slotCount =
          s.is_active && s.end_hour > s.start_hour
            ? Math.floor(
                ((s.end_hour - s.start_hour) * 60) / s.slot_duration_min
              )
            : 0;

        return (
          <div
            key={i}
            className={`rounded-2xl border-2 p-4 transition-colors ${
              s.is_active
                ? "border-primary-200 bg-white dark:border-primary-800 dark:bg-navy-800"
                : "border-navy-100 bg-navy-50 dark:border-navy-800 dark:bg-navy-900"
            }`}
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Toggle */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={s.is_active}
                  onChange={(e) => update(i, "is_active", e.target.checked)}
                  className="h-4 w-4 rounded accent-primary-500"
                />
                <span
                  className={`w-24 font-semibold ${
                    s.is_active
                      ? "text-navy-900 dark:text-navy-50"
                      : "text-navy-400 dark:text-navy-600"
                  }`}
                >
                  {DAY_NAMES[i]}
                </span>
              </label>

              {s.is_active && (
                <div className="flex flex-wrap items-center gap-3">
                  {/* Start */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-navy-500 dark:text-navy-400">
                      Début
                    </span>
                    <select
                      value={s.start_hour}
                      onChange={(e) =>
                        update(i, "start_hour", Number(e.target.value))
                      }
                      className="rounded-lg border border-navy-200 bg-white px-2 py-1 text-sm text-navy-800 dark:border-navy-600 dark:bg-navy-700 dark:text-navy-100"
                    >
                      {HOURS.slice(0, -1).map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}h
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* End */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-navy-500 dark:text-navy-400">
                      Fin
                    </span>
                    <select
                      value={s.end_hour}
                      onChange={(e) =>
                        update(i, "end_hour", Number(e.target.value))
                      }
                      className="rounded-lg border border-navy-200 bg-white px-2 py-1 text-sm text-navy-800 dark:border-navy-600 dark:bg-navy-700 dark:text-navy-100"
                    >
                      {HOURS.slice(1).map((h) => (
                        <option key={h} value={h} disabled={h <= s.start_hour}>
                          {String(h).padStart(2, "0")}h
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-navy-500 dark:text-navy-400">
                      Durée
                    </span>
                    <select
                      value={s.slot_duration_min}
                      onChange={(e) =>
                        update(i, "slot_duration_min", Number(e.target.value))
                      }
                      className="rounded-lg border border-navy-200 bg-white px-2 py-1 text-sm text-navy-800 dark:border-navy-600 dark:bg-navy-700 dark:text-navy-100"
                    >
                      <option value={30}>30 min</option>
                      <option value={60}>1h</option>
                      <option value={90}>1h30</option>
                    </select>
                  </div>

                  {/* Pause déjeuner */}
                  <div className="flex items-center gap-1.5">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-navy-500 dark:text-navy-400">
                      <input
                        type="checkbox"
                        checked={s.lunch_break_start != null}
                        onChange={(e) => {
                          if (e.target.checked) {
                            update(i, "lunch_break_start", 12);
                            update(i, "lunch_break_end", 14);
                          } else {
                            update(i, "lunch_break_start", null);
                            update(i, "lunch_break_end", null);
                          }
                        }}
                        className="h-4 w-4 rounded accent-primary-500"
                      />
                      Pause déj.
                    </label>
                    {s.lunch_break_start != null && (
                      <div className="flex items-center gap-1">
                        <select
                          value={s.lunch_break_start}
                          onChange={(e) => update(i, "lunch_break_start", Number(e.target.value))}
                          className="rounded-lg border border-navy-200 bg-white px-1.5 py-1 text-xs text-navy-800 dark:border-navy-600 dark:bg-navy-700 dark:text-navy-100"
                        >
                          {HOURS.slice(0, -1).map((h) => (
                            <option key={h} value={h}>{String(h).padStart(2,"0")}h</option>
                          ))}
                        </select>
                        <span className="text-xs text-navy-400">→</span>
                        <select
                          value={s.lunch_break_end ?? 14}
                          onChange={(e) => update(i, "lunch_break_end", Number(e.target.value))}
                          className="rounded-lg border border-navy-200 bg-white px-1.5 py-1 text-xs text-navy-800 dark:border-navy-600 dark:bg-navy-700 dark:text-navy-100"
                        >
                          {HOURS.slice(1).map((h) => (
                            <option key={h} value={h} disabled={h <= (s.lunch_break_start ?? 12)}>
                              {String(h).padStart(2,"0")}h
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {slotCount > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {slotCount} créneau{slotCount > 1 ? "x" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 font-semibold text-white shadow-soft transition-colors hover:bg-primary-600 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sauvegarde…
            </>
          ) : (
            "Enregistrer le planning"
          )}
        </button>

        {saved && !isPending && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Sauvegardé
          </span>
        )}
      </div>
    </div>
  );
}
