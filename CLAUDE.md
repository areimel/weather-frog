# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `pnpm dev` — start dev server (localhost:3000)
- `pnpm build` — production build
- `pnpm lint` — run ESLint (flat config, eslint.config.mjs)

## Stack

- **Next.js 16** with App Router (React 19, TypeScript, Tailwind CSS v4)
- Path alias: `@/*` maps to repo root
- Tailwind via PostCSS (`@tailwindcss/postcss`); theme tokens defined inline in `app/globals.css` using `@theme inline`
- Fonts: Geist Sans + Geist Mono loaded via `next/font/google`, exposed as CSS variables

## Project Context

Weather web app using Google WeatherFrog artwork. The frog images live in `frog-images-src/` (not served directly):
- `frog-images-src/square/` — ~295 layered PNGs (separate `_bg`, `_mg`, `_fg` layers per scene)
- `frog-images-src/wide/` — ~120 composite PNGs (some have `_c`/`_f` variants)
- Naming convention: `{weather-code}-{condition}-{location}-{activity}[_layer].png` (e.g., `01-sunny-beach-reading_fg.png`)

The app is in early scaffolding — `app/page.tsx` still has the default create-next-app template.
