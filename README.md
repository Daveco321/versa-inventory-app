# Versa Group — Inventory Management App

React app that connects to the same Render API as your main platform.

## Deploy to Netlify

1. Push this folder to a new GitHub repo
2. In Netlify → "Add new site" → "Import an existing project"
3. Connect the GitHub repo
4. Netlify auto-detects the settings from `netlify.toml` — just hit **Deploy**
5. Done. Your app is live at `your-site.netlify.app`

## Run Locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## How It Works

- Pulls live inventory from `versa-inventory-api.onrender.com`
- Same data as your main HTML platform — they run independently
- Caches data in localStorage for offline use
- All SKU parsing (brand codes, fabric, fit, size packs) built in
