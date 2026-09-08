# Portfolio v1

Personal portfolio monorepo with a Next.js frontend and a standalone Sanity Studio.

## Requirements

- Node.js 22.12 or newer
- pnpm 11.9
- A Sanity project and dataset

## Workspace

```text
.
├── web/       Next.js frontend
└── studio/    Standalone Sanity Studio
```

## Setup

Install dependencies from the project root:

```bash
pnpm install
```

Copy the environment examples and add the credentials for your Sanity project:

```text
web/.env.example → web/.env.local
studio/.env.example → studio/.env.local
```

Add `http://localhost:3000` to the Sanity project's CORS origins. Run TypeGen after
the environment files are configured and whenever schemas or GROQ queries change:

```bash
pnpm run typegen
```

## Development

Run the frontend and Studio together:

```bash
pnpm run dev
```

Or run either app separately:

```bash
pnpm run dev:web
pnpm run dev:studio
```

- Frontend: `http://localhost:3000`
- Studio: `http://localhost:3333`

## Quality checks

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run check
```

The builds that access Sanity require the local environment files to be configured.

## Design foundation

The global tokens live in `web/src/app/globals.css`.

- Colors: black, white, grid dark, and grid dark accent
- Desktop grid: 12 columns, 2.5rem page margins, 1.25rem gutters
- Mobile grid: 4 columns, 1.25rem page margins, 1rem gutters
- Display type: Montreal Regular
- Body and navigation type: PP Neue Montreal Mono Book

The fonts are self-hosted through `next/font/local`. Confirm their licenses before a public
deployment or distribution of this repository.

## Content

Sanity content is not stored in this repository. Use Site Settings for global metadata and
create pages with unique slugs in the Studio.
