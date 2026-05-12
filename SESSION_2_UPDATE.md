# 🚀 Mise à jour Session 2 — Module QCM

> Cette mise à jour ajoute le module QCM complet avec 3 modes, dark mode, historique, et stats.

## ⚡ Étapes pour passer de la V1 à la V2 (~10 min)

### 1. Sauvegarde (optionnel mais recommandé)

Avant tout, fais une copie du dossier projet ou commit ton état actuel sur Git.

### 2. Remplacer les fichiers

Dézippe `autoecole-platform.zip` (V2) **par-dessus ton projet existant**, en écrasant les fichiers. Les fichiers `.env.local` et `node_modules/` ne sont pas dans le zip → ils sont conservés.

### 3. Lancer la nouvelle migration SQL

Dans Supabase → **SQL Editor** → **+ New query** :
1. Copie tout le contenu de `supabase/migrations/0003_quiz_mode.sql`
2. **Run**
3. ✅ Vérifie que la dernière requête liste bien les colonnes `mode`, `time_limit_sec`, `question_ids` dans `quiz_attempts`.

> ⚠️ **Important** : la migration est **idempotente** (peut être lancée plusieurs fois sans casser). Si tu vois "duplicate object" pour le type `quiz_mode`, c'est normal et ignoré.

### 4. (Pas besoin de `npm install`)

Aucune nouvelle dépendance dans cette session. Si tu veux quand même vérifier :
```powershell
npm install
```
Ça ne fera rien si tout est déjà à jour.

### 5. Redémarrer

Dans le terminal où `npm run dev` tourne :
- **Ctrl + C** pour arrêter
- Relance : `npm run dev`

### 6. Tester

Va sur http://localhost:3000/dashboard et teste :

#### ✅ Tests de base
1. Le toggle dark mode (icône lune/soleil dans le header) bascule bien entre clair et sombre.
2. Le mode est conservé après rechargement de la page (localStorage).
3. Le dashboard affiche les 3 cartes stats (QCM passés, Score moyen, Dernier score) — toutes à `—` ou `0` au début.

#### ✅ Tests QCM mode Apprentissage (10 questions)
1. Clique "Mon code" → page hub QCM s'affiche.
2. Mode "Apprentissage" est pré-sélectionné.
3. Catégorie "Mix toutes catégories" est pré-sélectionnée.
4. Clique "Commencer le QCM" → tu arrives sur la page quiz.
5. Header affiche "Question 1/10", barre de progression à 10%.
6. Clique sur une réponse → feedback immédiat (vert si correct, rouge sinon) + explication.
7. Clique "Question suivante" → progresse.
8. À la 10ᵉ question, le bouton devient "Voir mes résultats".
9. Page résultats : score, durée, et liste des erreurs si applicable.
10. Bouton "Refaire un QCM" te ramène au hub.

#### ✅ Tests QCM mode Examen (40 questions chronométré)
1. Choisis "Examen blanc" + une catégorie.
2. ⚠️ Si tu as moins de 40 questions dans la catégorie choisie, le QCM aura moins de questions (c'est normal pour ton seed de 30).
3. Le timer démarre (top droit), tourne en `MM:SS`.
4. Pas de feedback après chaque question — on enchaîne directement.
5. Quand le timer arrive à 0 → submit auto et redirection vers résultats.

#### ✅ Tests reprise
1. Lance un QCM, réponds à 2-3 questions.
2. Ferme l'onglet du navigateur.
3. Reviens sur `/dashboard` → bandeau orange "QCM en cours" s'affiche en haut.
4. Clique → tu reprends à la question suivante (les réponses précédentes sont conservées).

#### ✅ Tests historique
1. Va sur `/dashboard/code/history` → liste de tes tentatives terminées.
2. Clique sur une tentative → tu retombes sur la page résultats.

#### ✅ Tests stats
1. Après plusieurs QCM terminés, le dashboard principal affiche :
   - Le bon nombre de QCM passés
   - Le score moyen en %
   - Le dernier score
2. Sur la page `/dashboard/code`, chaque chip de catégorie affiche le % de réussite calculé sur tes tentatives.

---

## 🐛 Si quelque chose ne marche pas

**Erreur "Aucune question trouvée pour cette catégorie"** : c'est que la catégorie sélectionnée n'a aucune question. C'est normal pour `signalisation`, `reglementation`, `autres` qui n'ont pas de seed dans le V1. Choisis une catégorie qui a des questions, ou "Mix".

**Le QCM "Examen blanc" n'a que 30 questions au lieu de 40** : normal, ton seed n'en contient que 30. La logique prend le max disponible. Quand tu auras les vraies questions du moniteur, ce sera réglé.

**Erreur SQL "column does not exist"** au moment de lancer un QCM : la migration `0003_quiz_mode.sql` n'a pas été exécutée. Retourne dans Supabase et lance-la.

**Le dark mode flashe en clair au chargement** : le script inline dans `<head>` est censé l'éviter. Si le problème persiste, vérifie que le script est bien présent dans `src/app/layout.tsx`.

**`is_correct` toujours à false** : c'est un bug serveur. Vérifie dans Supabase Logs (Auth → Logs ou Table Editor → `quiz_answers`) ce qui est inséré.

---

## 📂 Nouveaux fichiers de la Session 2

```
src/
├── app/(candidate)/dashboard/
│   ├── page.tsx                              ⚡ MIS À JOUR (stats réelles)
│   ├── code/
│   │   ├── page.tsx                          ✨ NOUVEAU (hub QCM)
│   │   ├── quiz/[attemptId]/page.tsx         ✨ NOUVEAU (page quiz)
│   │   ├── results/[attemptId]/page.tsx     ✨ NOUVEAU (page résultats)
│   │   └── history/page.tsx                  ✨ NOUVEAU (historique)
│   ├── layout.tsx                            ⚡ MIS À JOUR (theme toggle)
│   └── logout-button.tsx                     ⚡ MIS À JOUR (dark mode)
├── app/
│   ├── globals.css                           ⚡ MIS À JOUR (dark mode tokens)
│   └── layout.tsx                            ⚡ MIS À JOUR (ThemeProvider)
├── components/
│   ├── theme-provider.tsx                    ✨ NOUVEAU
│   ├── theme-toggle.tsx                      ✨ NOUVEAU
│   └── quiz/
│       └── quiz-player.tsx                   ✨ NOUVEAU (player interactif)
└── lib/quiz/
    ├── types.ts                              ✨ NOUVEAU (types domaine)
    └── actions.ts                            ✨ NOUVEAU (Server Actions)

supabase/migrations/
└── 0003_quiz_mode.sql                        ✨ NOUVEAU (à exécuter)
```

---

## 🎯 Recommandation forte avant la Session 3

**Bloque 1h cette semaine** pour faire 3 choses sur le terrain :

1. Aller voir le patron d'**Auto-école Larbi** et lui montrer la plateforme (la vitrine + le module QCM).
2. Lui faire passer **un vrai QCM** (mode Apprentissage, mix). Observer **sans intervenir** : où il hésite, ce qui le fait sourire, ce qui le bloque.
3. Lui demander : "Si demain je vous donne ça gratuit, est-ce que vous demandez à vos candidats de l'utiliser ?"

C'est ce feedback qui guidera la Session 3 (réservation) — pas l'inverse.
