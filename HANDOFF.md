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
| Active workout (add exercises, log sets, save) | Done | `src/components/workout/ActiveWorkout.tsx`, `ExerciseCard.tsx`, `SetRow.tsx`, `AddExerciseModal.tsx` |
| Workout templates (CRUD, start-from-template) | Done | `src/components/templates/TemplateList.tsx`, `TemplateEditor.tsx`, `TemplateEditorRoute.tsx` |
| Previous workout tracking (dimmed placeholders) | Done | `src/hooks/usePreviousWorkout.ts` (wired into `SetRow`) |
| Rest timer (global context, floating widget) | Done | `src/hooks/useRestTimer.ts`, `src/contexts/RestTimerContext.tsx`, `src/components/workout/RestTimerWidget.tsx` |
| Workout history (date-grouped list + detail view) | Done | `src/components/history/WorkoutHistory.tsx`, `WorkoutDetail.tsx` |
| PWA manifest + service worker | Done | `vite.config.ts` (VitePWA plugin), SVG icons in `public/icons/` |
| GitHub Pages deploy config | Done | `base: '/we-go-jim/'` in vite config, `gh-pages` package |

### Bugs Fixed During This Session

1. **Firebase crash on missing `.env`**: `initializeApp()` threw when env vars were undefined. Fixed with `isFirebaseConfigured` guard in `src/services/firebase/config.ts` -- Firebase init is skipped gracefully, and the login page shows an error message.

2. **`user!.uid` crash in App.tsx**: JSX prop expressions are evaluated eagerly by React, even inside AuthGuard children that won't render when `user` is null. Fixed by wrapping user-dependent Route elements in `user ? <Component /> : null`.

## How to Run

```bash
nvm use 20          # Node 20+ required (Vite 6)
npm install
npm run dev         # http://localhost:5173/we-go-jim/
```

Requires a `.env` file with Firebase credentials (see `.env.example`). The app works without it -- shows login page with a "not configured" message.

## Project Structure

```
src/
  App.tsx                     # Main router, connects all hooks to pages
  main.tsx                    # Entry point, HashRouter + RestTimerProvider
  index.css                   # Tailwind v4 imports + dark theme base styles
  components/
    auth/                     # LoginPage, AuthGuard
    dashboard/                # Dashboard (recent workouts, quick start)
    workout/                  # ActiveWorkout, ExerciseCard, SetRow, AddExerciseModal, RestTimerWidget
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
  contexts/
    RestTimerContext.tsx       # Global rest timer state (persists across workout screens)
  services/firebase/
    config.ts                 # Firebase app init (graceful when unconfigured)
    auth.ts                   # Google sign-in, sign-out, onAuthChange
    workouts.ts               # Firestore CRUD for workouts
    templates.ts              # Firestore CRUD for templates
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

## What's Left To Do

- [ ] **Testing**: Vitest + React Testing Library (planned in Phase 6, not started)
- [ ] **PWA icons**: Currently SVG placeholders in `public/icons/` -- replace with proper PNG icons
- [ ] **Offline support verification**: Service worker is configured but not tested offline
- [ ] **Mobile device testing**: Not tested on actual mobile hardware
- [ ] **Error boundaries**: No React error boundary wrapping the app
- [ ] **Exercise name autocomplete**: Could suggest previously used exercise names
- [ ] **Weight unit toggle**: Currently hardcoded to lbs
- [ ] **Workout duration display**: ActiveWorkout has `startedAt` but no live duration counter
- [ ] **Deploy to GitHub Pages**: `npm run deploy` is configured but not yet executed

## Git Status

No commits yet. All files are untracked. Ready for an initial commit.
