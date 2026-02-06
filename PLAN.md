# We Go Jim - Implementation Plan

A mobile-first Progressive Web App for tracking workouts, built with React, Firebase, and deployed to GitHub Pages.

---

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Build      | Vite 6                              |
| UI         | React 18 + TypeScript (strict mode) |
| Styling    | Tailwind CSS v4                     |
| Routing    | React Router v7 (`HashRouter`)      |
| Auth       | Firebase Auth (Google sign-in)      |
| Database   | Cloud Firestore                     |
| PWA        | vite-plugin-pwa + Workbox           |
| Hosting    | GitHub Pages                        |
| Date utils | date-fns                            |
| Testing    | Vitest + React Testing Library      |

---

## Project Structure

```
we-go-jim/
  public/
    icons/                # PWA icons (192x192, 512x512)
  src/
    components/
      auth/               # LoginPage, AuthGuard
      dashboard/          # Dashboard, RecentWorkouts, QuickStart
      workout/            # ActiveWorkout, ExerciseCard, SetRow, RestTimer
      templates/          # TemplateList, TemplateEditor
      history/            # WorkoutHistory, WorkoutDetail
      progression/        # ProgressionChart (per exercise)
      ui/                 # Button, Card, Modal, BottomNav, Timer
    hooks/
      useAuth.ts
      useWorkout.ts
      useTemplates.ts
      useRestTimer.ts
      usePreviousWorkout.ts
    services/
      firebase/
        config.ts         # Firebase app initialization
        auth.ts           # signInWithGoogle, signOut, onAuthChange
        workouts.ts       # CRUD for workout sessions
        templates.ts      # CRUD for templates
    types/
      workout.ts
      template.ts
    App.tsx
    main.tsx
    index.css             # Tailwind directives
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

---

## Firestore Data Model

### Collection: `users/{uid}/templates/{templateId}`

| Field       | Type        | Description                        |
| ----------- | ----------- | ---------------------------------- |
| name        | string      | Template name (e.g., "Push Day")   |
| createdAt   | Timestamp   | When the template was created      |
| exercises   | array       | Ordered list of exercise configs   |

Each exercise in the array:

| Field       | Type   | Description                                          |
| ----------- | ------ | ---------------------------------------------------- |
| name        | string | Exercise name (e.g., "Bench Press")                  |
| type        | string | `"dumbbell"` \| `"barbell"` \| `"bodyweight"` \| `"machine"` |
| defaultSets | number | Default number of sets                               |
| defaultReps | number | Default number of reps                               |

### Collection: `users/{uid}/workouts/{workoutId}`

| Field       | Type        | Description                                |
| ----------- | ----------- | ------------------------------------------ |
| templateId  | string?     | Optional reference to source template      |
| startedAt   | Timestamp   | When the workout was started               |
| completedAt | Timestamp   | When the workout was finished              |
| exercises   | array       | List of exercises performed                |

Each exercise in the array:

| Field | Type   | Description                                          |
| ----- | ------ | ---------------------------------------------------- |
| name  | string | Exercise name                                        |
| type  | string | `"dumbbell"` \| `"barbell"` \| `"bodyweight"` \| `"machine"` |
| sets  | array  | List of sets performed                               |

Each set in the array:

| Field     | Type    | Description                           |
| --------- | ------- | ------------------------------------- |
| weight    | number  | Weight in lbs (0 for bodyweight)      |
| reps      | number  | Number of reps completed              |
| completed | boolean | Whether the set was finished          |

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## App Flow

```
Login Page
  └─ Google Sign-In ──> Dashboard
                          ├─ Start from Template ──> Active Workout
                          ├─ Quick Start (Empty) ──> Active Workout
                          ├─ View History ──> Workout History
                          │                    └─ Tap Workout ──> Workout Detail
                          └─ Manage Templates ──> Template List
                                                    └─ Create/Edit ──> Template Editor

Active Workout
  ├─ Add Exercise ──> Exercise Card
  │                    └─ Log Sets (with previous data shown)
  ├─ Rest Timer (floating button)
  └─ Finish ──> Dashboard
