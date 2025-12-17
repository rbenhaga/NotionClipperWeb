-- ============================================
-- WORKSPACE PROTECTION & ANTI-ABUSE SYSTEM
-- Migration: 20251201_workspace_protection.sql
-- ============================================

-- 1. Table pour l'historique d'utilisation des workspaces (anti-abus)
-- Un workspace Notion ne peut être utilisé que par UN SEUL compte utilisateur
CREATE TABLE IF NOT EXISTS workspace_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL,
  workspace_name TEXT,
  first_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  first_user_email TEXT NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un workspace ne peut apparaître qu'une seule fois (protection principale)
  CONSTRAINT unique_workspace_global UNIQUE (workspace_id)
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_workspace_history_user ON workspace_usage_history(first_user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_history_workspace ON workspace_usage_history(workspace_id);

-- 2. Améliorer la table notion_connections pour supporter multi-workspace
ALTER TABLE notion_connections 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'active' CHECK (connection_status IN ('active', 'disconnected', 'expired', 'revoked'));

-- 3. Table pour tracker les tentatives de connexion (anti-abus)
CREATE TABLE IF NOT EXISTS connection_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('connect', 'disconnect', 'blocked')),
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connection_attempts_user ON connection_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_attempts_workspace ON connection_attempts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_connection_attempts_created ON connection_attempts(created_at);

-- 4. Fonction pour vérifier si un workspace peut être connecté
CREATE OR REPLACE FUNCTION check_workspace_availability(
  p_workspace_id TEXT,
  p_user_id UUID
) RETURNS TABLE (
  available BOOLEAN,
  reason TEXT,
  owner_email TEXT
) AS $$
DECLARE
  v_existing RECORD;
BEGIN
  -- Vérifier si le workspace existe déjà dans l'historique
  SELECT * INTO v_existing 
  FROM workspace_usage_history 
  WHERE workspace_id = p_workspace_id;
  
  IF v_existing IS NULL THEN
    -- Workspace jamais utilisé, disponible
    RETURN QUERY SELECT TRUE, 'Workspace available'::TEXT, NULL::TEXT;
  ELSIF v_existing.first_user_id = p_user_id THEN
    -- C'est le même utilisateur, il peut reconnecter son workspace
    RETURN QUERY SELECT TRUE, 'Workspace belongs to this user'::TEXT, v_existing.first_user_email;
  ELSIF v_existing.is_blocked THEN
    -- Workspace bloqué
    RETURN QUERY SELECT FALSE, ('Workspace blocked: ' || COALESCE(v_existing.block_reason, 'abuse detected'))::TEXT, v_existing.first_user_email;
  ELSE
    -- Workspace appartient à un autre utilisateur
    RETURN QUERY SELECT FALSE, 'This Notion workspace is already linked to another account. Each workspace can only be used with one Clipper Pro account.'::TEXT, v_existing.first_user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour enregistrer une connexion workspace
CREATE OR REPLACE FUNCTION register_workspace_connection(
  p_workspace_id TEXT,
  p_workspace_name TEXT,
  p_user_id UUID,
  p_user_email TEXT
) RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_check RECORD;
BEGIN
  -- Vérifier la disponibilité
  SELECT * INTO v_check FROM check_workspace_availability(p_workspace_id, p_user_id);
  
  IF NOT v_check.available THEN
    RETURN QUERY SELECT FALSE, v_check.reason;
    RETURN;
  END IF;
  
  -- Insérer ou mettre à jour l'historique
  INSERT INTO workspace_usage_history (workspace_id, workspace_name, first_user_id, first_user_email)
  VALUES (p_workspace_id, p_workspace_name, p_user_id, p_user_email)
  ON CONFLICT (workspace_id) DO UPDATE SET
    workspace_name = EXCLUDED.workspace_name,
    disconnected_at = NULL,
    updated_at = NOW();
  
  RETURN QUERY SELECT TRUE, 'Workspace registered successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_workspace_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workspace_history_updated_at ON workspace_usage_history;
CREATE TRIGGER workspace_history_updated_at
  BEFORE UPDATE ON workspace_usage_history
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_history_timestamp();

-- 7. RLS Policies pour workspace_usage_history
ALTER TABLE workspace_usage_history ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent voir que leurs propres entrées
DROP POLICY IF EXISTS "Users can view own workspace history" ON workspace_usage_history;
CREATE POLICY "Users can view own workspace history" ON workspace_usage_history
  FOR SELECT USING (first_user_id = auth.uid());

-- Seul le service role peut insérer/modifier
DROP POLICY IF EXISTS "Service role can manage workspace history" ON workspace_usage_history;
CREATE POLICY "Service role can manage workspace history" ON workspace_usage_history
  FOR ALL USING (auth.role() = 'service_role');

-- 8. RLS Policies pour connection_attempts
ALTER TABLE connection_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own connection attempts" ON connection_attempts;
CREATE POLICY "Users can view own connection attempts" ON connection_attempts
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage connection attempts" ON connection_attempts;
CREATE POLICY "Service role can manage connection attempts" ON connection_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- 9. Vue pour les statistiques anti-abus (admin)
CREATE OR REPLACE VIEW workspace_abuse_stats AS
SELECT 
  wuh.workspace_id,
  wuh.workspace_name,
  wuh.first_user_email,
  wuh.connected_at,
  wuh.is_blocked,
  COUNT(ca.id) FILTER (WHERE ca.attempt_type = 'blocked') as blocked_attempts,
  COUNT(DISTINCT ca.user_id) FILTER (WHERE ca.user_id != wuh.first_user_id) as other_users_tried
FROM workspace_usage_history wuh
LEFT JOIN connection_attempts ca ON ca.workspace_id = wuh.workspace_id
GROUP BY wuh.id;

-- 10. Contrainte pour s'assurer qu'un utilisateur ne peut avoir qu'un workspace par défaut
CREATE OR REPLACE FUNCTION ensure_single_default_workspace()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE notion_connections 
    SET is_default = FALSE 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS single_default_workspace ON notion_connections;
CREATE TRIGGER single_default_workspace
  BEFORE INSERT OR UPDATE ON notion_connections
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_workspace();

COMMENT ON TABLE workspace_usage_history IS 'Tracks workspace ownership to prevent abuse (one workspace = one account forever)';
COMMENT ON TABLE connection_attempts IS 'Logs all connection attempts for security auditing';
