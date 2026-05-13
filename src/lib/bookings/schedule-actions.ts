"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WeeklySchedule, ScheduleException } from "./types";

export async function getWeeklySchedule(schoolId: string): Promise<WeeklySchedule[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("school_weekly_schedules")
    .select("*")
    .eq("school_id", schoolId)
    .order("day_of_week");
  return (data as WeeklySchedule[]) ?? [];
}

export async function saveWeeklySchedule(schedules: WeeklySchedule[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "school_admin") throw new Error("Accès refusé");

  const upsertData = schedules.map((s) => ({
    school_id: profile.school_id,
    day_of_week: s.day_of_week,
    start_hour: s.start_hour,
    end_hour: s.end_hour,
    slot_duration_min: s.slot_duration_min,
    is_active: s.is_active,
  }));

  const { error } = await supabase
    .from("school_weekly_schedules")
    .upsert(upsertData, { onConflict: "school_id,day_of_week" });

  if (error) {
    console.error(error);
    throw new Error("Impossible de sauvegarder le planning.");
  }

  revalidatePath("/admin/planning");
}

export async function saveSchoolVehicleType(vehicleType: "auto" | "moto") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "school_admin") throw new Error("Accès refusé");

  const { error } = await supabase
    .from("driving_schools")
    .update({ vehicle_type: vehicleType })
    .eq("id", profile.school_id);

  if (error) {
    console.error(error);
    throw new Error("Impossible de mettre à jour le type de formation.");
  }

  revalidatePath("/admin/planning");
}

export async function getScheduleExceptions(
  schoolId: string,
  fromDate: string
): Promise<ScheduleException[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("schedule_exceptions")
    .select("*")
    .eq("school_id", schoolId)
    .gte("exception_date", fromDate)
    .order("exception_date");
  return (data as ScheduleException[]) ?? [];
}

export async function addScheduleException(date: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "school_admin") throw new Error("Accès refusé");

  const { error } = await supabase
    .from("schedule_exceptions")
    .upsert(
      { school_id: profile.school_id, exception_date: date, is_closed: true },
      { onConflict: "school_id,exception_date" }
    );

  if (error) {
    console.error(error);
    throw new Error("Impossible d'ajouter le jour fermé.");
  }

  revalidatePath("/admin/planning");
}

export async function deleteScheduleException(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "school_admin") throw new Error("Accès refusé");

  await supabase
    .from("schedule_exceptions")
    .delete()
    .eq("id", id)
    .eq("school_id", profile.school_id);

  revalidatePath("/admin/planning");
}
