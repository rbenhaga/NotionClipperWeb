# 🎯 RÈGLES AI - NotionClipperWeb (Backend + Site)

## ⛔ RÈGLES GIT NON-NÉGOCIABLES

### Interdictions absolues
- **INTERDIT** : commit sans validation explicite du patron
- **INTERDIT** : push sans validation explicite du patron
- **INTERDIT** : travailler directement sur `main`
- **INTERDIT** : modifier l'historique (rebase/force-push) sans validation

### Workflow obligatoire
1. Proposer un plan (3-7 bullets) AVANT d'éditer
2. Faire les modifications
3. Générer un patch (`git diff --stat` + liste fichiers)
4. **STOP** : demander validation
5. Seulement après GO : commit → push → PR

### Format de demande de validation
```
STOP : prêt à commit.
- Fichiers modifiés : [liste]
- Tests exécutés : [oui/non + résultat]
- Risques : [aucun / liste]
Donne-moi le GO pour commit.
```

---

## ⚠️ Règles Critiques pour Agents AI

### Mode de Travail Obligatoire
1. **TOUJOURS** proposer un plan AVANT d'implémenter
2. **JAMAIS** modifier plusieurs fichiers sans validation
3. **MODIFICATIONS MINIMALES** : ne toucher que le code nécessaire
4. **REVIEW OBLIGATOIRE** : attendre validation avant chaque étape

### Fichiers Protégés (NE JAMAIS MODIFIER sans demande explicite)
- `package.json`, `package-lock.json`
- `tsconfig.json`, `vite.config.ts`
- `.env`, `.env.example`, `.secrets.local`
- `supabase/config.toml`
- Fichiers de migrations SQL existants

### Fichiers Autorisés (travail autonome possible)
- Composants React (`src/components/`, `src/pages/`)
- Controllers/Services backend (`src/controllers/`, `src/services/`)
- Routes (`src/routes/`)
- Tests (`*.test.ts`, `*.spec.ts`)
- Nouvelles migrations SQL

### Stratégie de Modification
```
1. Lire le fichier complet
2. Identifier le bloc EXACT à modifier
3. Proposer le changement MINIMAL
4. Attendre validation
5. Appliquer
```

## Architecture

```
NotionClipperWeb/
├── backend/                    # Express.js + TypeScript
│   ├── src/
│   │   ├── controllers/        # Logique endpoints
│   │   ├── services/           # Logique métier
│   │   ├── routes/             # Définition routes
│   │   ├── middleware/         # Auth, CORS, Rate limiting
│   │   └── config/             # Database, constants
│   └── .env                    # Secrets (jamais commité)
├── showcase-site/              # React + Vite + Tailwind
│   └── src/
│       ├── pages/              # Pages (Dashboard, Billing, etc.)
│       ├── components/         # Composants réutilisables
│       ├── services/           # API calls
│       └── contexts/           # Auth, Subscription
└── supabase/
    └── migrations/             # Migrations SQL
```

## Base de Données (Supabase)

### Tables Principales
- `user_profiles` - Profils (avatar_data, email_verified)
- `subscriptions` - Abonnements (tier: FREE/PREMIUM/GRACE_PERIOD)
- `notion_connections` - Tokens Notion chiffrés
- `usage_records` - Suivi mensuel
- `usage_events` - Événements détaillés
- `activity_logs` - Logs pour dashboard
- `workspace_usage_history` - Anti-abus (1 workspace = 1 compte)

### Contraintes DB Importantes
- `check_auth_provider`: auth_provider IN ('google', 'notion', 'email')
- `tier` en MAJUSCULES dans la DB (FREE, PREMIUM, GRACE_PERIOD)
- RLS activé sur toutes les tables
- Service role pour bypass RLS côté backend
- 1 workspace Notion = 1 compte utilisateur (permanent, anti-abus)

## API Endpoints

| Route | Description |
|-------|-------------|
| `/api/auth/*` | OAuth Google/Notion, Email auth |
| `/api/stripe/*` | Checkout, Portal, Webhooks |
| `/api/user/*` | Profil, Avatar, App Data |
| `/api/usage/*` | Quotas, Tracking |
| `/api/activity/*` | Historique, Stats, Insights |
| `/api/workspace/*` | Multi-workspace, Anti-abus |

## 🔐 Flow d'Authentification

### Site Web → App Desktop
```
1. User ouvre l'app desktop
2. App vérifie si token existe localement
3. Si non → Ouvre navigateur vers /auth?source=app
4. User s'authentifie (OAuth ou Email)
5. Backend génère JWT et redirige vers /auth/success?token=...&source=app
6. Page /auth/success détecte source=app → Deep link notion-clipper://auth/callback?token=...
7. App reçoit le deep link → Appelle /api/user/app-data avec le token
8. Backend retourne: user, subscription, notionWorkspace, notionToken (déchiffré)
9. App sauvegarde tout localement et affiche l'interface
```

### Endpoints Auth Importants
- `GET /api/user/app-data` - Retourne TOUTES les données pour l'app desktop
- `POST /api/auth/signup` - Inscription email (envoie email de vérification)
- `POST /api/auth/login` - Connexion email (vérifie email_verified)
- `POST /api/auth/resend-verification` - Renvoyer email de vérification
- `POST /api/auth/forgot-password` - Demande reset password
- `POST /api/auth/reset-password` - Reset avec token

