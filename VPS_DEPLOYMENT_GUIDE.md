# 🚀 Guide de Déploiement VPS - Notion Clipper

Guide complet pour déployer le backend et le site vitrine sur un VPS Oracle Cloud (Free Tier).

---

## 📋 Prérequis

### VPS Oracle Cloud
- ✅ 4 vCPU
- ✅ 24GB RAM
- ✅ Ubuntu 22.04 LTS
- ✅ Adresse IPv4 publique

### Accès requis
- Clé SSH pour se connecter au VPS
- Accès sudo sur le serveur
- Compte GitHub pour cloner le repo

### Services externes
- Compte Supabase (déjà configuré)
- Compte Stripe (pour paiements)
- Credentials OAuth (Google, Notion)

---

## 🏗️ Architecture Cible

```
┌────────────────────────────────────────────────────────────────┐
│                    VPS Oracle Cloud                             │
│                (Ubuntu 22.04, 4vCPU, 24GB RAM)                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Nginx (Port 80/443)                         │ │
│  │          Reverse Proxy + SSL Termination                 │ │
│  └────────────┬────────────────────────┬────────────────────┘ │
│               │                         │                       │
│       ┌───────▼──────────┐      ┌──────▼────────────┐         │
│       │   Backend API    │      │  Showcase Site    │         │
│       │  Node.js/Express │      │   React (static)  │         │
│       │   Port 3001      │      │   dist/           │         │
│       │   PM2 (x2)       │      │                   │         │
│       └──────────────────┘      └───────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Étape 1 : Préparation du Serveur

### 1.1 Connexion SSH

```bash
# Se connecter au VPS
ssh ubuntu@YOUR_VPS_IP

# OU avec clé SSH spécifique
ssh -i ~/.ssh/oracle_key ubuntu@YOUR_VPS_IP
```

### 1.2 Mise à jour du système

```bash
# Mettre à jour les packages
sudo apt update && sudo apt upgrade -y

# Installer les outils de base
sudo apt install -y curl wget git build-essential
```

### 1.3 Installer Node.js 20 LTS

```bash
# Via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node --version  # Doit afficher v20.x.x
npm --version   # Doit afficher 10.x.x
```

### 1.4 Installer pnpm

```bash
# Installer pnpm globalement
npm install -g pnpm

# Vérifier
pnpm --version  # Doit afficher 8.x.x
```

### 1.5 Installer PM2

```bash
# Installer PM2 globalement
npm install -g pm2

# Vérifier
pm2 --version

# Configurer PM2 pour démarrer au boot
pm2 startup
# Exécuter la commande affichée (sudo env PATH=...)
```

### 1.6 Installer Nginx

```bash
# Installer Nginx
sudo apt install -y nginx

# Vérifier
nginx -v

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier le status
sudo systemctl status nginx
```

---

## 📂 Étape 2 : Cloner et Configurer le Projet

### 2.1 Cloner le repository

```bash
# Se placer dans le home directory
cd /home/ubuntu

# Cloner le repo (remplacer par votre URL)
git clone https://github.com/YOUR_USERNAME/NotionClipper.git

# Entrer dans le dossier
cd NotionClipper

# Checkout la bonne branche
git checkout claude/showcase-site-backend-setup-01P3CC13tiQQFK3ywh8VARLa
```

### 2.2 Configurer le Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
pnpm install

# Créer le fichier .env
cp .env.example .env

# Éditer avec vos credentials
nano .env
```

**Variables à configurer dans `.env` :**
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

SUPABASE_URL=https://rijjtngbgahxdjflfyhi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>

GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
GOOGLE_REDIRECT_URI=http://YOUR_VPS_IP/api/auth/google/callback

NOTION_CLIENT_ID=<YOUR_NOTION_CLIENT_ID>
NOTION_CLIENT_SECRET=<YOUR_NOTION_CLIENT_SECRET>
NOTION_REDIRECT_URI=http://YOUR_VPS_IP/api/auth/notion/callback

STRIPE_SECRET_KEY=<YOUR_STRIPE_SECRET_KEY>
STRIPE_WEBHOOK_SECRET=<YOUR_STRIPE_WEBHOOK_SECRET>
STRIPE_PREMIUM_PRICE_ID=<YOUR_PRICE_ID>

JWT_SECRET=<GENERATE_WITH_openssl_rand_-base64_32>
TOKEN_ENCRYPTION_KEY=<SAME_AS_SUPABASE_VAULT>
```

**Générer JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 2.3 Build le Backend

```bash
# Depuis /home/ubuntu/NotionClipper/backend
pnpm build

# Vérifier que dist/ est créé
ls -la dist/
```

### 2.4 Configurer le Site Vitrine

```bash
# Aller dans le dossier showcase-site
cd ../showcase-site

