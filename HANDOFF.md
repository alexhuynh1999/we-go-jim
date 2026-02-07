# Handoff - We Go Jim

## What This Is

A mobile-first PWA workout tracker built with React, Firebase, and Tailwind CSS. See `AGENTS.md` for coding conventions and `PLAN.md` for the full implementation plan with all 6 phases.

## Current State

**All 6 implementation phases are complete, plus a round of UX polish and mobile improvements.** The app builds, type-checks, and runs in dev mode. No tests have been written yet (Phase 6 deferred testing).

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
| Rest timer (global context, centered widget) | Done | `src/hooks/useRestTimer.ts`, `src/contexts/RestTimerContext.tsx`, `src/components/workout/RestTimerWidget.tsx` |
| Workout history (date-grouped list + detail view) | Done | `src/components/history/WorkoutHistory.tsx`, `WorkoutDetail.tsx` |
| Exercise search (API Ninjas + custom exercises) | Done | `src/services/exerciseApi.ts`, `src/hooks/useExerciseSearch.ts`, `src/components/workout/ExerciseSearchModal.tsx` |
| Custom exercises (Firestore, cross-device sync) | Done | `src/services/firebase/customExercises.ts`, `src/hooks/useCustomExercises.ts` |
| PWA manifest + service worker | Done | `vite.config.ts` (VitePWA plugin), PNG + SVG icons in `public/icons/` |
| GitHub Pages deploy config + CI/CD | Done | `.github/workflows/deploy.yml`, `base: '/we-go-jim/'` in vite config |

### UX Polish (Added This Session)

All features from `features.md` were implemented:

1. **Safe-area top spacing**: `pt-[env(safe-area-inset-top)]` on App.tsx wrapper; sticky headers in ActiveWorkout and TemplateEditor use `top-[env(safe-area-inset-top)]` so they don't overlap the iPhone notch/Dynamic Island. BottomNav already handled bottom inset.

2. **Live workout timer**: The ActiveWorkout header shows a live `MM:SS` / `H:MM:SS` counter. If the workout exceeds 3 hours, the timer turns amber and a "Still Working Out?" prompt appears (once).

3. **Duration tags in history**: Workout cards in both WorkoutHistory and Dashboard show a clock icon + formatted duration (e.g., "1h 30m"). Shared helper at `src/utils/formatDuration.ts`.

4. **Pinch-to-zoom disabled**: Viewport meta tag updated with `maximum-scale=1.0, user-scalable=no`.

5. **Set autofill (dimmed suggestions)**: When adding a new set, the previous set in the same exercise provides dimmed placeholder values (same pattern as previous-workout suggestions). Computed in `ExerciseCard` -- the previous set in the current exercise takes priority, falling back to the previous workout's matching set. Ready for a future progression algorithm.

6. **Centered rest timer**: Floating button moved from bottom-right to bottom-center (`left-1/2 -translate-x-1/2`).

7. **Custom timer sound**: `useRestTimer.ts` plays `public/sounds/timer-done.mp3` using `import.meta.env.BASE_URL`. Falls back to the original 880Hz oscillator beep if the file is missing or audio is blocked.

8. **PNG app icons**: PWA manifest updated to reference both PNG and SVG icons. `<link rel="apple-touch-icon">` added to `index.html`. User-provided PNGs are at `public/icons/icon-192x192.png` and `icon-512x512.png`.

9. **Exercise name formatting**: `formatExerciseName()` in `exerciseApi.ts` title-cases every word and strips punctuation (except dashes). Applied to API Ninjas results before caching.

10. **Finish workout confirmation**: A modal appears when tapping "Finish" showing exercise count, completed sets, and elapsed time. User can "Keep Going" or confirm "Finish".

11. **Recent workout deep-link**: Clicking a recent workout on the Dashboard navigates to `/history/:id`, which auto-selects that workout in WorkoutHistory via `initialWorkoutId` prop. A `deepLinkConsumed` ref prevents the back button from re-selecting.

12. **Version indicator**: `__APP_VERSION__` injected via Vite `define` from `package.json`. Displayed discreetly below the "Sign out" button on the Dashboard.

### Bugs Fixed During Previous Sessions

1. **Firebase crash on missing `.env`**: `initializeApp()` threw when env vars were undefined. Fixed with `isFirebaseConfigured` guard in `src/services/firebase/config.ts`.

2. **`user!.uid` crash in App.tsx**: JSX props evaluated eagerly even inside AuthGuard. Fixed with `user ? <Component /> : null`.

3. **Exercise search showing no results**: API Ninjas returning 400 was silently swallowed. Fixed by surfacing `SearchResult.error` through to the UI.

### Bugs Fixed This Session

