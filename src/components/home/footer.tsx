import { schoolConfig } from "@/config/school";

export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50 py-10">
      <div className="container-narrow">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500 font-bold text-white">
              L
            </div>
            <span className="font-semibold text-navy-800">
              {schoolConfig.name}
            </span>
          </div>
          <p className="text-sm text-navy-500">
            © {new Date().getFullYear()} {schoolConfig.name} ·{" "}
            {schoolConfig.city}, Algérie. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
