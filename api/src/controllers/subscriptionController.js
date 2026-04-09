import * as subscriptionService from "../services/subscriptionService.js";
import { HttpError } from "../utils/httpError.js";

/**
 * Créer un nouvel abonnement
 * POST /api/subscriptions
 */
export const createSubscription = async (req, res, next) => {
  try {
    const { teacher_id, type } = req.body;
    const student_id = req.user.id;

    if (!teacher_id || !type) {
      throw new HttpError(400, 'teacher_id et type sont requis');
    }

    const subscription = await subscriptionService.createSubscription(
      student_id,
      teacher_id,
      type
    );

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les abonnements de l'utilisateur connecté
 * GET /api/subscriptions/my-subscriptions
 */
export const getMySubscriptions = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const subscriptions = await subscriptionService.getStudentSubscriptions(student_id);
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les abonnements actifs de l'utilisateur connecté
 * GET /api/subscriptions/active
 */
export const getActiveSubscriptions = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const subscriptions = await subscriptionService.getActiveStudentSubscriptions(student_id);
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifier l'accès à un contenu
 * GET /api/subscriptions/check-access/:teacher_id
 */
export const checkAccess = async (req, res, next) => {
  try {
    const { teacher_id } = req.params;
    const { content_type = 'full' } = req.query;
    const student_id = req.user.id;

    const hasAccess = await subscriptionService.checkAccess(
      student_id,
      parseInt(teacher_id),
      content_type
    );

    res.json({ has_access: hasAccess });
  } catch (error) {
    next(error);
  }
};

/**
 * Annuler un abonnement
 * DELETE /api/subscriptions/:id
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student_id = req.user.id;

    const subscription = await subscriptionService.cancelSubscription(
      parseInt(id),
      student_id
    );

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les types d'abonnements disponibles
 * GET /api/subscriptions/types
 */
export const getSubscriptionTypes = async (req, res, next) => {
  try {
    const types = subscriptionService.getSubscriptionTypes();
    res.json(types);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les abonnés d'un enseignant (pour les profs uniquement)
 * GET /api/subscriptions/my-subscribers
 */
export const getMySubscribers = async (req, res, next) => {
  try {
    const teacher_id = req.user.id;

    if (req.user.role !== 'teacher') {
      throw new HttpError(403, 'Accès réservé aux enseignants');
    }

    const subscribers = await subscriptionService.getTeacherSubscribers(teacher_id);
    res.json(subscribers);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les informations d'abonnement pour un professeur
 * GET /api/subscriptions/info/:teacher_id
 */
export const getSubscriptionInfo = async (req, res, next) => {
  try {
    const { teacher_id } = req.params;
    const student_id = req.user.id;

    const info = await subscriptionService.getSubscriptionInfo(
      student_id,
      parseInt(teacher_id)
    );

    res.json(info);
  } catch (error) {
    next(error);
  }
};
