import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { NewBookingForm } from "@/components/bookings/new-booking-form";
import { VEHICLE_CONFIG, type VehicleType, type TrainingStage } from "@/lib/bookings/types";

export default async function NewBookingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, current_stage, driving_schools(vehicle_type, name)")
    .eq("id", user.id)
    .single();

  const school = profile?.driving_schools as unknown as
    | { vehicle_type: string; name: string }
    | null;

  if (!profile?.school_id || !school) {
    return (
      <div className="container-narrow py-10">
        <div className="rounded-3xl bg-white p-8 text-center shadow-card dark:bg-navy-800">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
          <p className="mt-4 text-navy-700 dark:text-navy-200">
            Votre compte n&apos;est associé à aucune auto-école.
            Contactez l&apos;administration.
          </p>
        </div>
      </div>
    );
  }

  const vehicleType = (school.vehicle_type as VehicleType) ?? "auto";
  const vehicleCfg = VEHICLE_CONFIG[vehicleType];
  const currentStage = (profile as { current_stage?: string | null } | null)?.current_stage as TrainingStage | null ?? null;

  return (
    <div className="container-narrow py-10">
      <Link
        href="/dashboard/reservations"
        className="mb-6 inline-flex items-center gap-2 text-sm text-navy-500 transition-colors hover:text-navy-700 dark:text-navy-400 dark:hover:text-navy-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour à mes réservations
      </Link>

      <div className="mb-8">
        <div className="text-sm font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Nouvelle demande
        </div>
        <h1 className="mt-2 text-3xl font-bold text-navy-900 dark:text-navy-50 md:text-4xl">
          Demander un créneau
        </h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          {vehicleCfg.emoji} Vous préparez le{" "}
          <strong>{vehicleCfg.label}</strong> chez{" "}
          <strong>{school.name}</strong>. Choisissez un créneau disponible.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-card dark:bg-navy-800">
        <NewBookingForm
          schoolId={profile.school_id}
          vehicleType={vehicleType}
          currentStage={currentStage}
        />
      </div>
    </div>
  );
}
