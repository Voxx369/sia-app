-- Migration 018: Create subscriptions table

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('full_access', 'replays_only')),
  price_cents INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes fréquentes
CREATE INDEX idx_subscriptions_student_id ON subscriptions(student_id);
CREATE INDEX idx_subscriptions_teacher_id ON subscriptions(teacher_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Index composé pour vérifier les abonnements actifs
CREATE INDEX idx_subscriptions_active ON subscriptions(student_id, teacher_id, status, end_date);

-- Commentaires
COMMENT ON TABLE subscriptions IS 'Table des abonnements étudiants aux professeurs';
COMMENT ON COLUMN subscriptions.type IS 'Type d''abonnement: full_access (30€) ou replays_only (10€)';
COMMENT ON COLUMN subscriptions.status IS 'Statut: active, cancelled, expired';
