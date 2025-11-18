# 🔧 FIX MIGRATIONS - Guide d'Application

## ⚠️ Problème Rencontré

**Erreur lors de la migration 003** :
```
ERROR: 42P13: cannot change return type of existing function
HINT: Use DROP FUNCTION increment_usage_counter(uuid,text,integer) first.
```

**Autres problèmes détectés** :
- Table `notion_connections` avait 2 colonnes token (redondance)
- Contrainte UNIQUE manquante sur `usage_records(user_id, year, month)`

---

## ✅ Solution : 8 Migrations de Fix

J'ai créé 8 migrations correctives (les obsolètes ont été supprimées) :

```
supabase/migrations/
├── 20251118000006_fix_rpc_functions.sql              ✅ Fix fonction RPC
├── 20251118000007_fix_notion_connections_column.sql  ✅ Nettoyer colonnes redondantes
├── 20251118000009_add_constraints_safe.sql           ✅ Version SAFE (recommandée)
├── 20251118000010_fix_rpc_ambiguity.sql              ✅ Fix ambiguité colonnes
├── 20251118000011_fix_security_warnings.sql          🔒 Fix warnings sécurité
├── 20251118000012_cleanup_old_functions.sql          🧹 Nettoyer fonctions obsolètes
└── 20251118000013_fix_last_check_quota.sql           🔒 Drop dernière fonction check_quota
```

**Migrations obsolètes supprimées** :
- ~~20251118000008_add_missing_constraints.sql~~ (remplacée par 009)
- ~~20251117_fix_user_profiles_rls.sql~~ (ancien schéma)

**IMPORTANT** :
- Migrations **011 + 012 + 013** corrigent TOUS les warnings de sécurité Supabase
- Voir **supabase/migrations/README.md** pour la documentation complète

---

## 🚀 Ordre d'Application (IMPORTANT)

### Option A : Nouvelle Installation (Base de données vide)

**Exécuter les migrations dans cet ordre** :

```bash
# 1. Drop unused tables
20251118000000_drop_unused_tables.sql

# 2. Create optimized schema
20251118000001_create_optimized_schema.sql

# 3. Create indexes
20251118000002_create_indexes.sql

# 4. SKIP 003 (on va utiliser 006 à la place)
# 20251118000003_create_rpc_functions.sql  ❌ SKIP

# 5. Create triggers
20251118000004_create_triggers.sql

# 6. Create RLS policies
20251118000005_create_rls_policies.sql

# 7. FIX: Create RPC functions (version corrigée)
20251118000006_fix_rpc_functions.sql  ✅ UTILISER CELLE-CI

# 8. FIX: Clean notion_connections
20251118000007_fix_notion_connections_column.sql

# 9. FIX: Add constraints
20251118000009_add_constraints_safe.sql

# 10. FIX: Fix column ambiguity in RPC
20251118000010_fix_rpc_ambiguity.sql

# 11. FIX: Security warnings (search_path, pg_trgm)
20251118000011_fix_security_warnings.sql

# 12. CLEANUP: Remove old obsolete functions
20251118000012_cleanup_old_functions.sql

# 13. FIX: Drop last check_quota function
20251118000013_fix_last_check_quota.sql
```

---

### Option B : Base de données existante (avec erreur déjà rencontrée)

**Si vous avez déjà appliqué les migrations 000-005 et eu des erreurs** :

```bash
# 1. Appliquer les migrations de fix dans l'ordre
20251118000006_fix_rpc_functions.sql   # Drop + Recréer RPC functions
20251118000007_fix_notion_connections_column.sql  # Nettoyer colonne

# 2. Pour les contraintes, utilisez la version SAFE :
20251118000009_add_constraints_safe.sql  # ✅ VERSION SAFE (recommandée)

# 3. Fix column ambiguity
20251118000010_fix_rpc_ambiguity.sql  # Fix ON CONFLICT ambiguity

# 4. Fix security warnings
20251118000011_fix_security_warnings.sql  # Fix search_path + pg_trgm

# 5. Cleanup old functions
20251118000012_cleanup_old_functions.sql  # Remove obsolete functions

# 6. Fix last check_quota
20251118000013_fix_last_check_quota.sql  # Drop last check_quota variant
```

**Recommandations** :
- Migrations **011 + 012 + 013** sont **CRITIQUES** pour la sécurité en production
- Migration **013** supprime la dernière fonction check_quota obsolète
- Voir **supabase/migrations/README.md** pour la documentation complète

---

## 📝 Application via Supabase Dashboard

### Étape 1 : Supprimer migration 003 (si déjà tentée)

```sql
-- Exécuter dans SQL Editor pour nettoyer
DROP FUNCTION IF EXISTS public.increment_usage_counter CASCADE;
DROP FUNCTION IF EXISTS public.get_current_quota CASCADE;
DROP FUNCTION IF EXISTS public.check_quota_limit CASCADE;
DROP FUNCTION IF EXISTS public.get_usage_analytics CASCADE;
```

### Étape 2 : Appliquer les migrations de fix

**Dans Supabase Dashboard → SQL Editor** :

1. **Migration 006** : Copier/coller le contenu de `20251118000006_fix_rpc_functions.sql`
2. **Migration 007** : Copier/coller le contenu de `20251118000007_fix_notion_connections_column.sql`
3. **Migration 009** : Copier/coller le contenu de `20251118000009_add_constraints_safe.sql`
4. **Migration 010** : Copier/coller le contenu de `20251118000010_fix_rpc_ambiguity.sql`
5. **Migration 011** : Copier/coller le contenu de `20251118000011_fix_security_warnings.sql` 🔒
6. **Migration 012** : Copier/coller le contenu de `20251118000012_cleanup_old_functions.sql` 🧹
7. **Migration 013** : Copier/coller le contenu de `20251118000013_fix_last_check_quota.sql` 🔒