4. **Deep-link back button loop**: Pressing "Back" in WorkoutDetail after navigating from Dashboard caused an infinite re-selection loop. The `useEffect` watching `initialWorkoutId` re-fired when `selected` was cleared because `selected` was in the dependency array. Fixed with a `deepLinkConsumed` ref that prevents the effect from running more than once.

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
  vite-env.d.ts               # Type declarations (ImportMetaEnv, __APP_VERSION__)
  components/
    auth/                     # LoginPage, AuthGuard
    dashboard/                # Dashboard (recent workouts, quick start, version indicator)
    workout/                  # ActiveWorkout, ExerciseCard, SetRow, AddExerciseModal,
                              # ExerciseSearchModal, RestTimerWidget
    templates/                # TemplateList, TemplateEditor, TemplateEditorRoute
    history/                  # WorkoutHistory (supports deep-link via initialWorkoutId), WorkoutDetail
    ui/                       # BottomNav
  hooks/
    useAuth.ts                # Firebase auth state
    useWorkout.ts             # Active workout reducer (local state, not persisted until finish)
    useWorkouts.ts            # Fetch/delete workout history from Firestore
    useTemplates.ts           # CRUD templates from Firestore
    usePreviousWorkout.ts     # Query previous sets for an exercise
    useRestTimer.ts           # Timer logic (start/pause/resume/reset, custom sound file)
    useExerciseSearch.ts      # Debounced API Ninjas search (300ms, AbortController)
    useCustomExercises.ts     # Load/add custom exercises from Firestore
  contexts/
    RestTimerContext.tsx       # Global rest timer state (persists across workout screens)
  services/
    exerciseApi.ts             # API Ninjas client, in-memory cache, type inference, name formatting
    firebase/
      config.ts               # Firebase app init (graceful when unconfigured)
      auth.ts                 # Google sign-in, sign-out, onAuthChange
      workouts.ts             # Firestore CRUD for workouts
      templates.ts            # Firestore CRUD for templates
      customExercises.ts      # Firestore CRUD for user custom exercises
  utils/
    formatDuration.ts          # Shared helper: format Timestamp pair as "1h 30m"
  types/
    workout.ts                # Workout, WorkoutExercise, WorkoutSet, ExerciseType
    template.ts               # Template, TemplateExercise
public/
  icons/                      # PWA icons (192x192 + 512x512, both PNG and SVG)
  sounds/
    timer-done.mp3            # Custom rest timer completion sound
```

## Key Architecture Decisions

- **Firebase config is nullable**: `app`, `auth`, `db` exports from `config.ts` can be `null`. All service functions guard against this. The `isFirebaseConfigured` boolean is exported for UI messaging.
- **Workout state is local**: `useWorkout` uses `useReducer` -- workout data only hits Firestore when "Finish" is tapped (with confirmation modal). This avoids partial writes.
- **Route elements use conditional rendering**: `user ? <Component /> : null` instead of `user!` non-null assertions, because React evaluates JSX props eagerly even for guarded children.
- **Rest timer is in React Context**: Wraps the entire app so the timer persists when navigating between exercises during an active workout.
- **No default exports**: All components/hooks use named exports per project convention.
- **Exercise search merges two sources**: API Ninjas results (cached in-memory, names title-cased via `formatExerciseName`) and Firestore custom exercises (loaded once per session). Custom exercises appear first and deduplicate API results by name.
- **Set suggestion priority**: When adding a new set, the placeholder suggestion comes from (1) the previous set in the same exercise (current workout), then falls back to (2) the matching set from the last completed workout. Computed in `ExerciseCard`, passed to `SetRow` as `previousSet`.
- **Deep-link with consumed ref**: `/history/:id` auto-selects a workout in WorkoutHistory. A `deepLinkConsumed` ref prevents the useEffect from re-selecting after the user presses "Back".
- **Version injection**: `__APP_VERSION__` is defined in `vite.config.ts` via `process.env.npm_package_version` and typed in `vite-env.d.ts`.
- **Safe-area handling**: App.tsx wrapper has `pt-[env(safe-area-inset-top)]`; sticky headers use `top-[env(safe-area-inset-top)]`; BottomNav uses `pb-[env(safe-area-inset-bottom)]`.

## Known Issues

- **API Ninjas free tier is currently down**: The `/v1/exercises` endpoint returns 400 for free-tier API keys. The app handles this gracefully (shows the error + manual fallback). When the endpoint comes back, search will work automatically (no code changes needed).
- **Mobile testing limited**: Safe-area and layout changes have been tested in Chrome DevTools device emulation but not on actual mobile hardware. Real-device testing on an iPhone is recommended.

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
- [ ] **Offline support verification**: Service worker is configured but not tested offline
- [ ] **Real mobile device testing**: Safe-area, layout, and touch interactions need testing on actual iPhone hardware
- [ ] **Error boundaries**: No React error boundary wrapping the app
- [ ] **Weight unit toggle**: Currently hardcoded to lbs
- [ ] **Progression algorithm**: Set suggestions currently copy the previous set; infrastructure is ready for a smarter algorithm
- [x] **Deploy to GitHub Pages**: See deployment instructions above
- [x] **PWA icons**: PNG icons added at `public/icons/`
- [x] **Workout duration display**: Live timer in ActiveWorkout header + duration tags in history
- [x] **All `features.md` items**: Safe-area, timer, zoom, autofill, centered rest timer, sound, icons, name formatting, finish confirmation, deep-link, version indicator

## Git Status

All changes committed and pushed to `origin/main`. Working tree is clean.
