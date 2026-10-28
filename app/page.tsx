'use client'

import { useState } from 'react'
import { ArrowUpRight, Camera, CircleHelp, Menu, ScanLine, Sparkles, X } from 'lucide-react'

type Artwork = { id: string; title: string; artist: string; year: string; medium: string; description: string; image: string; accent: string }

const fallbackArt: Artwork[] = [
  { id: 'QAW-001', title: 'Blue Hour, Reassembled', artist: 'Mina Okafor', year: '2024', medium: 'Pigment, acrylic, found light', description: 'A study in the quiet tension between geometry and gesture. Okafor layers color like a signal searching for its source.', image: '/art-aurora.png', accent: 'cyan' },
  { id: 'QAW-002', title: 'Soft Systems', artist: 'Jules Renard', year: '2023', medium: 'Ink, oil stick on canvas', description: 'A visual conversation between precise marks and instinctive movement, made for the spaces in between.', image: '/art-echo.png', accent: 'coral' },
  { id: 'QAW-003', title: 'Tidal Memory', artist: 'Aya Watanabe', year: '2025', medium: 'Screenprint, digital collage', description: 'Watanabe maps the rhythm of a changing coastline through saturated color and repeating organic forms.', image: '/art-tide.png', accent: 'lime' },
]

export default function Page() {
  const [artworks, setArtworks] = useState<Artwork[]>(fallbackArt)
  const [selected, setSelected] = useState<Artwork | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  async function lookup(value: string) {
    const clean = value.trim().toUpperCase()
    if (!clean) return
    setMessage('Querying the archive…')
    try {
      const response = await fetch(`/api/artworks?id=${encodeURIComponent(clean)}`)
      if (!response.ok) throw new Error('Not found')
      const artwork = await response.json()
      setSelected(artwork)
      setMessage('Artwork identified.')
    } catch {
      setMessage('No artwork matched that code. Try QAW-001, QAW-002, or QAW-003.')
    }
  }

  function demoScan(id: string) {
    setCode(id)
    lookup(id)
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a href="#top" className="wordmark" aria-label="QR Art World home"><span className="mark">/</span><span>QR ART<br /><b>WORLD</b></span></a>
        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
          <a href="#scan" onClick={() => setMenuOpen(false)}>Scan a work</a>
          <a href="#gallery" onClick={() => setMenuOpen(false)}>The archive</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section id="top" className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> DIGITAL ART INDEX / 01</p>
          <h1>Every work<br /><em>has a signal.</em></h1>
          <p className="hero-intro">Scan the mark. Meet the maker. QR Art World connects the art on your wall to the story behind it.</p>
          <a className="text-link" href="#scan">Enter the archive <ArrowUpRight /></a>
        </div>
        <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><ScanLine /></div><span>SCAN<br />TO<br />KNOW</span></div>
        <div className="hero-index">001<br /><span>NEW VISIONS<br />IN PUBLIC VIEW</span></div>
      </section>

      <section id="scan" className="scanner-section">
        <div className="section-label"><span>01</span><span>IDENTIFY A WORK</span></div>
        <div className="scanner-grid">
          <div className="scanner-card">
            <div className="scanner-visual"><div className="scan-corners" /><div className="scan-line" /><Camera /></div>
            <div className="scanner-details"><div><p className="eyebrow">READY TO DISCOVER?</p><h2>Point your camera<br />at the QR mark.</h2></div><p className="scanner-note">Your browser camera can scan supported QR codes. Or enter a work ID below.</p></div>
            <div className="lookup-row"><label htmlFor="art-code">WORK ID</label><input id="art-code" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) lookup(code) }} placeholder="QAW-001" /><button onClick={() => lookup(code)}>LOOK UP <ArrowUpRight /></button></div>
            {message && <p className="form-message" role="status">{message}</p>}
          </div>
          <aside className="how-it-works"><p className="eyebrow">HOW IT WORKS</p><div className="step"><span>01</span><p><b>SCAN</b><br />Find the QR mark beside a work.</p></div><div className="step"><span>02</span><p><b>CONNECT</b><br />The archive recognizes its unique ID.</p></div><div className="step"><span>03</span><p><b>LOOK CLOSER</b><br />Meet the artist and read the story.</p></div><div className="micro-note"><CircleHelp /> No app download. Just curiosity.</div></aside>
        </div>
      </section>

      <section id="gallery" className="gallery-section">
        <div className="section-heading"><div><p className="eyebrow">02 / THE ARCHIVE</p><h2>Recent signals</h2></div><p>Three works. Three voices.<br />One living collection.</p></div>
        <div className="art-grid">{artworks.map((art, index) => <button className={`art-card accent-${art.accent}`} key={art.id} onClick={() => setSelected(art)}><span className="art-number">0{index + 1}</span><img src={art.image} alt={art.title} /><span className="art-meta"><b>{art.title}</b><small>{art.artist} / {art.year}</small></span><ArrowUpRight className="card-arrow" /></button>)}</div>
      </section>

      <section id="about" className="about-section"><div className="section-label"><span>03</span><span>WHY THIS EXISTS</span></div><h2>Art should never<br /><em>lose its context.</em></h2><p>QR Art World is a small, open index for the people, process, and perspective hidden behind the finished image.</p><a className="text-link" href="#scan">Start exploring <ArrowUpRight /></a></section>

      <footer><a href="#top" className="wordmark"><span className="mark">/</span><span>QR ART<br /><b>WORLD</b></span></a><p>THE ARTWORK IS THE MESSAGE.<br />THE QR IS THE INVITATION.</p><span>© 2025 / QAW</span></footer>

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><article className="art-modal" role="dialog" aria-modal="true" aria-label={`${selected.title} by ${selected.artist}`} onClick={(e) => e.stopPropagation()}><button className="close-modal" onClick={() => setSelected(null)} aria-label="Close artwork details"><X /></button><img src={selected.image} alt={selected.title} /><div className="modal-copy"><p className="eyebrow">{selected.id} / ARTWORK IDENTIFIED</p><h2>{selected.title}</h2><p className="artist-name">{selected.artist} <span>/{selected.year}</span></p><p>{selected.description}</p><small>{selected.medium}</small></div></article></div>}
    </main>
  )
}
