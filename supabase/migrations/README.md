# 📦 Database Migrations - NotionClipperWeb

## 🎯 Vue d'Ensemble

Ce dossier contient toutes les migrations de la base de données PostgreSQL/Supabase pour NotionClipperWeb.

**Objectif** : Réduire la complexité de la base de données de 11 tables → 5 tables (-55%).

---

## 📋 Ordre d'Application des Migrations

### Phase 1 : Schéma Optimisé (000-005)

| Migration | Fichier | Description |
|-----------|---------|-------------|
| **000** | `20251118000000_drop_unused_tables.sql` | Supprime 6 tables obsolètes de l'ancien schéma |
| **001** | `20251118000001_create_optimized_schema.sql` | Crée le nouveau schéma optimisé (5 tables) |
| **002** | `20251118000002_create_indexes.sql` | Ajoute 28 indexes pour performance <10ms |
| **003** | `20251118000003_create_rpc_functions.sql` | Crée 4 fonctions RPC pour usage tracking |
| **004** | `20251118000004_create_triggers.sql` | Crée 5 triggers pour automation |
| **005** | `20251118000005_create_rls_policies.sql` | Configure RLS (13 policies) |

### Phase 2 : Corrections (006-010)

| Migration | Fichier | Description | Priorité |
|-----------|---------|-------------|----------|
| **006** | `20251118000006_fix_rpc_functions.sql` | Fix signatures RPC fonctions | ✅ Requis |
| **007** | `20251118000007_fix_notion_connections_column.sql` | Nettoie colonne access_token | ✅ Requis |
| **009** | `20251118000009_add_constraints_safe.sql` | Ajoute contraintes (idempotent) | ✅ Requis |
| **010** | `20251118000010_fix_rpc_ambiguity.sql` | Fix ambiguité ON CONFLICT | ✅ Requis |

### Phase 3 : Sécurité (011-013)

| Migration | Fichier | Description | Priorité |
|-----------|---------|-------------|----------|
| **011** | `20251118000011_fix_security_warnings.sql` | Fix 15 warnings search_path + pg_trgm | 🔒 Sécurité |
| **012** | `20251118000012_cleanup_old_functions.sql` | Nettoie 8 fonctions obsolètes | 🔒 Sécurité |
| **013** | `20251118000013_fix_last_check_quota.sql` | Drop dernière fonction check_quota | 🔒 Sécurité |

### Phase 4 : Performance (014)

| Migration | Fichier | Description | Priorité |
|-----------|---------|-------------|----------|
| **014** | `20251118000014_fix_performance_warnings.sql` | Fix RLS policies + indexes dupliqués | ⚡ Performance |

---

## 🚀 Application Complète (Nouvelle Installation)

Pour une nouvelle base de données, appliquer dans l'ordre :

```bash
# Phase 1 : Schéma de base
20251118000000_drop_unused_tables.sql
20251118000001_create_optimized_schema.sql
20251118000002_create_indexes.sql
20251118000003_create_rpc_functions.sql
20251118000004_create_triggers.sql
20251118000005_create_rls_policies.sql

# Phase 2 : Corrections
20251118000006_fix_rpc_functions.sql
20251118000007_fix_notion_connections_column.sql
20251118000009_add_constraints_safe.sql
20251118000010_fix_rpc_ambiguity.sql

# Phase 3 : Sécurité
20251118000011_fix_security_warnings.sql
20251118000012_cleanup_old_functions.sql
20251118000013_fix_last_check_quota.sql

# Phase 4 : Performance
20251118000014_fix_performance_warnings.sql
```

---

## 📊 Résumé des Changements

### Tables Supprimées (6)
- `users` - Redondant avec auth.users
- `notion_workspaces` - Fusionné dans notion_connections
- `clip_history` - Non utilisé
- `user_favorites` - Non utilisé
- `mode_sessions` - Non utilisé
- `notion_api_keys` - Fusionné dans notion_connections

### Tables Créées (5)
- `user_profiles` - Profils utilisateurs
- `subscriptions` - Abonnements (free/pro/team)
- `usage_records` - Compteurs mensuels
- `usage_events` - Events détaillés
- `notion_connections` - Connexions Notion OAuth

### RPC Functions (4)
- `increment_usage_counter` - Incrémenter usage atomiquement
- `get_current_quota` - Obtenir quotas actuels
- `check_quota_limit` - Vérifier si quota dépassé
- `get_usage_analytics` - Analytics 6 derniers mois

