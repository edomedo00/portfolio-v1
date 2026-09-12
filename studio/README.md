# Portfolio Content Studio

Standalone Sanity Studio for the portfolio. It contains fixed editors for Site Settings,
Home, Projects, Archive, About, Contact, and Cells, plus reusable Project and Archive
Project documents.

## Content rules

- Spanish and English text is edited inline with `sanity-plugin-internationalized-array`.
- Project disciplines are free-form string labels; there is no category taxonomy.
- Project and archive galleries accept images only.
- The first gallery image is the listing image; there is no separate preview image.
- External website and source-code links are optional URL fields.
- The legacy generic Page schema remains registered for data compatibility but is hidden
  from the Studio structure.

## Commands

From the repository root:

```bash
pnpm run dev:studio
pnpm run typegen
pnpm run seed
pnpm run build:studio
```

The seed command uses the authenticated Sanity CLI user and can safely be rerun. Configure
`studio/.env.local` from `studio/.env.example` before starting the Studio.
