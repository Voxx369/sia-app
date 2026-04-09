import * as subscriptionModel from "../models/subscriptionModel.js";
import * as userModel from "../models/userModel.js";

// Prix des abonnements en centimes
const SUBSCRIPTION_PRICES = {
  artist_subscription: 3999, // 39,99€
  other_subscription: 0, // 0€
};

/**
 * Créer un nouvel abonnement
 */
export const createSubscription = async (student_id, teacher_id, type) => {
  // Valider le type d'abonnement
  if (!['artist_subscription', 'other_subscription'].includes(type)) {
    throw new Error('Type d\'abonnement invalide. Utilisez "artist_subscription" ou "other_subscription".');
  }

  // Pour other_subscription, on n'a pas besoin de teacher_id
  if (type === 'artist_subscription') {
    // Vérifier que le professeur existe et est bien un teacher
    const teacher = await userModel.findById(teacher_id);
    if (!teacher) {
      throw new Error('Professeur non trouvé');
    }
    
    if (teacher.role !== 'teacher') {
      throw new Error('Cet utilisateur n\'est pas un professeur');
    }

    // Vérifier qu'il n'y a pas déjà un abonnement actif
    const existingSubscription = await subscriptionModel.getActiveSubscription(
      student_id,
      teacher_id
    );

    if (existingSubscription) {
      // Si un abonnement existe déjà, le retourner au lieu de lancer une erreur
      return existingSubscription;
    }
  }

  // Créer l'abonnement avec le prix correspondant
  const subscription = await subscriptionModel.createSubscription({
    student_id,
    teacher_id,
    type,
    price_cents: SUBSCRIPTION_PRICES[type],
  });

  return subscription;
};

/**
 * Récupérer tous les abonnements d'un étudiant
 */
export const getStudentSubscriptions = async (student_id) => {
  return await subscriptionModel.getSubscriptionsByStudent(student_id);
};

/**
 * Récupérer les abonnements actifs d'un étudiant
 */
export const getActiveStudentSubscriptions = async (student_id) => {
  return await subscriptionModel.getActiveSubscriptionsByStudent(student_id);
};

/**
 * Vérifier si un étudiant a accès au contenu d'un professeur
 */
export const checkAccess = async (student_id, teacher_id, contentType = 'full') => {
  // Si c'est un replay, l'abonnement replays_only suffit
  if (contentType === 'replay') {
    const hasReplayAccess = await subscriptionModel.hasActiveSubscription(
      student_id,
      teacher_id,
      'replays_only'
    );
    const hasFullAccess = await subscriptionModel.hasActiveSubscription(
      student_id,
      teacher_id,
      'full_access'
    );
    return hasReplayAccess || hasFullAccess;
  }

  // Pour le contenu complet, seul full_access donne accès
  return await subscriptionModel.hasActiveSubscription(
    student_id,
    teacher_id,
    'full_access'
  );
};

/**
 * Annuler un abonnement
 */
export const cancelSubscription = async (subscription_id, student_id) => {
  const subscription = await subscriptionModel.findById(subscription_id);

  if (!subscription) {
    throw new Error('Abonnement non trouvé');
  }

  if (subscription.student_id !== student_id) {
    throw new Error('Vous n\'êtes pas autorisé à annuler cet abonnement');
  }

  if (subscription.status !== 'active') {
    throw new Error('Cet abonnement n\'est pas actif');
  }

  return await subscriptionModel.cancelSubscription(subscription_id, student_id);
};

/**
 * Récupérer les abonnés d'un enseignant
 */
export const getTeacherSubscribers = async (teacher_id) => {
  return await subscriptionModel.getSubscriptionsByTeacher(teacher_id);
};

/**
 * Obtenir les informations sur les types d'abonnements disponibles
 */
export const getSubscriptionTypes = () => {
  return {
    artist_subscription: {
      name: 'Abonnement Artiste',
      description: '2 cours gratuits par mois + accès à tous les replays',
      price_cents: SUBSCRIPTION_PRICES.artist_subscription,
      price_display: '39,99€',
      free_courses: 2,
    },
    other_subscription: {
      name: 'Autre Abonnement',
      description: 'À venir',
      price_cents: SUBSCRIPTION_PRICES.other_subscription,
      price_display: '0€',
      free_courses: 0,
    },
  };
};

/**
 * Vérifier si un étudiant peut utiliser un cours gratuit
 */
export const canUseFreeCourse = async (student_id, teacher_id) => {
  return await subscriptionModel.hasFreeCourseAvailable(student_id, teacher_id);
};

/**
 * Utiliser un cours gratuit
 */
export const useFreeCourse = async (student_id, teacher_id) => {
  const subscription = await subscriptionModel.hasFreeCourseAvailable(student_id, teacher_id);
  
  if (!subscription) {
    throw new Error('Aucun cours gratuit disponible');
  }

  return await subscriptionModel.incrementFreeCoursesUsed(subscription.id);
};

/**
 * Obtenir les informations d'abonnement pour un étudiant et un professeur
 */
export const getSubscriptionInfo = async (student_id, teacher_id) => {
  const subscription = await subscriptionModel.getActiveSubscription(student_id, teacher_id);
  
  if (!subscription) {
    return null;
  }

  // Réinitialiser le compteur si nécessaire
  await subscriptionModel.checkAndResetFreeCoursesCounter(subscription.id);
  
  // Récupérer les données mises à jour
  const updatedSubscription = await subscriptionModel.findById(subscription.id);
  
  return {
    ...updatedSubscription,
    courses_remaining: updatedSubscription.free_courses_limit - updatedSubscription.free_courses_used,
    has_free_courses: (updatedSubscription.free_courses_limit - updatedSubscription.free_courses_used) > 0,
  };
};