### Règles Auth
- OAuth users (Google/Notion) sont auto-vérifiés
- Email users doivent vérifier leur email avant connexion
- Token Notion est chiffré en DB, déchiffré uniquement pour l'app desktop
- 1 workspace Notion = 1 compte (anti-abus)

## Règles Strictes

### 1. Sécurité
- JWT obligatoire sur endpoints protégés
- Rate limiting configuré
- Tokens Notion chiffrés (AES-256-GCM)
- Validation/sanitization des inputs

### 2. Stripe
- Webhooks: Toujours vérifier signature
- Tier: Normaliser en MAJUSCULES pour frontend
- `cancel_at_period_end`: Gérer dans BillingPage

### 3. Anti-Abus Workspace
- 1 workspace Notion = 1 compte utilisateur (permanent)
- Vérifier disponibilité avant connexion
- Logger toutes les tentatives

### 4. Éviter la Dette Technique
- **Code propre dès le départ** : Pas de "quick fix" temporaires qui restent
- **Nommage explicite** : Variables/fonctions auto-documentées
- **Pas de code mort** : Supprimer le code commenté ou inutilisé
- **DRY (Don't Repeat Yourself)** : Factoriser le code dupliqué
- **Single Responsibility** : Une fonction = une responsabilité
- **Gestion d'erreurs complète** : Toujours gérer les cas d'erreur (try/catch, fallbacks)
- **Types stricts** : Jamais de `any`, toujours typer explicitement
- **Tests pour code critique** : Fonctions métier testées
- **Documentation inline** : Commenter le "pourquoi", pas le "quoi"
- **Fallbacks gracieux** : Gérer les cas où les APIs/services sont indisponibles
- **Backward compatibility** : Penser à la rétrocompatibilité lors des changements
- **Migrations réversibles** : Prévoir le rollback des migrations SQL

### 5. Code Style TypeScript/React/Tailwind
- TypeScript strict, jamais de `any`
- `async/await` (jamais `.then()`)
- Logger Winston (pas console.log)
- Réponses: `sendSuccess(res, data)` ou `throw new AppError()`

### 6. Conventions React (showcase-site)
- Composants = fonctions (jamais de classes)
- Props toujours typées avec interface
- Hooks pour toute logique d'état
- Pas d'inline CSS, uniquement TailwindCSS
- Composants responsive par défaut
- Nommage: `PascalCase` pour composants, `camelCase` pour hooks

### 7. Structure des Composants
```tsx
// 1. Imports
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 2. Interface Props
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

// 3. Composant
export function MyComponent({ title, onAction }: MyComponentProps) {
  const { t } = useTranslation();
  const [state, setState] = useState(false);
  
  return <div className="...">{t('key')}</div>;
}
```

### 8. Structure Backend (Express)
```typescript
// Controller
export async function myController(req: Request, res: Response) {
  try {
    const result = await myService.doSomething(req.body);
    sendSuccess(res, result);
  } catch (error) {
    throw new AppError('Message', 400);
  }
}
```

## Commandes

```bash
# Backend
cd backend && npm run dev

# Frontend
cd showcase-site && npm run dev

# Migrations
cd .. && supabase db push --linked
```

## Design UI/UX

- Style: Apple/Notion (minimaliste, épuré)
- Animations: Framer Motion (subtiles)
- Couleurs: Purple/Blue gradients, gris neutres
- i18n: FR/EN avec react-i18next


## 🔄 Workflows Recommandés

### Nouvelle Fonctionnalité
```
1. "Fais un plan d'implémentation pour [feature]"
2. Valider/modifier le plan
3. "Implémente l'étape 1 uniquement"
4. Review → Valider
5. Répéter pour chaque étape
```

### Nouvelle Route API
```
1. Créer le controller dans src/controllers/
2. Créer le service dans src/services/
3. Ajouter la route dans src/routes/
4. Documenter dans ce fichier
5. Tester avec Postman/curl
```

### Migration SQL
```
1. Créer fichier: YYYYMMDDHHMMSS_description.sql
2. Tester localement: supabase db reset
3. Vérifier RLS policies
4. Push: supabase db push --linked
```

### Debug
```
1. "Analyse cette erreur: [erreur]"
2. "Propose des solutions sans modifier le code"
3. Choisir la solution
4. "Applique la solution choisie"
```

## 📝 Prompts Optimisés

### Pour nouvelle feature frontend
> "Tu vas implémenter [feature] pour showcase-site (React/TS/Tailwind/Vite).
> AVANT toute action, écris un plan détaillé avec: étapes, fichiers touchés, risques.
> Tu respectes les RULES.md. Modifications minimales et localisées uniquement."

### Pour nouvelle route API
> "Crée un endpoint [METHOD] /api/[route] qui [description].
> Structure: controller → service → route.
> Inclure: validation, auth JWT, error handling, types TS."

### Pour correction bug
> "Bug: [description]. Stack: Express + React + TS + Supabase.
> 1. Analyse la cause probable
> 2. Propose 2-3 solutions
> 3. Attends ma validation avant de modifier"

### Pour migration DB
> "Crée une migration pour [description].
> Inclure: CREATE/ALTER, RLS policies, indexes si nécessaire.
> Format: supabase migration standard."
