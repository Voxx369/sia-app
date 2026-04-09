import { Router } from "express";
import * as subscriptionController from "../controllers/subscriptionController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Récupérer les types d'abonnements disponibles (accessible sans authentification)
router.get("/types", subscriptionController.getSubscriptionTypes);

// Toutes les autres routes nécessitent une authentification
router.use(requireAuth);

// Créer un nouvel abonnement
router.post("/", subscriptionController.createSubscription);

// Récupérer tous les abonnements de l'utilisateur connecté
router.get("/my-subscriptions", subscriptionController.getMySubscriptions);

// Récupérer les abonnements actifs de l'utilisateur connecté
router.get("/active", subscriptionController.getActiveSubscriptions);

// Vérifier l'accès à un contenu d'un professeur
router.get("/check-access/:teacher_id", subscriptionController.checkAccess);

// Obtenir les informations d'abonnement pour un professeur
router.get("/info/:teacher_id", subscriptionController.getSubscriptionInfo);

// Annuler un abonnement
router.delete("/:id", subscriptionController.cancelSubscription);

// Récupérer les abonnés d'un enseignant (pour les profs uniquement)
router.get("/my-subscribers", subscriptionController.getMySubscribers);

export default router;
