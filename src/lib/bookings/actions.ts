"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const preferred_date = formData.get("preferred_date") as string;
  const slot_time_hhmm = formData.get("slot_time") as string; // "HH:MM"
  const candidate_note = (formData.get("candidate_note") as string) || null;

  if (!preferred_date || !slot_time_hhmm) {
    throw new Error("Veuillez sélectionner une date et un créneau.");
  }

  // slot_time stored as PostgreSQL time: "HH:MM:SS"
  const slot_time = slot_time_hhmm.length === 5 ? slot_time_hhmm + ":00" : slot_time_hhmm;

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, current_stage")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) throw new Error("École introuvable.");

  // Fetch vehicle_type from the school (not from the form)
  const { data: school } = await supabase
    .from("driving_schools")
    .select("vehicle_type")
    .eq("id", profile.school_id)
    .single();

  if (!school) throw new Error("École introuvable.");

  // Check slot is still available (guard against race conditions)
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("school_id", profile.school_id)
    .eq("preferred_date", preferred_date)
    .eq("slot_time", slot_time)
    .neq("status", "refused")
    .maybeSingle();

  if (existing) throw new Error("Ce créneau vient d'être pris. Veuillez en choisir un autre.");

  const { error } = await supabase.from("bookings").insert({
    candidate_id: user.id,
    school_id: profile.school_id,
    vehicle_type: school.vehicle_type,
    preferred_date,
    preferred_slot: null,
    slot_time,
    stage: (profile as { current_stage?: string | null }).current_stage ?? null,
    candidate_note,
  });

  if (error) {
    console.error(error);
    throw new Error("Impossible de créer la demande.");
  }

  revalidatePath("/dashboard/reservations");
  redirect("/dashboard/reservations");
}

export async function updateBookingStatus(
  bookingId: string,
  status: "approved" | "refused",
  adminNote?: string
) {
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
    .from("bookings")
    .update({ status, admin_note: adminNote || null })
    .eq("id", bookingId)
    .eq("school_id", profile.school_id);

  if (error) {
    console.error(error);
    throw new Error("Impossible de mettre à jour le statut.");
  }

  revalidatePath("/admin/reservations");
}
