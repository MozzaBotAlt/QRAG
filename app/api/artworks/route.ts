import { NextResponse } from 'next/server'

const artworks = [
  { id: 'QAW-001', title: 'Blue Hour, Reassembled', artist: 'Mina Okafor', year: '2024', medium: 'Pigment, acrylic, found light', description: 'A study in the quiet tension between geometry and gesture. Okafor layers color like a signal searching for its source.', image: '/art-aurora.png', accent: 'cyan' },
  { id: 'QAW-002', title: 'Soft Systems', artist: 'Jules Renard', year: '2023', medium: 'Ink, oil stick on canvas', description: 'A visual conversation between precise marks and instinctive movement, made for the spaces in between.', image: '/art-echo.png', accent: 'coral' },
  { id: 'QAW-003', title: 'Tidal Memory', artist: 'Aya Watanabe', year: '2025', medium: 'Screenprint, digital collage', description: 'Watanabe maps the rhythm of a changing coastline through saturated color and repeating organic forms.', image: '/art-tide.png', accent: 'lime' },
]

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')?.trim().toUpperCase()
  const artwork = artworks.find((item) => item.id === id)
  return artwork ? NextResponse.json(artwork) : NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
}