```

### Navigation

Bottom navigation bar with 3 tabs:
1. **Dashboard** - Home screen with recent workouts and quick start
2. **History** - Chronological list of past workouts
3. **Templates** - Manage workout templates

The **Active Workout** screen is a full-screen overlay (no bottom nav visible).

---

## Key Features

### 1. Active Workout Screen (Core Feature)

The primary screen where users log their exercises in real time.

- Each exercise is displayed as a card with the exercise name, type badge, and a list of set rows.
- Each set row shows: `[set #] [weight input] x [reps input] [checkmark button]`
- **Previous workout data** for the same exercise is displayed as dimmed/gray placeholder values in each set row.
- "Add Set" button at the bottom of each exercise card.
- "Add Exercise" button at the bottom of the screen.
- Floating rest timer button (bottom-right corner).
- "Finish Workout" button in the header.

### 2. Rest Timer

A global timer that persists across screens during an active workout.

- Configurable presets: 30s, 60s, 90s, 2min, 3min, 5min.
- Plays an audio chime and triggers device vibration when complete.
- Displayed as a mini-widget or floating overlay so it doesn't block the workout.
- Timer state managed globally (React Context) so it persists while navigating between exercises.

### 3. Previous Workout Tracking

Shows what the user did last time for the same exercise, enabling progressive overload.

- When starting an exercise, query the most recent completed workout that contains an exercise with the same name.
- Display the previous weight and reps as dimmed placeholder text in each set row.
- Example: If last session was "Bench Press 135 x 6", each set row shows `135` and `6` as gray placeholders the user can match or beat.

### 4. Workout Templates

Reusable workout routines that users create and manage.

- Template list screen shows all user-created templates as cards.
- Template editor allows: naming the template, adding/removing/reordering exercises, setting default sets and reps per exercise.
- "Start Workout" button on each template card pre-populates the active workout with those exercises and their defaults.
- Templates are stored in Firestore under `users/{uid}/templates/`.

### 5. PWA (Progressive Web App)

- Service worker caches the app shell (HTML, CSS, JS, icons) for offline loading.
- Web App Manifest with: app name ("We Go Jim"), icons (192x192, 512x512), theme color, background color, `display: standalone`.
- "Add to Home Screen" installability on mobile browsers.
- Configured via `vite-plugin-pwa` with Workbox runtime caching.

### 6. Testing

- **Vitest** as the test runner (native Vite integration).
- **React Testing Library** for component tests.
- Service functions (Firebase CRUD) tested with mocked Firestore.
- Custom hooks tested with `@testing-library/react` `renderHook`.
- Goal: tests should prevent regressions when adding new features.

---

## Implementation Phases

### Phase 1: Project Scaffolding and Auth

**Goal:** Get the app running with authentication and basic navigation.

- [ ] Initialize Vite project with React + TypeScript template
- [ ] Install dependencies: `react-router-dom`, `firebase`, `tailwindcss`, `vite-plugin-pwa`, `date-fns`
- [ ] Configure Tailwind CSS v4
- [ ] Set up Firebase project and add config (`src/services/firebase/config.ts`)
- [ ] Implement Google sign-in (`src/services/firebase/auth.ts`)
- [ ] Create `useAuth` hook and `AuthGuard` component
- [ ] Build Login page
- [ ] Set up `HashRouter` with routes: `/`, `/history`, `/templates`
- [ ] Build bottom navigation bar (`BottomNav` component)
- [ ] Create basic Dashboard, History, and Templates placeholder pages

### Phase 2: Workout Logging (Core)

**Goal:** Users can start, log, and save workouts.

- [ ] Define TypeScript types for workouts (`src/types/workout.ts`)
- [ ] Build `ActiveWorkout` screen with workout state management
- [ ] Build `ExerciseCard` component (displays one exercise with its sets)
- [ ] Build `SetRow` component (weight input, reps input, checkmark)
- [ ] Implement "Add Exercise" flow (exercise name input, type selector)
- [ ] Implement "Add Set" / "Remove Set" within an exercise
- [ ] Create workout service (`src/services/firebase/workouts.ts`) for saving to Firestore
- [ ] Wire up "Finish Workout" to save data and return to Dashboard

### Phase 3: Templates

**Goal:** Users can create, edit, and start workouts from templates.

- [ ] Define TypeScript types for templates (`src/types/template.ts`)
- [ ] Create template service (`src/services/firebase/templates.ts`) for CRUD
- [ ] Build `TemplateList` screen showing all templates
- [ ] Build `TemplateEditor` screen for creating/editing templates
- [ ] Implement "Start Workout from Template" (pre-populate active workout)
- [ ] Create `useTemplates` hook for fetching and managing templates

### Phase 4: Previous Workout Tracking

**Goal:** Show previous performance data during active workouts.

- [ ] Implement `usePreviousWorkout` hook that queries the most recent workout containing a given exercise
- [ ] Update `SetRow` to display previous weight/reps as dimmed placeholders
- [ ] Handle edge case: no previous data (show empty placeholders)
- [ ] Optimize query with Firestore index if needed

### Phase 5: Rest Timer

**Goal:** A global rest timer with audio/vibration alerts.

- [ ] Implement `useRestTimer` hook with start, pause, reset, and configurable duration
- [ ] Create `RestTimer` floating widget component
- [ ] Add timer preset selector (30s, 60s, 90s, 2min, 3min, 5min)
- [ ] Implement audio chime on timer completion
- [ ] Implement vibration API on timer completion
- [ ] Wrap timer in React Context so it persists across the active workout

### Phase 6: History, PWA, and Polish

**Goal:** Complete the feature set, make it installable, and deploy.

- [ ] Build `WorkoutHistory` screen with date-grouped workout list
- [ ] Build `WorkoutDetail` screen showing full exercise/set breakdown
- [ ] Configure PWA manifest and icons in `vite-plugin-pwa`
- [ ] Verify offline caching works for the app shell
- [ ] Add `base: '/we-go-jim/'` to `vite.config.ts`
- [ ] Add `gh-pages` package and deploy script
- [ ] Test full flow on mobile device
- [ ] Write tests for critical paths (auth, workout save, template CRUD)

---

## Environment Variables

Firebase config values are stored as Vite environment variables (prefixed with `VITE_`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

These go in a `.env` file (git-ignored) and `.env.example` (committed, with placeholder values).

---

## GitHub Pages Deployment

1. `base: '/we-go-jim/'` in `vite.config.ts` sets the correct asset paths.
2. `HashRouter` handles client-side routing without server config.
3. Deploy script: `"deploy": "vite build && gh-pages -d dist"` using the `gh-pages` npm package.
4. Firebase Auth must have the GitHub Pages URL added as an authorized domain.