Cliquer **RUN** après chaque migration.

**IMPORTANT** : Après migration 013, activez "Leaked Password Protection" dans Auth Settings (voir SECURITY_FIX.md).

---

## 🧪 Vérification Post-Migration

### Test 1 : Vérifier les RPC functions

```sql
-- Doit retourner 4 fonctions
SELECT proname, pg_get_function_result(oid)
FROM pg_proc
WHERE proname LIKE '%usage%' AND pronamespace = 'public'::regnamespace;

-- Expected:
-- increment_usage_counter | SETOF record
-- get_current_quota | SETOF record
-- check_quota_limit | SETOF record
-- get_usage_analytics | SETOF record
```

### Test 2 : Vérifier les colonnes notion_connections

```sql
-- Doit retourner seulement access_token_encrypted (pas access_token)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notion_connections'
  AND column_name LIKE '%token%';

-- Expected:
-- access_token_encrypted | text
```

### Test 3 : Vérifier les contraintes usage_records

```sql
-- Doit inclure la contrainte unique (user_id, year, month)
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'public.usage_records'::regclass;

-- Expected (among others):
-- usage_records_unique_user_month | u
```

### Test 4 : Tester la fonction RPC

```sql
-- Créer un utilisateur test dans auth.users (remplacer UUID)
-- Puis tester l'incrémentation :

SELECT * FROM increment_usage_counter(
  'YOUR_USER_UUID_HERE',
  'clips',
  1
);

-- Doit retourner 1 ligne avec clips_count = 1
```

---

## 📊 Schéma Final Attendu

### Tables (5)

1. ✅ `user_profiles` (id, email, full_name, avatar_url, auth_provider, created_at, updated_at)
2. ✅ `subscriptions` (id, user_id, tier, status, stripe_*, created_at, updated_at, ...)
3. ✅ `usage_records` (id, user_id, subscription_id, year, month, clips_count, files_count, ...)
4. ✅ `usage_events` (id, user_id, subscription_id, usage_record_id, event_type, feature, metadata, ...)
5. ✅ `notion_connections` (id, user_id, workspace_id, workspace_name, access_token_encrypted, ...)

### RPC Functions (4)

1. ✅ `increment_usage_counter(user_id, feature, increment)`
2. ✅ `get_current_quota(user_id)`
3. ✅ `check_quota_limit(user_id, feature)`
4. ✅ `get_usage_analytics(user_id, months)`

### Triggers (5)

1. ✅ `update_updated_at_column()` → Sur toutes les tables
2. ✅ `create_default_subscription_on_signup()` → Sur user_profiles
3. ✅ `update_last_activity_timestamps()` → Sur usage_records
4. ✅ `sync_user_to_auth_users()` → Sur user_profiles
5. ✅ `prevent_subscription_tier_downgrade()` → Sur subscriptions

### Indexes (28)

- user_profiles : 3 indexes
- subscriptions : 8 indexes
- usage_records : 5 indexes
- usage_events : 6 indexes
- notion_connections : 4 indexes

### RLS Policies (13)

- 2-3 policies par table (service_role + authenticated users)

---

## ❓ FAQ

### Q: Pourquoi 2 colonnes token dans notion_connections ?

**A:** C'était une erreur de migration. La colonne `access_token` plain-text était restée d'une ancienne version. Seule `access_token_encrypted` devrait exister pour la sécurité.

### Q: Puis-je supprimer la migration 003 originale ?

**A:** Non, gardez-la dans `/supabase/migrations/` pour l'historique. Elle sera simplement ignorée. La migration 006 la remplace.

### Q: Comment tester si tout fonctionne ?

**A:** Lancez le backend :
```bash
cd backend
pnpm dev

# Test health check
curl http://localhost:3001/health

# Test OAuth flow
open http://localhost:3001/api/auth/google
```

---

## 🐛 Troubleshooting

### Erreur : "relation usage_records_unique_user_month already exists"

**Solution** : La contrainte existe déjà, c'est bon. Migration 008 utilise `IF NOT EXISTS`.

### Erreur : "column access_token does not exist"

**Solution** : La colonne a déjà été supprimée, c'est bon. Migration 007 utilise `DROP IF EXISTS`.

### Erreur : "function increment_usage_counter already exists"

**Solution** : Relancer migration 006 qui DROP puis recréée la fonction.

---

## ✅ Checklist Post-Migration

- [ ] 4 RPC functions existent et sont exécutables
- [ ] `notion_connections` n'a qu'une seule colonne token (encrypted)
- [ ] Contrainte UNIQUE sur `usage_records(user_id, year, month)`
- [ ] ON CONFLICT utilise le nom de contrainte (pas de colonnes)
- [ ] Toutes les fonctions ont `SET search_path = public, pg_catalog` 🔒
- [ ] Extension pg_trgm dans schema `extensions` (pas `public`) 🔒
- [ ] Leaked Password Protection activée dans Auth Settings 🔒
- [ ] 0 warnings Supabase sécurité (attendre 5-10 min après migration) 🔒
- [ ] Backend démarre sans erreurs (`pnpm dev`)
- [ ] Test OAuth fonctionne
- [ ] Test usage tracking fonctionne

---

**Une fois les migrations appliquées, vous pouvez continuer avec le développement frontend !** 🚀

Voir **TODO_FRONTEND.md** pour le plan détaillé (12-15h).
