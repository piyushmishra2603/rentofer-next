# Rentofer Next — Scaffold

This branch (scaffold/next-migration) adds a production-ready Next.js + TypeScript + Tailwind scaffold and converts the homepage into the App Router structure. It also preserves the original page-level CSS (see public/original-index.css) to keep visual parity during the migration.

What I added
- Next.js 15 + TypeScript scaffold
- Tailwind + PostCSS configuration
- Global stylesheet (styles/globals.css) which imports the original site CSS
- App Router root layout and a converted homepage (app/page.tsx)
- Reusable components: Header, Hero, Footer, Cursor, ProgressBar
- Utility: classnames helper, useToggle hook, basic types

Run locally
1. npm install
2. npm run dev

Notes & next steps
- I kept the original CSS in public/original-index.css to preserve visuals exactly. Next step is to progressively refactor styles into Tailwind utility classes and break out components for categories, services, FAQ, blog, etc.
- I will migrate remaining pages incrementally in separate PRs and replace inline scripts with typed services/hooks.
