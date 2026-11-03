# Sharpe Wysman: web (Next.js)

The frontend of sharpewysman.com. See the [project README](../README.md) for architecture, WordPress setup and deployment.

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck && npm run lint
npm run seed:export  # refresh the WordPress plugin's seed.json from src/content
```
