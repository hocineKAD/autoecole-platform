import { schoolConfig } from "@/config/school";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="bg-cream-100 py-20">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            Nous trouver
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-900 md:text-4xl">
            Venez nous rencontrer à {schoolConfig.city}
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          {/* Coordonnées */}
          <div className="space-y-4 lg:col-span-2">
            <ContactCard
              icon={MapPin}
              title="Adresse"
              content={schoolConfig.address}
              href={schoolConfig.mapsUrl}
            />
            <ContactCard
              icon={Phone}
              title="Téléphone"
              content={schoolConfig.phone}
              href={`tel:${schoolConfig.phone.replace(/\s/g, "")}`}
            />
            <ContactCard
              icon={Mail}
              title="Email"
              content={schoolConfig.email}
              href={`mailto:${schoolConfig.email}`}
            />
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-navy-900">Horaires</div>
                  {schoolConfig.hours.map((h) => (
                    <div
                      key={h.day}
                      className="text-sm text-navy-600"
                    >
                      <span className="font-medium">{h.day}</span> · {h.time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Carte iframe Google Maps (mode embed gratuit, sans API key) */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-card lg:col-span-3">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                `${schoolConfig.address}, ${schoolConfig.city}`
              )}&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation de l'auto-école"
              className="block w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  title,
  content,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="block rounded-3xl bg-white p-6 shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-navy-900">{title}</div>
          <div className="truncate text-sm text-navy-600">{content}</div>
        </div>
      </div>
    </a>
  );
}
