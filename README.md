# Auto-école Platform

Plateforme moderne pour auto-écoles algériennes : vitrine, espace candidat, QCM en ligne, réservation de conduite. V1 mono-tenant (Auto-école Larbi, Alger), architecture multi-tenant prête pour l'extension future.

## 🎯 Périmètre Session 1

✅ Vitrine complète (hero, formules, comment ça marche, FAQ, contact, Maps)
✅ Authentification email + mot de passe (Supabase Auth)
✅ Inscription / Connexion / Déconnexion
✅ Dashboard candidat (squelette protégé)
✅ Schéma DB multi-tenant + RLS
✅ Design Headspace-inspired (orange chaleureux, Manrope, formes arrondies)

⏳ **Session 2 (à venir)** : module QCM complet (passer un test, voir les résultats, historique).
⏳ **Session 3 (à venir)** : module réservation simple.
⏳ **Session 4 (à venir)** : back-office admin.

---

## 🛠️ Stack technique

| Couche | Technologie | Coût |
|--------|-------------|------|
| Framework | Next.js 15 (App Router) + TypeScript | Gratuit (open source) |
| Style | Tailwind CSS v4 | Gratuit |
| UI | Composants custom + lucide-react | Gratuit |
| Backend | Next.js Server Components + API Routes | Gratuit |
| Base de données | PostgreSQL via Supabase | Free tier généreux |
| Auth | Supabase Auth (email + mot de passe) | Free tier |
| Hébergement (plus tard) | Vercel | Free tier |

Aucune dépendance payante en V1.

---

## 🚀 Setup pas à pas (Windows)

> 💡 Tu es data engineer, donc tu connais déjà la ligne de commande. Je détaille quand même chaque étape pour qu'il n'y ait aucune ambiguïté.

### 1. Installer Node.js 22 LTS

Télécharger l'installeur Windows depuis [nodejs.org](https://nodejs.org/en/download) :
- Choisir **"LTS" version 22.x.x** (et non Current).
- Architecture : **Windows Installer (.msi) — 64-bit**.
- Lancer l'installeur, accepter les options par défaut, **cocher** "Automatically install necessary tools" si demandé.

Vérifier dans un nouveau **PowerShell** ou **Terminal** :
```powershell
node -v
# v22.x.x
npm -v
# 10.x.x ou 11.x.x
```

### 2. Installer Git (si pas déjà fait)

[git-scm.com/download/win](https://git-scm.com/download/win) → installer avec les options par défaut.

```powershell
git --version
```

### 3. Installer VS Code (recommandé)

[code.visualstudio.com](https://code.visualstudio.com/) — extensions utiles à ajouter :
- **ESLint** (dbaeumer.vscode-eslint)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **Prettier** (esbenp.prettier-vscode)

### 4. Récupérer le code

Dézipper le projet `autoecole-platform.zip` à l'endroit de ton choix, par exemple :
```
C:\Users\<toi>\dev\autoecole-platform
```

Ouvrir un terminal dans ce dossier (clic droit → "Ouvrir dans le terminal" ou via VS Code → "Terminal > Nouveau terminal").

### 5. Installer les dépendances

```powershell
npm install
```

⏱️ ~2-3 minutes la première fois.

### 6. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com/), s'inscrire (gratuit, GitHub OK).
2. **New Project** :
   - Name : `autoecole-larbi`
   - Database password : choisir un mot de passe **fort**, le **noter**.
   - Region : **Europe (Frankfurt)** ou **Europe (Paris)** — latence acceptable depuis l'Algérie.
   - Plan : **Free**.
3. Attendre ~1 minute la création.

### 7. Lancer les migrations SQL

Dans Supabase :
1. Onglet **SQL Editor** (icône à gauche).
2. Cliquer **+ New query**.
3. Copier/coller tout le contenu de `supabase/migrations/0001_initial_schema.sql`.
4. Cliquer **Run** (en bas à droite).
5. ✅ La dernière requête affiche un `school_id` (UUID). **Le copier**, on en a besoin à l'étape suivante.
6. Nouvelle query → coller `supabase/migrations/0002_seed_questions.sql` → **Run**.
7. ✅ 30 questions ont été créées. Vérifier dans **Table Editor > questions**.

### 8. Configurer les variables d'environnement

Dans le dossier du projet, copier `.env.example` vers `.env.local` :
```powershell
copy .env.example .env.local
```

Récupérer les clés Supabase : **Project Settings → API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Et coller le `school_id` de l'étape précédente dans `NEXT_PUBLIC_SCHOOL_ID`.

Ouvrir `.env.local` et remplir :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_SCHOOL_ID=<ton_school_id>
```

### 9. (Optionnel) Désactiver la confirmation d'email pour le dev

Pour aller plus vite en dev, désactive la confirmation par email :
- Supabase → **Authentication → Providers → Email**.
- Décocher **Confirm email**.
- Save.

> ⚠️ Réactive cette option en production.

### 10. Lancer l'application

```powershell
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

---

## ✅ Tests à faire après le setup

1. ✅ La page d'accueil s'affiche avec les couleurs orange/cream.
2. ✅ Cliquer sur "S'inscrire" → créer un compte test.
3. ✅ Tu es redirigé vers `/dashboard` automatiquement.
4. ✅ Vérifier dans Supabase **Auth → Users** que ton compte existe.
5. ✅ Vérifier dans **Table Editor → profiles** qu'un profil a été créé automatiquement.
6. ✅ Cliquer "Déconnexion" → retour à la home.
7. ✅ Cliquer "Se connecter" → réussir à se reconnecter.
8. ✅ Cliquer sur le bouton WhatsApp flottant → ouvre wa.me.
9. ✅ La carte Google Maps s'affiche dans la section Contact.

---

## 📁 Structure du projet

```
autoecole-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Login + Signup
│   │   ├── (candidate)/             # Dashboard candidat (protégé)
│   │   ├── globals.css              # Tokens Tailwind v4 + design system
│   │   ├── layout.tsx               # Layout racine
│   │   └── page.tsx                 # Vitrine
│   ├── components/
│   │   ├── home/                    # Sections de la vitrine
│   │   ├── ui/                      # Composants UI (Button, etc.)
│   │   └── whatsapp-float.tsx       # Bouton WhatsApp flottant
│   ├── config/
│   │   └── school.ts                # Données auto-école (V1 mono-tenant)
│   ├── lib/
│   │   ├── supabase/                # Clients Supabase (browser, server, middleware)
│   │   └── utils.ts                 # cn() pour Tailwind
│   └── middleware.ts                # Refresh session + protection routes
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql  # Tables + RLS + triggers
│       └── 0002_seed_questions.sql  # 30 QCM exemple
├── .env.example
├── PROJECT_STATE.md                 # ⭐ Suivi de l'avancement
└── README.md
```

---

## 🐛 Dépannage rapide

**`npm install` plante** : vérifier `node -v` >= 22, supprimer `node_modules` et `package-lock.json`, relancer.

**Erreur "Invalid login credentials"** : cf étape 9, désactive la confirmation d'email pour tester rapidement.

**Page blanche / erreur Supabase** : vérifier que `.env.local` est bien rempli et **redémarrer** `npm run dev` (les variables d'env ne sont lues qu'au démarrage).

**La carte Maps ne s'affiche pas** : c'est un iframe `output=embed` gratuit. Si bloqué, l'adresse dans `src/config/school.ts` est peut-être invalide.

---

## 🗺️ Prochaines sessions

Voir `PROJECT_STATE.md` pour le détail de ce qui est fait et ce qui reste.
