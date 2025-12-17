# 📦 Database Migrations - NotionClipperWeb

## ⚠️ IMPORTANT: Migration Consolidation (1er Décembre 2025)

Les migrations ont été consolidées pour simplifier le schéma. 

### Pour une NOUVELLE installation (base de données vide)

Utilisez uniquement la migration consolidée :
```bash
cd NotionClipperWeb
supabase db push
```

La migration `00000000000000_consolidated_schema.sql` contient tout le schéma nécessaire.

### Pour une installation EXISTANTE

Les anciennes migrations (20251118*) ont déjà été appliquées. Appliquez uniquement les nouvelles migrations du 1er décembre.

---

## 📋 Structure des Migrations

### Migration Consolidée (nouvelles installations)
| Fichier | Description |
|---------|-------------|
| `00000000000000_consolidated_schema.sql` | Schéma complet consolidé (8 tables, RLS, triggers, RPC) |

### Migrations Actives (installations existantes)
| Fichier | Description |
|---------|-------------|
| `20251201_activity_logs_and_avatar.sql` | Table activity_logs + colonnes avatar |
| `20251201_add_cancel_at_period_end.sql` | Colonne Stripe cancel_at_period_end |
| `20251201_fix_stripe_customer_id.sql` | Fix données JSON corrompues |
| `20251201_fix_subscription_tier.sql` | Fix tier uppercase |
| `20251201_notion_workspace_unique.sql` | Contrainte unique workspace |
| `20251201_workspace_protection.sql` | Système anti-abus complet |

### Migrations Archivées (dossier `_archive/`)
Les migrations `20251118*` et `20251119*` ont été déplacées dans `_archive/` car elles ont déjà été appliquées. Elles sont conservées pour l'historique.

---

## 📊 Schéma de Base de Données

### Tables Principales (5)
| Table | Description |
|-------|-------------|
| `user_profiles` | Profils utilisateurs (OAuth/Email) |
| `subscriptions` | Abonnements Stripe (FREE/PREMIUM/GRACE_PERIOD) |
| `usage_records` | Suivi mensuel des quotas |
| `usage_events` | Événements détaillés |
| `notion_connections` | Connexions Notion (tokens chiffrés AES-256-GCM) |

### Tables Activité (1)
| Table | Description |
|-------|-------------|
| `activity_logs` | Logs d'activité pour le dashboard |

### Tables Anti-Abus (2)
| Table | Description |
|-------|-------------|
| `workspace_usage_history` | Un workspace = Un compte (à vie) |
| `connection_attempts` | Audit des tentatives de connexion |

---

## 🔧 Fonctions RPC

| Fonction | Description |
|----------|-------------|
| `increment_usage_counter` | Incrémenter les compteurs atomiquement |
| `get_current_quota` | Obtenir les quotas actuels |
| `check_quota_limit` | Vérifier les limites |
| `get_usage_analytics` | Analytics d'utilisation (6 mois) |
| `get_user_activity` | Récupérer l'activité utilisateur |
| `check_workspace_availability` | Vérifier disponibilité workspace (anti-abus) |
| `register_workspace_connection` | Enregistrer une connexion workspace |

---

## 🔒 Sécurité

### Row Level Security (RLS)
- ✅ Activé sur toutes les tables
- ✅ Force RLS même pour le propriétaire
- ✅ Optimisé avec `(select auth.uid())` pour performance

### Chiffrement
- ✅ Tokens Notion chiffrés (AES-256-GCM)
- ✅ Clé de chiffrement côté serveur uniquement

### Anti-Abus
- ✅ Un workspace Notion = Un compte utilisateur (à vie)
- ✅ Audit de toutes les tentatives de connexion
- ✅ Blocage des workspaces abusifs

---

## 🚀 Application

```bash
# Depuis le dossier NotionClipperWeb
cd NotionClipperWeb
supabase db push
```

---

## 🧪 Vérification Post-Migration

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
-- Expected: 8 tables

-- Vérifier les fonctions RPC
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
-- Expected: 7+ fonctions

-- Tester le tracking
SELECT * FROM increment_usage_counter('YOUR_USER_UUID', 'clips', 1);
```

---

## ✅ Checklist

- [ ] Migration consolidée appliquée (nouvelles installations)
- [ ] OU migrations 20251201_* appliquées (installations existantes)
- [ ] 8 tables présentes
- [ ] 7+ RPC functions présentes
- [ ] RLS activé sur toutes les tables
- [ ] Leaked Password Protection activée (Dashboard → Auth → Settings)

---

**Base de données production-ready !** 🚀
