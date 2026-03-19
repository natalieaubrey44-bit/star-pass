# StarPass Architecture - Technical Source of Truth

## 1) Purpose

This document is the definitive technical source of truth for StarPass, intended for a secondary coding agent to add features or refactor reliably without additional context.

It covers:

- Tech stack and environment
- Project structure and components
- End-to-end data flow
- Critical logic and dependencies
- Existing patterns and architectural constraints
- Non-obvious bugs and gotchas
- Feature-add guidance with risk mitigation

---

## 2) Tech Stack & Environment

### Core stack

- **Language**: TypeScript (React 19 + JSX)
- **UI Framework**: React 19
- **Bundler/Dev server**: Vite
- **Styling**: Tailwind CSS v4
- **Animation**: motion (`motion/react`)
- **Icons**: lucide-react
- **Routing**: react-router-dom (v7)
- **Backend/Auth**: @supabase/supabase-js
- **Notifications**: sonner
- **Utility**: clsx + tailwind-merge

### Key dependencies (from package.json)

- `react`, `react-dom` (v19)
- `vite` (v6.2.0)
- `typescript` (~5.8.2)
- `tailwindcss` (v4.1.14)
- `react-router-dom` (v7)
- `@supabase/supabase-js`
- `sonner`
- `clsx`, `tailwind-merge`, `lucide-react`, `motion`

### Environment

- Frontend-only static application (no server-side API or database in this repo)
- Single-page app mounted through `src/main.tsx`
- Template static assets in `public/templates/`

---

## 3) Project Structure (Visual + Purpose)

```
star-card/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ templates.json
├─ public/
│  └─ templates/
│      └─ <template images>.jpg|.png
└─ src/
   ├─ main.tsx
   ├─ index.css
   ├─ App.tsx
   ├─ lib/
   │  ├─ utils.ts
   │  └─ supabase.ts
   ├─ context/
   │  └─ AuthContext.tsx
   ├─ pages/
   │  ├─ Auth.tsx
   │  └─ Dashboard.tsx
   └─ components/
      ├─ Navbar.tsx
      ├─ Hero.tsx
      ├─ Generator.tsx
      ├─ CartOverlay.tsx
      └─ CheckoutOverlay.tsx
```

### Main file responsibilities

- `src/main.tsx`: React root mount.
- `src/App.tsx`: Page layout, tier selection, conditional rendering of generator.
- `src/components/Navbar.tsx`: Navigation and mobile menu callbacks.
- `src/components/Hero.tsx`: Landing hero section and CTA.
- `src/components/Generator.tsx`: Multi-step fan card generator and canvas export.
- `templates.json`: Static template coordinates and text styles.
- `public/templates/`: Static template background images.
- `src/lib/utils.ts`: class-name merge helper `cn`.

---

## 4) Data Flow & Logic

### App-level flow

1. `src/main.tsx` renders `<AuthProvider>` and `<Router>`, which then render `<App />`.
2. `App` consumes `useAuth()` to check identity before allowing critical actions.
3. `App` tracks `showGenerator` and `selectedTier`.
4. Landing page shows hero, how-it-works, pricing cards.
5. User chooses tier → `handleStart(tierIndex)` sets `selectedTier` and shows generator.
6. `<Generator selectedTier={selectedTier} onBack={...} />` handles the wizard.

### Generator wizard flow

- `Generator` has these local states:
  - `step` (1..3), `loading`, `templates`, and `formData` object.
  - `formData` fields: `templateId`, `name`, `cardFor`, `location`, `photoUrl`, `previewUrl`, `memberId`, `memberSince`, `validUntil`.
- On mount, `useEffect` filters `templatesData.templates` by `selectedTier.name` and sets default `templateId`.
- Photo upload (`handlePhotoUpload`) reads file via `FileReader` into Data URL and sets `formData.photoUrl`.
- `generatePreview()` does:
  1. Validate required fields.
  2. Choose template config by `templateId`.
  3. Create canvas 800x1000 and get `2d` context.
  4. Load template image and user image.
  5. Draw user image clipped by `photo` rectangle and border radius.
  6. Draw template overlay.
  7. Write text fields to canvas based on config coordinates.
  8. Set `previewUrl` from `canvas.toDataURL("image/png")`.
