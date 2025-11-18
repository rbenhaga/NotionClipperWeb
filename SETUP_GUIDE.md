# 🚀 SETUP GUIDE - Déploiement VPS Oracle

> **Guide complet de déploiement production**
> VPS Oracle Cloud Free Tier • Ubuntu 22.04 • Caddy • PM2

---

## 🎯 Vue d'Ensemble

**Infrastructure** :
- **VPS** : Oracle Cloud Free Tier (4 vCPU, 24GB RAM, 200GB storage)
- **OS** : Ubuntu 22.04 LTS
- **Runtime** : Node.js 20 LTS
- **Process Manager** : PM2 (cluster mode)
- **Reverse Proxy** : Caddy (SSL auto Let's Encrypt)
- **Database** : Supabase PostgreSQL (cloud)

**URLs finales** :
- Frontend : `https://notionclipper.com`
- Backend API : `https://api.notionclipper.com`

---

## ✅ PHASE 1 : Provisionner VPS Oracle Cloud (30 min)

### 1.1 Créer un compte Oracle Cloud

1. Aller sur : https://oracle.com/cloud/free
2. S'inscrire (carte bancaire requise mais **0€ facturé**)
3. Vérifier l'email

### 1.2 Créer une instance VM

1. **Compute** → **Instances** → **Create Instance**

2. **Configuration** :
   - **Name** : `notionclipper-prod`
   - **Compartment** : root (default)
   - **Availability Domain** : Any
   - **Shape** : Ampere (ARM) **VM.Standard.A1.Flex**
     - **OCPUs** : 4 (max free tier)
     - **Memory (GB)** : 24 (max free tier)
   - **Image** : Ubuntu 22.04 LTS (Canonical)
   - **Boot Volume** : 200 GB (max free tier)

3. **Networking** :
   - **VCN** : Create new VCN
   - **Subnet** : Create new subnet (public)
   - **Assign public IPv4** : ✅ YES

4. **SSH Keys** :
   - Générer une paire de clés SSH :
     ```bash
     ssh-keygen -t rsa -b 4096 -f ~/.ssh/oracle_cloud_rsa
     ```
   - Copier la clé publique :
     ```bash
     cat ~/.ssh/oracle_cloud_rsa.pub
     ```
   - Coller dans le champ "Add SSH keys"

5. **Create Instance** → Attendre 2-3 min

6. **Noter l'IP publique** : `xxx.xxx.xxx.xxx`

### 1.3 Configurer le Firewall (Oracle Cloud)

1. **Networking** → **Virtual Cloud Networks** → VCN créé → **Security Lists** → **Default Security List**

2. **Add Ingress Rules** :

| Stateless | Source CIDR | IP Protocol | Source Port | Destination Port | Description |
|-----------|-------------|-------------|-------------|------------------|-------------|
| No | 0.0.0.0/0 | TCP | All | 22 | SSH |
| No | 0.0.0.0/0 | TCP | All | 80 | HTTP |
| No | 0.0.0.0/0 | TCP | All | 443 | HTTPS |

3. **Save**

### 1.4 Se connecter au VPS

```bash
ssh -i ~/.ssh/oracle_cloud_rsa ubuntu@xxx.xxx.xxx.xxx
```

**Si erreur "Permission denied"** :
```bash
chmod 600 ~/.ssh/oracle_cloud_rsa
```

---

## ✅ PHASE 2 : Setup Serveur Ubuntu (1h)

### 2.1 Mise à jour système

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Configurer le firewall Ubuntu (UFW)

```bash
# Installer UFW
sudo apt install ufw -y

# Autoriser SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer UFW
sudo ufw enable

# Vérifier status
sudo ufw status
```

**Output attendu** :
```
Status: active
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

### 2.3 Installer Node.js 20 LTS

```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Recharger bashrc
source ~/.bashrc

# Installer Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Vérifier
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 2.4 Installer pnpm

```bash
npm install -g pnpm

# Vérifier
pnpm -v  # 8.x.x
```

### 2.5 Installer PM2

```bash
npm install -g pm2

# Setup PM2 startup (auto-restart au boot)
pm2 startup
# Copier et exécuter la commande affichée (sudo env PATH=...)

# Vérifier
pm2 -v  # 5.x.x
```

### 2.6 Installer Git

```bash
sudo apt install git -y

# Configurer Git
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### 2.7 Installer Caddy

```bash
# Installer Caddy (reverse proxy + SSL auto)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y

# Vérifier
caddy version  # v2.x.x
```

---

## ✅ PHASE 3 : Déployer le Backend (1h)

### 3.1 Cloner le repo

```bash
cd /home/ubuntu
git clone https://github.com/rbenhaga/NotionClipperWeb.git
cd NotionClipperWeb
```

### 3.2 Configurer les variables d'environnement

```bash
cd backend
cp .env.example .env
nano .env
```

**Remplir avec vos credentials** :
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Frontend
FRONTEND_URL=https://notionclipper.com

# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ⚠️ SERVICE_ROLE_KEY

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.notionclipper.com/api/auth/google/callback

# Notion OAuth
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...
NOTION_REDIRECT_URI=https://api.notionclipper.com/api/auth/notion/callback

# Stripe
STRIPE_SECRET_KEY=sk_live_...  # ⚠️ Mode LIVE pour production
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID_MONTHLY=price_...
STRIPE_PREMIUM_PRICE_ID_ANNUAL=price_...

# JWT
JWT_SECRET=$(openssl rand -base64 32)  # Générer une nouvelle clé

# Token Encryption
TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32)  # Générer une nouvelle clé
```

**Générer les clés sécurisées** :
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env
```

### 3.3 Installer les dépendances et build

```bash
pnpm install --prod
pnpm build
```

### 3.4 Lancer avec PM2 (cluster mode)

```bash
# Lancer backend avec PM2
pm2 start ecosystem.config.js --env production

# Vérifier
pm2 list
pm2 logs

# Sauvegarder la config PM2
pm2 save
```

**Vérifier que le backend écoute** :
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","service":"notion-clipper-backend"}
```

---

## ✅ PHASE 4 : Déployer le Frontend (30 min)

### 4.1 Configurer les variables d'environnement

```bash
cd /home/ubuntu/NotionClipperWeb/showcase-site
cp .env.example .env
nano .env
```

**Remplir** :
```env
VITE_API_URL=https://api.notionclipper.com/api
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...  # ⚠️ ANON KEY (pas service role!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # ⚠️ Mode LIVE
```

### 4.2 Build le frontend

```bash
pnpm install
pnpm build
```

**Fichiers buildés dans** : `dist/`

### 4.3 Déplacer les fichiers vers /var/www

```bash
sudo mkdir -p /var/www/notionclipper
sudo cp -r dist/* /var/www/notionclipper/
sudo chown -R www-data:www-data /var/www/notionclipper
```

---

## ✅ PHASE 5 : Configurer Caddy (Reverse Proxy + SSL) (30 min)

### 5.1 Configurer DNS (avant de continuer)

**Chez votre registrar (Namecheap, GoDaddy, Cloudflare, etc.)** :

1. **Ajouter un record A** :
   - **Host** : `@` (ou vide)
   - **Value** : `xxx.xxx.xxx.xxx` (IP publique VPS)
   - **TTL** : 300

2. **Ajouter un record A pour le sous-domaine API** :
   - **Host** : `api`
   - **Value** : `xxx.xxx.xxx.xxx` (même IP)
   - **TTL** : 300

3. **Attendre la propagation** (5-10 min) :
   ```bash
   dig notionclipper.com
   dig api.notionclipper.com
   ```

### 5.2 Créer le Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

**Contenu** :
```caddyfile
# Frontend : notionclipper.com
notionclipper.com {
  # Serve static files from /var/www/notionclipper
  root * /var/www/notionclipper
  file_server

  # SPA routing (React Router)
  try_files {path} /index.html

  # Security headers
  header {
    X-Frame-Options "SAMEORIGIN"
    X-Content-Type-Options "nosniff"
    X-XSS-Protection "1; mode=block"
    Referrer-Policy "strict-origin-when-cross-origin"
  }

  # Gzip compression
  encode gzip

  # Logs
  log {
    output file /var/log/caddy/notionclipper.log
  }
}

# Backend API : api.notionclipper.com
api.notionclipper.com {
  # Reverse proxy to Node.js backend
  reverse_proxy localhost:3001 {
    # Health check
    health_uri /health
    health_interval 30s
    health_timeout 5s
  }

  # CORS headers (si nécessaire, sinon géré par Express)
  header {
    Access-Control-Allow-Origin "https://notionclipper.com"
    Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers "Authorization, Content-Type"
  }

  # Logs
  log {
    output file /var/log/caddy/api.log
  }
}
```

### 5.3 Tester et relancer Caddy

```bash
# Tester la config
sudo caddy validate --config /etc/caddy/Caddyfile

# Relancer Caddy
sudo systemctl restart caddy

# Vérifier status
sudo systemctl status caddy

# Vérifier logs
sudo journalctl -u caddy --no-pager | tail -50
```

**Caddy va automatiquement** :
1. Obtenir un certificat SSL Let's Encrypt
2. Configurer HTTPS automatiquement
3. Rediriger HTTP → HTTPS

**Logs SSL** :
```bash
sudo tail -f /var/log/caddy/notionclipper.log
```

---

## ✅ PHASE 6 : Tester en Production (15 min)

### 6.1 Tester Frontend

```bash
curl https://notionclipper.com
# Expected: HTML de la page d'accueil
```

**Dans le navigateur** :
1. Ouvrir : https://notionclipper.com
2. Vérifier SSL (cadenas vert)
3. Tester navigation (Home → Pricing)

### 6.2 Tester Backend API

```bash
curl https://api.notionclipper.com/health
# Expected: {"status":"ok","timestamp":"...","service":"notion-clipper-backend"}
```

### 6.3 Tester OAuth Flow

1. Cliquer "Login with Google" sur le site
2. Vérifier redirection vers Google
3. Après login, vérifier redirection vers `/auth/success?token=...`
4. Vérifier que le Dashboard se charge

### 6.4 Tester Stripe Checkout

1. Aller sur `/pricing`
2. Cliquer "Upgrade to Premium"
3. Vérifier redirection vers Stripe Checkout
4. Tester avec carte test Stripe : `4242 4242 4242 4242`

---

## ✅ PHASE 7 : Monitoring & Logs (30 min)

### 7.1 Logs Backend (PM2)

```bash
# Logs en temps réel
pm2 logs

# Logs d'un process spécifique
pm2 logs notion-clipper-backend

# Vider les logs
pm2 flush
```

### 7.2 Logs Caddy

```bash
# Frontend logs
sudo tail -f /var/log/caddy/notionclipper.log

# API logs
sudo tail -f /var/log/caddy/api.log

# Logs système Caddy
sudo journalctl -u caddy -f
```

### 7.3 Monitoring PM2

```bash
# Interface monitoring
pm2 monit

# Status détaillé
pm2 info notion-clipper-backend
```

### 7.4 Redémarrage automatique

```bash
# Redémarrer après crash
pm2 restart notion-clipper-backend

# Redémarrer si > 500MB RAM
pm2 start ecosystem.config.js --max-memory-restart 500M
```

---

## ✅ PHASE 8 : Sécurité Production (1h)

### 8.1 Firewall strict

```bash
# Bloquer tout sauf SSH, HTTP, HTTPS
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 8.2 Désactiver root SSH

```bash
sudo nano /etc/ssh/sshd_config
```

**Modifier** :
```
PermitRootLogin no
PasswordAuthentication no  # Force SSH key only
```

**Relancer SSH** :
```bash
sudo systemctl restart sshd
```

### 8.3 Fail2ban (protection brute-force SSH)

```bash
# Installer
sudo apt install fail2ban -y

# Configurer
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

**Activer SSH jail** :
```ini
[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600  # 1 heure
```

**Démarrer** :
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status
```

### 8.4 Rotation des logs

```bash
# Configurer logrotate pour PM2
sudo nano /etc/logrotate.d/pm2
```

**Contenu** :
```
/home/ubuntu/.pm2/logs/*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
}
```

---

## 📊 Checklist Production

Avant de lancer :

- [ ] DNS configuré (A records pour `@` et `api`)
- [ ] SSL actif (Let's Encrypt via Caddy)
- [ ] Backend écoute sur port 3001
- [ ] Frontend build déployé dans `/var/www`
- [ ] PM2 configured avec `pm2 startup` + `pm2 save`
- [ ] Firewall UFW actif (22, 80, 443 uniquement)
- [ ] Supabase migrations appliquées
- [ ] Stripe webhooks configurés avec URL production
- [ ] Google/Notion OAuth redirect URIs mis à jour
- [ ] Variables d'environnement production (LIVE keys)
- [ ] Logs monitoring configurés
- [ ] Fail2ban actif
- [ ] Health check backend fonctionnel (`/health`)

---

## 🐛 Troubleshooting

### Problème : Caddy ne démarre pas

```bash
# Vérifier erreurs
sudo journalctl -u caddy -n 50

# Vérifier config
sudo caddy validate --config /etc/caddy/Caddyfile

# Vérifier ports
sudo netstat -tulpn | grep -E ':(80|443)'
```

### Problème : SSL ne fonctionne pas

```bash
# Vérifier que le DNS pointe bien vers le VPS
dig notionclipper.com

# Vérifier logs Caddy
sudo journalctl -u caddy | grep -i certificate

# Forcer renouvellement SSL
sudo caddy reload --config /etc/caddy/Caddyfile
```

### Problème : Backend ne répond pas

```bash
# Vérifier PM2
pm2 list
pm2 logs notion-clipper-backend

# Vérifier port 3001
curl http://localhost:3001/health

# Relancer
pm2 restart notion-clipper-backend
```

### Problème : 502 Bad Gateway

```bash
# Backend down → Vérifier PM2
pm2 list

# Caddy ne peut pas atteindre le backend
sudo journalctl -u caddy -f

# Vérifier que le backend écoute
ss -tulpn | grep 3001
```

---

## 🔄 Mise à Jour Production

### Déployer une nouvelle version

```bash
cd /home/ubuntu/NotionClipperWeb

# Pull latest code
git pull origin main

# Backend update
cd backend
pnpm install --prod
pnpm build
pm2 restart notion-clipper-backend

# Frontend update
cd ../showcase-site
pnpm install
pnpm build
sudo rm -rf /var/www/notionclipper/*
sudo cp -r dist/* /var/www/notionclipper/
sudo chown -R www-data:www-data /var/www/notionclipper
```

---

**Made with ❤️ by NotionClipper Team**
*Production-Ready • Scalable • Secure*
