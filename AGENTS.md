# AGENTS.md - We Go Jim

Project guidelines and conventions for AI agents working on this codebase.

## Project Overview

**We Go Jim** is a mobile-first Progressive Web App (PWA) for tracking workouts. Users log exercises with weight, reps, and sets, create reusable workout templates, use a rest timer, and track weight progression over time.

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
    hooks/                # Custom React hooks (useAuth, useWorkout, etc.)
    services/
      firebase/
        config.ts         # Firebase app initialization
        auth.ts           # signInWithGoogle, signOut, onAuthChange
        workouts.ts       # CRUD for workout sessions
        templates.ts      # CRUD for templates
    types/                # Shared TypeScript types
    App.tsx
    main.tsx
    index.css             # Tailwind directives
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

## Coding Standards

### General

- **TypeScript strict mode** is enabled. No `any` types unless absolutely necessary and documented.
- Use `const` by default. Only use `let` when reassignment is needed. Never use `var`.
- Prefer named exports over default exports.
- Keep files focused and under 200 lines when possible.

### React

- **Functional components only.** No class components.
- Custom hooks for reusable logic, always prefixed with `use` (e.g., `useAuth`, `useRestTimer`).
- Components organized by feature folder inside `src/components/`.
- Colocate component-specific types in `*.types.ts` files next to the component; shared types go in `src/types/`.
- Use React Router v7 `HashRouter` for all routing (required for GitHub Pages static hosting).

### Styling (Tailwind CSS)

- **Mobile-first approach.** Design for 375px base width, then scale up.
- Use responsive prefixes to scale UP: `sm:`, `md:`, `lg:`.
- No inline styles. Use Tailwind utility classes exclusively.
- For complex/reusable style combinations, extract to component-level abstractions -- not to `@apply` in CSS.

### Firebase / Firestore

- All Firebase logic is isolated in `src/services/firebase/`.
- **Never call Firebase SDK directly from components.** Always go through service functions.
- Firestore data lives under `users/{uid}/` for security isolation.
- Two subcollections per user: `templates` and `workouts`.
- Use Firestore Timestamps for all date fields (`startedAt`, `completedAt`, `createdAt`).

### Data Model

**Workout types:** `"dumbbell"`, `"barbell"`, `"bodyweight"`, `"machine"`

**Template structure:**
- `name`: string
- `createdAt`: Timestamp
- `exercises`: array of `{ name, type, defaultSets, defaultReps }`

**Workout structure:**
- `templateId?`: string (optional reference to source template)
- `startedAt`: Timestamp
- `completedAt`: Timestamp
- `exercises`: array of `{ name, type, sets: [{ weight, reps, completed }] }`

### PWA

- Service worker caches the app shell for offline loading.
- Manifest includes app name, icons (192x192, 512x512), and theme color.
- Use `vite-plugin-pwa` with Workbox for service worker generation.

### Deployment

- GitHub Pages hosting with `base: '/we-go-jim/'` in `vite.config.ts`.
- Deploy via `gh-pages` npm package: `"deploy": "vite build && gh-pages -d dist"`.
- `HashRouter` eliminates the need for a `404.html` SPA redirect hack.

## Do NOT

- Do not add class components.
- Do not use inline styles or CSS modules -- Tailwind only.
- Do not call Firebase SDK directly from React components.
- Do not commit Firebase API keys or secrets (use environment variables with `VITE_` prefix).
- Do not use default exports for components or hooks.
- Do not install libraries without checking if an existing dependency already covers the use case.