- Final UI step includes mock payment and download link click by setting `a.download` and click.

### Data sources

- Template JSON config from `templates.json` (imported in `Generator.tsx`).
- Template assets under `public/templates/` accessed as `/templates/{id}.png`.
- User data stored only in memory state, no persistence.

---

## 5) Key Components & Dependencies

### App (`src/App.tsx`)

- Entry component with tier data and page sections.
- Conditional rendering: landing vs `<Generator />`.
- Passes handlers to `Navbar` and `Hero`.

### Navbar (`src/components/Navbar.tsx`)

- Fixed nav with desktop links and mobile toggle.
- External callbacks to `App` to navigate.

### Hero (`src/components/Hero.tsx`)

- Marketing hero with animated card preview.
- CTA button triggers `onStart`.

### Generator (`src/components/Generator.tsx`)

- Primary feature module (engine for fan card creation).
- Steps:
  1. Upload photo
  2. Fill details + select template
  3. Review + pay/download
- Scale-derived UI transitions with `motion`.
- Canvas generation logic is encapsulated in `generatePreview()` and `writeText()`.

### Utility function (`src/lib/utils.ts`)

- `cn(...inputs)`: merges class names with `clsx` and `twMerge`.

---

## 6) State Management, Data Schema, and UI Model

### UI state

- `App`: `showGenerator`, `selectedTier`.
- `Generator`: `step`, `loading`, `templates`, `formData`.

### Data schema (templates)

Each template object includes:

- `id`, `name`, `tier`, `path`
- `photo`: x,y,w,h,borderRadius
- `text`, `location`, `memberId`, `memberSince`, `validUntil`: x,y,fontSize,color,textAlign,fontWeight

### Relationship mapping

- `selectedTier.name` ⇒ filter template list in generator.
- `formData.templateId` ⇒ chosen template coordinates.
- `formData.photoUrl` ⇒ user photo image source.
- `generatePreview` writes card fields using template text coordinates.

---

## 7) Existing Patterns and Engineering Style

### Patterns

- React functional components + hooks (`useState`, `useEffect`, `useRef`).
- Controlled inputs with local state updates.
- Step wizard pattern and conditional rendering.
- Template-driven card layout.
- Utility class merging with `cn`.

### Styles

- Tailwind CSS utility classes in JSX.
- Responsive layout with mobile and desktop variants.

### Quality

- Light type-safety; `any` used in `Generator`, requiring future type hardening.
- No global state manager; state is local to components.

---

## 8) Constraints & Gotchas (High-Risk Areas)

### Known gotchas

- `Generator` disables generate button with `!formData.name || ...`, but UI only sets `cardFor`. This is a bug that can block generation unexpectedly.
- Template path uses `config.path.replace(/^public\//, "/")`; if config path format changes, image load fails.
- The card generation logic assumes `config.photo`, `config.text` fields exist and are valid numeric values.
- `handlePayment` has leftover dead code (`document.createElement("auth-mock")`).
- Image generation is synchronous on main thread, may block on large images.

### Hardcoded values

- Canvas width/height fixed to 800x1000.
- Date format en-US.
- Mock payment delay fixed to 2 seconds.
- Pricing and features data are hardcoded in `App.tiers`.

### Potential breakage risks

- Changing template coordinate shape requires `generatePreview` updates.
- Moving template assets away from `/templates/{id}.png` requires adjusting preview and generation paths.
- Any UI refactor of wizard step flow should preserve `step` and `formData` object shape.

---

## 9) Add Feature Without Breaking Existing Components (Practical Guide)

### Example feature: Add custom font selection

