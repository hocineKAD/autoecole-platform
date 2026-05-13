"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCandidateStatus(
  candidateId: string,
  status: "approved" | "rejected"
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

  const updatePayload: Record<string, string | null> = { status };
  if (status === "approved") updatePayload.current_stage = "code";
  if (status === "rejected") updatePayload.current_stage = null;

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", candidateId)
    .eq("school_id", profile.school_id);

  if (error) {
    console.error(error);
    throw new Error("Impossible de mettre à jour le statut.");
  }

  revalidatePath("/admin");
}
