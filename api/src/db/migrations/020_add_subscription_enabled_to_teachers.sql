-- Migration 020: Add subscription enabled flag to teacher profiles

-- Ajouter une colonne pour permettre aux profs d'activer/désactiver les abonnements
ALTER TABLE teacher_profiles 
  ADD COLUMN IF NOT EXISTS subscription_enabled BOOLEAN DEFAULT false;

-- Commentaire
COMMENT ON COLUMN teacher_profiles.subscription_enabled IS 'Indique si le professeur accepte les abonnements étudiants';
