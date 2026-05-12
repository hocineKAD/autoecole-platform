"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-bold text-navy-900">Connexion</h1>
        <p className="mt-2 text-sm text-navy-600">
          Connectez-vous pour accéder à votre espace candidat.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-navy-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="vous@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-navy-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-600">
          Pas encore de compte ?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
