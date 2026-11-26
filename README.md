# Student Art Archive

A lightweight student artwork archive. The existing Next.js site remains available at `/`; the plain HTML, CSS, and JavaScript pages are `/index.html`, `/upload.html`, and `/artwork.html`. Uploads are compressed in the browser, stored as hosted image URLs, and recorded as metadata in Postgres.

## Run the frontend

```bash
pnpm install
pnpm dev
```

Set `ART_BACKEND_URL` in `.env.local` to the full Express artwork endpoint, for example `https://your-backend.example.com/api/artworks`. The Next.js `/api/artworks` route proxies gallery reads, QR ID lookups, and multipart uploads, so browser pages use a same-origin API.

## Connect an existing Express + Neon backend

1. Apply [`backend/schema.sql`](backend/schema.sql) to the Neon database.
2. Copy [`backend/artworks-router.js`](backend/artworks-router.js) into or import it from the Express backend. The backend needs `express`, `multer`, `pg`, and `cloudinary` (use existing installed dependencies where available).
3. Configure the existing Postgres pool and Cloudinary client using server-side credentials, then mount the router:

   ```js
   const { Pool } = require('pg')
   const cloudinary = require('cloudinary').v2
   const { createArtworkRouter } = require('./artworks-router')

   const pool = new Pool({ connectionString: process.env.DATABASE_URL })
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   })

   app.use('/api/artworks', createArtworkRouter({ pool, cloudinary }))
   ```

4. Configure the Express deployment with `DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Optionally set `CLOUDINARY_FOLDER`. Configure the frontend's `ART_BACKEND_URL` to that mounted route.

The feed returns up to 200 newest records as an array. `GET /api/artworks?id=<qr_id>` returns one record; `POST /api/artworks` accepts multipart fields `title`, `description`, and `image`, and responds with the saved row including its generated `qr_id`. Image bytes go to Cloudinary; only `image_url` and artwork metadata are stored in Postgres. Never expose database or Cloudinary secrets in frontend code.

The upload page downsizes images to at most 1800 pixels and JPEG quality 0.82 before sending them. QR generation uses qrcodejs from a public CDN; downloading the QR or printing its label happens in the browser.
