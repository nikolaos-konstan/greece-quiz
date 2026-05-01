# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Greece geography quiz built with Next.js 15 (App Router) and React 19. Users identify Greek prefectures or municipalities on a Leaflet map with bilingual (English/Greek) support.

## Commands

```bash
npm run dev      # Dev server on localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint (next.js core-web-vitals)
```

## Architecture

**Entry:** `src/app/page.js` renders `QuizController` (client component).

**Component hierarchy:**
- `QuizController` — orchestrator, owns all quiz state via useState
  - `QuizSettings` — quiz type, language selection, start button
  - `Question` — displays current region to find
  - `LeafletMap` — interactive Leaflet map, handles click/hover

**Custom hooks (src/hooks/):**
- `useQuizData` — fetches and validates GeoJSON, transforms properties for selected language
- `useQuizLogic` — game state machine: region queue, scoring, skip/second-pass, rank calculation

**Config (src/config/quizConfig.js):**
Defines quiz types (prefectures vs municipalities) with data paths, bilingual property mappings, and ID strategies. Adding a new quiz type means adding an entry here and placing the GeoJSON in `public/data/`.

**Data:** Static GeoJSON files in `public/data/`. Loaded lazily when a quiz starts.

**Utilities (src/utils/dataHelpers.js):** Data transformation and validation for GeoJSON features.

## Key Patterns

- All interactive components use `"use client"` directive
- Pure React state management (no Redux/Zustand) — state lives in QuizController
- CSS Modules for component-scoped styling; global styles in `src/app/globals.css`
- Path alias: `@/*` maps to `./src/*` (configured in jsconfig.json)
- JavaScript only (no TypeScript)
