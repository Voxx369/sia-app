import 'dotenv/config';
import { query } from './src/config/db.js';

console.log('=== Création d\'un cours de test ===\n');

try {
  // Récupérer un enseignant existant
  const teacherResult = await query(
    'SELECT id FROM users WHERE role = $1 LIMIT 1',
    ['teacher']
  );

  if (teacherResult.rows.length === 0) {
    console.error('❌ Aucun enseignant trouvé dans la base de données');
    process.exit(1);
  }

  const teacherId = teacherResult.rows[0].id;
  console.log(`✓ Enseignant trouvé: ID ${teacherId}`);

  // Créer une date dans 2 jours
  const courseDate = new Date();
  courseDate.setDate(courseDate.getDate() + 2);
  courseDate.setHours(14, 0, 0, 0); // 14h00

  console.log(`✓ Date du cours: ${courseDate.toLocaleString('fr-FR')}`);

  // Créer le cours de test
  const courseSlug = `test-cours-annulation-${Date.now()}`;
  const insertResult = await query(
    `INSERT INTO courses (
      teacher_id, title, slug, discipline, level, format, 
      description, price_cents, course_date, min_students, max_students
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, title, course_date, min_students`,
    [
      teacherId,
      'Cours Test - Devrait être annulé',
      courseSlug,
      'Peinture',
      'Débutant',
      'live', // ⚠️ Doit être 'live' ou 'replay'
      'Ce cours est créé pour tester l\'annulation automatique. Il a lieu dans 2 jours avec un minimum de 3 étudiants.',
      0, // gratuit
      courseDate,
      3, // minimum 3 étudiants
      15 // maximum 15 étudiants
    ]
  );

  const course = insertResult.rows[0];
  console.log(`\n✅ Cours créé avec succès!`);
  console.log(`   ID: ${course.id}`);
  console.log(`   Titre: ${course.title}`);
  console.log(`   Date: ${new Date(course.course_date).toLocaleString('fr-FR')}`);
  console.log(`   Minimum d'étudiants: ${course.min_students}`);
  console.log(`   Nombre d'inscrits: 0`);
  console.log(`\n⚠️  Ce cours devrait être annulé car:`);
  console.log(`   - Il a lieu dans moins de 3 jours`);
  console.log(`   - Il a 0 inscrit mais nécessite ${course.min_students} étudiants minimum`);
  console.log(`\n💡 Lancez 'node checkCourseCancellations.js' pour annuler ce cours`);

  process.exit(0);
} catch (error) {
  console.error('\n❌ Erreur:', error);
  process.exit(1);
}
