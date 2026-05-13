"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Phone, X, Coffee } from "lucide-react";
import { BookingActions } from "@/components/bookings/booking-actions";
import { VEHICLE_CONFIG, STAGE_CONFIG, MONTH_NAMES, type WeeklySchedule, type VehicleType, type TrainingStage } from "@/lib/bookings/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CalendarBooking {
  id: string;
  preferred_date: string;
  slot_time: string | null;
  status: "pending" | "approved" | "refused";
  vehicle_type: string;
  stage: string | null;
  candidate_note: string | null;
  candidate_name: string | null;
  candidate_phone: string | null;
}

interface Props {
  bookings: CalendarBooking[];
  schedule: WeeklySchedule[];
  exceptions: { exception_date: string; is_closed: boolean }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_SHORT_MON = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8h → 20h

function pad(n: number) { return String(n).padStart(2, "0"); }
function toDateStr(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function isToday(d: Date) { return toDateStr(d) === toDateStr(new Date()); }

function getMonday(d: Date): Date {
  const day = new Date(d);
  const dow = (day.getDay() + 6) % 7; // Mon=0
  day.setDate(day.getDate() - dow);
  day.setHours(0, 0, 0, 0);
  return day;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return r;
}

function slotHour(slotTime: string | null): number | null {
  if (!slotTime) return null;
  return parseInt(slotTime.split(":")[0], 10);
}

function formatSlot(slotTime: string | null) {
  if (!slotTime) return "—";
  return slotTime.slice(0, 5) + "h";
}

function formatDateFR(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

const STATUS_STYLE = {
  pending:  { dot: "bg-yellow-400", card: "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200", badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", label: "En attente" },
  approved: { dot: "bg-green-400",  card: "border-green-300  bg-green-50  dark:border-green-700  dark:bg-green-900/20",  text: "text-green-800  dark:text-green-200",  badge: "bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300",  label: "Validé"     },
  refused:  { dot: "bg-red-300",    card: "border-red-200    bg-red-50    dark:border-red-800     dark:bg-red-900/20",    text: "text-red-700    dark:text-red-300",    badge: "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-300",    label: "Refusé"     },
};

// ─── Booking detail panel ─────────────────────────────────────────────────────

function BookingPanel({ booking, onClose }: { booking: CalendarBooking; onClose: () => void }) {
  const vehicle = VEHICLE_CONFIG[booking.vehicle_type as VehicleType];
  const st = STATUS_STYLE[booking.status];
  return (
    <div className="rounded-3xl border-2 border-navy-100 bg-white p-6 shadow-card dark:border-navy-700 dark:bg-navy-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-navy-900 dark:text-navy-50">Détails de la réservation</h3>
        <button onClick={onClose} className="rounded-xl p-1 text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/30">
          {vehicle?.emoji ?? "🚗"}
        </div>
        <div className="flex-1 space-y-1">
          <div className="font-bold text-navy-900 dark:text-navy-50">{booking.candidate_name ?? "Candidat inconnu"}</div>
          {booking.candidate_phone && (
            <div className="flex items-center gap-1 text-sm text-navy-500 dark:text-navy-400">
              <Phone className="h-3.5 w-3.5" />{booking.candidate_phone}
            </div>
          )}
          <div className="text-sm text-navy-600 dark:text-navy-300 capitalize">
            {formatDateFR(booking.preferred_date)} {booking.slot_time ? `· ${formatSlot(booking.slot_time)}` : ""}
          </div>
          {booking.candidate_note && (
            <div className="mt-2 text-sm italic text-navy-500 dark:text-navy-400">
              &ldquo;{booking.candidate_note}&rdquo;
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.badge}`}>
              {st.label}
            </span>
            {booking.stage && STAGE_CONFIG[booking.stage as TrainingStage] && (
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_CONFIG[booking.stage as TrainingStage].badge}`}>
                {STAGE_CONFIG[booking.stage as TrainingStage].emoji} {STAGE_CONFIG[booking.stage as TrainingStage].label}
              </span>
            )}
          </div>
        </div>
      </div>

      {booking.status === "pending" && (
        <BookingActions bookingId={booking.id} />
      )}
    </div>
  );
}

// ─── Month view ───────────────────────────────────────────────────────────────

interface MonthViewProps {
  year: number;
  month: number; // 1-12
  bookingsByDate: Map<string, CalendarBooking[]>;
  scheduleMap: Map<number, WeeklySchedule>;
  closedDays: Set<string>;
  selected: string | null;
  onSelect: (ds: string | null) => void;
}

function MonthView({ year, month, bookingsByDate, scheduleMap, closedDays, selected, onSelect }: MonthViewProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Mon=0
  const today = toDateStr(new Date());

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card dark:bg-navy-800">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-navy-100 dark:border-navy-700">
        {DAY_SHORT_MON.map((d) => (
          <div key={d} className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-500">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="min-h-[80px] border-b border-r border-navy-50 p-1 dark:border-navy-700/50" />;

          const ds = `${year}-${pad(month)}-${pad(day)}`;
          const monDow = (firstDow + day - 1) % 7; // Mon-first, pour affichage seulement
          const dbDow = (monDow + 1) % 7;          // DB convention : 0=Dim, 1=Lun…
          const sched = scheduleMap.get(dbDow);
          const isClosed = closedDays.has(ds) || !sched?.is_active;
          const dayBookings = bookingsByDate.get(ds) ?? [];
          const isSelected = selected === ds;
          const isTodayCell = ds === today;

          const pendingCount = dayBookings.filter((b) => b.status === "pending").length;
          const approvedCount = dayBookings.filter((b) => b.status === "approved").length;
          const refusedCount = dayBookings.filter((b) => b.status === "refused").length;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(isSelected ? null : ds)}
              disabled={isClosed && dayBookings.length === 0}
              className={`
                min-h-[80px] border-b border-r border-navy-50 p-2 text-left transition-colors
                dark:border-navy-700/50
                ${isSelected ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-navy-50 dark:hover:bg-navy-700/30"}
                ${isClosed ? "bg-navy-50/60 dark:bg-navy-900/30" : ""}
              `}
            >
              <div className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                isTodayCell ? "bg-primary-500 text-white" : "text-navy-700 dark:text-navy-300"
              } ${isClosed ? "opacity-40" : ""}`}>
                {day}
              </div>

              {dayBookings.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-0.5 rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                      {pendingCount}
                    </span>
                  )}
                  {approvedCount > 0 && (
                    <span className="flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      {approvedCount}
                    </span>
                  )}
                  {refusedCount > 0 && (
                    <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
                      {refusedCount}
                    </span>
                  )}
                </div>
              )}
              {isClosed && (
                <div className="mt-1 text-[10px] text-navy-300 dark:text-navy-600">Fermé</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week view ────────────────────────────────────────────────────────────────

interface WeekViewProps {
  monday: Date;
  bookingsByDate: Map<string, CalendarBooking[]>;
  scheduleMap: Map<number, WeeklySchedule>;
  closedDays: Set<string>;
  onBookingClick: (b: CalendarBooking) => void;
}

function WeekView({ monday, bookingsByDate, scheduleMap, closedDays, onBookingClick }: WeekViewProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card dark:bg-navy-800">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth: 700 }}>
          <thead>
            <tr className="border-b border-navy-100 dark:border-navy-700">
              <th className="w-14 py-3 pr-3 text-right text-xs font-medium text-navy-400 dark:text-navy-500" />
              {weekDays.map((day) => {
                const dbDow = day.getDay();            // DB: 0=Dim, 1=Lun…
                const monDow = (dbDow + 6) % 7;       // Mon-first pour DAY_SHORT_MON
                const sched = scheduleMap.get(dbDow);
                const isClosed = closedDays.has(toDateStr(day)) || !sched?.is_active;
                return (
                  <th key={toDateStr(day)} className={`py-3 text-center ${isClosed ? "opacity-40" : ""}`}>
                    <div className="text-xs font-medium text-navy-500 dark:text-navy-400">
                      {DAY_SHORT_MON[monDow]}
                    </div>
                    <div className={`text-lg font-bold ${isToday(day) ? "text-primary-500" : "text-navy-800 dark:text-navy-100"}`}>
                      {day.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-b border-navy-50 dark:border-navy-700/50">
                <td className="py-1 pr-3 text-right text-xs font-medium text-navy-400 dark:text-navy-500 align-top pt-2">
                  {hour}h
                </td>
                {weekDays.map((day) => {
                  const dateStr = toDateStr(day);
                  const dbDow = day.getDay(); // DB: 0=Dim
                  const sched = scheduleMap.get(dbDow);
                  const isClosed = closedDays.has(dateStr) || !sched?.is_active;

                  const isLunch =
                    sched?.lunch_break_start != null &&
                    sched?.lunch_break_end != null &&
                    hour >= sched.lunch_break_start &&
                    hour < sched.lunch_break_end;

                  const isOutside =
                    !isClosed && sched && (hour < sched.start_hour || hour >= sched.end_hour);

                  const cellBookings = (bookingsByDate.get(dateStr) ?? []).filter(
                    (b) => slotHour(b.slot_time) === hour
                  );

                  let cellClass = "min-w-[100px] p-1 align-top";
                  if (isClosed) cellClass += " bg-navy-50/60 dark:bg-navy-900/30";
                  else if (isLunch) cellClass += " bg-amber-50/60 dark:bg-amber-900/10";
                  else if (isOutside) cellClass += " bg-navy-50/30 dark:bg-navy-900/10";

                  return (
                    <td key={dateStr} className={cellClass}>
                      {isLunch && cellBookings.length === 0 && (
                        <div className="flex items-center justify-center py-1">
                          <Coffee className="h-3 w-3 text-amber-300" />
                        </div>
                      )}
                      {cellBookings.map((b) => {
                        const st = STATUS_STYLE[b.status];
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => onBookingClick(b)}
                            className={`mb-1 w-full rounded-xl border px-2 py-1.5 text-left text-xs transition-opacity hover:opacity-80 ${st.card}`}
                          >
                            <div className={`truncate font-semibold ${st.text}`}>
                              {b.candidate_name ?? "—"}
                            </div>
                            <div className={`flex items-center gap-1 ${st.text} opacity-80`}>
                              <span>{formatSlot(b.slot_time)}</span>
                              <span>{VEHICLE_CONFIG[b.vehicle_type as VehicleType]?.emoji}</span>
                              {b.stage && STAGE_CONFIG[b.stage as TrainingStage] && (
                                <span>{STAGE_CONFIG[b.stage as TrainingStage].emoji}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-navy-100 px-4 py-3 dark:border-navy-700">
        {(["pending", "approved", "refused"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-navy-500 dark:text-navy-400">
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLE[s].dot}`} />
            {STATUS_STYLE[s].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-navy-500 dark:text-navy-400">
          <Coffee className="h-3 w-3 text-amber-400" /> Pause déjeuner
        </span>
      </div>
    </div>
  );
}

// ─── Day bookings list (month view detail) ────────────────────────────────────

function DayList({
  dateStr,
  bookings,
  onSelect,
}: {
  dateStr: string;
  bookings: CalendarBooking[];
  onSelect: (b: CalendarBooking) => void;
}) {
  if (bookings.length === 0) return (
    <div className="rounded-3xl bg-white p-6 text-center shadow-card dark:bg-navy-800">
      <p className="text-sm text-navy-500 dark:text-navy-400 capitalize">
        {formatDateFR(dateStr)} — aucune réservation.
      </p>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-navy-600 dark:text-navy-300 capitalize">
        {formatDateFR(dateStr)}
      </p>
      {bookings.map((b) => {
        const vehicle = VEHICLE_CONFIG[b.vehicle_type as VehicleType];
        const st = STATUS_STYLE[b.status];
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b)}
            className={`w-full rounded-2xl border-2 p-4 text-left transition-colors hover:opacity-90 ${st.card}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{vehicle?.emoji ?? "🚗"}</span>
                <div>
                  <div className={`font-bold ${st.text}`}>{b.candidate_name ?? "—"}</div>
                  <div className={`text-xs ${st.text} opacity-80`}>{formatSlot(b.slot_time)}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.badge}`}>{st.label}</span>
                {b.stage && STAGE_CONFIG[b.stage as TrainingStage] && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_CONFIG[b.stage as TrainingStage].badge}`}>
                    {STAGE_CONFIG[b.stage as TrainingStage].emoji} {STAGE_CONFIG[b.stage as TrainingStage].label}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReservationsCalendar({ bookings, schedule, exceptions }: Props) {
  const [view, setView] = useState<"month" | "week">("month");
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);

  const scheduleMap = useMemo(
    () => new Map(schedule.map((s) => [s.day_of_week, s])),
    [schedule]
  );
  const closedDays = useMemo(
    () => new Set(exceptions.filter((e) => e.is_closed).map((e) => e.exception_date)),
    [exceptions]
  );
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const b of bookings) {
      const arr = map.get(b.preferred_date) ?? [];
      arr.push(b);
      map.set(b.preferred_date, arr);
    }
    return map;
  }, [bookings]);

  // Navigation
  const prev = () => {
    setSelectedDay(null);
    setSelectedBooking(null);
    if (view === "month") setCurrentDate((d) => addMonths(d, -1));
    else setCurrentDate((d) => addDays(d, -7));
  };
  const next = () => {
    setSelectedDay(null);
    setSelectedBooking(null);
    if (view === "month") setCurrentDate((d) => addMonths(d, 1));
    else setCurrentDate((d) => addDays(d, 7));
  };
  const goToday = () => {
    setCurrentDate(view === "month" ? new Date(now.getFullYear(), now.getMonth(), 1) : getMonday(now));
    setSelectedDay(null);
    setSelectedBooking(null);
  };

  // Period label
  const monday = getMonday(currentDate);
  const sunday = addDays(monday, 6);
  const periodLabel =
    view === "month"
      ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      : `${monday.getDate()} ${MONTH_NAMES[monday.getMonth()]} – ${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()]} ${sunday.getFullYear()}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-card dark:bg-navy-800">
        {/* View toggle */}
        <div className="flex rounded-2xl border-2 border-navy-100 p-0.5 dark:border-navy-700">
          {(["month", "week"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setView(v); setSelectedDay(null); setSelectedBooking(null); setCurrentDate(v === "month" ? new Date(now.getFullYear(), now.getMonth(), 1) : getMonday(now)); }}
              className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors ${
                view === v
                  ? "bg-primary-500 text-white"
                  : "text-navy-600 hover:text-navy-800 dark:text-navy-400"
              }`}
            >
              {v === "month" ? "Mois" : "Semaine"}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy-100 text-navy-600 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[200px] text-center text-sm font-semibold text-navy-900 dark:text-navy-50">
            {periodLabel}
          </span>
          <button
            type="button"
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-navy-100 text-navy-600 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={goToday}
          className="rounded-xl border border-navy-100 px-4 py-1.5 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-700"
        >
          Aujourd&apos;hui
        </button>
      </div>

      {/* Calendar */}
      {view === "month" ? (
        <MonthView
          year={currentDate.getFullYear()}
          month={currentDate.getMonth() + 1}
          bookingsByDate={bookingsByDate}
          scheduleMap={scheduleMap}
          closedDays={closedDays}
          selected={selectedDay}
          onSelect={(ds) => { setSelectedDay(ds); setSelectedBooking(null); }}
        />
      ) : (
        <WeekView
          monday={monday}
          bookingsByDate={bookingsByDate}
          scheduleMap={scheduleMap}
          closedDays={closedDays}
          onBookingClick={(b) => { setSelectedBooking(b); setSelectedDay(null); }}
        />
      )}

      {/* Month view: day list */}
      {view === "month" && selectedDay && !selectedBooking && (
        <DayList
          dateStr={selectedDay}
          bookings={bookingsByDate.get(selectedDay) ?? []}
          onSelect={setSelectedBooking}
        />
      )}

      {/* Booking detail panel */}
      {selectedBooking && (
        <BookingPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
