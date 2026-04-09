-- DB-first content seed (profiles, blog, announcements, site content)

-- Keep teacher demo profiles deterministic
INSERT INTO teacher_profiles (user_id, display_name, bio, avatar_url, cover_url, country_code, profile_slug, is_public, updated_at)
VALUES
  (
    1,
    'Artiste Demo 1',
    'Artiste enseignante demo Soul Into Art.',
    'https://ui-avatars.com/api/?name=Artiste+Demo+1&background=1A1F71&color=fff&size=256',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=420&fit=crop',
    'FR',
    'artiste-demo-1',
    TRUE,
    now()
  ),
  (
    2,
    'Artiste Demo 2',
    'Artiste enseignant demo Soul Into Art.',
    'https://ui-avatars.com/api/?name=Artiste+Demo+2&background=1A1F71&color=fff&size=256',
    'https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=1200&h=420&fit=crop',
    'BE',
    'artiste-demo-2',
    TRUE,
    now()
  )
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  cover_url = EXCLUDED.cover_url,
  country_code = EXCLUDED.country_code,
  profile_slug = EXCLUDED.profile_slug,
  is_public = EXCLUDED.is_public,
  updated_at = now();

-- Blog categories
INSERT INTO blog_categories (slug, name, sort_order, is_active, updated_at)
VALUES
  ('peinture', 'Peinture', 1, TRUE, now()),
  ('dessin', 'Dessin', 2, TRUE, now()),
  ('danse', 'Danse', 3, TRUE, now()),
  ('chant', 'Chant', 4, TRUE, now()),
  ('photographie', 'Photographie', 5, TRUE, now()),
  ('art-therapie', 'Art therapie', 6, TRUE, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Blog posts linked to teachers
INSERT INTO blog_posts (
  author_id,
  category_id,
  title,
  slug,
  excerpt,
  cover_image_url,
  content_md,
  status,
  published_at,
  updated_at
)
VALUES
  (
    1,
    (SELECT id FROM blog_categories WHERE slug = 'peinture'),
    'Histoire du street art',
    'histoire-street-art',
    'Un parcours des courants majeurs qui ont transforme l''espace urbain.',
    'https://images.unsplash.com/photo-1459908676235-d5f02a50184b?w=1200&h=700&fit=crop',
    '## Histoire du street art\n\nLe street art est ne de pratiques urbaines spontanées. Sur SIA, nous abordons ses codes visuels et sa composition.',
    'published',
    now() - interval '12 days',
    now()
  ),
  (
    2,
    (SELECT id FROM blog_categories WHERE slug = 'danse'),
    'Comment choisir un cours de danse en ligne',
    'cours-danse-en-ligne',
    'Format, niveau, rythme: les criteres a verifier avant de commencer.',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&h=700&fit=crop',
    '## Cours de danse en ligne\n\nChoisissez un objectif clair, vérifiez le niveau annoncé et adoptez un rythme régulier.',
    'published',
    now() - interval '10 days',
    now()
  ),
  (
    1,
    (SELECT id FROM blog_categories WHERE slug = 'dessin'),
    'Apprendre a dessiner: guide debutants',
    'apprendre-dessiner-guide-debutants',
    'Les bases indispensables pour prendre confiance et pratiquer regulierement.',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&h=700&fit=crop',
    '## Guide débutants dessin\n\nMisez sur des exercices courts mais fréquents: observation, formes simples et ombres de base.',
    'published',
    now() - interval '8 days',
    now()
  ),
  (
    2,
    (SELECT id FROM blog_categories WHERE slug = 'chant'),
    'Technique vocale: les fondamentaux',
    'technique-vocale',
    'Respiration, posture et echauffement pour chanter avec plus de confort.',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=700&fit=crop',
    '## Technique vocale\n\nLe socle reste la respiration diaphragmatique, la posture et les échauffements progressifs.',
    'published',
    now() - interval '6 days',
    now()
  ),
  (
    1,
    (SELECT id FROM blog_categories WHERE slug = 'photographie'),
    'Photographie de rue: techniques utiles',
    'photographie-rue-techniques',
    'Conseils de cadrage et de timing pour saisir des scenes vivantes.',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=700&fit=crop',
    '## Photo de rue\n\nTravaillez votre anticipation, la distance au sujet et la gestion de lumière naturelle.',
    'published',
    now() - interval '4 days',
    now()
  ),
  (
    2,
    (SELECT id FROM blog_categories WHERE slug = 'art-therapie'),
    'Art-therapie et bien-etre: pourquoi ca fonctionne',
    'art-therapie-bien-etre',
    'Une pratique creative qui aide a canaliser les emotions et renforcer la confiance.',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=700&fit=crop',
    '## Art-thérapie\n\nL''expression créative facilite l''ancrage émotionnel et soutient une progression durable.',
    'published',
    now() - interval '2 days',
    now()
  )
ON CONFLICT (slug) DO UPDATE SET
  author_id = EXCLUDED.author_id,
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  cover_image_url = EXCLUDED.cover_image_url,
  content_md = EXCLUDED.content_md,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();

-- Announcements linked to teachers
DELETE FROM announcements;

INSERT INTO announcements (author_id, title, message, audience, course_id, status, published_at, updated_at)
VALUES
  (
    1,
    'Bienvenue dans votre espace enseignant',
    'Pensez a actualiser vos descriptions de cours avant la prochaine session live.',
    'followers',
    NULL,
    'published',
    now() - interval '5 days',
    now()
  ),
  (
    2,
    'Replay disponible',
    'Le replay du dernier atelier a ete publie dans l''espace cours.',
    'course',
    (SELECT id FROM courses WHERE teacher_id = 2 ORDER BY id LIMIT 1),
    'published',
    now() - interval '2 days',
    now()
  );

-- Site content entries (replace front hardcoded content)
INSERT INTO site_content_entries (key, payload, is_published, updated_by, updated_at)
VALUES
(
  'home.hero_slides',
  $$[
    {
      "id": 1,
      "title": "Liberez votre creativite",
      "subtitle": "Decouvrez des cours d'art en ligne avec des artistes passionnes",
      "ctaText": "Decouvrir les cours",
      "ctaLink": "/tous-les-cours-en-ligne",
      "image": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1920&h=800&fit=crop"
    },
    {
      "id": 2,
      "title": "Cours en direct et replay",
      "subtitle": "Apprenez a votre rythme avec nos cours live et enregistres",
      "ctaText": "Voir les cours live",
      "ctaLink": "/tous-les-cours-en-ligne",
      "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&h=800&fit=crop"
    },
    {
      "id": 3,
      "title": "Exprimez votre ame artistique",
      "subtitle": "De l'aquarelle a la danse, trouvez votre discipline creative",
      "ctaText": "Explorer",
      "ctaLink": "/tous-les-cours-en-ligne",
      "image": "https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=1920&h=800&fit=crop"
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'home.testimonials',
  $$[
    {
      "id": 1,
      "name": "Eleve Demo 1",
      "quote": "Les cours d'aquarelle m'ont permis de debloquer ma pratique et de gagner en confiance.",
      "rating": 5,
      "technique": "Aquarelle",
      "avatar": "https://ui-avatars.com/api/?name=Eleve+Demo+1&background=1A1F71&color=fff"
    },
    {
      "id": 2,
      "name": "Eleve Demo 2",
      "quote": "Enfin une plateforme claire et humaine pour progresser a mon rythme.",
      "rating": 5,
      "technique": "Dessin",
      "avatar": "https://ui-avatars.com/api/?name=Eleve+Demo+2&background=1A1F71&color=fff"
    },
    {
      "id": 3,
      "name": "Eleve Demo 3",
      "quote": "Les formats live + replay sont parfaits pour mon emploi du temps.",
      "rating": 5,
      "technique": "Peinture",
      "avatar": "https://ui-avatars.com/api/?name=Eleve+Demo+3&background=1A1F71&color=fff"
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'home.faqs',
  $$[
    {
      "id": 1,
      "question": "Comment fonctionnent les cours en ligne ?",
      "answer": "Les cours sont proposes en live et/ou replay selon le format du professeur."
    },
    {
      "id": 2,
      "question": "Puis-je m'inscrire a plusieurs cours ?",
      "answer": "Oui, vous pouvez suivre plusieurs cours en parallele selon vos disponibilites."
    },
    {
      "id": 3,
      "question": "Les cours sont-ils adaptes aux debutants ?",
      "answer": "Oui, chaque cours indique son niveau: debutant, intermediaire ou avance."
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.subscription_plans',
  $$[
    {
      "id": "carte",
      "name": "A la carte",
      "badge": "Flexible",
      "price": "Paiement cours par cours",
      "points": [
        "Choix libre de chaque atelier",
        "Ideal pour tester plusieurs disciplines",
        "Aucun engagement mensuel"
      ]
    },
    {
      "id": "abonnement",
      "name": "Abonnement",
      "badge": "Populaire",
      "price": "Acces regulier a la plateforme",
      "points": [
        "Acces simplifie aux contenus inclus",
        "Rythme d'apprentissage continu",
        "Concu pour progresser dans la duree"
      ]
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.contact_faqs',
  $$[
    {
      "id": "faq-1",
      "question": "Comment acceder a mes cours apres inscription ?",
      "answer": "Connectez-vous a votre dashboard puis ouvrez Mes cours."
    },
    {
      "id": "faq-2",
      "question": "Puis-je suivre les cours en replay ?",
      "answer": "Oui, selon le cours vous avez acces au direct, au replay, ou aux deux."
    },
    {
      "id": "faq-3",
      "question": "Je suis artiste, comment proposer mes cours ?",
      "answer": "Inscrivez-vous en enseignant puis completez votre profil professeur."
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.contact_methods',
  $$[
    {
      "title": "Email support",
      "detail": "hello@soulintoart.com",
      "note": "Reponse moyenne sous 24-48h ouvrables."
    },
    {
      "title": "Partenariats",
      "detail": "partenariats@soulintoart.com",
      "note": "Pour collaborations culturelles et education."
    },
    {
      "title": "Espace artistes",
      "detail": "Formulaire via Partager votre art",
      "note": "Accompagnement sur l'onboarding enseignant."
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.about_values',
  $$[
    "Pratique artistique accessible a tous",
    "Formats flexibles: visio, live, replay",
    "Communaute bienveillante et engagee",
    "Transmission par des artistes inspires"
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.share.reasons',
  $$[
    {
      "title": "Mettez en lumiere votre univers",
      "text": "Votre pratique artistique est mise en avant dans un cadre coherent et professionnel."
    },
    {
      "title": "Partagez votre passion autrement",
      "text": "Animez des cours live et publiez des contenus a la demande pour votre communaute."
    },
    {
      "title": "Echangez et inspirez",
      "text": "Chaque interaction devient une opportunite d'encouragement et de progression."
    },
    {
      "title": "Elargissez votre horizon",
      "text": "Touchez des apprenants de tous horizons sans contrainte geographique."
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.share.steps',
  $$[
    {
      "title": "Votre profil Artiste",
      "text": "Racontez votre parcours et les disciplines que vous enseignez."
    },
    {
      "title": "Vos contenus",
      "text": "Planifiez vos cours live et ajoutez des ressources pedagogiques."
    },
    {
      "title": "Vos tarifs",
      "text": "Definissez votre modele de prix en accord avec votre proposition de valeur."
    },
    {
      "title": "Votre communaute",
      "text": "Animez, repondez, fidelisez et faites evoluer vos eleves."
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.share.features',
  $$[
    {
      "title": "Hebergement video securise",
      "text": "Diffusez vos cours dans un environnement stable et securise."
    },
    {
      "title": "Bibliotheque de ressources",
      "text": "Ajoutez documents, exercices et supports complementaires."
    },
    {
      "title": "Suivi de votre impact",
      "text": "Consultez l'engagement et la progression de vos apprenants."
    },
    {
      "title": "Support technique reactif",
      "text": "Une equipe vous accompagne sur les aspects techniques."
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.share.faq',
  $$[
    {
      "question": "Quels sont les criteres pour rejoindre la plateforme ?",
      "answer": "Les artistes motivees peuvent proposer des cours, quel que soit leur parcours."
    },
    {
      "question": "Puis-je proposer des cours dans plusieurs disciplines ?",
      "answer": "Oui, vous pouvez enseigner plusieurs disciplines si vous les maitrisez."
    },
    {
      "question": "Comment sont geres les paiements ?",
      "items": [
        "Paiements mensuels securises.",
        "Suivi de vos ventes dans le dashboard.",
        "Fonctionnement transparent sans frais caches."
      ]
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.guide.minimum_price_rules',
  $$[
    "Abonnement mensuel artiste conseille a 39,99 EUR",
    "Inclut 2 cours live au choix chaque mois",
    "Replays accessibles pour les cours suivis",
    "Formule sans engagement"
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.guide.checklist',
  $$[
    "Definir l'objectif pedagogique du cours",
    "Preciser format, duree et niveau",
    "Verifier le materiel requis",
    "Valider la proposition de valeur et le prix"
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.guide.faq',
  $$[
    {
      "question": "Pourquoi un prix minimum recommande ?",
      "answer": "Pour garantir une grille de lecture claire pour les apprenants."
    },
    {
      "question": "Le guide bloque-t-il ma liberte de prix ?",
      "answer": "Non, il sert de reference et peut evoluer selon votre offre."
    },
    {
      "question": "Puis-je ajuster mon offre dans le temps ?",
      "answer": "Oui, selon les retours eleves et vos objectifs pedagogiques."
    }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.revenue.monthly_rows',
  $$[
    { "month": "Janvier", "sessions": 8, "learners": 42, "revenue": "1 480 EUR" },
    { "month": "Fevrier", "sessions": 6, "learners": 36, "revenue": "1 210 EUR" },
    { "month": "Mars", "sessions": 7, "learners": 39, "revenue": "1 360 EUR" }
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'public.revenue.tips',
  $$[
    "Conservez un rythme de publication regulier",
    "Precisez clairement niveau et prerequis",
    "Ajoutez un suivi post-session pour fideliser",
    "Analysez les retours eleves avant chaque nouveau cycle"
  ]$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'legal.cgv_cgu',
  $${
    "title": "CGV / CGU",
    "updatedAt": "Fevrier 2026",
    "sections": [
      {
        "heading": "Objet",
        "content": "Les presentes conditions encadrent l'usage de Soul Into Art et la relation entre utilisateurs et artistes."
      },
      {
        "heading": "Acces au service",
        "content": "L'acces aux contenus depend de la creation d'un compte et du respect des regles de la plateforme."
      },
      {
        "heading": "Responsabilites",
        "content": "Chaque utilisateur est responsable de ses informations et de son usage des contenus proposes."
      }
    ]
  }$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'legal.cookies',
  $${
    "title": "Politique de cookies",
    "updatedAt": "Fevrier 2026",
    "sections": [
      {
        "heading": "Utilisation des cookies",
        "content": "Des cookies techniques et de mesure sont utilises pour le fonctionnement et l'amelioration du site."
      },
      {
        "heading": "Gestion du consentement",
        "content": "Vous pouvez ajuster vos preferences cookies a tout moment."
      },
      {
        "heading": "Duree de conservation",
        "content": "Les cookies sont conserves pour une duree proportionnee a leur finalite."
      }
    ]
  }$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'legal.privacy',
  $${
    "title": "Politique de donnees et de confidentialite",
    "updatedAt": "Fevrier 2026",
    "sections": [
      {
        "heading": "Donnees collectees",
        "content": "Les donnees necessaires a la creation de compte et au suivi des cours peuvent etre traitees."
      },
      {
        "heading": "Finalites",
        "content": "Ces donnees servent a fournir les services demandes et securiser la plateforme."
      },
      {
        "heading": "Vos droits",
        "content": "Vous pouvez demander l'acces, la rectification ou la suppression de vos donnees."
      }
    ]
  }$$::jsonb,
  TRUE,
  1,
  now()
),
(
  'legal.legal_notice',
  $${
    "title": "Mentions legales",
    "updatedAt": "Fevrier 2026",
    "sections": [
      {
        "heading": "Editeur",
        "content": "Soul Into Art - plateforme d'apprentissage artistique en ligne."
      },
      {
        "heading": "Hebergement",
        "content": "Les informations d'hebergement sont disponibles conformement aux obligations legales."
      },
      {
        "heading": "Propriete intellectuelle",
        "content": "Les contenus et ressources de la plateforme sont proteges et ne peuvent etre reproduits sans autorisation."
      }
    ]
  }$$::jsonb,
  TRUE,
  1,
  now()
)
ON CONFLICT (key) DO UPDATE SET
  payload = EXCLUDED.payload,
  is_published = EXCLUDED.is_published,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();
