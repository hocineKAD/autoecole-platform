import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function generateSlots(
  startHour: number,
  endHour: number,
  durationMin: number,
  lunchStart?: number | null,
  lunchEnd?: number | null
): string[] {
  const slots: string[] = [];
  const lunchStartM = lunchStart != null ? lunchStart * 60 : null;
  const lunchEndM = lunchEnd != null ? lunchEnd * 60 : null;
  for (let m = startHour * 60; m < endHour * 60; m += durationMin) {
    if (lunchStartM != null && lunchEndM != null) {
      if (m >= lunchStartM && m < lunchEndM) continue;
    }
    slots.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}:00`);
  }
  return slots;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const school_id = searchParams.get("school_id");
  const year = parseInt(searchParams.get("year") ?? "");
  const month = parseInt(searchParams.get("month") ?? ""); // 1–12

  if (!school_id || isNaN(year) || isNaN(month)) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Weekly schedules
  const { data: schedules } = await supabase
    .from("school_weekly_schedules")
    .select("day_of_week, start_hour, end_hour, slot_duration_min, lunch_break_start, lunch_break_end")
    .eq("school_id", school_id)
    .eq("is_active", true);

  if (!schedules || schedules.length === 0) {
    return NextResponse.json({ available_days: [], no_schedule: true });
  }

  const scheduleMap = new Map(schedules.map((s) => [s.day_of_week, s]));

  const daysInMonth = new Date(year, month, 0).getDate();
  const start = dateStr(year, month, 1);
  const end = dateStr(year, month, daysInMonth);

  // Exceptions (closed days)
  const { data: exceptions } = await supabase
    .from("schedule_exceptions")
    .select("exception_date")
    .eq("school_id", school_id)
    .eq("is_closed", true)
    .gte("exception_date", start)
    .lte("exception_date", end);

  const closedDates = new Set((exceptions ?? []).map((e) => e.exception_date));

  // Existing non-refused bookings for this month
  const { data: bookings } = await supabase
    .from("bookings")
    .select("preferred_date, slot_time")
    .eq("school_id", school_id)
    .neq("status", "refused")
    .gte("preferred_date", start)
    .lte("preferred_date", end)
    .not("slot_time", "is", null);

  const bookedMap = new Map<string, Set<string>>();
  for (const b of bookings ?? []) {
    if (!b.slot_time) continue;
    if (!bookedMap.has(b.preferred_date)) bookedMap.set(b.preferred_date, new Set());
    bookedMap.get(b.preferred_date)!.add(b.slot_time);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const available_days: string[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    if (date <= today) continue;

    const ds = dateStr(year, month, d);
    if (closedDates.has(ds)) continue;

    const dow = date.getDay(); // 0=Sun
    const sched = scheduleMap.get(dow);
    if (!sched) continue;

    const allSlots = generateSlots(sched.start_hour, sched.end_hour, sched.slot_duration_min, sched.lunch_break_start, sched.lunch_break_end);
    const booked = bookedMap.get(ds) ?? new Set();
    const hasOpen = allSlots.some((s) => !booked.has(s));

    if (hasOpen) available_days.push(ds);
  }

  return NextResponse.json({ available_days, no_schedule: false });
}
