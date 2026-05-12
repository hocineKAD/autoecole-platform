import Link from "next/link";
import { schoolConfig } from "@/config/school";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cream-200/60 bg-cream-50/80 backdrop-blur-md">
      <div className="container-narrow flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500 font-bold text-white">
            L
          </div>
          <span className="text-lg font-bold text-navy-800">
            {schoolConfig.shortName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#formules"
            className="text-sm font-medium text-navy-700 hover:text-primary-600"
          >
            Formules
          </a>
          <a
            href="#fonctionnement"
            className="text-sm font-medium text-navy-700 hover:text-primary-600"
          >
            Comment ça marche
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-navy-700 hover:text-primary-600"
          >
            FAQ
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-navy-700 hover:text-primary-600"
          >
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:inline-flex">
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">S&apos;inscrire</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
