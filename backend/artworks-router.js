const { randomUUID } = require('node:crypto')
const express = require('express')
const multer = require('multer')

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
})

function uploadToCloudinary(cloudinary, buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'student-artwork',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error)
        else if (!result?.secure_url || !result.public_id) reject(new Error('Image hosting returned an incomplete result.'))
        else resolve(result)
      },
    )
    stream.end(buffer)
  })
}

function createArtworkRouter({ pool, cloudinary }) {
  if (!pool || !cloudinary) throw new Error('Artwork router requires a Postgres pool and configured Cloudinary client.')
  const router = express.Router()

  router.get('/', async (request, response) => {
    try {
      const qrId = request.query.id?.trim()
      if (qrId) {
        const result = await pool.query(
          'SELECT qr_id, title, description, image_url, created_at FROM artworks WHERE qr_id = $1',
          [qrId],
        )
        if (result.rowCount === 0) return response.status(404).json({ error: 'Artwork not found.' })
        return response.json(result.rows[0])
      }

      const result = await pool.query(
        'SELECT qr_id, title, description, image_url, created_at FROM artworks ORDER BY created_at DESC LIMIT 200',
      )
      return response.json(result.rows)
    } catch (error) {
      console.error('Artwork feed query failed', error)
      return response.status(500).json({ error: 'Could not load artworks.' })
    }
  })

  router.post('/', upload.single('image'), async (request, response) => {
    const title = request.body.title?.trim()
    const description = request.body.description?.trim() || ''
    const file = request.file

    if (!title || title.length > 160) return response.status(400).json({ error: 'Title is required and must be 160 characters or fewer.' })
    if (description.length > 5000) return response.status(400).json({ error: 'Description must be 5000 characters or fewer.' })
    if (!file) return response.status(400).json({ error: 'An artwork image is required.' })
    if (!allowedImageTypes.has(file.mimetype)) {
      return response.status(400).json({ error: 'Image must be a JPEG, PNG, or WebP file.' })
    }

    let hostedImage
    try {
      hostedImage = await uploadToCloudinary(cloudinary, file.buffer)
      const qrId = randomUUID()
      try {
        const result = await pool.query(
          'INSERT INTO artworks (qr_id, title, description, image_url) VALUES ($1, $2, $3, $4) RETURNING qr_id, title, description, image_url, created_at',
          [qrId, title, description, hostedImage.secure_url],
        )
        return response.status(201).json(result.rows[0])
      } catch (error) {
        try {
          await cloudinary.uploader.destroy(hostedImage.public_id, { resource_type: 'image' })
        } catch (cleanupError) {
          console.error('Could not remove unreferenced hosted artwork image', cleanupError)
        }
        throw error
      }
    } catch (error) {
      console.error('Artwork upload failed', error)
      return response.status(500).json({ error: 'Could not save artwork. Please try again.' })
    }
  })

  router.use((error, request, response, next) => {
    if (error instanceof multer.MulterError) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
      return response.status(status).json({
        error: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 12 MB or smaller.' : 'Invalid image upload.',
      })
    }
    console.error('Artwork route failed', error)
    return response.status(500).json({ error: 'Artwork request failed.' })
  })

  return router
}

module.exports = { createArtworkRouter }
