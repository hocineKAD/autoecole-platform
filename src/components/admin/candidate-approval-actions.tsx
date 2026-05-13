"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { updateCandidateStatus } from "@/lib/admin/actions";

interface Props {
  candidateId: string;
}

export function CandidateApprovalActions({ candidateId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await updateCandidateStatus(candidateId, "approved");
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await updateCandidateStatus(candidateId, "rejected");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex gap-3 border-t border-navy-100 pt-4 dark:border-navy-700">
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
        Approuver
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="flex items-center gap-2 rounded-full border-2 border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        <XCircle className="h-4 w-4" />
        Refuser
      </button>
    </div>
  );
}
