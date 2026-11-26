const status = document.querySelector('#artwork-status')
const detail = document.querySelector('#artwork-detail')
const backLink = document.querySelector('#back-to-gallery')

async function loadArtwork() {
  const qrId = new URLSearchParams(window.location.search).get('id')?.trim()
  if (!qrId) {
    status.textContent = 'This artwork link is missing its QR ID.'
    status.classList.add('error')
    backLink.hidden = false
    return
  }

  try {
    const response = await fetch(`/api/artworks?id=${encodeURIComponent(qrId)}`, {
      headers: { Accept: 'application/json' },
    })
    const artwork = await response.json()
    if (!response.ok) throw new Error(artwork.error || 'Artwork not found.')
    const imageUrl = artwork.image_url || artwork.image
    if (!imageUrl || !artwork.qr_id) throw new Error('The artwork record is incomplete.')

    document.title = `${artwork.title || 'Artwork'} — Student Art Archive`
    document.querySelector('#detail-id').textContent = `QR ID / ${artwork.qr_id}`
    document.querySelector('#detail-title').textContent = artwork.title || 'Untitled artwork'
    document.querySelector('#detail-description').textContent = artwork.description || 'No description provided.'
    const image = document.querySelector('#detail-image')
    image.src = imageUrl
    image.alt = artwork.title || 'Student artwork'
    image.addEventListener('error', () => {
      detail.hidden = true
      status.hidden = false
      status.textContent = 'The artwork image could not be loaded.'
      status.classList.add('error')
      backLink.hidden = false
    }, { once: true })
    detail.hidden = false
    status.hidden = true
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Artwork could not be loaded.'
    status.classList.add('error')
    backLink.hidden = false
  }
}

loadArtwork()
