-- =====================================================
-- Seed — 30 questions exemple (français)
-- ⚠️ Questions pédagogiques génériques, à valider/remplacer
--    par votre auto-école pilote avec un moniteur agréé.
-- À exécuter APRÈS 0001_initial_schema.sql.
-- =====================================================

-- Helper : insertion d'une question + ses options
-- Pas de procédure stockée pour rester lisible : INSERT direct.

-- ======= PANNEAUX (10) =======
with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 1,
    'Un panneau triangulaire à bord rouge signifie généralement :',
    'Les panneaux triangulaires à bord rouge sont des panneaux de danger : ils annoncent un risque sur la route.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Une obligation', false, 1),
    ('Un danger à signaler', true, 2),
    ('Une interdiction', false, 3),
    ('Une indication', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 1,
    'Un panneau rond à fond rouge avec un trait blanc horizontal signifie :',
    'C''est le panneau "sens interdit". L''entrée est interdite à tout véhicule.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Stationnement interdit', false, 1),
    ('Sens interdit', true, 2),
    ('Voie sans issue', false, 3),
    ('Fin de route prioritaire', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 1,
    'Un panneau octogonal rouge avec l''inscription "STOP" oblige à :',
    'Le panneau STOP impose un arrêt complet, pas un simple ralentissement.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Ralentir uniquement', false, 1),
    ('Marquer un arrêt complet et céder le passage', true, 2),
    ('Klaxonner', false, 3),
    ('Changer de file', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 1,
    'Un panneau carré à fond bleu indique généralement :',
    'Les panneaux carrés à fond bleu sont des panneaux d''indication.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Une interdiction', false, 1),
    ('Un danger', false, 2),
    ('Une indication ou un service', true, 3),
    ('Une obligation', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 2,
    'Un panneau rond à fond bleu avec une flèche blanche signifie :',
    'Les panneaux ronds bleus sont des panneaux d''obligation : ici, obligation de suivre la direction indiquée.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Direction conseillée', false, 1),
    ('Direction obligatoire', true, 2),
    ('Sens unique', false, 3),
    ('Voie réservée', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 1,
    'Le panneau "céder le passage" est de forme :',
    'Le panneau "céder le passage" est un triangle pointe vers le bas, à bord rouge.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Ronde', false, 1),
    ('Carrée', false, 2),
    ('Triangulaire pointe en bas', true, 3),
    ('Octogonale', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 2,
    'Un panneau rond à fond blanc bordé de rouge avec un nombre noir indique :',
    'C''est une limitation de vitesse : le nombre indiqué est la vitesse maximale autorisée.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Vitesse minimale obligatoire', false, 1),
    ('Vitesse maximale autorisée', true, 2),
    ('Vitesse conseillée', false, 3),
    ('Distance entre véhicules', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 2,
    'Un panneau rond à fond blanc bordé de rouge barré obliquement indique :',
    'C''est un panneau de fin d''interdiction (par exemple fin de limitation de vitesse).')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Début d''une interdiction', false, 1),
    ('Fin d''une interdiction', true, 2),
    ('Voie sans issue', false, 3),
    ('Zone de stationnement', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 1,
    'Le panneau "passage piétons" est de forme :',
    'Le panneau d''indication de passage piétons est un carré bleu avec un piéton blanc.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Triangulaire à bord rouge', false, 1),
    ('Carré bleu avec piéton', true, 2),
    ('Ronde bleue avec piéton', false, 3),
    ('Octogonale rouge', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('panneaux', 2,
    'Un panneau rectangulaire vert sur autoroute indique :',
    'Sur autoroute, les panneaux directionnels sont sur fond vert.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Une aire de repos', false, 1),
    ('Une direction sur autoroute', true, 2),
    ('Un péage', false, 3),
    ('Une station-service', false, 4)
  ) as t(text, correct, pos);

