# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Greece geography quiz built with Next.js 16 (App Router) and React 19. Users identify Greek prefectures or municipalities on a Leaflet map with bilingual (English/Greek) support.

## Commands

```bash
npm run dev         # Dev server on localhost:3000
npm run build       # Production build
npm run start       # Run production build
npm run lint        # ESLint (eslint-config-next core-web-vitals)
npm run test:run    # Vitest, once (npm test for watch mode)
npm run format      # Prettier
npm run data:build  # Rebuild public/data from data/raw
```

CI (`.github/workflows/ci.yml`) runs lint, format check, tests and build.

## Architecture

**Entry:** `src/app/page.js` renders `QuizController` (client component).

**Component hierarchy:**
- `QuizController` — settings state (quiz type, language); sets `<html lang>`
  - `QuizSettings` — quiz type, language selection, start button
  - `QuizSession` (in QuizController.js) — mounted per started quiz; loads data, shows loading/error
    - `QuizGame` — the quiz screen: header, progress, end screen, feedback
      - `Question` — current region, Next and Give up buttons
      - `LeafletMap` — client-only (`next/dynamic`, `ssr: false`); builds the layer once and restyles changed regions. Remounted (via `key`) on Play Again, because Leaflet's `unbindTooltip` leaks a focus listener.

**Game logic (src/hooks/):**
- `quizReducer.js` — pure state machine: queue, skipped list, second pass, input lock during delays (`pending`), give up, scoring, rank keys. Randomness comes in through actions, so it is deterministic in tests.
- `useQuizLogic` — wraps the reducer; timers are effects keyed on `pending`/`wrongClick`, so state changes cancel them.
- `useQuizData` — fetches and validates GeoJSON; caches per data path for the visit; the timeout covers the whole download.

Regions are identified by **id** everywhere (clicks, correct list, map styling); names are display-only.

**Config (src/config/):** `quizConfig.js` defines quiz types with data path, `idProperty`, name properties and optional map `attribution`. `translations.js` holds all UI strings (both languages must have the same keys; a test enforces it).

**Data:** `data/raw/` holds the source files; `scripts/build-map-data.mjs` writes `public/data/*.geojson` with properties `id`, `name_en`, `name_el`, simplified geometry (shared borders simplified identically) and rounded coordinates. Display-name fixes live in `scripts/regionNames.mjs`. Adding a quiz type means adding a source to the build script and an entry in `quizConfig.js`. `src/config/__tests__/mapData.test.js` checks the generated files (unique ids and names, valid rings).

**Keyboard play:** regions are focusable SVG paths (roving tabindex); arrow keys move via `src/utils/mapNavigation.js`, Enter selects. Unfound regions are labelled generically so screen readers don't reveal answers.

## Key Patterns

- All interactive components use `"use client"` directive
- Pure React state (useState/useReducer), no state library
- CSS Modules for component-scoped styling; global styles and color tokens in `src/app/globals.css`
- Fonts: font CSS variables are set on `<html>` (so `:root` tokens can use them); `:root:lang(el)` switches to Greek-capable fonts (Noto Sans, GFS Didot), because Geist/Cinzel lack Greek and their automatic local fallbacks would otherwise catch Greek text
- Path alias: `@/*` maps to `./src/*` (configured in jsconfig.json)
- JavaScript only (no TypeScript)
