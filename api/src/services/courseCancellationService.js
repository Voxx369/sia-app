import { query } from "../config/db.js";

/**
 * Fonction pour envoyer un email (simulation)
 * Dans un vrai projet, utiliser un service comme SendGrid, Mailgun, etc.
 */
const sendEmail = async (to, subject, message) => {
  console.log(`📧 Email envoyé à ${to}`);
  console.log(`   Sujet: ${subject}`);
  console.log(`   Message: ${message}`);
  // TODO: Intégrer un vrai service d'email
};

/**
 * Vérifie et annule les cours qui n'ont pas atteint le minimum 3 jours avant
 */
export const checkAndCancelCourses = async () => {
  console.log("🔍 Vérification des cours à annuler...");

  // Trouver les cours qui doivent être vérifiés
  // (3 jours ou moins avant la date, actifs, avec nombre min d'inscrits non atteint)
  const { rows: coursesToCheck } = await query(`
    SELECT 
      c.id, 
      c.title, 
      c.course_date,
      c.min_students,
      c.status,
      COALESCE(enr.enrolled_count, 0) AS enrolled_count
    FROM courses c
    LEFT JOIN (
      SELECT course_id, COUNT(*)::int AS enrolled_count
      FROM enrollments
      WHERE status = 'enrolled'
      GROUP BY course_id
    ) enr ON enr.course_id = c.id
    WHERE c.course_date IS NOT NULL
      AND c.status = 'active'
      AND c.course_date <= (now() + INTERVAL '3 days')
      AND COALESCE(enr.enrolled_count, 0) < c.min_students
  `);

  if (coursesToCheck.length === 0) {
    console.log("✅ Aucun cours à annuler");
    return { cancelled: 0 };
  }

  let cancelledCount = 0;

  for (const course of coursesToCheck) {
    console.log(`\n❌ Annulation du cours: ${course.title}`);
    console.log(`   Date prévue: ${course.course_date}`);
    console.log(`   Minimum requis: ${course.min_students}`);
    console.log(`   Inscrits actuels: ${course.enrolled_count}`);

    // Marquer le cours comme annulé
    await query(
      `UPDATE courses SET status = 'cancelled' WHERE id = $1`,
      [course.id]
    );

    // Récupérer les emails des étudiants inscrits
    const { rows: students } = await query(
      `SELECT u.email, u.id
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       WHERE e.course_id = $1 AND e.status = 'enrolled'`,
      [course.id]
    );

    // Envoyer un email à chaque étudiant
    for (const student of students) {
      await sendEmail(
        student.email,
        `Annulation du cours: ${course.title}`,
        `Bonjour,\n\nNous sommes désolés de vous informer que le cours "${course.title}" prévu le ${new Date(course.course_date).toLocaleDateString('fr-FR')} a été annulé en raison d'un nombre insuffisant d'inscriptions.\n\nVous serez automatiquement remboursé si des frais ont été prélevés.\n\nNous vous remercions de votre compréhension.\n\nL'équipe Soul Into Art`
      );
    }

    // Récupérer l'email de l'enseignant
    const { rows: teacher } = await query(
      `SELECT u.email FROM courses c
       JOIN users u ON u.id = c.teacher_id
       WHERE c.id = $1`,
      [course.id]
    );

    if (teacher.length > 0) {
      await sendEmail(
        teacher[0].email,
        `Annulation de votre cours: ${course.title}`,
        `Bonjour,\n\nVotre cours "${course.title}" prévu le ${new Date(course.course_date).toLocaleDateString('fr-FR')} a été automatiquement annulé car le nombre minimum d'inscriptions (${course.min_students}) n'a pas été atteint.\n\nNombre d'inscrits: ${course.enrolled_count}\n\nCordialement,\nL'équipe Soul Into Art`
      );
    }

    cancelledCount++;
  }

  console.log(`\n✅ ${cancelledCount} cours annulé(s)`);
  return { cancelled: cancelledCount };
};
