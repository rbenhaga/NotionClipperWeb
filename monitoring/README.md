# Monitoring Stack - NotionClipper

Dashboard Grafana + Prometheus pour surveiller la fiabilité Notion (P0).

## Quick Start

```bash
cd monitoring

# Set your metrics token
export METRICS_TOKEN=42ea9ab1a3e801a3c2e6c5332fbb2ab97d9102c948fa7d05f50365ffdce0323f

# Start the stack
docker compose up -d
```

## Access

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3002 | admin / clipper2024 |
| Prometheus | http://localhost:9090 | - |

## Dashboard

Le dashboard "NotionClipper - Reliability Dashboard" affiche :

- **Cooldown Active** : Nombre de tokens en cooldown (429 reçu)
- **Circuit Breakers Open** : Nombre de circuits ouverts (Notion down)
- **In-Flight Requests** : Requêtes en cours (backpressure)
- **Queue Depth** : Jobs en attente/running/failed

## Configuration

### Backend URL

Si ton backend n'est pas sur `localhost:3001`, modifie `prometheus.yml` :

```yaml
params:
  target: ['http://YOUR_BACKEND_HOST:PORT/metrics']
```

### METRICS_TOKEN

Le token doit être configuré dans `json-exporter.yml` :

```yaml
headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

## Alerting (optionnel)

Pour ajouter des alertes, configure Alertmanager dans `prometheus.yml` et ajoute des règles dans `alert.rules.yml`.

Exemples d'alertes utiles :
- `notion_circuit_open_count > 0` pendant 5min → Notion down
- `notion_queue_depth_queued > 100` → Queue qui s'accumule
- `notion_cooldown_active_count > 10` → Trop de tokens rate-limited
