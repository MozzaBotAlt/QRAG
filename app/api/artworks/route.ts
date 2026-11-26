import { NextResponse } from 'next/server'

const artworks = [
  { id: 'QAW-001', title: 'Blue Hour, Reassembled', artist: 'Mina Okafor', year: '2024', medium: 'Pigment, acrylic, found light', description: 'A study in the quiet tension between geometry and gesture. Okafor layers color like a signal searching for its source.', image: '/art-aurora.png', accent: 'cyan' },
  { id: 'QAW-002', title: 'Soft Systems', artist: 'Jules Renard', year: '2023', medium: 'Ink, oil stick on canvas', description: 'A visual conversation between precise marks and instinctive movement, made for the spaces in between.', image: '/art-echo.png', accent: 'coral' },
  { id: 'QAW-003', title: 'Tidal Memory', artist: 'Aya Watanabe', year: '2025', medium: 'Screenprint, digital collage', description: 'Watanabe maps the rhythm of a changing coastline through saturated color and repeating organic forms.', image: '/art-tide.png', accent: 'lime' },
]

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.trim()
  const backendUrl = process.env.ART_BACKEND_URL?.trim()

  if (backendUrl) {
    try {
      const url = new URL(backendUrl)
      if (id) url.searchParams.set('id', id)
      const upstream = await fetch(url, { cache: 'no-store' })
      return new NextResponse(await upstream.text(), { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' } })
    } catch (error) {
      console.error('Artwork backend GET failed', error)
      return NextResponse.json({ error: 'Artwork backend unavailable' }, { status: 502 })
    }
  }

  if (!id) {
    return NextResponse.json(artworks.map((artwork) => ({
      qr_id: artwork.id,
      title: artwork.title,
      description: artwork.description,
      image_url: artwork.image,
    })))
  }

  const artwork = artworks.find((item) => item.id === id.toUpperCase())
  return artwork ? NextResponse.json({
    ...artwork,
    qr_id: artwork.id,
    image_url: artwork.image,
  }) : NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
}

export async function POST(request: Request) {
  const backendUrl = process.env.ART_BACKEND_URL?.trim()
  if (!backendUrl) {
    return NextResponse.json({ error: 'Artwork uploads are not configured' }, { status: 503 })
  }

  try {
    const upstream = await fetch(backendUrl, {
      method: 'POST',
      body: await request.formData(),
    })
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    })
  } catch (error) {
    console.error('Artwork backend POST failed', error)
    return NextResponse.json({ error: 'Artwork backend unavailable' }, { status: 502 })
  }
}
