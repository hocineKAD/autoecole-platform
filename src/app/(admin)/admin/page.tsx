import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarClock,
  Users,
  ClipboardList,
  ChevronRight,
  CalendarDays,
  Phone,
  UserCircle2,
  UserCheck,
} from "lucide-react";
import { BookingActions } from "@/components/bookings/booking-actions";
import { CandidateApprovalActions } from "@/components/admin/candidate-approval-actions";
import {
  VEHICLE_CONFIG,
  STAGE_CONFIG,
  formatSlotTime,
  type BookingWithProfile,
  type VehicleType,
  type TrainingStage,
} from "@/lib/bookings/types";
import { StageSelector } from "@/components/admin/stage-selector";

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatJoined(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface CandidateRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  current_stage: TrainingStage | null;
  bookingCount: number;
  lastBookingDate: string | null;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, school_id, driving_schools(vehicle_type)")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "school_admin" || !profile.school_id)
    redirect("/dashboard");

  const firstName = profile.full_name?.split(" ")[0] ?? "Admin";
  const schoolId = profile.school_id;
  const schoolVehicleType = ((profile as { driving_schools?: { vehicle_type?: string } | null }).driving_schools?.vehicle_type ?? "auto") as VehicleType;

  // Semaine courante (lundi → dimanche)
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  const [
    pendingBookingsResult,
    pendingCandidatesResult,
    approvedCandidatesResult,
    weekResult,
    recentPendingBookingsResult,
    allBookingsResult,
  ] = await Promise.all([
    // Réservations en attente (count)
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("status", "pending"),

    // Inscriptions en attente d'approbation
    supabase
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .eq("school_id", schoolId)
      .eq("role", "candidate")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),

    // Candidats approuvés
    supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, current_stage")
      .eq("school_id", schoolId)
      .eq("role", "candidate")
      .eq("status", "approved")
      .order("created_at", { ascending: false }),

    // Séances validées cette semaine
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("status", "approved")
      .gte("preferred_date", weekStart)
      .lte("preferred_date", weekEnd),

    // Top 5 réservations en attente avec profil candidat
    supabase
      .from("bookings")
      .select("*, profiles!candidate_id(full_name, phone)")
      .eq("school_id", schoolId)
      .eq("status", "pending")
      .order("preferred_date", { ascending: true })
      .limit(5),

    // Toutes les réservations (pour les stats par candidat)
    supabase
      .from("bookings")
      .select("candidate_id, preferred_date")
      .eq("school_id", schoolId),
  ]);

  const pendingBookingsCount = pendingBookingsResult.count ?? 0;
  const pendingCandidates = (pendingCandidatesResult.data ?? []) as {
    id: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
  }[];
  const approvedCandidates = (approvedCandidatesResult.data ?? []) as {
    id: string;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    current_stage: TrainingStage | null;
  }[];
  const weekCount = weekResult.count ?? 0;
  const recentPendingBookings = (recentPendingBookingsResult.data ?? []) as BookingWithProfile[];
  const allBookings = allBookingsResult.data ?? [];

  // Stats réservations par candidat (pour le tableau)
  const bookingStatsByCandidate = new Map<string, { count: number; lastDate: string | null }>();
  for (const b of allBookings) {
    const existing = bookingStatsByCandidate.get(b.candidate_id) ?? { count: 0, lastDate: null };
    existing.count += 1;
    if (!existing.lastDate || b.preferred_date > existing.lastDate) {
      existing.lastDate = b.preferred_date;
    }
    bookingStatsByCandidate.set(b.candidate_id, existing);
  }

  const candidateRows: CandidateRow[] = approvedCandidates.map((c) => {
    const stats = bookingStatsByCandidate.get(c.id);
    return {
      ...c,
      current_stage: c.current_stage as TrainingStage | null,
      bookingCount: stats?.count ?? 0,
      lastBookingDate: stats?.lastDate ?? null,
    };
  });

  return (
    <div className="container-narrow py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm font-medium uppercase tracking-wider text-primary-600 dark:text-primary-400">
          Administration
        </div>
        <h1 className="mt-2 text-3xl font-bold text-navy-900 dark:text-navy-50 md:text-4xl">
          Bonjour {firstName} 👋
        </h1>
        <p className="mt-2 text-navy-600 dark:text-navy-300">
          Vue d&apos;ensemble de votre auto-école.
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<UserCheck className="h-6 w-6" />}
          label="Inscriptions en attente"
          value={pendingCandidates.length}
          color="amber"
        />
        <KpiCard
          icon={<ClipboardList className="h-6 w-6" />}
          label="Demandes de conduite"
          value={pendingBookingsCount}
          color="yellow"
          href="/admin/reservations"
        />
        <KpiCard
          icon={<Users className="h-6 w-6" />}
          label="Candidats actifs"
          value={approvedCandidates.length}
          color="primary"
        />
        <KpiCard
          icon={<CalendarClock className="h-6 w-6" />}
          label="Séances cette semaine"
          value={weekCount}
          color="green"
        />
      </div>

      {/* Nouvelles inscriptions en attente */}
      {pendingCandidates.length > 0 && (
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-navy-900 dark:text-navy-50">
              Nouvelles inscriptions
            </h2>
            <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
              Ces candidats attendent votre approbation pour accéder à la plateforme.
            </p>
          </div>
          <div className="space-y-4">
            {pendingCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-3xl border-2 border-amber-100 bg-white p-6 shadow-card dark:border-amber-900/30 dark:bg-navy-800"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                      <UserCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-navy-900 dark:text-navy-50">
                        {candidate.full_name ?? "—"}
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-1 text-sm text-navy-500 dark:text-navy-400">
                          <Phone className="h-3 w-3" />
                          {candidate.phone}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-navy-400 dark:text-navy-500">
                        Inscrit le {formatJoined(candidate.created_at)}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 self-start rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    En attente
                  </span>
                </div>
                <CandidateApprovalActions candidateId={candidate.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Demandes de conduite en attente */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-900 dark:text-navy-50">
            Demandes de conduite en attente
          </h2>
          <Link
            href="/admin/reservations"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Tout voir <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentPendingBookings.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-card dark:bg-navy-800">
            <p className="text-navy-500 dark:text-navy-400">
              Aucune demande de conduite en attente 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPendingBookings.map((booking) => {
              const vehicle = VEHICLE_CONFIG[booking.vehicle_type];
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
                          {booking.profiles?.full_name ?? "Candidat inconnu"}
                        </div>
                        {booking.profiles?.phone && (
                          <div className="flex items-center gap-1 text-sm text-navy-500 dark:text-navy-400">
                            <Phone className="h-3 w-3" />
                            {booking.profiles.phone}
                          </div>
                        )}
                        <div className="mt-1 text-sm text-navy-600 dark:text-navy-300">
                          {vehicle.label} ·{" "}
                          <span className="capitalize">
                            {formatDate(booking.preferred_date)}
                          </span>
                          {timeLabel ? ` · ${timeLabel}` : ""}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 self-start rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      En attente
                    </span>
                  </div>
                  <BookingActions bookingId={booking.id} />
                </div>
              );
            })}
            {pendingBookingsCount > 5 && (
              <Link
                href="/admin/reservations"
                className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-navy-200 py-4 text-sm font-medium text-navy-500 transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-navy-700 dark:text-navy-400"
              >
                +{pendingBookingsCount - 5} autre
                {pendingBookingsCount - 5 > 1 ? "s" : ""} demande
                {pendingBookingsCount - 5 > 1 ? "s" : ""}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Candidats actifs */}
      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-navy-900 dark:text-navy-50">
            Candidats actifs ({approvedCandidates.length})
          </h2>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
            Candidats dont l&apos;accès a été validé.
          </p>
        </div>

        {candidateRows.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-card dark:bg-navy-800">
            <p className="text-navy-500 dark:text-navy-400">
              Aucun candidat actif pour l&apos;instant.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white shadow-card dark:bg-navy-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-100 dark:border-navy-700">
                    <th className="px-6 py-4 text-left font-semibold text-navy-500 dark:text-navy-400">
                      Candidat
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-navy-500 dark:text-navy-400">
                      Téléphone
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-navy-500 dark:text-navy-400">
                      Inscrit le
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-navy-500 dark:text-navy-400">
                      Étape
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-navy-500 dark:text-navy-400">
                      Réservations
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-navy-500 dark:text-navy-400">
                      Dernier créneau
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-700">
                  {candidateRows.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-navy-50 dark:hover:bg-navy-700/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                            <UserCircle2 className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-navy-900 dark:text-navy-50">
                            {c.full_name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-navy-600 dark:text-navy-300">
                        {c.phone ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-navy-500 dark:text-navy-400">
                        {formatJoined(c.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {c.current_stage ? (
                          <StageSelector
                            candidateId={c.id}
                            currentStage={c.current_stage}
                            vehicleType={schoolVehicleType}
                          />
                        ) : (
                          <span className="text-xs text-navy-400 dark:text-navy-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {c.bookingCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            {c.bookingCount} demande
                            {c.bookingCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-navy-400 dark:text-navy-500">Aucune</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-navy-500 dark:text-navy-400">
                        {c.lastBookingDate ? formatDate(c.lastBookingDate) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Accès rapide */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-navy-900 dark:text-navy-50">
          Accès rapide
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/reservations"
            className="group flex items-center gap-4 rounded-3xl bg-white p-6 shadow-card transition-transform hover:-translate-y-1 dark:bg-navy-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-navy-900 dark:text-navy-50">Réservations</div>
              <div className="text-sm text-navy-500 dark:text-navy-400">
                Gérez toutes les demandes de créneaux
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-navy-300 group-hover:text-primary-500" />
          </Link>

          <Link
            href="/admin/planning"
            className="group flex items-center gap-4 rounded-3xl bg-white p-6 shadow-card transition-transform hover:-translate-y-1 dark:bg-navy-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-navy-900 dark:text-navy-50">Planning</div>
              <div className="text-sm text-navy-500 dark:text-navy-400">
                Horaires, type de formation, jours fermés
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-navy-300 group-hover:text-primary-500" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "primary" | "yellow" | "green" | "amber";
  href?: string;
}) {
  const colorMap = {
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
    green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  };

  const inner = (
    <div className="rounded-3xl bg-white p-5 shadow-card dark:bg-navy-800">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="mt-3 text-3xl font-extrabold text-navy-900 dark:text-navy-50">{value}</div>
      <div className="mt-1 text-sm text-navy-600 dark:text-navy-300">{label}</div>
    </div>
  );

  if (href)
    return (
      <Link href={href} className="block transition-transform hover:-translate-y-0.5">
        {inner}
      </Link>
    );
  return inner;
}
