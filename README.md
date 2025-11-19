# 🚀 NotionClipperWeb - Site Vitrine + Backend API

**Status**: ✅ PRÊT POUR TESTS  
**Date**: 19 novembre 2025

---

## ✅ Configuration

### Supabase Vault (Recommandé)
Tous les secrets sont chargés depuis Supabase Vault:
- OAuth (Google + Notion)
- Stripe (Secret Key + Price IDs)
- Token Encryption Key

**Voir**: `SUPABASE_VAULT_SETUP.md` pour configuration (10 min)

### Features
- ✅ Toggle Monthly/Annual avec badge -20%
- ✅ Email auth (signup/login)
- ✅ OAuth Google + Notion
- ✅ i18n FR/EN complet
- ✅ RLS policies Supabase fixées
- ✅ Secrets depuis Supabase Vault

---

## 🧪 Tests (20 min)

### Démarrer:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd showcase-site && npm run dev
```

### Tester:
1. **Pricing**: http://localhost:5173/pricing → Toggle Monthly/Annual
2. **Stripe**: Click "Start Free Trial" → Checkout fonctionne
3. **Auth**: http://localhost:5173/auth → Signup/Login/OAuth
4. **i18n**: Toggle FR/EN dans Header

---

## 📁 Structure

```
NotionClipperWeb/
├── backend/
│   ├── src/
│   ├── .env              # Config minimale (Supabase + JWT)
│   └── .env.example      # Template
├── showcase-site/
│   ├── src/
│   └── .env
├── supabase/
│   ├── functions/        # Edge Function (get-oauth-secrets)
│   └── migrations/       # RLS policies ✅
├── SUPABASE_VAULT_SETUP.md  # Guide configuration Vault
└── CHANGELOG.md
```

---

## 🚀 Déploiement

Voir `CHANGELOG.md` pour:
- Phase 1: Polish & Qualité
- Phase 2: Backend Enhancements
- Phase 3: Deployment VPS

---

**Temps de test**: 20 minutes  
**Verdict**: Prêt pour validation! ✅
