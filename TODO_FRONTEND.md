# 🎨 TODO FRONTEND - Plan Détaillé (12-15h)

> **Développement Site Vitrine + Dashboard**
> React 18 + TypeScript + Vite + Tailwind CSS

---

## 📋 Vue d'Ensemble

**Objectif** : Site vitrine professionnel + Dashboard utilisateur
**Design** : Apple/Notion quality standards
**Stack** : React 18, TypeScript, Vite, Tailwind CSS, React Router
**Temps estimé** : **12-15 heures**

---

## 🏗️ Architecture Frontend

```
showcase-site/
├── src/
│   ├── assets/              # Images, logos, SVG
│   ├── components/          # Composants réutilisables
│   │   ├── ui/              # Boutons, Cards, Modals
│   │   ├── layout/          # Header, Footer, Sidebar
│   │   ├── auth/            # AuthGuard, LoginForm
│   │   └── dashboard/       # UsageChart, QuotaCard
│   ├── pages/               # Pages principales
│   │   ├── Home.tsx
│   │   ├── Pricing.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   ├── AuthSuccess.tsx
│   │   └── AuthError.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useSubscription.ts
│   │   └── useUsage.ts
│   ├── services/            # API calls
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── stripe.service.ts
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utilities
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── App.tsx              # Router setup
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── .env.example
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📦 Dépendances Recommandées

### Installation

```bash
cd showcase-site

# Core dependencies
pnpm add react-router-dom
pnpm add @tanstack/react-query     # Data fetching + caching
pnpm add axios                      # HTTP client
pnpm add zustand                    # State management (alternative à Context)
pnpm add lucide-react              # Icons (déjà installé)
pnpm add recharts                   # Charts pour analytics
pnpm add react-hot-toast           # Notifications
pnpm add framer-motion             # Animations

# Dev dependencies
pnpm add -D @types/node
```

---

## 🎯 Plan de Développement (Ordre Optimal)

---

### ✅ **PHASE 1 : Setup & Foundation** (2h)

#### 1.1 Configuration Vite + TypeScript (30 min)

**Fichiers** :
- `vite.config.ts` : Alias paths (`@/components`, etc.)
- `tsconfig.json` : Strict mode + path mapping
- `tailwind.config.js` : Thème custom (couleurs Apple/Notion)

**Tâches** :
```typescript
// vite.config.ts
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### 1.2 Services API + Types (1h)

**Fichiers** :
- `src/services/api.ts` : Axios instance avec interceptors
- `src/types/index.ts` : Types TypeScript

