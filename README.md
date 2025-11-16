# Notion Clipper Web

Backend API et site vitrine pour Notion Clipper.

## Structure

- **backend/** - API Node.js/Express (OAuth, Stripe, etc.)
- **showcase-site/** - Site vitrine React/Vite
- **caddy/** - Configuration Caddy (reverse proxy)
- **deploy/** - Scripts de déploiement

## Quick Start

Voir [VPS_SETUP_FROM_SCRATCH.md](./VPS_SETUP_FROM_SCRATCH.md)

## Stack

- **Backend:** Node.js 20, Express, TypeScript
- **Frontend:** React 18, Vite, Tailwind CSS
- **Proxy:** Caddy (ou Nginx)
- **Process Manager:** PM2
- **Database:** Supabase PostgreSQL

## Déploiement

```bash
# Clone
git clone https://github.com/rbenhaga/NotionClipperWeb.git
cd NotionClipperWeb

# Suivre le guide
cat VPS_SETUP_FROM_SCRATCH.md
```

## License

MIT
