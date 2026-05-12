"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          school_id: process.env.NEXT_PUBLIC_SCHOOL_ID,
          role: "candidate",
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Si la confirmation d'email est activée côté Supabase, l'user n'a pas
    // encore de session. Sinon il est déjà connecté.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setInfo(
        "Inscription réussie. Vérifiez votre boîte mail pour confirmer votre compte."
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-bold text-navy-900">Créer un compte</h1>
        <p className="mt-2 text-sm text-navy-600">
          Inscrivez-vous pour commencer votre code.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-navy-700"
            >
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="Mohamed Larbi"
              autoComplete="name"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-navy-700"
            >
              Téléphone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="0555 00 00 00"
              autoComplete="tel"
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              placeholder="Minimum 8 caractères"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {info && (
            <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
              {info}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Créer mon compte
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-600">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
