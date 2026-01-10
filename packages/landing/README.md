# Wish Master Landing Page

Landing page for Wish Master application built with Astro and React.

## Tech Stack

- **Astro 5.x** - Static site generator with React islands
- **React 18** - For interactive components (Header with mobile menu)
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library

## Development

```bash
# From monorepo root
npm run dev:landing

# Or from this directory
npm run dev
```

The development server will start at http://localhost:4321

## Build

```bash
# From monorepo root
npm run build:landing

# Or from this directory
npm run build
```

The static build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Astro and React components
│   ├── Header.tsx    # Interactive header (React island)
│   ├── Button.tsx    # Button component
│   ├── Hero.astro    # Hero section
│   ├── HowItWorks.astro
│   ├── Features.astro
│   ├── CTA.astro
│   └── Footer.astro
├── layouts/
│   └── Layout.astro  # Base HTML layout
├── pages/
│   └── index.astro   # Main landing page
└── styles/
    └── global.css    # Global styles with Tailwind
```
