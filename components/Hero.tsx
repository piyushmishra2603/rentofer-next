'use client'
import React from 'react'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-slides" aria-hidden />
      <div className="hero-overlay" />
      <div className="hero-bg" />
      <div className="hero-spark" />

      <div className="h-eye"><span className="live-dot" />AI-Powered · Zero Brokerage · India</div>

      <h1 className="h-title">Find Your<br /><em>Perfect Rental</em></h1>
      <div className="h-sub-serif">Homes that feel like home.</div>
      <p className="h-desc">Discover verified PGs, hostels, flats &amp; co-living spaces across India — intelligently matched to your commute, budget and lifestyle. Zero brokerage, always.</p>

      <div className="h-search">
        <div className="h-search-inner">
          <div className="h-search-field"><span className="h-search-ic">📍</span><input className="h-search-input" placeholder="City or locality" aria-label="City or locality" /></div>
          <div className="h-search-divider" />
          <div className="h-search-field"><span className="h-search-ic">🏠</span><input className="h-search-input" placeholder="PG, flat, co-living…" aria-label="Property type" /></div>
          <a className="h-search-btn" href="/properties">🔍 Search</a>
        </div>
      </div>

      <div className="hero-ctas">
        <a className="h-btn-main" href="/properties">🏠 Browse Rentals</a>
        <a className="h-btn-sec" href="/services">🔧 Explore Services</a>
        <a className="h-btn-sec" href="/post/property">✦ List Property Free</a>
      </div>

      <div className="trust-float">
        <div className="tf-card">✅ KYC Verified Owners</div>
        <div className="tf-card">⚡ Zero Brokerage</div>
        <div className="tf-card">🤖 AI Matched</div>
        <div className="tf-card">🔒 Secure Platform</div>
        <div className="tf-card">📞 Direct Connect</div>
      </div>

      <div className="h-stats">
        <div className="stats-inner">
          <div className="hst"><div className="hst-v">—</div><div className="hst-l">Live Properties</div></div>
          <div className="hst"><div className="hst-v">—</div><div className="hst-l">Verified Owners</div></div>
          <div className="hst"><div className="hst-v">15+</div><div className="hst-l">Cities Covered</div></div>
          <div className="hst"><div className="hst-v">₹0</div><div className="hst-l">Brokerage Fee</div></div>
        </div>
      </div>

    </section>
  )
}