### Triggers (5)
- `update_updated_at_column` - Auto-update updated_at
- `create_default_subscription_on_signup` - Créer abonnement free auto
- `update_last_activity_timestamps` - Update last_activity_at
- `sync_user_to_auth_users` - Vérifier existence dans auth.users
- `prevent_subscription_tier_downgrade` - Empêcher downgrade actif

### Indexes (28)
- Performance : Toutes les queries <10ms
- Types : btree (clés, foreign keys) + gin (recherche texte)

---

## 🔒 Sécurité

### Migrations 011-013 : Corrections Critiques

**Problème** : 17 warnings Supabase Security Linter
- 15x Function Search Path Mutable ❌
- 1x Extension in Public ❌
- 1x Leaked Password Protection ⚠️ (manuel)

**Solution** :
- Migration 011 : Ajoute `SET search_path = public, pg_catalog` aux fonctions principales
- Migration 012 : Nettoie anciennes fonctions obsolètes
- Migration 013 : Supprime dernière fonction check_quota

**Résultat** : 0 warnings automatiques ✅

### Configuration Manuelle Requise

**Leaked Password Protection** (Auth Settings) :
1. Dashboard → Authentication → Settings
2. Activer "Check passwords against leaked database"
3. Activer "Prevent sign-up if leaked"

---

## ⚡ Performance

### Migration 014 : Optimisations Performance

**Problème** : 25 warnings Supabase Performance Linter
- 13x Auth RLS Initialization Plan ❌
- 5x Multiple Permissive Policies ❌
- 7x Duplicate Index ❌

**Solution** :
- Migration 014 : Fix RLS policies avec `(select auth.uid())`
- Migration 014 : Supprime policies dupliquées
- Migration 014 : Supprime 7 indexes redondants

**Résultat** : 0 warnings performance ✅

**Optimisations** :
1. **Auth RLS** : `auth.uid()` évalué 1 seule fois au lieu de N fois (1 par ligne)
2. **Policies** : 1 seule policy par action/rôle (pas de doublons)
3. **Indexes** : Suppression de 7 indexes redondants (performances write améliorées)

---

## 🧪 Vérification Post-Migration

### Test 1 : Tables créées
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: 5 tables
-- user_profiles, subscriptions, usage_records, usage_events, notion_connections
```

### Test 2 : RPC Functions
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Expected: 4 functions
-- increment_usage_counter, get_current_quota, check_quota_limit, get_usage_analytics
```

### Test 3 : Search Path (Sécurité)
```sql
SELECT
  p.proname AS function_name,
  p.proconfig AS search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('increment_usage_counter', 'get_current_quota', 'check_quota_limit', 'get_usage_analytics');

-- Expected: Chaque fonction doit avoir: {SET search_path TO public, pg_catalog}
```

### Test 4 : Usage Tracking
```sql
-- Test increment
SELECT * FROM increment_usage_counter('YOUR_USER_UUID', 'clips', 1);

-- Expected: Retourne 1 ligne avec clips_count incrémenté
```

---

## 📝 Notes

### Migrations Obsolètes (Supprimées)

- ~~`20251117_fix_user_profiles_rls.sql`~~ - Ancien schéma
- ~~`20251118000008_add_missing_constraints.sql`~~ - Remplacé par 009 (idempotent)

### Idempotence

Migrations idempotentes (peuvent être relancées sans erreur) :
- ✅ 009 : Vérifie existence avant CREATE
- ✅ 011 : DROP IF EXISTS + CREATE
- ✅ 012 : DROP IF EXISTS + CREATE
- ✅ 013 : DROP IF EXISTS

### Dépendances

- PostgreSQL 14+
- Supabase (auth, storage, realtime)
- Extension pg_trgm (schema: extensions)

---

## 🔗 Documentation

- **MIGRATION_FIX.md** : Guide d'application détaillé
- **SECURITY_FIX.md** : Guide sécurité complet
- **READY.md** : Quick start complet
- **API_GUIDE.md** : Documentation API

---

## ✅ Checklist Complète

- [ ] Phase 1 appliquée (migrations 000-005)
- [ ] Phase 2 appliquée (migrations 006-010)
- [ ] Phase 3 appliquée (migrations 011-013)
- [ ] Test 1 : 5 tables présentes
- [ ] Test 2 : 4 RPC functions présentes
- [ ] Test 3 : Search path correct
- [ ] Test 4 : Usage tracking fonctionne
- [ ] Leaked Password Protection activée
- [ ] 0 warnings Supabase Security

---

**Base de données production-ready !** 🚀✅
