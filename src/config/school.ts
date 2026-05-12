/**
 * Configuration de l'auto-école active.
 * V1 = mono-tenant : on stocke ici les infos affichées sur la vitrine.
 * V3 = multi-tenant : ces données viendront de la base, par school_id.
 */

export const schoolConfig = {
  name: "Auto-école Larbi",
  shortName: "Larbi",
  city: "Alger",
  tagline: "Votre permis, en confiance.",
  description:
    "Une auto-école moderne à Alger pour préparer votre permis avec sérénité. Code en ligne, suivi personnalisé, moniteurs expérimentés.",

  // Contact
  phone: "+213 555 00 00 00", // À remplacer par le vrai numéro
  whatsapp: "+213555000000", // Format international sans + ni espaces pour wa.me
  email: "contact@autoecole-larbi.dz",
  address: "Rue de l'Indépendance, Alger Centre",
  mapsUrl: "https://maps.google.com/?q=Alger+Centre",

  // Horaires
  hours: [
    { day: "Samedi - Jeudi", time: "08:30 - 18:00" },
    { day: "Vendredi", time: "Fermé" },
  ],

  // Stats à afficher en hero
  stats: {
    yearsActive: 12,
    candidatesPassed: 2500,
    successRate: 87,
  },

  // Formules tarifaires (placeholder, à ajuster avec le pilote)
  formulas: [
    {
      id: "code-only",
      name: "Code seul",
      price: "8 000",
      currency: "DA",
      features: [
        "Accès illimité aux QCM en ligne",
        "Examens blancs",
        "Suivi de progression",
        "Cours en présentiel",
      ],
      highlighted: false,
    },
    {
      id: "standard",
      name: "Permis B Standard",
      price: "35 000",
      currency: "DA",
      features: [
        "Code en ligne illimité",
        "20h de conduite",
        "Examen blanc",
        "Présentation aux examens",
        "Suivi personnalisé",
      ],
      highlighted: true,
    },
    {
      id: "premium",
      name: "Permis B Confort",
      price: "45 000",
      currency: "DA",
      features: [
        "Tout le pack Standard",
        "30h de conduite",
        "Moniteur dédié",
        "Créneaux prioritaires",
        "Garantie réussite *",
      ],
      highlighted: false,
    },
  ],

  // FAQ - questions fréquentes du marché algérien
  faq: [
    {
      q: "Quels documents pour s'inscrire ?",
      a: "Carte d'identité nationale, certificat médical, 4 photos d'identité, et l'extrait de naissance n°12.",
    },
    {
      q: "Combien de temps pour avoir le permis ?",
      a: "En moyenne 2 à 4 mois selon votre disponibilité et votre rythme d'apprentissage. Le code peut être passé dès 3 semaines.",
    },
    {
      q: "Puis-je payer en plusieurs fois ?",
      a: "Oui, nous proposons un paiement échelonné en 3 fois sans frais. Contactez-nous via WhatsApp pour les détails.",
    },
    {
      q: "Les cours de code sont-ils en français ou en arabe ?",
      a: "Les supports sont disponibles en français. Une version arabe est en cours de préparation.",
    },
    {
      q: "Que se passe-t-il si je rate l'examen ?",
      a: "Vous pouvez le repasser. Notre équipe vous accompagne pour corriger les points faibles avec des examens blancs supplémentaires.",
    },
  ],
} as const;

export type SchoolConfig = typeof schoolConfig;
