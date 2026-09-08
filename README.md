# Next.js + Sanity Template

Reusable starter for building responsive websites with Next.js, TypeScript, CSS Modules, Sanity, and pnpm.

## Requirements

- Node.js 20.9 or newer
- pnpm 11
- A Sanity account and project

## Project structure

```text
.
├── web/       Next.js frontend
├── studio/    Standalone Sanity Studio
└── package.json
```

## Installation

Install dependencies from the project root:

```bash
pnpm install
```

If pnpm asks to approve the `esbuild` build script:

```bash
pnpm approve-builds
```

Select `esbuild` and approve it.

## Environment variables

Copy:

```text
web/.env.example → web/.env.local
studio/.env.example → studio/.env.local
```

Configure the frontend:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-08-17
```

Configure the Studio:

```env
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_TITLE=Project Studio
```

Local environment files are ignored by Git.

## Sanity setup

Create or select a project at [Sanity Manage](https://www.sanity.io/manage).

Add this development URL to the project’s CORS origins:

```text
http://localhost:3000
```

Then generate the Sanity types:

```bash
pnpm run typegen
```

Run TypeGen again whenever schemas or GROQ queries change.

## Development

Start the frontend:

```bash
pnpm run dev:web
```

Start Sanity Studio in another terminal:

```bash
pnpm run dev:studio
```

The default URLs are:

- Frontend: `http://localhost:3000`
- Studio: `http://localhost:3333`

## Initial content

In Sanity Studio:

1. Open **Site Settings**.
2. Enter the site title and URL.
3. Add the default SEO information.
4. Publish the document.
5. Create and publish pages with unique slugs.

A page with the slug `about` is available at:

```text
http://localhost:3000/about
```

Content stored in Sanity is not included when this repository is cloned.

## Available commands

```bash
pnpm run dev:web
pnpm run dev:studio
pnpm run typegen
pnpm run lint:web
pnpm run build:web
pnpm run build:studio
```

## Final verification

Before using or publishing the template:

```bash
pnpm run typegen
pnpm run lint:web
pnpm run build:web
pnpm run build:studio
```

## Template scope

The template includes:

- Next.js App Router
- TypeScript
- CSS Modules
- Standalone Sanity Studio
- Live published-content updates
- Sanity TypeGen
- Site Settings singleton
- Dynamic page routes
- Global and page-specific SEO
- Accessible Sanity images

Design-specific components, page sections, navigation, Portable Text, and Visual Editing should be added separately for each project.
