"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addScheduleException,
  deleteScheduleException,
} from "@/lib/bookings/schedule-actions";
import type { ScheduleException } from "@/lib/bookings/types";
import { Trash2, Plus, Loader2 } from "lucide-react";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  initialExceptions: ScheduleException[];
}

export function ExceptionManager({ initialExceptions }: Props) {
  const router = useRouter();
  const [exceptions, setExceptions] =
    useState<ScheduleException[]>(initialExceptions);
  const [newDate, setNewDate] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sync with server data after router.refresh()
  useEffect(() => {
    setExceptions(initialExceptions);
  }, [initialExceptions]);

  const today = new Date().toISOString().split("T")[0];

  const handleAdd = () => {
    if (!newDate) return;
    startTransition(async () => {
      await addScheduleException(newDate);
      setNewDate("");
      router.refresh(); // re-fetches real IDs from server
    });
  };

  const handleDelete = (id: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id)); // optimistic
    startTransition(async () => {
      await deleteScheduleException(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={newDate}
          min={today}
          onChange={(e) => setNewDate(e.target.value)}
          className="flex-1 rounded-2xl border-2 border-navy-100 bg-white px-4 py-2.5 text-sm text-navy-900 transition-colors focus:border-primary-500 focus:outline-none dark:border-navy-700 dark:bg-navy-800 dark:text-navy-50"
        />
        <button
          onClick={handleAdd}
          disabled={!newDate || isPending}
          className="flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Fermer ce jour
        </button>
      </div>

      {/* List */}
      {exceptions.length === 0 ? (
        <p className="text-sm text-navy-400 dark:text-navy-500">
          Aucun jour de fermeture exceptionnel planifié.
        </p>
      ) : (
        <div className="space-y-2">
          {exceptions.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10"
            >
              <div>
                <span className="text-sm font-medium capitalize text-red-700 dark:text-red-300">
                  {formatDate(ex.exception_date)}
                </span>
                <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  Fermé
                </span>
              </div>
              <button
                onClick={() => handleDelete(ex.id)}
                disabled={isPending}
                className="ml-4 rounded-xl p-2 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
