-- Reset data and insert fresh demo accounts/courses/enrollments
TRUNCATE enrollments, courses, users RESTART IDENTITY CASCADE;

INSERT INTO users (email, role, password_hash) VALUES
  ('teacher1@gmail.com', 'teacher', '$2b$10$rFdmoK9ZnShk9a89goWsp.XwSUmRJ7lu33/IAt3m7BKeaeqUEIR2K'),
  ('teacher2@gmail.com', 'teacher', '$2b$10$MqzUePljgRyGBllTf/VFP.8sgkqntK9DhGM/i65tOBnDDcWcyI3/W'),
  ('user1@gmail.com', 'student', '$2b$10$bXYqYEp70k75k5Kq.iBBH.P1BHBriak5TIhcVXegUiVHsAT0Vprgq'),
  ('user2@gmail.com', 'student', '$2b$10$aKcU8Lb37hdfiyryyZvwMuR01GCplX5r1noCefNbbTnM04UgbESCe'),
  ('user3@gmail.com', 'student', '$2b$10$5IKvkHojyXh2CXnmdxOM4unjXZsxSHMP0hTB.MOSokhqcJ3HIMYL6'),
  ('user4@gmail.com', 'student', '$2b$10$VZEGrPLnDOerXQepij2dl.r/TLka6C4cb9lREgaJLFVYKKoPxQBPq'),
  ('user5@gmail.com', 'student', '$2b$10$wMBBdf8GE4mntTqnVwewPun/XnA.1Z2AOUqqHSXeSpS9HA./3x9/.');

INSERT INTO courses (title, slug, discipline, level, format, description, price_cents, teacher_id, course_date, min_students, max_students) VALUES
  ('Techniques acryliques modernes', 'techniques-acryliques', 'peinture', 'debutant', 'replay', 'Bases et textures.', 1500, 1, '2026-02-24 14:00:00+00', 1, 15),
  ('Croquis urbain rapide', 'croquis-urbain-rapide', 'dessin', 'intermediaire', 'live', 'Croquis sur le vif.', 2000, 1, '2026-02-26 10:00:00+00', 3, 10),
  ('Aquarelle botanique detaillee', 'aquarelle-botanique-detail', 'aquarelle', 'debutant', 'replay', 'Fleurs et feuillages.', 1800, 2, '2026-02-28 16:00:00+00', 1, 20),
  ('Composition couleur', 'composition-couleur', 'peinture', 'avance', 'live', 'Couleurs, contrastes, harmonies.', 2200, 2, '2026-03-02 18:00:00+00', 5, 12);

INSERT INTO enrollments (user_id, course_id, status) VALUES
  (3, 1, 'enrolled'),
  (4, 2, 'enrolled'),
  (5, 3, 'enrolled'),
  (6, 4, 'enrolled'),
  (7, 1, 'enrolled');
