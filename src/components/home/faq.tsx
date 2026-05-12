"use client";

import { useState } from "react";
import { schoolConfig } from "@/config/school";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            Vos questions
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
            Les réponses aux questions fréquentes
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {schoolConfig.faq.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "overflow-hidden rounded-3xl bg-white shadow-card transition-all",
                  isOpen && "ring-2 ring-primary-200"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="text-base font-semibold text-navy-900 md:text-lg">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-primary-500 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 leading-relaxed text-navy-600">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