-- ======= PRIORITÉS (8) =======
with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('priorites', 2,
    'À une intersection sans signalisation, qui a la priorité ?',
    'En l''absence de signalisation, c''est la priorité à droite qui s''applique.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Le véhicule le plus rapide', false, 1),
    ('Le véhicule venant de droite', true, 2),
    ('Le véhicule venant de gauche', false, 3),
    ('Le plus gros véhicule', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('priorites', 2,
    'Dans un rond-point, la priorité est :',
    'En Algérie comme en France, les véhicules dans le rond-point ont la priorité sur ceux qui veulent y entrer.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('À celui qui entre', false, 1),
    ('À celui déjà engagé dans le rond-point', true, 2),
    ('À celui qui klaxonne', false, 3),
    ('Au véhicule le plus à gauche', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('priorites', 2,
    'Un véhicule prioritaire (ambulance, pompiers) en mission avec sirène :',
    'Tout conducteur doit céder le passage et faciliter le passage des véhicules d''urgence en intervention.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Doit attendre son tour', false, 1),
    ('A toujours la priorité, il faut lui céder le passage', true, 2),
    ('N''a la priorité qu''aux feux rouges', false, 3),
    ('N''a aucune priorité particulière', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('priorites', 1,
    'Un piéton engagé sur un passage protégé :',
    'Tout conducteur doit céder le passage à un piéton engagé sur un passage protégé ou s''apprêtant à le faire.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Doit céder le passage aux véhicules', false, 1),
    ('A toujours la priorité', true, 2),
    ('Doit traverser rapidement', false, 3),
    ('Doit attendre le feu vert', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('priorites', 2,
    'À un feu tricolore éteint ou clignotant en orange :',
    'Quand un feu est éteint ou clignote, on applique la règle de priorité à droite ou la signalisation existante (panneaux).')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('On a toujours la priorité', false, 1),
    ('On applique la priorité à droite ou la signalisation présente', true, 2),
    ('On doit s''arrêter complètement', false, 3),
    ('On peut passer sans regarder', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('priorites', 2,
    'Un panneau "Stop" oblige à :',
    'Le STOP impose un arrêt absolu, même si la voie semble dégagée.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Ralentir', false, 1),
    ('S''arrêter complètement et céder le passage', true, 2),
    ('Klaxonner', false, 3),
    ('Allumer ses feux', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('priorites', 2,
    'En cas de doute sur la priorité, le bon réflexe est :',
    'Quand on doute, on cède le passage. La sécurité prime sur le droit de passage.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Forcer le passage', false, 1),
    ('Klaxonner', false, 2),
    ('Céder le passage par prudence', true, 3),
    ('Accélérer', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('priorites', 2,
    'Un agent de circulation présent à un carrefour :',
    'Les indications d''un agent de circulation prévalent sur la signalisation lumineuse et les panneaux.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('A moins d''autorité que les feux', false, 1),
    ('Prime sur les feux et les panneaux', true, 2),
    ('Doit être ignoré si feu vert', false, 3),
    ('Ne s''applique qu''aux camions', false, 4)
  ) as t(text, correct, pos);

-- ======= CONDUITE (7) =======
with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('conduite', 1,
    'En agglomération en Algérie, la vitesse maximale est généralement de :',
    'En agglomération, la limite est de 50 km/h sauf indication contraire.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('30 km/h', false, 1),
    ('50 km/h', true, 2),
    ('70 km/h', false, 3),
    ('90 km/h', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('conduite', 2,
    'Sur autoroute en Algérie, la vitesse maximale pour une voiture est de :',
    'La vitesse maximale sur autoroute est généralement de 120 km/h pour les véhicules légers, sauf indication contraire.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('90 km/h', false, 1),
    ('100 km/h', false, 2),
    ('120 km/h', true, 3),
    ('140 km/h', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('conduite', 1,
    'La ceinture de sécurité est obligatoire :',
    'La ceinture de sécurité est obligatoire pour tous les occupants du véhicule, à l''avant comme à l''arrière.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Uniquement à l''avant', false, 1),
    ('Uniquement sur autoroute', false, 2),
    ('Pour tous les occupants à l''avant et à l''arrière', true, 3),
    ('Seulement la nuit', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('conduite', 2,
    'L''usage du téléphone tenu en main pendant la conduite :',
    'Tenir un téléphone en main pendant la conduite est interdit et fortement sanctionné.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Est autorisé en ville', false, 1),
    ('Est autorisé à l''arrêt en circulation', false, 2),
    ('Est strictement interdit', true, 3),
    ('Est autorisé pour les appels courts', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('conduite', 2,
    'La distance de sécurité avec le véhicule qui précède correspond à :',
    'La règle pratique est qu''il faut au moins 2 secondes entre vous et le véhicule devant.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('1 mètre', false, 1),
    ('Environ 2 secondes de temps de parcours', true, 2),
    ('La longueur d''une voiture', false, 3),
    ('Aucune distance n''est imposée', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('conduite', 2,
    'Avant de changer de direction, il faut :',
    'Tout changement de direction implique de regarder dans les rétroviseurs et d''avertir avec le clignotant suffisamment à l''avance.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Klaxonner', false, 1),
    ('Vérifier les rétroviseurs et mettre le clignotant à l''avance', true, 2),
    ('Accélérer', false, 3),
    ('Allumer les feux de détresse', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('conduite', 2,
    'Par temps de pluie, il faut :',
    'La pluie réduit l''adhérence et la visibilité : il faut adapter sa vitesse et augmenter la distance de sécurité.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Conduire normalement', false, 1),
    ('Réduire sa vitesse et augmenter la distance de sécurité', true, 2),
    ('Allumer les feux de détresse', false, 3),
    ('Accélérer pour passer la zone', false, 4)
  ) as t(text, correct, pos);

-- ======= MÉCANIQUE (3) =======
with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('mecanique', 1,
    'La pression des pneus doit être vérifiée :',
    'Une pression incorrecte affecte la tenue de route et la consommation. À vérifier régulièrement, à froid.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Une fois par an', false, 1),
    ('Régulièrement, à froid', true, 2),
    ('Uniquement quand on sent une vibration', false, 3),
    ('Jamais, c''est automatique', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('mecanique', 1,
    'Le voyant rouge d''huile qui s''allume au tableau de bord signifie :',
    'Un voyant rouge nécessite un arrêt rapide en lieu sûr et une vérification : il signale un risque grave.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Aucun problème, on peut continuer', false, 1),
    ('Arrêter le véhicule en lieu sûr et vérifier', true, 2),
    ('Accélérer pour rentrer chez soi', false, 3),
    ('Allumer la radio', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('mecanique', 1,
    'Avant de partir, il faut vérifier :',
    'Une vérification rapide avant le départ (éclairage, pneus, niveaux) évite beaucoup d''ennuis.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Uniquement le carburant', false, 1),
    ('Éclairage, pneus, niveaux principaux', true, 2),
    ('Uniquement la radio', false, 3),
    ('Rien, c''est inutile', false, 4)
  ) as t(text, correct, pos);

-- ======= SECOURISME (2) =======
with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('secourisme', 2,
    'Face à un accident, le premier réflexe est :',
    'Protéger d''abord le lieu pour éviter un suraccident, puis alerter les secours, enfin secourir si possible.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Déplacer immédiatement les blessés', false, 1),
    ('Protéger, alerter, secourir', true, 2),
    ('Repartir sans s''arrêter', false, 3),
    ('Téléphoner à un proche', false, 4)
  ) as t(text, correct, pos);

with q as (
  insert into public.questions (category, difficulty, text, explanation)
  values ('secourisme', 2,
    'Après un accident sans blessé apparent, il faut :',
    'Même sans blessé, il faut sécuriser la zone (gilet, triangle) et signaler l''accident aux autorités si nécessaire.')
  returning id
)
insert into public.answer_options (question_id, text, is_correct, position)
select q.id, t.text, t.correct, t.pos from q,
  (values
    ('Repartir aussitôt', false, 1),
    ('Sécuriser la zone et établir un constat', true, 2),
    ('Discuter en plein milieu de la route', false, 3),
    ('Effacer les traces', false, 4)
  ) as t(text, correct, pos);
