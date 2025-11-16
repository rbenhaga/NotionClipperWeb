# Caddy Configuration - Notion Clipper

Configuration Caddy (alternative moderne à Nginx) pour le déploiement VPS.

## 🚀 Pourquoi Caddy ?

✅ **HTTPS automatique** - Let's Encrypt configuré en 0 ligne
✅ **Configuration ultra-simple** - 80% moins de lignes vs Nginx
✅ **HTTP/3 natif** - QUIC protocol (plus rapide)
✅ **Reload sans downtime** - `caddy reload` instant
✅ **Binaire unique** - Aucune dépendance
✅ **Modern** - Développé en 2015, vs Nginx (2004)

## 📦 Installation

### Ubuntu/Debian

```bash
# Installer les dépendances
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https

# Ajouter le repository Caddy
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# Installer Caddy
sudo apt update
sudo apt install caddy

# Vérifier
caddy version
```

## 🔧 Configuration

### 1. Copier le Caddyfile

```bash
# Copier la configuration
sudo cp Caddyfile /etc/caddy/Caddyfile

# Éditer avec votre IP/domaine
sudo nano /etc/caddy/Caddyfile

# Remplacer YOUR_VPS_IP par votre vraie IP
# Exemple: 123.456.789.012
```

### 2. Ajuster les chemins

Dans le Caddyfile, modifier:
```caddyfile
root * /home/ubuntu/NotionClipperWeb/showcase-site/dist
```

Par le chemin réel de votre projet.

### 3. Créer le dossier de logs

```bash
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy
```

### 4. Tester la configuration

```bash
# Valider le Caddyfile
caddy validate --config /etc/caddy/Caddyfile

# Résultat attendu: "Valid configuration"
```

### 5. Démarrer Caddy

```bash
# Démarrer le service
sudo systemctl start caddy

# Activer au démarrage
sudo systemctl enable caddy

# Vérifier le status
sudo systemctl status caddy
```

## ✅ Vérification

### Tester l'accès

```bash
# Backend API
curl http://YOUR_VPS_IP/health

# Site vitrine
curl http://YOUR_VPS_IP
```

Dans le navigateur: `http://YOUR_VPS_IP`

## 🔐 HTTPS Automatique (avec domaine)

**Pré-requis:** Avoir un nom de domaine pointant vers votre VPS

### 1. Modifier le Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

Remplacer:
```caddyfile
YOUR_VPS_IP {
```

Par:
```caddyfile
yourdomain.com {
```

### 2. Reload Caddy

```bash
sudo caddy reload --config /etc/caddy/Caddyfile
```

**C'EST TOUT !** Caddy configure automatiquement Let's Encrypt.

Quelques secondes après, visitez: `https://yourdomain.com` ✅

## 🔄 Commandes Utiles

### Reload sans downtime

```bash
# Recharger la configuration (0 downtime)
sudo caddy reload --config /etc/caddy/Caddyfile
```

### Logs

```bash
# Logs en temps réel
sudo journalctl -u caddy -f

# Logs d'accès (JSON)
sudo tail -f /var/log/caddy/notionclipper-access.log | jq

# Dernières erreurs
sudo journalctl -u caddy -n 50 --no-pager
```

### Status

```bash
# Status du service
sudo systemctl status caddy

# Redémarrer
sudo systemctl restart caddy

# Arrêter
sudo systemctl stop caddy
```

### Firewall

```bash
# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ou simplement
sudo ufw allow 'Caddy Full'
```

## 📊 Comparaison Nginx vs Caddy

| Feature | Nginx | Caddy |
|---------|-------|-------|
| **HTTPS auto** | ❌ (certbot requis) | ✅ Automatique |
| **Config lines** | ~50 lignes | ~20 lignes |
| **HTTP/3** | ⚠️ Module externe | ✅ Natif |
| **Reload** | `systemctl restart` (downtime) | `caddy reload` (0 downtime) |
| **Reverse proxy** | 10+ lignes | 1 ligne |
| **Learning curve** | Moyenne | Facile |
| **Performance** | Excellent | Excellent |
| **Ecosystem** | Énorme | Croissant |

## 🐛 Dépannage

### Erreur "bind: address already in use"

**Cause:** Nginx ou autre service utilise déjà le port 80/443

```bash
# Arrêter Nginx si installé
sudo systemctl stop nginx
sudo systemctl disable nginx

# Vérifier quel process utilise le port 80
sudo lsof -i :80

# Redémarrer Caddy
sudo systemctl restart caddy
```

### Site ne charge pas

```bash
# Vérifier que Caddy tourne
sudo systemctl status caddy

# Vérifier les logs
sudo journalctl -u caddy -n 50

# Vérifier que les fichiers existent
ls -la /home/ubuntu/NotionClipperWeb/showcase-site/dist

# Vérifier les permissions
sudo chown -R caddy:caddy /home/ubuntu/NotionClipperWeb/showcase-site/dist
```

### Backend API 502

**Cause:** Backend non démarré

```bash
# Vérifier PM2
pm2 status

# Redémarrer backend
pm2 restart notion-clipper-backend

# Vérifier qu'il écoute sur port 3001
netstat -tlnp | grep 3001
```

### Let's Encrypt échoue

**Causes possibles:**
- Domaine ne pointe pas vers le VPS (vérifier avec `dig yourdomain.com`)
- Firewall bloque le port 80/443
- Autre service utilise déjà le port

```bash
# Vérifier les logs
sudo journalctl -u caddy -n 100 | grep -i "acme"

# Tester manuellement
caddy validate --config /etc/caddy/Caddyfile
```

## 🔧 Configuration Avancée

### Rate Limiting

Installer le module:
```bash
xcaddy build --with github.com/mholt/caddy-ratelimit
```

Puis ajouter dans Caddyfile:
```caddyfile
rate_limit {
    zone api {
        key {remote_host}
        events 100
        window 1m
    }
}
```

### Compression Brotli

Activer dans le Caddyfile:
```caddyfile
encode {
    gzip 6
    zstd
    br 11
}
```

### Custom Headers

```caddyfile
header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Content-Security-Policy "default-src 'self'"
}
```

## 📚 Ressources

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Caddyfile Syntax](https://caddyserver.com/docs/caddyfile)
- [Automatic HTTPS](https://caddyserver.com/docs/automatic-https)
- [Migration from Nginx](https://caddyserver.com/docs/wiki/nginx-to-caddy)

## 🎯 Migration Nginx → Caddy

Si vous avez déjà Nginx installé:

```bash
# 1. Arrêter Nginx
sudo systemctl stop nginx
sudo systemctl disable nginx

# 2. Installer Caddy (voir Installation ci-dessus)

# 3. Copier Caddyfile
sudo cp Caddyfile /etc/caddy/Caddyfile

# 4. Démarrer Caddy
sudo systemctl start caddy
sudo systemctl enable caddy

# 5. Vérifier
curl http://YOUR_VPS_IP
```

## ✅ Checklist

- [ ] Caddy installé
- [ ] Caddyfile copié et édité (IP/domaine)
- [ ] Chemins ajustés dans Caddyfile
- [ ] Logs directory créé
- [ ] Configuration validée
- [ ] Service démarré
- [ ] Firewall configuré
- [ ] Backend répond sur /api/health
- [ ] Site vitrine accessible
- [ ] (Optionnel) HTTPS automatique fonctionne

---

**Recommandation:** Utilisez Caddy au lieu de Nginx pour ce projet. C'est plus simple, plus moderne, et HTTPS est automatique.
