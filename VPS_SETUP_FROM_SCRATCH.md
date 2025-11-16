# 🚀 VPS Setup Guide - FROM SCRATCH (Oracle Cloud)

Guide **COMPLET** pour déployer Notion Clipper sur un VPS Oracle Cloud **VIERGE** (Ubuntu 22.04 fresh install).

**AUCUNE connaissance préalable requise. Suivez pas-à-pas.**

---

## 📋 Prérequis

- ✅ Un VPS Oracle Cloud (Free Tier: 4 vCPU, 24GB RAM)
- ✅ Ubuntu 22.04 LTS installé
- ✅ Votre adresse IP publique (exemple: `123.456.789.012`)
- ✅ Accès SSH (clé SSH configurée dans Oracle Cloud)

---

## 🔐 ÉTAPE 1 : Premier accès au VPS

### 1.1 Se connecter en SSH

```bash
# Depuis votre machine locale (Mac/Linux/Windows WSL)
ssh ubuntu@YOUR_VPS_IP

# Si vous avez une clé SSH spécifique:
ssh -i ~/.ssh/oracle_cloud_key ubuntu@YOUR_VPS_IP

# Accepter la clé SSH la première fois (tapez "yes")
```

**Vous devriez voir :**
```
Welcome to Ubuntu 22.04.x LTS
ubuntu@instance-xxx:~$
```

✅ **Vous êtes connecté !**

---

## 📦 ÉTAPE 2 : Mettre à jour le système

```bash
# Mettre à jour la liste des packages
sudo apt update

# Installer les mises à jour
sudo apt upgrade -y

# Installer les outils de base
sudo apt install -y curl wget git build-essential ca-certificates gnupg lsb-release
```

**Temps estimé :** 5-10 minutes

---

## 🟢 ÉTAPE 3 : Installer Node.js 20 LTS

```bash
# Ajouter le repository NodeSource pour Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installer Node.js
sudo apt install -y nodejs

# Vérifier l'installation
node --version   # Doit afficher: v20.x.x
npm --version    # Doit afficher: 10.x.x
```

✅ **Node.js installé !**

---

## 📦 ÉTAPE 4 : Installer pnpm (gestionnaire de packages)

```bash
# Installer pnpm globalement
npm install -g pnpm

# Vérifier
pnpm --version   # Doit afficher: 8.x.x
```

✅ **pnpm installé !**

---

## ⚙️ ÉTAPE 5 : Installer PM2 (process manager)

```bash
# Installer PM2 globalement
npm install -g pm2

# Vérifier
pm2 --version

# Configurer PM2 pour démarrer au boot du serveur
pm2 startup

# IMPORTANT: Copier et exécuter la commande affichée (commence par "sudo env PATH=...")
# Exemple:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

✅ **PM2 installé et configuré pour auto-start !**

---

## 🌐 ÉTAPE 6 : Installer Nginx (serveur web)

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx

# Activer Nginx au démarrage
sudo systemctl enable nginx

# Vérifier le status
sudo systemctl status nginx
# Appuyez sur "q" pour quitter
```

**Tester Nginx:**

Ouvrez votre navigateur et allez sur `http://YOUR_VPS_IP`

Vous devriez voir la page "Welcome to nginx!"

✅ **Nginx fonctionne !**

---

## 🔥 ÉTAPE 7 : Configurer le Firewall

### 7.1 Firewall Ubuntu (UFW)

```bash
# Autoriser SSH (TRÈS IMPORTANT, sinon vous perdez l'accès!)
sudo ufw allow OpenSSH

# Autoriser HTTP (port 80)
sudo ufw allow 'Nginx Full'

# Activer le firewall
sudo ufw enable
# Tapez "y" pour confirmer

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

### 7.2 Firewall Oracle Cloud (OBLIGATOIRE!)

**Via l'interface web Oracle Cloud :**

1. Aller sur https://cloud.oracle.com
2. Se connecter à votre compte
3. Menu **Compute** → **Instances**
4. Cliquer sur votre instance
5. Onglet **Virtual Cloud Network** → Cliquer sur le subnet
6. Cliquer sur **Default Security List**
7. Cliquer sur **Add Ingress Rules**

**Ajouter ces 2 règles :**

**Règle 1 - HTTP:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `80`
- Description: `HTTP`

**Règle 2 - HTTPS:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `443`
- Description: `HTTPS`

✅ **Firewall configuré !**

---

## 📂 ÉTAPE 8 : Cloner le projet

```bash
# Aller dans le home directory
cd /home/ubuntu

# Cloner le repository GitHub
git clone https://github.com/rbenhaga/NotionClipper.git

# Entrer dans le dossier
cd NotionClipper