1. Extend template data to include `fontFamily` fallback.
2. Add `formData.fontFamily` in `Generator` state.
3. In generatePreview `writeText`, set `ctx.font = `${textObj.fontWeight || "normal"} ${textObj.fontSize}px ${formData.fontFamily || "sans-serif"}``.
4. Add UI input on step 2 for font selection.
5. Keep old behavior by defaulting to current text style.
6. Verify existing template generation continues to work.

### Example feature: Add localStorage persistence

1. In `Generator`, use `useEffect` to load from localStorage on mount.
2. Save `formData` on every change.
3. Avoid stale old versions by namespaced keys.
4. Ensure `formData.previewUrl` and generated output are recalculated after updates.

### Stability rules for refactor

- Keep `templates.json` shape backward compatible.
- Keep wizard `step` transitions sequential (1→2→3). If you add an extra step, update all step UI presence checks.
- Do not remove `selectedTier` prop from `Generator`; it’s required for pricing and filtering.
- Always fallback gracefully in `generatePreview` for missing template fields.

---

## 10) Quick Access Reference (for secondary agent)

- App shell + tier view: `src/App.tsx`
- Landing sections: `src/components/Hero.tsx`, `src/components/Navbar.tsx`
- Card generation engine: `src/components/Generator.tsx`
- Template config: `templates.json`
- Template asset root: `public/templates/`
- Class name helper: `src/lib/utils.ts`

### Key function points

- `Generator.generatePreview()` - central canvas drawing logic
- `Generator.handlePhotoUpload()` - local image file reading
- `Generator.handlePayment()` - download flow
- `App.handleStart()` - entry from tier to generator

---

## 11) Recommended immediate technical cleanups

1. Strongly type `templates` and `formData` (replace `any` types).
2. Fix the `Generate Preview` enablement bug (`formData.name` vs `formData.cardFor`).
3. Extract canvas logic into a helper module for easier tests.
4. Add consistent error UI instead of `alert()`.
5. Add minimal unit tests for text drawing utilities and template loading.

---

## 12) Should-have for high-confidence future changes

- Add `src/schemas/template.ts` types and use them in `Generator`.
- Add smoke tests for each step (upload, form fill, preview generation, download).
- Add CI linting with TypeScript strict mode.
- Add runtime validation of `templates.json` against expected shape.

> This architecture document now contains full context and cross-references needed for safe feature work.

---

## 13) Phase 2: User Authentication & Authorization (Integrated)

This section details the major architectural update that added user identity and purchase persistence.

### Auth Architecture (Final Production)

The app is now fully production-hardened with strict Supabase identity and Row Level Security.

- **Strict Identity**: `src/context/AuthContext.tsx` handles only real Supabase sessions. Guest/Demo mode has been completely removed.
- **Secure Client**: `src/lib/supabase.ts` relies exclusively on environment variables.
- **Database Security (RLS)**:
  - Table: `purchases`
  - Policy: `auth.uid() = user_id` enforced for SELECT, INSERT, UPDATE, and DELETE.
  - Users can never access or modify data belonging to other accounts.
- **Routing**: All actions (`handleStart`) and the `/dashboard` route require a valid session. Unauthenticated users are redirected to `/login`.

### Data Model (Persistence)

We moved from memory-only state to permanent storage in Supabase:

- **Collection**: `purchases`
- **Schema**: UUID `user_id` (foreign key), `tier`, `status`, `amount`, and `card_data` (JSONB storing the card configuration).
- **Security**: Row Level Security (RLS) policies ensure users can only SELECT, INSERT, or DELETE their own records based on their `auth.uid()`.

### Updated Patterns

- **Protected Routes**: Custom `<ProtectedRoute>` wrapper in `App.tsx` redirects unauthenticated traffic from `/dashboard` back to `/login`.
- **Global Context Provider**: Centralized authentication state management to avoid prop drilling.
- **External Integration**: First-class support for OAuth (Google) and Email/Password flows.
- **Async Data Fetching**: `Dashboard.tsx` uses `useEffect` to fetch real-time history from Supabase with loading states.
