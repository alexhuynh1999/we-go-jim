# Handoff - We Go Jim

## What This Is

A mobile-first PWA workout tracker built with React, Firebase, and Tailwind CSS. See `AGENTS.md` for coding conventions and `PLAN.md` for the full implementation plan with all 6 phases.

## Current State

**All 6 implementation phases are complete.** The app builds, type-checks, and runs in dev mode. No tests have been written yet (Phase 6 deferred testing).

### What's Been Built

| Feature | Status | Key Files |
|---------|--------|-----------|
| Vite + React 18 + TypeScript (strict) | Done | `vite.config.ts`, `tsconfig.app.json` |
| Tailwind CSS v4 (dark theme, mobile-first) | Done | `src/index.css` |
| Firebase Auth (Google sign-in) | Done | `src/services/firebase/auth.ts`, `src/hooks/useAuth.ts` |
| Firebase Firestore (workouts + templates) | Done | `src/services/firebase/workouts.ts`, `src/services/firebase/templates.ts` |
| HashRouter with 3-tab BottomNav | Done | `src/App.tsx`, `src/components/ui/BottomNav.tsx` |
| Login page + AuthGuard | Done | `src/components/auth/LoginPage.tsx`, `src/components/auth/AuthGuard.tsx` |
| Dashboard with recent workouts | Done | `src/components/dashboard/Dashboard.tsx` |
| Active workout (add exercises, log sets, save) | Done | `src/components/workout/ActiveWorkout.tsx`, `ExerciseCard.tsx`, `SetRow.tsx` |
| Workout templates (CRUD, start-from-template) | Done | `src/components/templates/TemplateList.tsx`, `TemplateEditor.tsx`, `TemplateEditorRoute.tsx` |
| Previous workout tracking (dimmed placeholders) | Done | `src/hooks/usePreviousWorkout.ts` (wired into `SetRow`) |
| Rest timer (global context, floating widget) | Done | `src/hooks/useRestTimer.ts`, `src/contexts/RestTimerContext.tsx`, `src/components/workout/RestTimerWidget.tsx` |
| Workout history (date-grouped list + detail view) | Done | `src/components/history/WorkoutHistory.tsx`, `WorkoutDetail.tsx` |
| Exercise search (API Ninjas + custom exercises) | Done | `src/services/exerciseApi.ts`, `src/hooks/useExerciseSearch.ts`, `src/components/workout/ExerciseSearchModal.tsx` |
| Custom exercises (Firestore, cross-device sync) | Done | `src/services/firebase/customExercises.ts`, `src/hooks/useCustomExercises.ts` |
| PWA manifest + service worker | Done | `vite.config.ts` (VitePWA plugin), SVG icons in `public/icons/` |
| GitHub Pages deploy config | Done | `base: '/we-go-jim/'` in vite config, `gh-pages` package |

### Exercise Search Integration (Added This Session)

The "Add Exercise" flow in both **ActiveWorkout** and **TemplateEditor** was replaced with an API-powered search modal:

- **`ExerciseSearchModal`** opens when the user taps "Add Exercise". It shows a search input, queries the API Ninjas Exercises API (debounced, cached), and displays results with auto-inferred equipment types.
- **"+ Add custom exercise"** at the bottom of the modal opens the original `AddExerciseModal` as a fallback for manual entry.
- **Custom exercises are persisted in Firestore** at `users/{uid}/customExercises` and sync across devices. They appear first in search results, deduplicated against API results.
- **Error handling**: API errors (e.g., free-tier endpoint downtime) are surfaced as amber-colored messages in the modal with a hint to use the manual fallback.
- **Graceful degradation**: Works without an API key (shows only custom exercises) and without Firebase (shows only API results).

Data flow:

```
ExerciseSearchModal
  ├── useExerciseSearch(query)       → debounced API Ninjas search (exerciseApi.ts)
  ├── useCustomExercises(uid)        → Firestore custom exercises (customExercises.ts)
  └── useMemo                        → merges custom (first) + API results, deduplicates
```

`uid` is threaded through: `App.tsx` → `ActiveWorkout` (already had it) and `App.tsx` → `TemplateEditorRoute` → `TemplateEditor`.

### Bugs Fixed During Previous Session

1. **Firebase crash on missing `.env`**: `initializeApp()` threw when env vars were undefined. Fixed with `isFirebaseConfigured` guard in `src/services/firebase/config.ts` -- Firebase init is skipped gracefully, and the login page shows an error message.

2. **`user!.uid` crash in App.tsx**: JSX prop expressions are evaluated eagerly by React, even inside AuthGuard children that won't render when `user` is null. Fixed by wrapping user-dependent Route elements in `user ? <Component /> : null`.

### Bugs Fixed This Session

