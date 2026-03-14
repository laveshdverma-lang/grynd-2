# GRYND — Sprint 1 Deployment Guide
### From zero to live on grynd.app in under 1 hour

---

## WHAT YOU'RE DEPLOYING

A full React PWA with:
- ✅ Email + Google auth (Supabase)
- ✅ 5-step onboarding intake form
- ✅ Claude AI program generation (personalised 12-week plan)
- ✅ Full program view — phase/day/block/exercise
- ✅ Exercise tick-off (persists between sessions)
- ✅ Edit any exercise (sets/reps/weights/notes)
- ✅ Stats tracker with charts
- ✅ Workout log with RPE
- ✅ Race result logging
- ✅ Offline support + installable PWA
- ✅ Streak tracking
- ✅ Your personal training data pre-loaded

---

## STEP 1 — GET YOUR API KEYS (10 min)

### 1a. Supabase (free — database + auth)
1. Go to **supabase.com** → Sign up (Google login works)
2. Click **"New Project"**
3. Name it `grynd`, set a strong DB password, choose region **South Asia (Mumbai)**
4. Wait ~2 min for project to spin up
5. Go to **Settings → API**
6. Copy:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon/public key** → this is your `VITE_SUPABASE_ANON_KEY`

### 1b. Set up the database
1. In Supabase, go to **SQL Editor → New Query**
2. Open the file `supabase-schema.sql` from this project
3. Paste the entire contents and click **Run**
4. You should see "Success. No rows returned"

### 1c. Enable Google Auth (optional but recommended)
1. Supabase → **Authentication → Providers → Google**
2. Enable it
3. Go to **console.cloud.google.com** → Create OAuth credentials
4. Add your Vercel URL as authorised redirect URI
5. Paste Client ID + Secret into Supabase

### 1d. Anthropic API key (free credits available)
1. Go to **console.anthropic.com** → Sign up
2. Go to **API Keys → Create Key**
3. Copy the key → this is your `VITE_ANTHROPIC_API_KEY`
4. ⚠️ Keep this secret — never commit to git

---

## STEP 2 — SET UP THE PROJECT (5 min)

```bash
# 1. Extract the zip / clone the repo
cd grynd

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env

# 4. Open .env and paste your keys:
# VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_ANTHROPIC_API_KEY=sk-ant-...

# 5. Test locally
npm run dev
# → Opens at http://localhost:5173
```

---

## STEP 3 — DEPLOY TO VERCEL (5 min)

### Option A — Deploy via Vercel Dashboard (easiest)
1. Go to **vercel.com** → Sign up with GitHub
2. Push your code to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "GRYND Sprint 1"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/grynd.git
   git push -u origin main
   ```
3. In Vercel: **"Add New Project"** → Import your GitHub repo
4. Framework: **Vite** (auto-detected)
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_API_KEY`
6. Click **Deploy** → Done in ~90 seconds

### Option B — Deploy via CLI
```bash
npm install -g vercel
vercel login
vercel --prod
# Follow prompts, paste env vars when asked
```

### Set your custom domain (optional)
1. Vercel → Your project → **Settings → Domains**
2. Add `grynd.app` (or whatever domain you buy)
3. Follow DNS instructions (usually just add a CNAME record)

---

## STEP 4 — INSTALL ON YOUR PHONE (2 min)

### Android (Chrome)
1. Open your Vercel URL in Chrome
2. Tap the **⋮ menu → "Add to Home Screen"**
3. GRYND installs as an app with its own icon
4. Works fully offline after first load

### iPhone (Safari)
1. Open your Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share button → "Add to Home Screen"**
3. Tap **Add**
4. GRYND icon appears on your home screen

---

## STEP 5 — ADD SUPABASE REDIRECT URL

After deploying, add your Vercel URL to Supabase auth:
1. Supabase → **Authentication → URL Configuration**
2. Add to **Redirect URLs**: `https://your-app.vercel.app/**`
3. Add your custom domain if you have one

---

## OFFLINE / DEMO MODE

The app works **without Supabase and without an API key** in demo mode:
- All data saves to browser localStorage
- No login required
- Program generation won't work (needs Anthropic key) but a fallback program loads
- Perfect for testing before you set up the backend

To enable auth: open `src/App.jsx` and uncomment the auth gate:
```jsx
if (!user) return <AuthPage />
```

---

## PROJECT STRUCTURE

```
grynd/
├── src/
│   ├── components/
│   │   └── BottomNav.jsx          # 5-tab bottom navigation
│   ├── hooks/
│   │   ├── useAuth.jsx            # Supabase auth context
│   │   └── useToast.js            # Toast notifications
│   ├── lib/
│   │   ├── supabase.js            # Supabase client
│   │   └── claude.js              # Claude API — program gen + coach chat
│   ├── pages/
│   │   ├── AuthPage.jsx           # Login / signup / magic link
│   │   ├── OnboardingPage.jsx     # 5-step intake → AI program generation
│   │   ├── DashboardPage.jsx      # Home — today's session + stats
│   │   ├── ProgramPage.jsx        # Full program — phase/day/block/exercise
│   │   ├── StatsPage.jsx          # Metrics, charts, InBody updates
│   │   ├── LogPage.jsx            # Workout log with RPE
│   │   └── ProfilePage.jsx        # Settings, race results, regenerate
│   ├── store/
│   │   └── index.js               # Zustand store with localStorage persist
│   ├── styles/
│   │   └── global.css             # Full GRYND design system
│   ├── App.jsx                    # Router + auth gate
│   └── main.jsx                   # Entry point
├── supabase-schema.sql             # Paste into Supabase SQL editor
├── .env.example                    # Copy to .env and fill in keys
├── vite.config.js                  # Vite + PWA config
└── index.html                      # HTML entry point
```

---

## SPRINT 2 FEATURES (NEXT BUILD)

When you say "build Sprint 2", I'll add:
- 📊 Macro tracking + food database (Nutritionix API)
- 📅 Full race calendar with countdown timers
- 💬 AI coach chat (Claude-powered in-app chat)
- 📈 Enhanced progress charts (body composition trends)
- 🔔 Push notifications (workout reminders)
- 👥 Training partner pairing (Priya-style doubles)

---

## TROUBLESHOOTING

**"Module not found" errors**
```bash
rm -rf node_modules
npm install
```

**Supabase auth not working**
- Check your redirect URL is added in Supabase auth settings
- Make sure `.env` variables start with `VITE_`

**Claude API errors**
- Check your API key is correct in `.env`
- The app falls back to a default program if Claude API fails

**PWA not installing on iPhone**
- Must use Safari, not Chrome
- Make sure you're on HTTPS (Vercel provides this automatically)

**Build errors**
```bash
npm run build
# Check the error output — usually a missing import
```

---

## COSTS

| Service | Free Tier | When You'll Pay |
|---|---|---|
| Vercel | Unlimited for personal | When you need team features |
| Supabase | 50k MAU, 500MB DB | When you hit real scale |
| Anthropic | ~$5 free credits | ~₹2 per program generated |
| Domain (grynd.app) | — | ~₹800/year |

**Total to launch: ₹0** (until you run out of Anthropic free credits)

---

Built with ❤️ and Claude · GRYND Sprint 1 · March 2026
