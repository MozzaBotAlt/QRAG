const gallery = document.querySelector('#artwork-grid')
const status = document.querySelector('#gallery-status')

function artworkImage(artwork) {
  return artwork.image_url || artwork.image || ''
}

function showEmpty(message) {
  const notice = document.createElement('p')
  notice.className = 'empty-state'
  notice.textContent = message
  gallery.replaceChildren(notice)
}

function makeCard(artwork) {
  const card = document.createElement('article')
  card.className = 'artwork-card'
  const image = document.createElement('img')
  image.src = artworkImage(artwork)
  image.alt = artwork.title || 'Student artwork'
  image.loading = 'lazy'
  image.addEventListener('error', () => { image.hidden = true }, { once: true })

  const copy = document.createElement('div')
  copy.className = 'card-copy'
  const title = document.createElement('h3')
  title.textContent = artwork.title || 'Untitled artwork'
  const description = document.createElement('p')
  description.textContent = artwork.description || 'No description provided.'
  const link = document.createElement('a')
  link.textContent = 'View artwork ↗'
  link.href = `/artwork.html?id=${encodeURIComponent(artwork.qr_id || artwork.id || '')}`
  copy.append(title, description, link)
  card.append(image, copy)
  return card
}

async function loadGallery() {
  try {
    const response = await fetch('/api/artworks', { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`Gallery request failed (${response.status})`)
    const result = await response.json()
    const artworks = Array.isArray(result) ? result : result.artworks
    if (!Array.isArray(artworks)) throw new Error('The gallery response must be a list of artworks.')
    if (artworks.length === 0) {
      status.textContent = 'No artwork has been shared yet.'
      showEmpty('Be the first to add artwork to the archive.')
      return
    }
    gallery.replaceChildren(...artworks.map(makeCard))
    status.textContent = `${artworks.length} ${artworks.length === 1 ? 'work' : 'works'} in the archive`
  } catch (error) {
    status.textContent = 'The gallery could not be loaded.'
    showEmpty(error instanceof Error ? error.message : 'Please try again later.')
  }
}

loadGallery()
