import { query } from "../config/db.js";

// Créer un nouvel abonnement
export const createSubscription = async ({ student_id, teacher_id, type, price_cents }) => {
  const free_courses_limit = type === 'artist_subscription' ? 2 : 0;
  const { rows } = await query(
    `
      INSERT INTO subscriptions (student_id, teacher_id, type, price_cents, status, start_date, end_date, free_courses_limit, free_courses_used, free_courses_reset_date)
      VALUES ($1, $2, $3, $4, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', $5, 0, CURRENT_DATE)
      RETURNING *
    `,
    [student_id, teacher_id, type, price_cents, free_courses_limit]
  );
  return rows[0];
};

// Récupérer tous les abonnements d'un étudiant
export const getSubscriptionsByStudent = async (student_id) => {
  const { rows } = await query(
    `
      SELECT s.*, u.email AS teacher_email, tp.display_name AS teacher_name
      FROM subscriptions s
      JOIN users u ON u.id = s.teacher_id
      LEFT JOIN teacher_profiles tp ON tp.user_id = s.teacher_id
      WHERE s.student_id = $1
      ORDER BY s.created_at DESC
    `,
    [student_id]
  );
  return rows;
};

// Récupérer les abonnements actifs d'un étudiant
export const getActiveSubscriptionsByStudent = async (student_id) => {
  const { rows } = await query(
    `
      SELECT s.*, u.email AS teacher_email, tp.display_name AS teacher_name
      FROM subscriptions s
      JOIN users u ON u.id = s.teacher_id
      LEFT JOIN teacher_profiles tp ON tp.user_id = s.teacher_id
      WHERE s.student_id = $1 AND s.status = 'active' AND s.end_date > CURRENT_DATE
      ORDER BY s.end_date DESC
    `,
    [student_id]
  );
  return rows;
};

// Vérifier si un étudiant a un abonnement actif pour un prof
export const hasActiveSubscription = async (student_id, teacher_id, type = null) => {
  const params = [student_id, teacher_id];
  let typeCondition = '';
  
  if (type) {
    typeCondition = 'AND s.type = $3';
    params.push(type);
  }
  
  const { rows } = await query(
    `
      SELECT EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.student_id = $1 
          AND s.teacher_id = $2 
          AND s.status = 'active' 
          AND s.end_date > CURRENT_DATE
          ${typeCondition}
      ) AS has_subscription
    `,
    params
  );
  return rows[0].has_subscription;
};

// Récupérer un abonnement par ID
export const findById = async (id) => {
  const { rows } = await query(
    `
      SELECT s.*, u.email AS teacher_email, tp.display_name AS teacher_name
      FROM subscriptions s
      JOIN users u ON u.id = s.teacher_id
      LEFT JOIN teacher_profiles tp ON tp.user_id = s.teacher_id
      WHERE s.id = $1
      LIMIT 1
    `,
    [id]
  );
  return rows[0];
};

// Annuler un abonnement
export const cancelSubscription = async (id, student_id) => {
  const { rows } = await query(
    `
      UPDATE subscriptions
      SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND student_id = $2 AND status = 'active'
      RETURNING *
    `,
    [id, student_id]
  );
  return rows[0];
};

// Renouveler un abonnement
export const renewSubscription = async (id) => {
  const { rows } = await query(
    `
      UPDATE subscriptions
      SET end_date = end_date + INTERVAL '1 month', status = 'active'
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );
  return rows[0];
};

// Récupérer les abonnements d'un enseignant (ses abonnés)
export const getSubscriptionsByTeacher = async (teacher_id) => {
  const { rows } = await query(
    `
      SELECT s.*, u.email AS student_email
      FROM subscriptions s
      JOIN users u ON u.id = s.student_id
      WHERE s.teacher_id = $1 AND s.status = 'active' AND s.end_date > CURRENT_DATE
      ORDER BY s.created_at DESC
    `,
    [teacher_id]
  );
  return rows;
};

// Récupérer un abonnement actif pour un étudiant et un prof
export const getActiveSubscription = async (student_id, teacher_id) => {
  const { rows } = await query(
    `
      SELECT s.*, u.email AS teacher_email, tp.display_name AS teacher_name
      FROM subscriptions s
      JOIN users u ON u.id = s.teacher_id
      LEFT JOIN teacher_profiles tp ON tp.user_id = s.teacher_id
      WHERE s.student_id = $1 
        AND s.teacher_id = $2 
        AND s.status = 'active' 
        AND s.end_date > CURRENT_DATE
      LIMIT 1
    `,
    [student_id, teacher_id]
  );
  return rows[0];
};

// Vérifier et réinitialiser le compteur de cours gratuits si nécessaire
export const checkAndResetFreeCoursesCounter = async (subscription_id) => {
  const { rows } = await query(
    `
      UPDATE subscriptions
      SET 
        free_courses_used = CASE 
          WHEN free_courses_reset_date < date_trunc('month', CURRENT_DATE) THEN 0
          ELSE free_courses_used
        END,
        free_courses_reset_date = CASE 
          WHEN free_courses_reset_date < date_trunc('month', CURRENT_DATE) THEN CURRENT_DATE
          ELSE free_courses_reset_date
        END
      WHERE id = $1
      RETURNING *
    `,
    [subscription_id]
  );
  return rows[0];
};

// Incrémenter le compteur de cours gratuits utilisés
export const incrementFreeCoursesUsed = async (subscription_id) => {
  const { rows } = await query(
    `
      UPDATE subscriptions
      SET free_courses_used = free_courses_used + 1
      WHERE id = $1 AND free_courses_used < free_courses_limit
      RETURNING *
    `,
    [subscription_id]
  );
  return rows[0];
};

// Vérifier si un étudiant a encore des cours gratuits disponibles
export const hasFreeCourseAvailable = async (student_id, teacher_id) => {
  // D'abord, réinitialiser le compteur si on est dans un nouveau mois
  await query(
    `
      UPDATE subscriptions
      SET 
        free_courses_used = 0,
        free_courses_reset_date = CURRENT_DATE
      WHERE student_id = $1 
        AND teacher_id = $2
        AND status = 'active'
        AND free_courses_reset_date < date_trunc('month', CURRENT_DATE)
    `,
    [student_id, teacher_id]
  );

  // Ensuite, vérifier les cours disponibles
  const { rows } = await query(
    `
      SELECT 
        s.*,
        (s.free_courses_limit - s.free_courses_used) AS courses_remaining
      FROM subscriptions s
      WHERE s.student_id = $1 
        AND s.teacher_id = $2 
        AND s.status = 'active' 
        AND s.end_date > CURRENT_DATE
        AND s.free_courses_used < s.free_courses_limit
      LIMIT 1
    `,
    [student_id, teacher_id]
  );
  
  return rows[0] || null;
};