3. **Exercise search showing no results**: The API Ninjas `/v1/exercises` endpoint was returning HTTP 400 (`"This endpoint is currently down for free users"`), but `searchExercises` silently returned `[]`. Fixed by parsing the error response body and surfacing it through `SearchResult.error` → `useExerciseSearch.error` → `ExerciseSearchModal` UI.

## How to Run

```bash
nvm use 20          # Node 20+ required (Vite 6)
npm install
npm run dev         # http://localhost:5173/we-go-jim/
```

Requires a `.env` file with Firebase credentials and optionally an API Ninjas key (see `.env.example`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_NINJAS_KEY=...          # Optional -- exercise search works without it
```

The app works without Firebase (shows login page with a "not configured" message) and without the API Ninjas key (exercise search shows only custom exercises).

## Project Structure

```
src/
  App.tsx                     # Main router, connects all hooks to pages
  main.tsx                    # Entry point, HashRouter + RestTimerProvider
  index.css                   # Tailwind v4 imports + dark theme base styles
  components/
    auth/                     # LoginPage, AuthGuard
    dashboard/                # Dashboard (recent workouts, quick start)
    workout/                  # ActiveWorkout, ExerciseCard, SetRow, AddExerciseModal,
                              # ExerciseSearchModal, RestTimerWidget
    templates/                # TemplateList, TemplateEditor, TemplateEditorRoute
    history/                  # WorkoutHistory, WorkoutDetail
    ui/                       # BottomNav
  hooks/
    useAuth.ts                # Firebase auth state
    useWorkout.ts             # Active workout reducer (local state, not persisted until finish)
    useWorkouts.ts            # Fetch/delete workout history from Firestore
    useTemplates.ts           # CRUD templates from Firestore
    usePreviousWorkout.ts     # Query previous sets for an exercise
    useRestTimer.ts           # Timer logic (start/pause/resume/reset)
    useExerciseSearch.ts      # Debounced API Ninjas search (300ms, AbortController)
    useCustomExercises.ts     # Load/add custom exercises from Firestore
  contexts/
    RestTimerContext.tsx       # Global rest timer state (persists across workout screens)
  services/
    exerciseApi.ts             # API Ninjas client, in-memory cache, type inference
    firebase/
      config.ts               # Firebase app init (graceful when unconfigured)
      auth.ts                 # Google sign-in, sign-out, onAuthChange
      workouts.ts             # Firestore CRUD for workouts
      templates.ts            # Firestore CRUD for templates
      customExercises.ts      # Firestore CRUD for user custom exercises
  types/
    workout.ts                # Workout, WorkoutExercise, WorkoutSet, ExerciseType
    template.ts               # Template, TemplateExercise
```

## Key Architecture Decisions

- **Firebase config is nullable**: `app`, `auth`, `db` exports from `config.ts` can be `null`. All service functions guard against this. The `isFirebaseConfigured` boolean is exported for UI messaging.
- **Workout state is local**: `useWorkout` uses `useReducer` -- workout data only hits Firestore when "Finish" is tapped. This avoids partial writes.
- **Route elements use conditional rendering**: `user ? <Component /> : null` instead of `user!` non-null assertions, because React evaluates JSX props eagerly even for guarded children.
- **Rest timer is in React Context**: Wraps the entire app so the timer persists when navigating between exercises during an active workout.
- **No default exports**: All components/hooks use named exports per project convention.
- **Exercise search merges two sources**: API Ninjas results (cached in-memory) and Firestore custom exercises (loaded once per session). Custom exercises appear first and deduplicate API results by name. The `ExerciseSearchModal` owns the merge via `useMemo`.
- **`searchExercises` returns `SearchResult`**: `{ exercises, error? }` -- not a bare array. This allows API error messages to be surfaced in the UI.
- **Equipment type inference**: `inferExerciseType()` maps the API's `equipments` array to the app's `ExerciseType` (`barbell`/`dumbbell`/`bodyweight`/`machine`).

## Known Issues

- **API Ninjas free tier is currently down**: The `/v1/exercises` endpoint returns 400 for free-tier API keys. The app handles this gracefully (shows the error + manual fallback). When the endpoint comes back, search will work automatically (no code changes needed).

## Deploying to GitHub Pages

### Understanding the Secrets

This app uses `VITE_`-prefixed environment variables, which Vite **embeds into the JavaScript bundle at build time**. This means:

- **Firebase client config keys** (`VITE_FIREBASE_*`) are safe to embed. They are public identifiers, not secrets. Firebase Security Rules and Firebase Auth are what actually protect your data -- not the API keys themselves. Google expects these to be in client-side code.
- **`VITE_API_NINJAS_KEY`** is a traditional API key tied to your account's rate limits. Embedding it in the client bundle means anyone can extract it from the built JS. If this concerns you, consider proxying API Ninjas calls through a backend (e.g., a Firebase Cloud Function) instead of calling it directly from the client. For a personal project, the risk is low.

**The `.env` file is gitignored** (see `.gitignore`) and must never be committed. Secrets are passed to the build via GitHub Actions repository secrets instead.

---

### Option A: GitHub Actions (Recommended)

This is the preferred approach. GitHub Actions builds and deploys automatically on every push to `main`, with secrets stored securely in the repository settings.

#### Step 1: Store secrets in GitHub

1. Go to your repo on GitHub: **Settings > Secrets and variables > Actions**.
2. Click **"New repository secret"** and add each of the following:

   | Secret name                          | Value                              |
   |--------------------------------------|------------------------------------|
   | `VITE_FIREBASE_API_KEY`              | Your Firebase API key              |
   | `VITE_FIREBASE_AUTH_DOMAIN`          | `your-project.firebaseapp.com`     |
   | `VITE_FIREBASE_PROJECT_ID`           | Your Firebase project ID           |
   | `VITE_FIREBASE_STORAGE_BUCKET`       | `your-project.firebasestorage.app` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID`  | Your Firebase sender ID            |
   | `VITE_FIREBASE_APP_ID`               | Your Firebase app ID               |
   | `VITE_API_NINJAS_KEY`                | Your API Ninjas key *(optional)*   |

#### Step 2: Enable GitHub Pages

1. Go to **Settings > Pages** in your GitHub repo.
2. Under **"Build and deployment" > Source**, select **"GitHub Actions"**.

#### Step 3: Add the workflow file

Create `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:     # allows manual trigger from Actions tab

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_API_NINJAS_KEY: ${{ secrets.VITE_API_NINJAS_KEY }}

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

#### Step 4: Push and deploy

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
git push origin main
```

The workflow will run automatically. Monitor progress at **Actions** tab in your repo. Once complete, the app will be live at:

```
https://<your-github-username>.github.io/we-go-jim/
```

#### Firebase Auth: Add the deployed domain

After deploying, you must whitelist the GitHub Pages domain in Firebase:

1. Go to the [Firebase Console](https://console.firebase.google.com/) > your project > **Authentication > Settings > Authorized domains**.
2. Add `<your-github-username>.github.io`.

Without this, Google sign-in will fail on the deployed site.

---

### Option B: Manual Deploy (via `gh-pages` package)

This uses the pre-configured `npm run deploy` script, which builds the app and pushes the `dist/` folder to the `gh-pages` branch.

#### Prerequisites

- Your `.env` file must exist locally with valid values (see `.env.example`).
- The GitHub repo must have Pages enabled, with source set to **"Deploy from a branch"** and branch set to `gh-pages` / `/ (root)`.

#### Deploy

```bash
npm run deploy
```

This runs `vite build && gh-pages -d dist`, which:
1. Builds the app (Vite reads `.env` from your local machine).
2. Pushes the contents of `dist/` to the `gh-pages` branch.

**Caveat**: Your local `.env` values are baked into the build. If you switch machines or lose your `.env`, you'll need to recreate it. The GitHub Actions approach (Option A) is more reliable for team workflows or if you want deploys tied to git pushes.

#### Firebase Auth: Add the deployed domain

Same as Option A -- add `<your-github-username>.github.io` to Firebase's authorized domains list.

---

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page after deploy | Make sure `base: '/we-go-jim/'` is set in `vite.config.ts` and the repo name matches exactly |
| Google sign-in fails | Add your GitHub Pages domain to Firebase Auth authorized domains |
| App loads but shows "Firebase not configured" | Secrets are missing or misspelled in GitHub repo settings. Check the Actions build log for warnings |
| 404 on page refresh | This app uses `HashRouter`, so direct URL refresh should work. If not, verify `base` in vite config |
| Old version still showing | Hard-refresh (`Cmd+Shift+R`) or clear the service worker in DevTools > Application > Service Workers > Unregister |

## What's Left To Do

- [ ] **Testing**: Vitest + React Testing Library (planned in Phase 6, not started)
- [ ] **PWA icons**: Currently SVG placeholders in `public/icons/` -- replace with proper PNG icons
- [ ] **Offline support verification**: Service worker is configured but not tested offline
- [ ] **Mobile device testing**: Not tested on actual mobile hardware
- [ ] **Error boundaries**: No React error boundary wrapping the app
- [ ] **Weight unit toggle**: Currently hardcoded to lbs
- [ ] **Workout duration display**: ActiveWorkout has `startedAt` but no live duration counter
- [x] **Deploy to GitHub Pages**: See deployment instructions above

## Git Status

No commits yet. All files are untracked. Ready for an initial commit.
