import Link from "next/link";
import { schoolConfig } from "@/config/school";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <header className="border-b border-cream-200/60 bg-cream-50/80 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500 font-bold text-white">
              L
            </div>
            <span className="text-lg font-bold text-navy-800">
              {schoolConfig.shortName}
            </span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
