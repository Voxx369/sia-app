-- Optional demo reviews so rating averages are visible immediately.
-- Uses emails/slugs to avoid relying on fixed IDs.

INSERT INTO course_reviews (course_id, user_id, rating, comment, updated_at)
SELECT
  c.id,
  u.id,
  v.rating,
  v.comment,
  now()
FROM (VALUES
  ('techniques-acryliques', 'user1@gmail.com', 5, 'Super cours, tres clair et motivant.'),
  ('croquis-urbain-rapide', 'user2@gmail.com', 4, 'Tres bien, j''aurais aime un peu plus d''exercices.'),
  ('aquarelle-botanique-detail', 'user3@gmail.com', 5, 'Excellent pour pratiquer rapidement au quotidien.'),
  ('composition-couleur', 'user4@gmail.com', 4, 'Joli rendu, explications accessibles.'),
  ('techniques-acryliques', 'user5@gmail.com', 5, 'Top pour comprendre les harmonies et contrastes.')
) AS v(course_slug, user_email, rating, comment)
JOIN courses c ON c.slug = v.course_slug
JOIN users u ON u.email = v.user_email
ON CONFLICT (course_id, user_id) DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment,
  updated_at = now();
