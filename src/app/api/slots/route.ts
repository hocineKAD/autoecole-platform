import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const school_id = searchParams.get("school_id");
  const date = searchParams.get("date"); // YYYY-MM-DD

  if (!school_id || !date) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Day of week for this date
  const [y, mo, d] = date.split("-").map(Number);
  const dow = new Date(y, mo - 1, d).getDay();

  // Check exception
  const { data: exception } = await supabase
    .from("schedule_exceptions")
    .select("is_closed")
    .eq("school_id", school_id)
    .eq("exception_date", date)
    .maybeSingle();

  if (exception?.is_closed) return NextResponse.json({ slots: [] });

  // Weekly schedule for this day
  const { data: sched } = await supabase
    .from("school_weekly_schedules")
    .select("start_hour, end_hour, slot_duration_min, lunch_break_start, lunch_break_end")
    .eq("school_id", school_id)
    .eq("day_of_week", dow)
    .eq("is_active", true)
    .maybeSingle();

  if (!sched) return NextResponse.json({ slots: [] });

  // Existing non-refused bookings for this date
  const { data: bookings } = await supabase
    .from("bookings")
    .select("slot_time")
    .eq("school_id", school_id)
    .eq("preferred_date", date)
    .neq("status", "refused")
    .not("slot_time", "is", null);

  const booked = new Set((bookings ?? []).map((b) => b.slot_time as string));

  // Generate open slots (excluding lunch break)
  const lunchStartM = sched.lunch_break_start != null ? sched.lunch_break_start * 60 : null;
  const lunchEndM = sched.lunch_break_end != null ? sched.lunch_break_end * 60 : null;
  const slots: string[] = [];
  for (let m = sched.start_hour * 60; m < sched.end_hour * 60; m += sched.slot_duration_min) {
    if (lunchStartM != null && lunchEndM != null && m >= lunchStartM && m < lunchEndM) continue;
    const hh = pad(Math.floor(m / 60));
    const mm = pad(m % 60);
    const pgTime = `${hh}:${mm}:00`;
    const display = `${hh}:${mm}`;
    if (!booked.has(pgTime)) slots.push(display);
  }

  return NextResponse.json({ slots });
}
