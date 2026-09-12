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

To populate a new dataset with the portfolio's starter content and images, authenticate
the Sanity CLI and run the idempotent seed script:

```bash
pnpm run seed
```

Running it again updates the same singleton and slug-based documents instead of creating
duplicates. Review the placeholder site URL, email address, and social links in Site
Settings before publishing.

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

The Studio is organized around seven singleton settings/pages plus two document lists:

- Site Settings: name, role, site URL, social links, time zone, and default SEO
- Home, Projects, Archive, About, Contact, and Cells page settings
- Projects and Archive Projects

Editable copy is localized in Spanish and English. The frontend language switcher stores
the selected language in an HTTP-only cookie and falls back to Spanish when a translation
is missing.

Project disciplines are simple labels, not category references. Project and archive media
are image-only galleries; the first gallery image is automatically used by listings, so
there is no separate preview-image field. Projects can optionally link to a live website or
source code.

When Sanity environment variables are absent, the frontend uses the checked-in fallback
content so local development still renders. Sanity remains the source of truth once valid
project and dataset values are configured.

## Editorial preview

The Studio Presentation tool opens the frontend and resolves previews for every singleton,
project, and archive project. Draft Mode is enabled through `/api/draft-mode/enable` and
requires `SANITY_API_READ_TOKEN` in `web/.env.local` to read private drafts. Add both the
local frontend origin and the deployed frontend origin to the Sanity project's CORS list
with credentials enabled.
