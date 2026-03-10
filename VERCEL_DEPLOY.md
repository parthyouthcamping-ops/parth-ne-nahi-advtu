# 🚀 Deploying to Vercel & Neon Database

To get your YouthCamping app live on Vercel with Neon, follow these exact steps:

### 1. Set Environment Variables in Vercel
Go to your project on **Vercel Dashboard → Settings → Environment Variables** and add:

- `DATABASE_URL`: `(Your Neon connection string from .env.local)`

### 2. Initialize and Seed Neon
If your Neon database is empty, run these commands:

1. **Initialize Tables**:
   `node init-neon.js`

2. **Seed Initial Data**:
   `node auto-insert-goa.js`

### 3. Verify Connection
Visit `http://localhost:3001/debug` (after setting your local `.env.local`) to see if the connection is active.
In your live environment, your API routes at `/api/db` will handle all communication with the Neon database securely.

---
**Note:** You no longer need Supabase for this project as it has been fully migrated to Neon.

### 🛠 Troubleshooting Build Errors
If you see **"npm error"** or **"vulnerability warnings"** on Vercel:
1.  **Ensure you have pushed the latest code**: The security fix I made in `package.json` only works once it is on GitHub.
2.  **Run these commands to sync GitHub**:
    - `git add .`
    - `git commit -m "fix: dependency upgrades for vercel"`
    - `git push origin main`

### ⚠️ A Note on Port Warnings
If you see `npm warn` or `Port 3000 in use`, don't worry! This just means another project is running on your computer. Next.js will automatically move your app to a new port (like `3004`). You can just use the new URL shown in the terminal.