# Vérifier les fichiers
ls -la
# Vous devriez voir: backend/, showcase-site/, nginx/, etc.
```

✅ **Projet cloné !**

---

## ⚙️ ÉTAPE 9 : Configurer le Backend

### 9.1 Installer les dépendances

```bash
# Aller dans le dossier backend
cd /home/ubuntu/NotionClipper/backend

# Installer les dépendances
pnpm install
# Cela peut prendre 2-3 minutes
```

### 9.2 Créer le fichier .env

```bash
# Copier l'exemple
cp .env.example .env

# Éditer avec nano
nano .env
```

**Dans l'éditeur nano, remplir TOUTES les valeurs :**

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Remplacer YOUR_VPS_IP par votre vraie IP
ALLOWED_ORIGINS=http://YOUR_VPS_IP,http://localhost:3000

SUPABASE_URL=https://rijjtngbgahxdjflfyhi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=VOTRE_SERVICE_ROLE_KEY_ICI

GOOGLE_CLIENT_ID=VOTRE_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=VOTRE_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://YOUR_VPS_IP/api/auth/google/callback

NOTION_CLIENT_ID=VOTRE_NOTION_CLIENT_ID
NOTION_CLIENT_SECRET=VOTRE_NOTION_CLIENT_SECRET
NOTION_REDIRECT_URI=http://YOUR_VPS_IP/api/auth/notion/callback

STRIPE_SECRET_KEY=VOTRE_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=VOTRE_STRIPE_WEBHOOK_SECRET
STRIPE_PREMIUM_PRICE_ID=VOTRE_PRICE_ID

# Générer un secret aléatoire (voir ci-dessous)
JWT_SECRET=GENERER_UN_SECRET_ICI

TOKEN_ENCRYPTION_KEY=VOTRE_ENCRYPTION_KEY
```

**Pour générer JWT_SECRET :**

Ouvrir un nouveau terminal local et exécuter :
```bash
openssl rand -base64 32
```

Copier le résultat dans `.env` à la place de `GENERER_UN_SECRET_ICI`

**Sauvegarder et quitter nano :**
- Appuyez sur `Ctrl + X`
- Tapez `Y` pour confirmer
- Appuyez sur `Enter`

### 9.3 Build le backend

```bash
# Toujours dans /home/ubuntu/NotionClipper/backend
pnpm build

# Vérifier que dist/ a été créé
ls -la dist/
# Vous devriez voir: server.js et autres fichiers .js
```

✅ **Backend configuré et buildé !**

---

## 🎨 ÉTAPE 10 : Configurer le Site Vitrine

### 10.1 Installer les dépendances

```bash
# Aller dans le dossier showcase-site
cd /home/ubuntu/NotionClipper/showcase-site

# Installer les dépendances
pnpm install
```

### 10.2 Créer le fichier .env

```bash
# Copier l'exemple
cp .env.example .env

# Éditer
nano .env
```

**Remplir:**
```env
VITE_API_URL=http://YOUR_VPS_IP/api

VITE_SUPABASE_URL=https://rijjtngbgahxdjflfyhi.supabase.co
VITE_SUPABASE_ANON_KEY=VOTRE_ANON_KEY

VITE_STRIPE_PUBLISHABLE_KEY=VOTRE_PUBLISHABLE_KEY
```

Sauvegarder (`Ctrl+X`, `Y`, `Enter`)

### 10.3 Build le site

```bash
# Build pour production
pnpm build

# Vérifier que dist/ a été créé
ls -la dist/
# Vous devriez voir: index.html, assets/, etc.
```

✅ **Site vitrine buildé !**

---

## 🚀 ÉTAPE 11 : Démarrer le Backend avec PM2

```bash
# Aller dans le dossier backend
cd /home/ubuntu/NotionClipper/backend

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Vérifier le status
pm2 status
```

**Résultat attendu :**
```
┌─────┬────────────────────────┬─────────┬─────────┬─────────┐
│ id  │ name                   │ mode    │ ↺      │ status  │
├─────┼────────────────────────┼─────────┼─────────┼─────────┤
│ 0   │ notion-clipper-backend │ cluster │ 0       │ online  │
│ 1   │ notion-clipper-backend │ cluster │ 0       │ online  │
└─────┴────────────────────────┴─────────┴─────────┴─────────┘
```

### Voir les logs en direct

```bash
pm2 logs notion-clipper-backend

# Pour arrêter les logs: Ctrl+C
```

### Sauvegarder la config PM2

```bash
pm2 save
```

✅ **Backend démarré sur port 3001 !**

### Tester le backend

```bash
curl http://localhost:3001/health
```

