"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { createBooking } from "@/lib/bookings/actions";
import {
  VEHICLE_CONFIG,
  STAGE_CONFIG,
  MONTH_NAMES,
  type VehicleType,
  type TrainingStage,
} from "@/lib/bookings/types";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";

const DAY_SHORT_MON_FIRST = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function formatDateLong(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5 font-bold text-white shadow-soft transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Envoi en cours…
        </>
      ) : (
        "Envoyer ma demande"
      )}
    </button>
  );
}

interface Props {
  schoolId: string;
  vehicleType: VehicleType;
  currentStage: TrainingStage | null;
}

export function NewBookingForm({ schoolId, vehicleType, currentStage }: Props) {
  const vehicle = VEHICLE_CONFIG[vehicleType];
  const stageCfg = currentStage ? STAGE_CONFIG[currentStage] : null;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [availableDays, setAvailableDays] = useState<Set<string>>(new Set());
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [noSchedule, setNoSchedule] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchMonthAvailability = useCallback(
    async (y: number, m: number) => {
      setLoadingMonth(true);
      setAvailableDays(new Set());
      setError(null);
      try {
        const res = await fetch(
          `/api/availability?school_id=${schoolId}&year=${y}&month=${m}`
        );
        const data = await res.json();
        if (data.no_schedule) {
          setNoSchedule(true);
        } else {
          setNoSchedule(false);
          setAvailableDays(new Set(data.available_days ?? []));
        }
      } catch {
        setError("Impossible de charger les disponibilités.");
      } finally {
        setLoadingMonth(false);
      }
    },
    [schoolId]
  );

  useEffect(() => {
    fetchMonthAvailability(year, month);
  }, [year, month, fetchMonthAvailability]);

  const handleDayClick = async (ds: string) => {
    if (!availableDays.has(ds)) return;
    setSelectedDate(ds);
    setSelectedSlot(null);
    setSlots([]);
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/slots?school_id=${schoolId}&date=${ds}`
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const prevMonth = () => {
    const canGo =
      year > now.getFullYear() || month > now.getMonth() + 1;
    if (!canGo) return;
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
  };

  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
  };

  const canGoPrev =
    year > now.getFullYear() || month > now.getMonth() + 1;

  // Calendar grid (Monday-first: adjust getDay() offset)
  const firstDayIndex = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (number | null)[] = [
    ...Array(firstDayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isFormReady = !!selectedDate && !!selectedSlot;

  return (
    <form action={createBooking} className="space-y-8">
      {/* Vehicle type — lecture seule */}
      <div className="flex items-center gap-4 rounded-2xl border-2 border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
        <span className="text-3xl">{vehicle.emoji}</span>
        <div>
          <div className="font-bold text-navy-900 dark:text-navy-50">
            {vehicle.label}
          </div>
          <div className="text-sm text-navy-500 dark:text-navy-400">
            {vehicle.description}
          </div>
        </div>
        <span className="ml-auto rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-800 dark:text-primary-200">
          Votre formation
        </span>
      </div>

      {/* Current stage — lecture seule */}
      {stageCfg && (
        <div className="flex items-center gap-4 rounded-2xl border-2 border-navy-100 bg-navy-50 p-4 dark:border-navy-700 dark:bg-navy-800">
          <span className="text-3xl">{stageCfg.emoji}</span>
          <div>
            <div className="font-bold text-navy-900 dark:text-navy-50">
              {stageCfg.label}
            </div>
            <div className="text-sm text-navy-500 dark:text-navy-400">
              {stageCfg.description}
            </div>
          </div>
          <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${stageCfg.badge}`}>
            Étape actuelle
          </span>
        </div>
      )}

      {/* Hidden inputs */}
      <input type="hidden" name="vehicle_type" value={vehicleType} />
      {selectedDate && (
        <input type="hidden" name="preferred_date" value={selectedDate} />
      )}
      {selectedSlot && (
        <input type="hidden" name="slot_time" value={selectedSlot} />
      )}

      {/* Calendar */}
      <div>
        <p className="mb-3 text-sm font-semibold text-navy-700 dark:text-navy-200">
          Choisir une date
        </p>

        {noSchedule ? (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              L&apos;auto-école n&apos;a pas encore configuré son planning de
              disponibilités. Veuillez la contacter directement pour convenir
              d&apos;un rendez-vous.
            </span>
          </div>
        ) : (
          <>
            {/* Month navigation */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                disabled={!canGoPrev}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy-100 bg-white text-navy-600 transition-colors hover:bg-navy-50 disabled:opacity-30 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-semibold text-navy-900 dark:text-navy-50">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy-100 bg-white text-navy-600 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {DAY_SHORT_MON_FIRST.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-xs font-medium text-navy-400 dark:text-navy-500"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            {loadingMonth ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const ds = toDateStr(year, month, day);
                  const date = new Date(year, month - 1, day);
                  const isPast = date <= today;
                  const isAvailable = availableDays.has(ds);
                  const isSelected = selectedDate === ds;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isPast || !isAvailable}
                      onClick={() => handleDayClick(ds)}
                      className={`
                        aspect-square w-full rounded-xl text-sm font-medium transition-colors
                        ${isSelected
                          ? "bg-primary-500 text-white"
                          : isAvailable
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-800/40"
                          : "cursor-not-allowed text-navy-300 dark:text-navy-600"}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-2 flex items-center gap-4 text-xs text-navy-400 dark:text-navy-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-200" />
                Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-primary-500" />
                Sélectionné
              </span>
            </div>
          </>
        )}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="mb-3 text-sm font-semibold text-navy-700 dark:text-navy-200">
            Horaires disponibles —{" "}
            <span className="capitalize">{formatDateLong(selectedDate)}</span>
          </p>

          {loadingSlots ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-navy-500 dark:text-navy-400">
              Aucun créneau disponible pour cette date.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`
                    rounded-2xl border-2 px-5 py-2.5 text-sm font-semibold transition-all
                    ${selectedSlot === slot
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      : "border-navy-100 bg-white text-navy-700 hover:border-primary-300 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-200 dark:hover:border-primary-700"}
                  `}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div>
        <label
          htmlFor="candidate_note"
          className="mb-2 block text-sm font-semibold text-navy-700 dark:text-navy-200"
        >
          Message (optionnel)
        </label>
        <textarea
          id="candidate_note"
          name="candidate_note"
          rows={3}
          placeholder="Précisions, préférences, questions..."
          className="w-full resize-none rounded-2xl border-2 border-navy-100 bg-white px-4 py-3 text-navy-900 placeholder:text-navy-400 transition-colors focus:border-primary-500 focus:outline-none dark:border-navy-700 dark:bg-navy-800 dark:text-navy-50 dark:placeholder:text-navy-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {!noSchedule && (
        <>
          {!isFormReady && (
            <p className="text-center text-sm text-navy-400 dark:text-navy-500">
              Sélectionnez une date et un horaire pour continuer.
            </p>
          )}
          <SubmitButton disabled={!isFormReady} />
        </>
      )}
    </form>
  );
}
