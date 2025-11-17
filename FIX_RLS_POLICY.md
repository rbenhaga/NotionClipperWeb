# Fix RLS Policy for OAuth

## Problème

Erreur lors de l'OAuth:
```
new row violates row-level security policy for table "user_profiles"
```

**Cause**: La table `user_profiles` a Row Level Security (RLS) activé mais n'a pas de policy permettant au `service_role` de créer/modifier des utilisateurs.

## Solution

Appliquer la migration SQL qui ajoute les bonnes policies RLS.

### Option 1: Via Supabase CLI (Recommandé)

```powershell
cd C:\Users\rayan\Desktop\Dev\NotionClipperWeb

# Appliquer la migration
supabase db push

# OU spécifiquement cette migration
supabase migration up
```

### Option 2: Via Supabase Dashboard

1. Allez sur https://supabase.com/dashboard/project/rijjtngbgahxdjflfyhi/editor
2. Cliquez sur "SQL Editor"
3. Copiez-collez le contenu de `supabase/migrations/20251117_fix_user_profiles_rls.sql`
4. Cliquez "Run"

### Option 3: Via SQL direct

Exécutez cette requête SQL dans le SQL Editor:

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role has full access to user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow service_role to do everything
CREATE POLICY "Service role has full access to user profiles"
  ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Vérification

Après avoir appliqué la migration, vérifiez que les policies sont bien créées:

```sql
-- Voir toutes les policies sur user_profiles
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles';
```

Vous devriez voir 3 policies:
1. ✅ "Service role has full access to user profiles" (FOR ALL, TO service_role)
2. ✅ "Users can view their own profile" (FOR SELECT, TO authenticated)
3. ✅ "Users can update their own profile" (FOR UPDATE, TO authenticated)

## Test OAuth

Une fois la migration appliquée:

1. Assurez-vous que le backend tourne (`npm run dev` dans backend/)
2. Testez Google OAuth: http://localhost:5173 → "Se connecter avec Google"
3. Testez Notion OAuth: http://localhost:5173 → "Connecter Notion"

**Attendu**: Connexion réussie sans erreur RLS! ✅

## Explication technique

### Pourquoi ça ne marchait pas avant?

1. ❌ `user_profiles` avait RLS activé
2. ❌ Aucune policy n'autorisait le `service_role` à insérer
3. ❌ Le backend utilise `SERVICE_ROLE_KEY` mais sans policy explicite, RLS bloquait quand même

### Pourquoi ça marche maintenant?

1. ✅ Policy explicite `TO service_role` avec `USING (true)` et `WITH CHECK (true)`
2. ✅ Le backend peut maintenant créer/modifier des users pendant l'OAuth
3. ✅ Les utilisateurs authentifiés peuvent toujours voir/modifier leur propre profil
4. ✅ Sécurité préservée: seul service_role peut créer des users

## Architecture RLS

```
OAuth Flow → Backend (SERVICE_ROLE_KEY)
    ↓
Supabase Client (service_role)
    ↓
INSERT INTO user_profiles (...)
    ↓
RLS vérifie: role = service_role? ✅
    ↓
Policy: "Service role has full access" → ALLOW
    ↓
✅ User créé avec succès
```

## Sécurité

Les policies RLS garantissent:
- ✅ Seul le backend (service_role) peut créer des users
- ✅ Les users ne peuvent voir que leur propre profil
- ✅ Les users ne peuvent modifier que leur propre profil
- ✅ Les users ne peuvent pas créer ou supprimer des profils
- ✅ Les users ne peuvent pas voir les profils des autres

C'est exactement le comportement attendu pour une application sécurisée!
