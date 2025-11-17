# Configuration des Redirect URIs OAuth

## Problème

Erreurs OAuth lors de la connexion:
- **Google**: "The OAuth client was not found. Erreur 401 : invalid_client"
- **Notion**: Échec de la redirection

**Cause**: Les redirect URIs du backend VPS ne sont pas autorisés dans les consoles OAuth.

## Redirect URIs requis

Le backend VPS utilise ces URLs de callback:

```
http://localhost:3001/api/auth/google/callback   (développement)
http://localhost:3001/api/auth/notion/callback   (développement)

https://VOTRE_DOMAINE/api/auth/google/callback   (production)
https://VOTRE_DOMAINE/api/auth/notion/callback   (production)
```

## Configuration Google OAuth

### 1. Accéder à Google Cloud Console

1. Allez sur https://console.cloud.google.com/apis/credentials
2. Sélectionnez votre projet
3. Trouvez votre "OAuth 2.0 Client ID" (commence par `950347333509-...`)

### 2. Ajouter les Redirect URIs

1. Cliquez sur le nom du client OAuth
2. Scrollez jusqu'à "Authorized redirect URIs"
3. Cliquez "ADD URI"
4. Ajoutez ces URLs **UNE PAR UNE**:

   ```
   http://localhost:3001/api/auth/google/callback
   http://127.0.0.1:3001/api/auth/google/callback
   ```

5. Pour la production, ajoutez aussi:

   ```
   https://votre-domaine.com/api/auth/google/callback
   ```

6. Cliquez "SAVE"

### 3. Vérifier les scopes

Assurez-vous que ces scopes sont autorisés:
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`
- `openid`

### 4. Test Screen Configuration

Si votre app est en "Testing":
1. Allez dans "OAuth consent screen"
2. Ajoutez votre email dans "Test users"
3. OU publiez l'application (pour usage public)

## Configuration Notion OAuth

### 1. Accéder à Notion Integrations

1. Allez sur https://www.notion.so/my-integrations
2. Cliquez sur votre intégration (client_id: `298d872b-594c-808a-b...`)

### 2. Configurer Redirect URIs

1. Trouvez la section "Redirect URIs"
2. Ajoutez ces URLs:

   ```
   http://localhost:3001/api/auth/notion/callback
   http://127.0.0.1:3001/api/auth/notion/callback
   ```

3. Pour la production:

   ```
   https://votre-domaine.com/api/auth/notion/callback
   ```

4. Cliquez "Save changes"

### 3. Vérifier les capabilities

Assurez-vous que votre intégration a:
- ✅ "Read user information including email addresses" (User Capabilities)
- ✅ OAuth activé (Integration type: Public)

### 4. Distribution Settings

Si vous voulez que d'autres utilisateurs puissent se connecter:
1. Allez dans "Distribution"
2. Sélectionnez "Make public" OU "Share with specific workspaces"

## Variables d'environnement

Vérifiez que votre `backend/.env` contient:

```bash
# Développement
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
NOTION_REDIRECT_URI=http://localhost:3001/api/auth/notion/callback

# Production
# GOOGLE_REDIRECT_URI=https://votre-domaine.com/api/auth/google/callback
# NOTION_REDIRECT_URI=https://votre-domaine.com/api/auth/notion/callback
```

## Test après configuration

### 1. Redémarrer le backend

```bash
cd backend
npm run dev
```

### 2. Tester Google OAuth

Ouvrez dans votre navigateur:
```
http://localhost:5173/
```

Cliquez sur "Se connecter avec Google"

**Attendu**: Redirection vers Google → Sélection de compte → Redirection vers `http://localhost:3001/api/auth/google/callback` → Succès

### 3. Tester Notion OAuth

Cliquez sur "Connecter Notion"

**Attendu**: Redirection vers Notion → Autorisation → Redirection vers `http://localhost:3001/api/auth/notion/callback` → Succès

## Dépannage

### Erreur Google: "redirect_uri_mismatch"

**Problème**: L'URL de callback ne correspond pas exactement

**Solutions**:
1. Vérifiez l'orthographe exacte dans Google Cloud Console
2. Assurez-vous qu'il n'y a pas d'espace ou de slash final
3. Vérifiez que le protocole est correct (http vs https)
4. Attendez 5 minutes après la modification (propagation Google)

### Erreur Google: "Access blocked: This app's request is invalid"

**Problème**: L'app est en mode "Testing" et vous n'êtes pas dans les test users

**Solution**:
1. Allez dans OAuth consent screen
2. Ajoutez votre email dans "Test users"
3. OU publiez l'application

### Erreur Notion: "invalid_redirect_uri"

**Problème**: Le redirect URI n'est pas dans la liste autorisée

**Solution**:
1. Vérifiez que vous avez cliqué "Save changes" dans Notion
2. Assurez-vous que l'URL est exactement identique
3. Notion est sensible à la casse et aux slashes

### Erreur Notion: "unauthorized_client"

**Problème**: L'intégration n'est pas configurée pour OAuth public

**Solution**:
1. Vérifiez que "Integration type" est "Public" (pas "Internal")
2. Assurez-vous que OAuth est activé
3. Vérifiez les User Capabilities

## URLs de configuration rapide

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Notion Integrations**: https://www.notion.so/my-integrations
- **Votre backend**: http://localhost:3001/health (vérifier qu'il tourne)
- **Votre frontend**: http://localhost:5173 (vérifier qu'il tourne)

## Architecture OAuth Flow

```
Frontend (localhost:5173)
    ↓ Clic "Se connecter avec Google"
    ↓ Redirige vers
Backend (localhost:3001/api/auth/google)
    ↓ Génère URL Google OAuth
    ↓ Redirige navigateur vers
Google OAuth (accounts.google.com)
    ↓ Utilisateur autorise
    ↓ Redirige vers
Backend (localhost:3001/api/auth/google/callback)
    ↓ Échange code pour tokens
    ↓ Crée/update utilisateur
    ↓ Génère JWT
    ↓ Redirige vers
Frontend (localhost:5173/auth/success?token=...)
    ✅ Connexion réussie
```

**Point clé**: Google/Notion doivent connaître et autoriser l'URL `http://localhost:3001/api/auth/*/callback`
