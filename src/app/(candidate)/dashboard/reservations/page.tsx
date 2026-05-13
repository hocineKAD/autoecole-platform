import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, Calendar } from "lucide-react";
import {
  VEHICLE_CONFIG,
  STATUS_CONFIG,
  formatSlotTime,
  type Booking,
} from "@/lib/bookings/types";

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ReservationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container-narrow py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Mes réservations
          </div>
          <h1 className="mt-2 text-3xl font-bold text-navy-900 dark:text-navy-50 md:text-4xl">
            Heures de conduite
          </h1>
        </div>
        <Link
          href="/dashboard/reservations/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 font-semibold text-white shadow-soft transition-colors hover:bg-primary-600"
        >
          <CalendarPlus className="h-4 w-4" />
          Nouvelle demande
        </Link>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-card dark:bg-navy-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-100 dark:bg-navy-700">
            <Calendar className="h-8 w-8 text-primary-500" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-navy-900 dark:text-navy-50">
            Aucune demande pour l&apos;instant
          </h2>
          <p className="mt-2 text-navy-600 dark:text-navy-300">
            Faites votre première demande de créneau de conduite.
          </p>
          <Link
            href="/dashboard/reservations/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 font-semibold text-white shadow-soft transition-colors hover:bg-primary-600"
          >
            <CalendarPlus className="h-4 w-4" />
            Demander un créneau
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: Booking) => {
            const vehicle = VEHICLE_CONFIG[booking.vehicle_type];
            const statusCfg = STATUS_CONFIG[booking.status];
            const timeLabel = formatSlotTime(booking.slot_time, booking.preferred_slot);

            return (
              <div
                key={booking.id}
                className="rounded-3xl bg-white p-6 shadow-card dark:bg-navy-800"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-900/30">
                      {vehicle.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-navy-900 dark:text-navy-50">
                        {vehicle.label}
                      </div>
                      <div className="mt-1 text-sm text-navy-600 dark:text-navy-300">
                        {formatDate(booking.preferred_date)}
                        {timeLabel ? ` — ${timeLabel}` : ""}
                      </div>
                      {booking.candidate_note && (
                        <div className="mt-2 text-sm italic text-navy-500 dark:text-navy-400">
                          &ldquo;{booking.candidate_note}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 self-start rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.classes}`}
                  >
                    {statusCfg.label}
                  </span>
                </div>

                {booking.status === "refused" && booking.admin_note && (
                  <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    <span className="font-semibold">Motif : </span>
                    {booking.admin_note}
                  </div>
                )}
                {booking.status === "approved" && (
                  <div className="mt-4 rounded-2xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                    Votre demande a été validée. L&apos;auto-école vous
                    contactera pour confirmer les détails.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