**Code** :
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor (add JWT token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```typescript
// src/services/auth.service.ts
import api from './api';

export const authService = {
  getProfile: () => api.get('/user/profile'),
  logout: () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  },
};
```

```typescript
// src/services/user.service.ts
import api from './api';

export const userService = {
  getSubscription: () => api.get('/user/subscription'),
  getUsage: () => api.get('/usage/current'),
  getNotionConnection: () => api.get('/user/notion-connection'),
};
```

```typescript
// src/services/stripe.service.ts
import api from './api';

export const stripeService = {
  createCheckoutSession: (plan: string) =>
    api.post('/stripe/create-checkout-session', { plan }),
  createPortalSession: (returnUrl: string) =>
    api.post('/stripe/create-portal', { returnUrl }),
};
```

#### 1.3 Auth Context + Hooks (30 min)

**Fichiers** :
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`

**Code** :
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await authService.getProfile();
      setUser(data);
    } catch (error) {
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string) => {
    localStorage.setItem('auth_token', token);
    fetchUser();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

### ✅ **PHASE 2 : UI Components** (2h)

#### 2.1 Layout Components (1h)

**Composants à créer** :
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Sidebar.tsx`

**Features** :
- Header : Logo, Navigation, User menu (avatar dropdown)
- Footer : Links, Copyright
- Sidebar : Dashboard navigation (Dashboard, Settings, Logout)

**Design** :
- Fond blanc/transparent
- Blur effect (backdrop-filter)
- Sticky header
- Responsive mobile

#### 2.2 UI Components (1h)

**Composants à créer** :
- `src/components/ui/Button.tsx` : Primary, Secondary, Outline
- `src/components/ui/Card.tsx` : Container avec shadow
- `src/components/ui/Badge.tsx` : Tier badges (FREE, PREMIUM)
- `src/components/ui/Spinner.tsx` : Loading state
- `src/components/ui/Modal.tsx` : Dialogs

**Variantes Button** :
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

---

### ✅ **PHASE 3 : Pages Publiques** (3h)

#### 3.1 Home Page (1.5h)

**Fichier** : `src/pages/Home.tsx`

**Sections** :
1. **Hero** : Titre accrocheur + CTA "Download" + "View Pricing"
2. **Features** : Grid 3 colonnes (Clip Notion, Focus Mode, Analytics)
3. **Screenshots** : Carousel images de l'app
4. **Testimonials** : Avis utilisateurs (3-4 cartes)
5. **CTA Final** : "Start clipping for free"

**Endpoints** : Aucun (page statique)

**Assets nécessaires** :
- Logo NotionClipper
- Screenshots de l'app desktop
- Icônes features (Lucide React)

#### 3.2 Pricing Page (1.5h)

**Fichier** : `src/pages/Pricing.tsx`

**Layout** : 2 colonnes (Free vs Premium)

**Pricing Cards** :
```
┌──────────────────────────┐  ┌──────────────────────────┐
│        FREE              │  │      PREMIUM             │
│  0€/mois                 │  │  2.99€/mois              │
│  ✓ 100 clips/mois        │  │  ✓ Clips illimités       │
│  ✓ 10 files/mois         │  │  ✓ Files illimités       │
│  ✓ 60 min focus mode     │  │  ✓ Focus mode illimité   │
│  ✓ 30 min compact mode   │  │  ✓ Compact mode illimité │
│                          │  │  ✓ Priority support      │
│  [Get Started]           │  │  [Upgrade to Premium]    │
└──────────────────────────┘  └──────────────────────────┘
```

**Endpoints** :
- `POST /stripe/create-checkout-session` (si user clique "Upgrade")

**Features** :
- Badge "Most Popular" sur Premium
- Toggle Monthly/Annual (-20%)
- FAQ section (accordions)

---

### ✅ **PHASE 4 : Pages Auth** (1h)

#### 4.1 AuthSuccess Page (30 min)

**Fichier** : `src/pages/AuthSuccess.tsx`

**Flow** :
1. Récupérer `?token=...` depuis URL
2. Stocker le token dans localStorage
3. Appeler `login(token)` depuis AuthContext
4. Redirect vers `/dashboard` après 2s

**Code** :
```typescript
export default function AuthSuccess() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Login Successful!</h1>
        <p className="text-gray-600 mt-2">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
```

#### 4.2 AuthError Page (30 min)

**Fichier** : `src/pages/AuthError.tsx`

**Display** : Message d'erreur + bouton "Try Again"

**Code** :
```typescript
export default function AuthError() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || 'Unknown error';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Authentication Failed</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <Button onClick={() => window.location.href = '/'}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
```

---

### ✅ **PHASE 5 : Dashboard** (4h)

#### 5.1 Dashboard Layout (1h)

**Fichier** : `src/pages/Dashboard.tsx`

**Layout** : 3 colonnes responsive

```
┌─────────────────────────────────────────────────────┐
│  Header (User avatar, Logout)                       │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Quota    │  │ Tier     │  │ Usage    │         │
│  │ Card     │  │ Card     │  │ Chart    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
├─────────────────────────────────────────────────────┤
│  Recent Activity Table                              │
└─────────────────────────────────────────────────────┘
```

**Endpoints** :
- `GET /user/profile` : Infos user
- `GET /user/subscription` : Tier, status
- `GET /usage/current` : Usage du mois

#### 5.2 Quota Card Component (1h)

**Fichier** : `src/components/dashboard/QuotaCard.tsx`

**Features** :
- Progress bar (clips, files, minutes utilisés vs limite)
- Couleurs : Vert < 70%, Jaune 70-90%, Rouge > 90%
- Badge "Upgrade to Premium" si Free tier

**Code** :
```typescript
interface QuotaCardProps {
  title: string;
  current: number;
  limit: number; // -1 = unlimited
  unit: string;
}

export function QuotaCard({ title, current, limit, unit }: QuotaCardProps) {
  const percentage = limit === -1 ? 0 : (current / limit) * 100;
  const isUnlimited = limit === -1;

  return (
    <Card>
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span>{current} {unit}</span>
          <span>{isUnlimited ? 'Unlimited' : `${limit} ${unit}`}</span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
```

#### 5.3 Tier Card Component (1h)

**Fichier** : `src/components/dashboard/TierCard.tsx`

**Features** :
- Badge FREE ou PREMIUM
- Période actuelle (current_period_end)
- Bouton "Upgrade" (si Free) ou "Manage Subscription" (si Premium)
- Click → Redirect vers Stripe Checkout/Portal

**Endpoint** :
- `POST /stripe/create-checkout-session` (upgrade)
- `POST /stripe/create-portal` (manage)

#### 5.4 Usage Chart Component (1h)

**Fichier** : `src/components/dashboard/UsageChart.tsx`

**Library** : Recharts

**Chart Type** : Line chart (6 derniers mois)

**Data** : RPC `get_usage_analytics(user_id, 6)`

**X-axis** : Mois (Jan, Feb, Mar, ...)
**Y-axis** : Clips count

---

### ✅ **PHASE 6 : Settings Page** (2h)

#### 6.1 Settings Layout (1h)

**Fichier** : `src/pages/Settings.tsx`

**Tabs** :
1. **Profile** : Email, Name, Avatar (read-only pour OAuth users)
2. **Notion Connection** : Workspace connected, Reconnect button
3. **Billing** : Subscription info, Manage button → Stripe Portal

#### 6.2 Notion Connection Section (1h)

**Component** : `src/components/settings/NotionConnection.tsx`

**Features** :
- Si connecté : Afficher workspace name + icon + "Disconnect" button
- Si non connecté : Bouton "Connect Notion" → Redirect `/api/auth/notion`

**Endpoint** :
- `GET /user/notion-connection`

---

### ✅ **PHASE 7 : Routing + Protection** (1h)

#### 7.1 React Router Setup (30 min)

**Fichier** : `src/App.tsx`

**Routes** :
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/auth/error" element={<AuthError />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

#### 7.2 PrivateRoute Component (30 min)

**Fichier** : `src/components/auth/PrivateRoute.tsx`

**Logic** :
- Si `loading` → Afficher Spinner
- Si `!user` → Redirect vers `/` (Home)
- Si `user` → Render children

**Code** :
```typescript
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner fullscreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

---

### ✅ **PHASE 8 : Polish & UX** (1-2h)

#### 8.1 Loading States (30 min)

**Tâches** :
- Ajouter Skeleton screens pour Dashboard
- Loading spinners pour buttons
- Suspense boundaries pour lazy loading

#### 8.2 Error Handling (30 min)

**Tâches** :
- Toast notifications (react-hot-toast)
- Error boundary component
- Retry failed requests

**Code** :
```typescript
// src/components/ErrorBoundary.tsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1>Something went wrong</h1>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 8.3 Animations (30 min)

**Tâches** :
- Framer Motion page transitions
- Hover effects sur cards
- Fade-in animations

---

## 🎨 Design System

### Couleurs (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          500: '#8b5cf6', // Violet
          600: '#7c3aed',
          700: '#6d28d9',
        },
        secondary: {
          500: '#6366f1', // Indigo
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      },
    },
  },
};
```

### Typography

```css
/* src/index.css */
@layer base {
  h1 {
    @apply text-5xl font-bold tracking-tight;
  }
  h2 {
    @apply text-3xl font-semibold;
  }
  h3 {
    @apply text-xl font-semibold;
  }
}
```

---

## 📊 Récap Temps Estimé

| Phase | Tâches | Temps |
|-------|--------|-------|
| 1 | Setup & Foundation | 2h |
| 2 | UI Components | 2h |
| 3 | Pages Publiques | 3h |
| 4 | Pages Auth | 1h |
| 5 | Dashboard | 4h |
| 6 | Settings | 2h |
| 7 | Routing + Protection | 1h |
| 8 | Polish & UX | 1-2h |
| **TOTAL** | | **16-17h** |

**Estimation ajustée** : **12-15h** (si développeur expérimenté React/TypeScript)

---

## ✅ Checklist Finale

Avant de pousser en production :

- [ ] Tous les endpoints backend fonctionnent
- [ ] OAuth Google/Notion flows testés
- [ ] Stripe checkout flow testé (test mode)
- [ ] Dashboard affiche quotas correctement
- [ ] Settings permet de gérer subscription
- [ ] Responsive mobile (test sur iPhone/Android)
- [ ] Loading states partout
- [ ] Error handling propre
- [ ] TypeScript sans erreurs (`npm run build`)
- [ ] Lighthouse score > 90 (Performance, Accessibility)

---

**Made with ❤️ by NotionClipper Team**
*React + TypeScript + Tailwind = 🔥*
