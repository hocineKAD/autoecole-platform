"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TrainingStage } from "@/lib/bookings/types";

export async function setCandidateStage(candidateId: string, stage: TrainingStage) {
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
    .from("profiles")
    .update({ current_stage: stage })
    .eq("id", candidateId)
    .eq("school_id", profile.school_id);

  if (error) {
    console.error(error);
    throw new Error("Impossible de mettre à jour l'étape.");
  }

  revalidatePath("/admin");
}