**Résultat attendu:**
```json
{"status":"ok","timestamp":"...","uptime":...}
```

---

## 🌐 ÉTAPE 12 : Configurer Nginx

### 12.1 Copier les fichiers de configuration

```bash
# Copier la config principale
sudo cp /home/ubuntu/NotionClipper/nginx/notionclipper.conf /etc/nginx/sites-available/notionclipper

# Copier la config partagée
sudo cp /home/ubuntu/NotionClipper/nginx/notionclipper-main.conf /etc/nginx/sites-available/notionclipper-main.conf
```

### 12.2 Modifier la config avec votre IP

```bash
# Éditer le fichier
sudo nano /etc/nginx/sites-available/notionclipper
```

**Remplacer `YOUR_DOMAIN_OR_IP` par votre IP réelle**

Exemple: si votre IP est `123.456.789.012`, remplacer :
```nginx
server_name YOUR_DOMAIN_OR_IP;
```
par:
```nginx
server_name 123.456.789.012;
```

Sauvegarder (`Ctrl+X`, `Y`, `Enter`)

### 12.3 Activer le site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/notionclipper /etc/nginx/sites-enabled/

# Supprimer le site par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t
```

**Résultat attendu:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 12.4 Redémarrer Nginx

```bash
sudo systemctl restart nginx

# Vérifier le status
sudo systemctl status nginx
# Appuyez sur "q" pour quitter
```

✅ **Nginx configuré !**

---

## ✅ ÉTAPE 13 : VÉRIFICATION FINALE

### 13.1 Tester le backend

Depuis votre navigateur: `http://YOUR_VPS_IP/api/health`

**Résultat attendu:** Page avec JSON `{"status":"ok",...}`

### 13.2 Tester le site vitrine

Depuis votre navigateur: `http://YOUR_VPS_IP`

**Résultat attendu:** Site vitrine Notion Clipper avec design Apple/Notion

### 13.3 Vérifier les logs

```bash
# Logs backend (PM2)
pm2 logs notion-clipper-backend --lines 20

# Logs Nginx
sudo tail -20 /var/log/nginx/notionclipper-access.log
sudo tail -20 /var/log/nginx/notionclipper-error.log
```

---

## 🎉 FÉLICITATIONS !

Votre stack est **COMPLÈTE** et **OPÉRATIONNELLE** :

- ✅ Node.js 20 installé
- ✅ pnpm installé
- ✅ PM2 installé et configuré
- ✅ Nginx installé et configuré
- ✅ Firewall configuré (UFW + Oracle Cloud)
- ✅ Backend Node.js/Express en production (PM2 cluster, 2 instances)
- ✅ Site vitrine React déployé
- ✅ Routes API fonctionnelles
- ✅ OAuth callbacks configurés

---

## 🔄 COMMANDES UTILES

### PM2
```bash
# Status
pm2 status

# Logs
pm2 logs notion-clipper-backend

# Restart
pm2 restart notion-clipper-backend

# Stop
pm2 stop notion-clipper-backend

# Delete
pm2 delete notion-clipper-backend
```

### Nginx
```bash
# Tester config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/notionclipper-access.log
sudo tail -f /var/log/nginx/notionclipper-error.log
```

### Système
```bash
# Utilisation CPU/RAM
htop

# Espace disque
df -h

# Processus Node.js
ps aux | grep node
```

---

## 🐛 DÉPANNAGE

### Backend ne démarre pas

```bash
# Voir les logs
pm2 logs notion-clipper-backend --lines 50

# Vérifier .env
cat /home/ubuntu/NotionClipper/backend/.env

# Tester manuellement
cd /home/ubuntu/NotionClipper/backend
node dist/server.js
```

### Nginx retourne 502

**Cause:** Backend non démarré

```bash
# Redémarrer backend
pm2 restart notion-clipper-backend

# Vérifier qu'il écoute sur port 3001
netstat -tlnp | grep 3001
```

### Site vitrine ne charge pas

```bash
# Vérifier que les fichiers existent
ls -la /home/ubuntu/NotionClipper/showcase-site/dist

# Vérifier permissions
sudo chown -R www-data:www-data /home/ubuntu/NotionClipper/showcase-site/dist

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 🔐 SÉCURITÉ (IMPORTANT)

### À faire IMMÉDIATEMENT en production:

1. **Configurer un domaine + SSL/HTTPS** (Let's Encrypt)
2. **Changer les ports SSH** (pas 22)
3. **Désactiver root login**
4. **Installer Fail2ban**
5. **Configurer les backups automatiques**

Voir `CHANGELOG.md` section Sécurité pour les détails.

---

**Dernière mise à jour:** 2025-11-16
**Temps total estimé:** 30-45 minutes