# Installer les dépendances
pnpm install

# Créer .env pour build
nano .env
```

**Variables à configurer (pour build):**
```env
VITE_API_URL=http://YOUR_VPS_IP/api
VITE_SUPABASE_URL=https://rijjtngbgahxdjflfyhi.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
VITE_STRIPE_PUBLISHABLE_KEY=<YOUR_STRIPE_PUBLISHABLE_KEY>
```

### 2.5 Build le Site Vitrine

```bash
# Depuis /home/ubuntu/NotionClipper/showcase-site
pnpm build

# Vérifier que dist/ est créé
ls -la dist/
```

---

## 🔧 Étape 3 : Démarrer les Services

### 3.1 Démarrer le Backend avec PM2

```bash
# Depuis /home/user/NotionClipper/backend
pm2 start ecosystem.config.js

# Vérifier le status
pm2 status

# Voir les logs
pm2 logs notion-clipper-backend
```

**Résultat attendu :**
```
┌─────┬────────────────────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name                       │ mode    │ ↺      │ status  │ cpu      │
├─────┼────────────────────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ notion-clipper-backend     │ cluster │ 0       │ online  │ 0%       │
│ 1   │ notion-clipper-backend     │ cluster │ 0       │ online  │ 0%       │
└─────┴────────────────────────────┴─────────┴─────────┴─────────┴──────────┘
```

### 3.2 Sauvegarder la configuration PM2

```bash
# Sauvegarder pour persistance après reboot
pm2 save

# Vérifier que PM2 démarre au boot
sudo systemctl status pm2-ubuntu
```

### 3.3 Tester le Backend

```bash
# Test health check
curl http://localhost:3001/health

# Résultat attendu :
# {"status":"ok","timestamp":"...","uptime":...}
```

---

## 🌐 Étape 4 : Configurer Nginx

### 4.1 Copier les fichiers de configuration

```bash
# Depuis /home/ubuntu/NotionClipper
sudo cp nginx/notionclipper.conf /etc/nginx/sites-available/notionclipper
sudo cp nginx/notionclipper-main.conf /etc/nginx/sites-available/notionclipper-main.conf
```

### 4.2 Modifier la configuration

```bash
# Éditer le fichier principal
sudo nano /etc/nginx/sites-available/notionclipper

# Remplacer YOUR_DOMAIN_OR_IP par votre IP
# Exemple : 123.456.789.012
```

**Changements à faire :**
```nginx
server_name YOUR_DOMAIN_OR_IP;  # Remplacer par votre IP
```

### 4.3 Activer le site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/notionclipper /etc/nginx/sites-enabled/

# Désactiver le site par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default
```

### 4.4 Tester la configuration

```bash
# Tester la syntaxe
sudo nginx -t

# Résultat attendu :
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4.5 Redémarrer Nginx

```bash
sudo systemctl restart nginx

# Vérifier le status
sudo systemctl status nginx
```

---

## 🔒 Étape 5 : Configuration Firewall

### 5.1 Configurer UFW

```bash
# Autoriser SSH (IMPORTANT : ne pas oublier !)
sudo ufw allow OpenSSH

# Autoriser HTTP et HTTPS
sudo ufw allow 'Nginx Full'

# Activer le firewall
sudo ufw enable

# Vérifier les règles
sudo ufw status
```

**Résultat attendu :**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

### 5.2 Configuration Firewall Oracle Cloud

**IMPORTANT:** Oracle Cloud a son propre firewall au niveau réseau.

1. Aller sur [cloud.oracle.com](https://cloud.oracle.com)
2. Compute → Instances → Votre instance
3. Virtual Cloud Network → Security Lists
4. Ajouter Ingress Rules :
   - **HTTP:** Port 80, Source 0.0.0.0/0
   - **HTTPS:** Port 443, Source 0.0.0.0/0

---

## ✅ Étape 6 : Vérification

### 6.1 Test Backend API

```bash
# Depuis votre machine locale
curl http://YOUR_VPS_IP/health

# Résultat attendu :
# OK
```

### 6.2 Test Site Vitrine

Ouvrir dans un navigateur :
```
http://YOUR_VPS_IP
```

Vous devriez voir le site vitrine React.

### 6.3 Test OAuth Callback

```bash
# Test redirect Google (doit retourner 404 car pas de code, mais pas 502)
curl -I http://YOUR_VPS_IP/api/auth/google/callback
```

---

## 🔐 Étape 7 : SSL/HTTPS avec Let's Encrypt

**À faire APRÈS avoir configuré un nom de domaine.**

### 7.1 Configurer un nom de domaine

1. Acheter un domaine (Namecheap, Cloudflare, etc.)
2. Créer un enregistrement A pointant vers votre VPS IP
3. Attendre propagation DNS (quelques minutes à 24h)

### 7.2 Installer Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.3 Obtenir un certificat SSL

```bash
# Remplacer par votre domaine
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Suivre les instructions interactives
# Choisir "2: Redirect" pour forcer HTTPS
```

### 7.4 Vérifier le renouvellement automatique

```bash
# Test dry-run
sudo certbot renew --dry-run

