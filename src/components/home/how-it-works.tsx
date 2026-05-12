import { UserPlus, BookOpen, Car } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Inscrivez-vous",
    description:
      "Créez votre compte en 1 minute. Aucun document à scanner pour commencer à pratiquer.",
    color: "bg-primary-100 text-primary-600",
  },
  {
    icon: BookOpen,
    title: "Préparez le code",
    description:
      "Entraînez-vous avec des QCM par catégorie, suivez votre progression, passez des examens blancs.",
    color: "bg-teal-400/20 text-teal-600",
  },
  {
    icon: Car,
    title: "Réservez vos heures",
    description:
      "Demandez vos créneaux de conduite directement depuis l'app. Confirmation par WhatsApp.",
    color: "bg-cream-200 text-primary-700",
  },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="py-20">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            Comment ça marche
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
            Trois étapes pour rouler vers votre permis
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative rounded-3xl bg-white p-8 shadow-card"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div className="mt-5 text-sm font-bold text-primary-500">
                  Étape {idx + 1}
                </div>
                <h3 className="mt-1 text-xl font-bold text-navy-900">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-navy-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
