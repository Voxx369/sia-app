-- Migration 019: Update subscriptions table for free courses tracking

-- Ajouter des colonnes pour tracker les cours gratuits
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS free_courses_limit INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS free_courses_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_courses_reset_date DATE DEFAULT CURRENT_DATE;

-- Supprimer l'ancienne contrainte pour pouvoir modifier les données
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_type_check;

-- Mettre à jour les abonnements existants avec les nouveaux types
UPDATE subscriptions SET type = 'artist_subscription' WHERE type = 'full_access';
UPDATE subscriptions SET type = 'other_subscription' WHERE type = 'replays_only';

-- Ajouter la nouvelle contrainte avec les nouveaux types
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_type_check 
  CHECK (type IN ('artist_subscription', 'other_subscription'));

-- Commentaires
COMMENT ON COLUMN subscriptions.free_courses_limit IS 'Nombre de cours gratuits inclus dans l''abonnement par mois';
COMMENT ON COLUMN subscriptions.free_courses_used IS 'Nombre de cours gratuits utilisés ce mois';
COMMENT ON COLUMN subscriptions.free_courses_reset_date IS 'Date du dernier reset du compteur de cours gratuits';
