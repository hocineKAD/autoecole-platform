import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WeeklyScheduleEditor } from "@/components/admin/weekly-schedule-editor";
import { ExceptionManager } from "@/components/admin/exception-manager";
import { getWeeklySchedule, getScheduleExceptions } from "@/lib/bookings/schedule-actions";
import { VEHICLE_CONFIG, type WeeklySchedule, type ScheduleException } from "@/lib/bookings/types";
import { saveSchoolVehicleType } from "@/lib/bookings/schedule-actions";
import { CalendarDays, Car } from "lucide-react";

async function VehicleTypeForm({
  current,
}: {
  current: "auto" | "moto";
}) {
  async function handleChange(formData: FormData) {
    "use server";
    const v = formData.get("vehicle_type") as "auto" | "moto";
    await saveSchoolVehicleType(v);
    redirect("/admin/planning");
  }

  return (
    <form action={handleChange} className="flex items-center gap-3">
      <div className="grid grid-cols-2 gap-3">
        {(["auto", "moto"] as const).map((v) => {
          const cfg = VEHICLE_CONFIG[v];
          return (
            <label
              key={v}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-5 py-3 transition-colors ${
                current === v
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-navy-100 bg-white hover:border-primary-300 dark:border-navy-700 dark:bg-navy-900"
              }`}
            >
              <input
                type="radio"
                name="vehicle_type"
                value={v}
                defaultChecked={current === v}
                className="accent-primary-500"
              />
              <span className="text-xl">{cfg.emoji}</span>
              <span className="font-semibold text-navy-900 dark:text-navy-50">
                {cfg.label}
              </span>
            </label>
          );
        })}
      </div>
      <button
        type="submit"
        className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-600"
      >
        Modifier
      </button>
    </form>
  );
}

export default async function AdminPlanningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "school_admin" || !profile.school_id) {
    redirect("/dashboard");
  }

  const { data: school } = await supabase
    .from("driving_schools")
    .select("vehicle_type")
    .eq("id", profile.school_id)
    .single();

  const schedules = (await getWeeklySchedule(profile.school_id)) as WeeklySchedule[];
  const today = new Date().toISOString().split("T")[0];
  const exceptions = (await getScheduleExceptions(
    profile.school_id,
    today
  )) as ScheduleException[];

  return (
    <div className="container-narrow py-10">
      <div className="mb-8">
        <div className="text-sm font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Administration
        </div>
        <h1 className="mt-2 text-3xl font-bold text-navy-900 dark:text-navy-50 md:text-4xl">
          Planning
        </h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          Définissez le type de formation proposé et les horaires disponibles.
        </p>
      </div>

      <div className="space-y-8">
        {/* Type de formation */}
        <section className="rounded-3xl bg-white p-6 shadow-card dark:bg-navy-800">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-navy-900 dark:text-navy-50">
                Type de formation
              </h2>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Voiture ou moto — une seule formation par auto-école.
              </p>
            </div>
          </div>
          <VehicleTypeForm current={(school?.vehicle_type as "auto" | "moto") ?? "auto"} />
        </section>

        {/* Planning hebdomadaire */}
        <section className="rounded-3xl bg-white p-6 shadow-card dark:bg-navy-800">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-navy-900 dark:text-navy-50">
                Planning hebdomadaire
              </h2>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Activez les jours et définissez les horaires et la durée des créneaux.
              </p>
            </div>
          </div>
          <WeeklyScheduleEditor
            schoolId={profile.school_id}
            initialSchedules={schedules}
          />
        </section>

        {/* Jours exceptionnels */}
        <section className="rounded-3xl bg-white p-6 shadow-card dark:bg-navy-800">
          <div className="mb-5">
            <h2 className="font-bold text-navy-900 dark:text-navy-50">
              Jours de fermeture exceptionnelle
            </h2>
            <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
              Bloquez une date précise (jour férié, congé, formation…).
            </p>
          </div>
          <ExceptionManager initialExceptions={exceptions} />
        </section>
      </div>
    </div>
  );
}
