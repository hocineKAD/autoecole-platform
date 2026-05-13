"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { updateBookingStatus } from "@/lib/bookings/actions";

export function BookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRefuseForm, setShowRefuseForm] = useState(false);
  const [note, setNote] = useState("");

  function handleApprove() {
    startTransition(async () => {
      await updateBookingStatus(bookingId, "approved");
      router.refresh();
    });
  }

  function handleRefuse() {
    startTransition(async () => {
      await updateBookingStatus(bookingId, "refused", note);
      router.refresh();
    });
  }

  return (
    <div className="mt-4 border-t border-navy-100 pt-4 dark:border-navy-700">
      {!showRefuseForm ? (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="flex items-center gap-2 rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Valider
          </button>
          <button
            onClick={() => setShowRefuseForm(true)}
            disabled={isPending}
            className="flex items-center gap-2 rounded-full border-2 border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" />
            Refuser
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motif du refus (optionnel — visible par le candidat)"
            rows={2}
            className="w-full resize-none rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm text-navy-900 focus:border-red-400 focus:outline-none dark:border-red-800 dark:bg-red-900/10 dark:text-navy-50"
          />
          <div className="flex gap-3">
            <button
              onClick={handleRefuse}
              disabled={isPending}
              className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Confirmer le refus
            </button>
            <button
              onClick={() => setShowRefuseForm(false)}
              disabled={isPending}
              className="rounded-full px-5 py-2 text-sm font-semibold text-navy-500 hover:bg-navy-100 dark:text-navy-400 dark:hover:bg-navy-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
