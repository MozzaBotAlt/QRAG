# QR Art World

A futuristic art archive that identifies artwork from QR-style work IDs and retrieves creator, image, medium, and description details from a Next.js backend route.

## Included

- Responsive art-themed home screen
- Work lookup flow using `/api/artworks?id=QAW-001`
- Artwork cards with detail modal
- Mobile-first navigation and accessible labels
- Generated artwork assets in `public/`

## Demo IDs

`QAW-001`, `QAW-002`, and `QAW-003`

## Run

```bash
pnpm install
pnpm dev
```

The artwork catalog currently lives in `app/api/artworks/route.ts`, making it easy to replace the in-memory collection with a database or CMS later.
