'use client'
import React from 'react'

export default function Header() {
  return (
    <nav className="nav" id="navbar">
      <a href="/" className="nav-brand">
        <div className="nav-gem">💎</div>
        <div className="nav-wordmark">
          <div style={{display:'flex',alignItems:'baseline',gap:4}}>
            <span className="nw-sr">SmartRent</span>
            <span className="nw-ai">AI</span>
          </div>
        </div>
      </a>

      <div className="nav-links">
        <div className="nav-dd">
          <button className="nav-dd-btn">Browse Rentals <svg viewBox="0 0 10 6" width={12} height={8}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          <div className="nav-dd-panel">
            <a className="dd-item" href="/pgs-hostels">🏠 PG &amp; Hostels</a>
            <a className="dd-item" href="/properties">🏡 Flats &amp; Apartments</a>
            <a className="dd-item" href="/properties">🤝 Co-living Spaces</a>
            <div className="dd-sep" />
            <a className="dd-item" href="/commercial">🏪 Commercial</a>
          </div>
        </div>

        <div className="nav-dd">
          <button className="nav-dd-btn" style={{color:'var(--teal)',fontWeight:700}}>🔧 Services <svg viewBox="0 0 10 6" width={12} height={8}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          <div className="nav-dd-panel">
            <a className="dd-item svc" href="/services">🔧 Plumber</a>
            <a className="dd-item svc" href="/services">⚡ Electrician</a>
            <a className="dd-item svc" href="/services">🪚 Carpenter</a>
          </div>
        </div>

        <a className="nav-a" href="/post/property">List Property <span className="nav-badge">FREE</span></a>
        <a className="nav-a" href="/plans">Pricing</a>
      </div>

      <div className="nav-right">
        <a className="nb nb-gh" href="/login" style={{textDecoration:'none'}} id="navSignIn">Sign In</a>
        <a className="nb nb-gold" href="/post/property" style={{textDecoration:'none'}} id="navListBtn">+ List Property</a>

        <div className="nav-user-pill" id="navUserPill" style={{display:'none'}}>
          <div className="nav-av" id="navAv" title="My Dashboard">P</div>
          <span id="navUserName">User</span>
        </div>
        <button className="nb nb-logout" id="navLogout" style={{display:'none'}}>🚪 Sign Out</button>

        <button className="mob-btn" id="mobBtn" aria-label="Toggle menu">☰</button>
      </div>
    </nav>
  )
}
