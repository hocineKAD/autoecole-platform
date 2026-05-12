import Link from "next/link";
import { schoolConfig } from "@/config/school";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="formules" className="bg-cream-100 py-20">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            Nos formules
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
            Choisissez le pack adapté à votre rythme
          </h2>
          <p className="mt-4 text-navy-600">
            Tous les tarifs sont en dinars algériens. Paiement échelonné
            possible — parlons-en sur WhatsApp.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {schoolConfig.formulas.map((formula) => (
            <div
              key={formula.id}
              className={cn(
                "relative flex flex-col rounded-3xl bg-white p-8 shadow-card transition-transform hover:-translate-y-1",
                formula.highlighted &&
                  "ring-2 ring-primary-500 md:scale-[1.03]"
              )}
            >
              {formula.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Plus populaire
                </div>
              )}

              <h3 className="text-xl font-bold text-navy-900">
                {formula.name}
              </h3>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-navy-900">
                  {formula.price}
                </span>
                <span className="font-semibold text-navy-500">
                  {formula.currency}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {formula.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        formula.highlighted
                          ? "bg-primary-100 text-primary-600"
                          : "bg-cream-200 text-primary-600"
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm leading-relaxed text-navy-700">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/signup">
                  <Button
                    variant={formula.highlighted ? "primary" : "outline"}
                    className="w-full"
                  >
                    Choisir cette formule
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-navy-500">
          * Conditions de la garantie réussite à demander à l&apos;auto-école.
        </p>
      </div>
    </section>
  );
}
