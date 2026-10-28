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

## Camera scanning

Use **USE CAMERA** on a secure origin (`https://` or localhost), then allow camera access when the browser asks. The scanner uses the browser's native `BarcodeDetector` API. If unsupported, enter the work ID manually.

## Connect your backend

Copy `.env.example` to `.env.local` and set:

```bash
ART_BACKEND_URL=https://your-backend.example.com/artworks
```

Your endpoint receives `?id=QAW-001` and should return JSON containing `id`, `title`, `artist`, `year`, `medium`, `description`, `image`, and `accent`. The local route proxies this request, so the backend URL stays server-side.