# Certbot configure automatiquement un cron job
```

### 7.5 Mettre à jour les OAuth Redirect URIs

Mettre à jour dans `.env` et chez les providers OAuth :
```env
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
NOTION_REDIRECT_URI=https://your-domain.com/api/auth/notion/callback
```

---

## 📊 Étape 8 : Monitoring & Logs

### 8.1 Logs Backend (PM2)

```bash
# Logs en temps réel
pm2 logs notion-clipper-backend

# Logs spécifiques
pm2 logs notion-clipper-backend --lines 100

# Logs d'erreur uniquement
pm2 logs notion-clipper-backend --err

# Fichiers de logs
cat /home/ubuntu/NotionClipper/backend/logs/backend.log
cat /home/ubuntu/NotionClipper/backend/logs/backend-error.log
```

### 8.2 Logs Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/notionclipper-access.log

# Error logs
sudo tail -f /var/log/nginx/notionclipper-error.log

# Tous les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### 8.3 Monitoring PM2

```bash
# Dashboard en temps réel
pm2 monit

# Statistiques
pm2 status
```

### 8.4 Ressources système

```bash
# Utilisation CPU/RAM
htop

# Espace disque
df -h

# Processus Node.js
ps aux | grep node
```

---

## 🔄 Étape 9 : Mises à Jour

### 9.1 Mettre à jour le code

```bash
# Se connecter au VPS
ssh ubuntu@YOUR_VPS_IP

# Aller dans le projet
cd /home/ubuntu/NotionClipper

# Pull les derniers changements
git pull origin main  # Ou votre branche

# Backend
cd backend
pnpm install
pnpm build
pm2 restart notion-clipper-backend

# Site vitrine
cd ../showcase-site
pnpm install
pnpm build
# Nginx sert automatiquement le nouveau build
```

### 9.2 Rollback en cas de problème

```bash
# Voir les derniers commits
git log --oneline -5

# Revenir à un commit précédent
git checkout <commit-hash>

# Rebuild
cd backend && pnpm build && pm2 restart notion-clipper-backend
cd ../showcase-site && pnpm build
```

---

## 🛠️ Dépannage

### Backend ne démarre pas

```bash
# Voir les logs PM2
pm2 logs notion-clipper-backend --lines 50

# Vérifier .env
cat /home/ubuntu/NotionClipper/backend/.env

# Tester manuellement
cd /home/ubuntu/NotionClipper/backend
node dist/server.js
```

### Nginx retourne 502 Bad Gateway

**Cause:** Backend non démarré

```bash
# Vérifier PM2
pm2 status

# Redémarrer
pm2 restart notion-clipper-backend

# Vérifier que le port 3001 est utilisé
netstat -tlnp | grep 3001
```

### Site vitrine ne charge pas

```bash
# Vérifier que les fichiers existent
ls -la /home/ubuntu/NotionClipper/showcase-site/dist

# Vérifier permissions
sudo chown -R www-data:www-data /home/ubuntu/NotionClipper/showcase-site/dist

# Tester Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### OAuth callbacks ne fonctionnent pas

1. Vérifier les Redirect URIs dans `.env`
2. Vérifier qu'elles correspondent aux providers OAuth
3. Vérifier les logs backend :
   ```bash
   pm2 logs notion-clipper-backend | grep auth
   ```

---

## 🎯 Checklist Finale

- [ ] VPS accessible via SSH
- [ ] Node.js 20 installé
- [ ] PM2 backend démarré (2 instances)
- [ ] Nginx configuré et démarré
- [ ] Firewall UFW configuré
- [ ] Firewall Oracle Cloud configuré
- [ ] Backend répond sur `/health`
- [ ] Site vitrine accessible sur `/`
- [ ] OAuth callbacks configurés
- [ ] Logs accessibles et sans erreurs
- [ ] PM2 configuré pour auto-start
- [ ] (Optionnel) SSL/HTTPS avec Let's Encrypt

---

## 📚 Ressources

- **Nginx:** https://nginx.org/en/docs/
- **PM2:** https://pm2.keymetrics.io/docs/
- **Let's Encrypt:** https://letsencrypt.org/
- **Oracle Cloud:** https://docs.oracle.com/en-us/iaas/

---

**Dernière mise à jour:** 2025-11-16
**Version:** 1.0.0
