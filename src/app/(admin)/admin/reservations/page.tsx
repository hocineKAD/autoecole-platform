import { createClient } from "@/lib/supabase/server";
import { ReservationsCalendar } from "@/components/admin/reservations-calendar";
import type { WeeklySchedule } from "@/lib/bookings/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function AdminReservationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "school_admin" || !profile.school_id) return null;

  const schoolId = profile.school_id;

  // Fenêtre : aujourd'hui - 2 mois → aujourd'hui + 4 mois
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 5, 0); // dernier jour du 5e mois futur

  const startStr = `${rangeStart.getFullYear()}-${pad(rangeStart.getMonth() + 1)}-01`;
  const endStr = `${rangeEnd.getFullYear()}-${pad(rangeEnd.getMonth() + 1)}-${pad(rangeEnd.getDate())}`;

  const [bookingsRes, scheduleRes, exceptionsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, preferred_date, slot_time, status, vehicle_type, stage, candidate_note, profiles!candidate_id(full_name, phone)")
      .eq("school_id", schoolId)
      .gte("preferred_date", startStr)
      .lte("preferred_date", endStr)
      .order("preferred_date", { ascending: true })
      .order("slot_time", { ascending: true }),

    supabase
      .from("school_weekly_schedules")
      .select("*")
      .eq("school_id", schoolId)
      .order("day_of_week"),

    supabase
      .from("schedule_exceptions")
      .select("exception_date, is_closed")
      .eq("school_id", schoolId)
      .gte("exception_date", startStr)
      .lte("exception_date", endStr),
  ]);

  // Flatten bookings pour le composant client
  const bookings = (bookingsRes.data ?? []).map((b) => {
    const prof = b.profiles as unknown as { full_name: string | null; phone: string | null } | null;
    return {
      id: b.id as string,
      preferred_date: b.preferred_date as string,
      slot_time: b.slot_time as string | null,
      status: b.status as "pending" | "approved" | "refused",
      vehicle_type: b.vehicle_type as string,
      stage: b.stage as string | null,
      candidate_note: b.candidate_note as string | null,
      candidate_name: prof?.full_name ?? null,
      candidate_phone: prof?.phone ?? null,
    };
  });

  const schedule = (scheduleRes.data ?? []) as WeeklySchedule[];
  const exceptions = (exceptionsRes.data ?? []) as { exception_date: string; is_closed: boolean }[];

  return (
    <div className="container-narrow py-10">
      <div className="mb-8">
        <div className="text-sm font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Administration
        </div>
        <h1 className="mt-2 text-3xl font-bold text-navy-900 dark:text-navy-50 md:text-4xl">
          Réservations
        </h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          Vue calendaire des demandes de conduite.
        </p>
      </div>

      <ReservationsCalendar
        bookings={bookings}
        schedule={schedule}
        exceptions={exceptions}
      />
    </div>
  );
}
