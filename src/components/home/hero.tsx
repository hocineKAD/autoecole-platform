import Link from "next/link";
import { Button } from "@/components/ui/button";
import { schoolConfig } from "@/config/school";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const whatsappHref = `https://wa.me/${schoolConfig.whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <section className="relative overflow-hidden bg-cream-100 pb-20 pt-12 md:pt-20">
      {/* Décoration en arrière-plan : cercles concentriques flous */}
      <div
        aria-hidden
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl"
      />

      <div className="container-narrow relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Texte */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm ring-1 ring-primary-100">
              <Sparkles className="h-4 w-4" />
              <span>{schoolConfig.city} · Auto-école nouvelle génération</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-navy-900 md:text-5xl lg:text-6xl">
              Votre permis,{" "}
              <span className="relative inline-block">
                <span className="relative z-10">en confiance.</span>
                <span
                  aria-hidden
                  className="absolute bottom-1 left-0 right-0 h-3 rounded-full bg-primary-300/60"
                />
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-navy-600">
              {schoolConfig.description} Préparez votre code en ligne et suivez
              votre progression depuis votre téléphone.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer le code
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="whatsapp" size="lg" className="w-full">
                  <MessageCircle className="h-5 w-5" fill="currentColor" />
                  WhatsApp
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 border-t border-navy-100 pt-6">
              <div>
                <div className="text-3xl font-bold text-navy-900">
                  {schoolConfig.stats.yearsActive}+
                </div>
                <div className="text-sm text-navy-500">Années d&apos;expérience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-navy-900">
                  {schoolConfig.stats.candidatesPassed.toLocaleString("fr-FR")}
                </div>
                <div className="text-sm text-navy-500">
                  Candidats accompagnés
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-navy-900">
                  {schoolConfig.stats.successRate}%
                </div>
                <div className="text-sm text-navy-500">Taux de réussite</div>
              </div>
            </div>
          </div>

          {/* Illustration : carte téléphone simulée */}
          <div className="relative mx-auto w-full max-w-md">
            <div
              aria-hidden
              className="absolute inset-0 -rotate-3 rounded-[2.5rem] bg-primary-300/30"
            />
            <div className="relative rotate-2 rounded-[2.5rem] bg-white p-6 shadow-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-navy-400">
                      Score code
                    </div>
                    <div className="text-3xl font-bold text-navy-900">
                      32 / 40
                    </div>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                    <Sparkles className="h-7 w-7" />
                  </div>
                </div>

                <div className="rounded-2xl bg-cream-100 p-4">
                  <div className="text-xs font-medium text-navy-500">
                    Prochaine séance
                  </div>
                  <div className="mt-1 font-semibold text-navy-900">
                    Mardi 14h00 — Conduite
                  </div>
                  <div className="text-sm text-navy-500">
                    avec Karim · 1 heure
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-navy-700">
                      Panneaux
                    </span>
                    <span className="text-navy-500">90%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: "90%" }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-navy-700">
                      Priorités
                    </span>
                    <span className="text-navy-500">75%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: "75%" }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-navy-700">
                      Conduite
                    </span>
                    <span className="text-navy-500">60%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-primary-300"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
