# PROJECT_STATE — Auto-école Platform

> ⭐ **Comment utiliser ce fichier** : à chaque nouvelle session avec Claude, copie/colle le contenu de ce fichier dans le chat. Ça permet à Claude de retrouver le contexte exact sans avoir à tout réexpliquer.

---

## 📌 Contexte projet

- **Auto-école pilote** : Auto-école Larbi, Alger
- **Cible primaire** : candidats au permis B
- **Modèle V1** : mono-tenant (une seule école), architecture multi-tenant ready
- **Inspiration design** : Headspace (orange chaleureux, formes arrondies, friendly)
- **Dev solo** : data engineer, Windows, ~1-2h/soir
- **Stack** : Next.js 15 (App Router) + TypeScript + Tailwind v4 + Supabase (Postgres + Auth)

## 🎯 Vision produit

> "Donner à une auto-école algérienne une plateforme moderne pour digitaliser sa relation candidats, sans changer ses habitudes."

Cible-pivot : **l'auto-école** (B2B). La valeur candidat (B2C) sert à rendre l'outil indispensable.

---

## ✅ Session 1 — TERMINÉE & VALIDÉE EN LOCAL

**Validé en test** :
- [x] Vitrine s'affiche correctement (orange/cream, Manrope)
- [x] Inscription fonctionne (compte créé dans auth.users + profile auto)
- [x] Redirection /dashboard après signup
- [x] Login/Logout fonctionnels
- [x] WhatsApp + Maps OK

---

## ✅ Session 2 — TERMINÉE (à tester en local)

**Livré** :
- [x] Migration SQL additive `0003_quiz_mode.sql` (mode, time_limit_sec, question_ids, contraintes uniques, index)
- [x] Types TypeScript pour le domaine QCM (`src/lib/quiz/types.ts`)
- [x] Server Actions pour `startQuiz`, `submitAnswer`, `finishQuiz` (logique métier sécurisée serveur)
- [x] Page `/dashboard/code` — hub QCM avec 3 modes + sélecteur de catégorie
- [x] Page `/dashboard/code/quiz/[attemptId]` — passer un QCM, 1 question par écran
- [x] Page `/dashboard/code/results/[attemptId]` — récap final avec score, durée, erreurs détaillées
- [x] Page `/dashboard/code/history` — liste paginée des tentatives passées
- [x] Dashboard principal mis à jour avec stats réelles + reprise QCM en cours
- [x] **Dark mode** complet (toggle dans le header, persistance localStorage, no-flash au chargement)
- [x] **3 modes QCM** : Apprentissage (10q), Entraînement (20q), Examen blanc (40q chronométré 30 min)
- [x] **Feedback immédiat** en modes Apprentissage/Entraînement (correction + explication après chaque question)
- [x] **Mode Examen** : pas de feedback, chronomètre, submit auto à la fin du temps
- [x] **Reprise** : si on ferme l'onglet, l'attempt non terminé reste, on peut reprendre depuis le dashboard
- [x] **Choix de catégorie** : 5 catégories spécifiques + "Mix toutes catégories"
- [x] **Stats par catégorie** : % de réussite affiché sur chaque chip de catégorie

**Décisions techniques figées en Session 2** :
- ⚙️ Server Actions pour toute écriture en base (pas d'API route REST)
- ⚙️ Calcul `is_correct` côté serveur uniquement (anti-triche)
- ⚙️ Une seule réponse par question par attempt (contrainte unique DB)
- ⚙️ Dark mode via `class="dark"` sur `<html>` + variant Tailwind v4 `@custom-variant`

---

## ⏳ Session 3 — À FAIRE : Réservation simple

**Objectif** : un candidat demande un créneau, l'admin le valide.

À implémenter :
- [ ] Tables `instructors`, `time_slots`, `bookings` (migration SQL)
- [ ] Page candidat : formulaire "demander un créneau" (date + horaire préféré)
- [ ] Notification WhatsApp manuelle (lien wa.me généré pour l'admin)
- [ ] Page admin minimaliste : liste des demandes + valider/refuser

---

## ⏳ Session 4 — À FAIRE : Back-office admin

**Objectif** : l'auto-école peut gérer ses candidats et son activité.

---

## ⏳ Sessions ultérieures (V2)

- Vraies images sur les questions
- Examens blancs avec recommandations personnalisées
- Notifications WhatsApp automatiques (Cloud API Meta)
- Bilingue FR/AR avec RTL
- Magic link auth
- Paiements en ligne
- Multi-tenant self-service

---

## 🔧 Décisions en suspens

- [ ] Faut-il un onboarding (3 questions après signup) ?
- [ ] Confirmation email obligatoire en prod (oui par défaut)
- [ ] Hébergement final : Vercel ou serveur Algérie ?
- [ ] Domaine final
- [ ] Version arabe : on planifie ou on attend retour pilote ?
- [ ] **NEW** : production des vraies questions par un moniteur (combien, quel budget ?)

---

## 📞 Auto-école pilote

- Nom : **Auto-école Larbi**
- Ville : **Alger**
- Statut : **engagée pour pilote**
- Contact principal : (à compléter)
- Date de lancement bêta visée : (à fixer)
- 🔴 **Action terrain à faire cette semaine** : montrer la vitrine + module QCM au patron de l'école pour recueillir un premier feedback réel

---

## 📝 Notes / décisions stratégiques (rappel)

- 🔴 **Ne PAS** ajouter de fonctionnalités non listées sans décider explicitement
- 🟢 **Production des QCM** : 30 exemple en V1, à compléter avec un moniteur agréé pour V2
- 🟢 **Acquisition** : pas avant que la pilote utilise l'outil pendant 30 jours
- 🟢 **Monétisation** : aucune en V1. Réfléchir au modèle (commission/abo) après 3 mois d'usage réel

---

_Dernière mise à jour : Session 2, module QCM complet avec 3 modes + dark mode + historique._
