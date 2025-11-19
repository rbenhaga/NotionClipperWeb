# 🚀 NotionClipperWeb - Site Vitrine + Backend API

**Status**: ✅ PRÊT POUR TESTS  
**Date**: 19 novembre 2025

---

## ✅ Configuration Complète

### Stripe
- Monthly: `price_1SSRiUC1QIPSyau3QOwLfWba` (2.99€/mois)
- Annual: `price_1SVG5GC1QIPSyau3jq8Jrr4W` (28.68€/an)

### Features
- ✅ Toggle Monthly/Annual avec badge -20%
- ✅ Email auth (signup/login)
- ✅ OAuth Google + Notion
- ✅ i18n FR/EN complet
- ✅ RLS policies Supabase fixées
- ✅ Vault désactivé en dev

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
├── backend/              # API Node.js + Express
│   ├── src/
│   ├── .env             # Stripe configuré ✅
│   └── logs/
├── showcase-site/        # Frontend React + Vite
│   ├── src/
│   └── .env
├── supabase/
│   └── migrations/      # RLS policies ✅
└── CHANGELOG.md         # Historique
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
