const form = document.querySelector('#artwork-form')
const imageInput = document.querySelector('#image')
const preview = document.querySelector('#image-preview')
const statusMessage = document.querySelector('#upload-status')
const submitButton = document.querySelector('#submit-button')
const resultPanel = document.querySelector('#qr-result')
const qrElement = document.querySelector('#qr-code')
const qrTitle = document.querySelector('#qr-art-title')
const qrId = document.querySelector('#qr-art-id')
const openArtwork = document.querySelector('#open-artwork')
let previewUrl = ''
let artworkUrl = ''

function setStatus(message, isError = false) {
  statusMessage.textContent = message
  statusMessage.classList.toggle('error', isError)
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('This image could not be opened.'))
    }
    image.src = url
  })
}

async function compressImage(file) {
  const image = await loadImage(file)
  const maxDimension = 1800
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Your browser could not prepare the image.')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
  if (!blob) throw new Error('Your browser could not compress the image.')
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'artwork'}.jpg`, { type: 'image/jpeg' })
}

function getQrImage() {
  const canvas = qrElement.querySelector('canvas')
  if (canvas) return canvas.toDataURL('image/png')
  const image = qrElement.querySelector('img')
  return image?.src || ''
}

imageInput.addEventListener('change', () => {
  const file = imageInput.files?.[0]
  if (previewUrl) URL.revokeObjectURL(previewUrl)
  preview.replaceChildren()
  preview.hidden = !file
  if (!file) return
  previewUrl = URL.createObjectURL(file)
  const image = document.createElement('img')
  image.src = previewUrl
  image.alt = 'Selected artwork preview'
  preview.append(image)
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const file = imageInput.files?.[0]
  if (!file) {
    setStatus('Choose an image before uploading.', true)
    return
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    setStatus('Choose a JPEG, PNG, or WebP image.', true)
    return
  }
  if (!window.QRCode) {
    setStatus('The QR code library did not load. Check your connection and try again.', true)
    return
  }

  submitButton.disabled = true
  resultPanel.hidden = true
  setStatus('Compressing image and saving your artwork…')
  try {
    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.set('title', form.elements.title.value.trim())
    formData.set('description', form.elements.description.value.trim())
    formData.set('image', compressed, compressed.name)

    const response = await fetch('/api/artworks', { method: 'POST', body: formData })
    const record = await response.json()
    if (!response.ok) throw new Error(record.error || `Upload failed (${response.status}).`)
    if (!record.qr_id) throw new Error('The server saved the artwork but did not return its QR ID.')

    artworkUrl = new URL('/artwork.html', window.location.href)
    artworkUrl.searchParams.set('id', record.qr_id)
    qrElement.replaceChildren()
    new QRCode(qrElement, {
      text: artworkUrl.href,
      width: 200,
      height: 200,
      correctLevel: QRCode.CorrectLevel.H,
    })
    qrTitle.textContent = record.title || form.elements.title.value.trim()
    qrId.textContent = record.qr_id
    openArtwork.href = artworkUrl.href
    resultPanel.hidden = false
    setStatus('Artwork added. Your QR label is ready.')
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Artwork upload failed. Please try again.', true)
  } finally {
    submitButton.disabled = false
  }
})

document.querySelector('#download-qr').addEventListener('click', () => {
  const dataUrl = getQrImage()
  if (!dataUrl) {
    setStatus('The QR image is not ready to download.', true)
    return
  }
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${qrId.textContent || 'artwork'}-qr.png`
  link.click()
})

document.querySelector('#print-qr').addEventListener('click', () => window.print())
