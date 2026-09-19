"use client";

import { useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import "./page.css";

const BODY_HTML = `
<div class="bg-tex"></div>
<div class="bg-orb o1"></div>
<div class="bg-orb o2"></div>
<div class="bg-orb o3"></div>

<div class="toast" id="toast"></div>

<div class="modal-bg" id="bookingModal">
  <div class="modal-box">
    <div class="modal-head">
      <div class="mh-close" onclick="closeModal('bookingModal')">✕</div>
      <div class="mh-tag">⚡ Book Electrician</div>
      <div class="mh-title" id="bmTitle">Book an Electrician</div>
      <div class="mh-sub" id="bmSub">The electrician will confirm your booking within 1 hour.</div>
    </div>
    <div class="modal-body">
      <div class="mf-provider">
        <div class="mf-av" id="bmAv">E</div>
        <div style="flex:1">
          <div class="mf-name" id="bmName">Provider</div>
          <div class="mf-loc"  id="bmLoc">📍 Location</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--ink)" id="bmPrice">₹—</div>
          <div style="font-size:10px;color:var(--ink5);font-family:'JetBrains Mono',monospace" id="bmPriceNote">onwards</div>
        </div>
      </div>

      <div id="bookingForm">
        <label class="mf-label">Your Name <span style="color:var(--rose)">*</span></label>
        <input class="mf-input" id="bkName" placeholder="Your full name">

        <label class="mf-label">Mobile Number <span style="color:var(--rose)">*</span></label>
        <input class="mf-input" id="bkPhone" type="tel" placeholder="+91 98765 43210" oninput="this.value=this.value.replace(/[^0-9+\\s]/g,'')">

        <div class="mf-grid2">
          <div>
            <label class="mf-label">City / Area <span style="color:var(--rose)">*</span></label>
            <input class="mf-input" id="bkArea" placeholder="e.g. Kondapur">
          </div>
          <div>
            <label class="mf-label">Preferred Date <span style="color:var(--rose)">*</span></label>
            <input class="mf-input" id="bkDate" type="date">
          </div>
        </div>

        <label class="mf-label">Preferred Time Slot</label>
        <div class="mf-select-wrap">
          <select class="mf-select" id="bkTime">
            <option value="">— Select preferred time —</option>
            <option>Morning (8 AM – 11 AM)</option>
            <option>Late Morning (11 AM – 1 PM)</option>
            <option>Afternoon (1 PM – 4 PM)</option>
            <option>Evening (4 PM – 7 PM)</option>
            <option>Flexible (Any time)</option>
          </select>
        </div>

        <label class="mf-label">Electrical Work Needed <span style="color:var(--rose)">*</span></label>
        <div class="mf-select-wrap">
          <select class="mf-select" id="bkService">
            <option value="">— Select electrical work —</option>
            <option>New wiring / Rewiring</option>
            <option>Fan installation / repair</option>
            <option>Light / LED fitting</option>
            <option>Switchboard repair / replacement</option>
            <option>MCB / fuse box repair</option>
            <option>Short circuit repair</option>
            <option>Earthing / grounding</option>
            <option>Inverter / UPS installation</option>
            <option>Power socket fitting</option>
            <option>AC power point wiring</option>
            <option>CCTV / security wiring</option>
            <option>Home automation wiring</option>
            <option>Emergency electrical fault</option>
            <option>Other (specify in notes)</option>
          </select>
        </div>

        <div class="mf-safety">
          <span>⚠️</span>
          <div><strong>Safety reminder:</strong> All electrical work should comply with BIS IS:732 wiring standards. Never attempt DIY electrical repairs. Always hire a licensed electrician.</div>
        </div>

        <label class="mf-label">Describe the Issue / Additional Notes</label>
        <textarea class="mf-textarea" id="bkNote" placeholder="e.g. 'Switchboard sparks when using plug point 3', floor number, flat number, any access notes…"></textarea>

        <button class="mf-submit" id="bkSubmit" onclick="submitBooking()">⚡ Confirm Booking Request</button>
        <div class="mf-note">📞 The electrician will call you within 1 hour to confirm. <strong>No advance payment needed.</strong></div>
      </div>

      <div class="booking-success" id="bookingSuccess">
        <span class="bs-icon">✅</span>
        <div class="bs-title">Booking Confirmed!</div>
        <div class="bs-sub">Your booking request has been sent to the electrician. They will contact you within 1 hour to confirm the appointment date, time, and charges.</div>
        <div class="bs-ref" id="bsRef">REF: —</div>
        <button class="mf-submit" onclick="closeModal('bookingModal')" style="margin-bottom:0">✓ Done</button>
      </div>
    </div>
  </div>
</div>

<div class="modal-bg" id="ratingModal">
  <div class="modal-box" style="max-width:420px">
    <div class="modal-head">
      <div class="mh-close" onclick="closeModal('ratingModal')">✕</div>
      <div class="mh-tag">Rate Electrician</div>
      <div class="mh-title">Leave a Review</div>
      <div class="mh-sub" id="rateProviderName">Help others choose the right electrician.</div>
    </div>
    <div class="modal-body">
      <div class="rate-stars" id="rateStars">
        <span class="rate-star" data-v="1" onclick="setRating(1)">⭐</span>
        <span class="rate-star" data-v="2" onclick="setRating(2)">⭐</span>
        <span class="rate-star" data-v="3" onclick="setRating(3)">⭐</span>
        <span class="rate-star" data-v="4" onclick="setRating(4)">⭐</span>
        <span class="rate-star" data-v="5" onclick="setRating(5)">⭐</span>
      </div>
      <label class="mf-label">Your Review</label>
      <textarea class="mf-textarea" id="rateText" placeholder="Describe your experience — quality of work, punctuality, professionalism, safety practices…"></textarea>
      <label class="mf-label">Your Name (optional)</label>
      <input class="mf-input" id="rateName" placeholder="Name shown on review" style="margin-bottom:14px">
      <button class="mf-submit" onclick="submitRating()" style="margin-bottom:0">⭐ Submit Review</button>
    </div>
  </div>
</div>

<nav class="nav" id="navbar">
  <a href="/" class="brand">
    <div class="b-gem">⚡</div>
    <span class="b-name">SmartRent<span class="b-tag">AI</span></span>
  </a>
  <div class="nav-center">
    <a class="nav-a" href="/">Home</a>
    <a class="nav-a" href="/services">All Services</a>
    <a class="nav-a" href="/plumber">Plumbers</a>
    <a class="nav-a active-link" href="/electrician">Electricians</a>
    <a class="nav-a" href="/properties">Rentals</a>
    <a class="nav-a" href="/plans">Plans</a>
  </div>
  <div class="nav-right">
    <span id="navAuthArea" style="display:flex;gap:8px;align-items:center"></span>
    <a class="nb nb-amber" href="/post-service" id="listServiceBtn">⚡ List Your Service</a>
    <button class="mob-btn" id="mobBtn">☰</button>
  </div>
</nav>

<div class="breadcrumb">
  <a href="/">Home</a><span class="bc-sep">›</span>
  <a href="/services">Services</a><span class="bc-sep">›</span>
  <span class="bc-curr">Electricians</span>
</div>

<section class="hero">
  <div class="hero-inner">
    <div>
      <div class="hero-badge"><span class="pulse"></span>Licensed Electricians · Book Instantly</div>
      <h1 class="hero-h1">Find Licensed<br><em>Electricians</em> Near You</h1>
      <p class="hero-sub">Verified, ISI-standard certified electrical professionals across India. Compare ratings, experience and pricing — book in minutes, pay only after the job is done.</p>

      <div class="hero-search">
        <div class="hs-field" style="flex:1.4">
          <span class="hs-ico">📍</span>
          <input id="searchLoc" placeholder="Area, locality, city…">
        </div>
        <div class="hsep"></div>
        <div class="hs-field" style="flex:.9">
          <span class="hs-ico">⚡</span>
          <select id="searchService">
            <option value="">Any work</option>
            <option>Wiring</option>
            <option>Fan installation</option>
            <option>Switchboard</option>
            <option>MCB repair</option>
            <option>Short circuit</option>
            <option>Inverter</option>
            <option>CCTV wiring</option>
            <option>Emergency</option>
          </select>
        </div>
        <div class="hsep"></div>
        <button class="hs-btn" id="heroSearchBtn">🔍 Search</button>
      </div>

      <div class="hero-stats">
        <div class="hstat"><span class="hstat-v" id="statTotal">0</span><span>Registered Electricians</span></div>
        <div class="hstat-sep"></div>
        <div class="hstat"><span class="hstat-v" id="statActive">0</span><span>Available Now</span></div>
        <div class="hstat-sep"></div>
        <div class="hstat"><span class="hstat-v">4.8★</span><span>Avg. Rating</span></div>
        <div class="hstat-sep"></div>
        <div class="hstat"><span class="hstat-v">15</span><span>Cities</span></div>
      </div>
    </div>

    <div class="hero-visual">
      <div class="hv-card"><span class="hv-icon">⚡</span><div class="hv-label">Services</div><div class="hv-val">Wiring, MCB, Fan</div></div>
      <div class="hv-card"><span class="hv-icon">🛡️</span><div class="hv-label">Safety</div><div class="hv-val">IS:732 Certified</div></div>
      <div class="hv-card"><span class="hv-icon">🕐</span><div class="hv-label">Response</div><div class="hv-val">Within 1 hr</div></div>
      <div class="hv-card"><span class="hv-icon">💳</span><div class="hv-label">Payment</div><div class="hv-val">After Service</div></div>
    </div>
  </div>
</section>

<div class="safety-bar">
  <div class="safety-inner">
    <span>⚠️</span>
    <div>
      <strong>Electrical Safety Notice:</strong> All electricians on SmartRent AI are required to follow BIS IS:732 wiring standards.
      Always switch off the main MCB before any electrical work.
      <span class="safety-badge">Licensed Only</span>
      <span class="safety-badge">IS:732 Compliant</span>
      <span class="safety-badge">Insured Work</span>
    </div>
  </div>
</div>

<div class="filters-wrap">
  <div class="filters-inner">
    <span class="filter-label">Filter:</span>
    <span class="fc on" data-f="all">All Electricians</span>
    <span class="fc" data-f="available">🟢 Available Now</span>
    <span class="fc" data-f="top">⭐ Top Rated (4.5+)</span>
    <span class="fc" data-f="budget">💰 Budget (≤₹300)</span>
    <span class="fc" data-f="licensed">🎓 Licensed / Certified</span>
    <span class="fc" data-f="emergency">🚨 24/7 Emergency</span>
    <div class="filter-sep"></div>
    <select class="sort-select" id="sortSelect">
      <option value="rating">Sort: Best Rated</option>
      <option value="price_asc">Sort: Price Low → High</option>
      <option value="price_desc">Sort: Price High → Low</option>
      <option value="experience">Sort: Most Experienced</option>
      <option value="newest">Sort: Newest First</option>
    </select>
    <span class="results-count" id="resultsCount">Loading…</span>
  </div>
</div>

<main class="main">
  <div class="info-banner rv">
    <span class="ib-ic">ℹ️</span>
    <div>All electricians listed here hold an active <strong>Electrician Plan</strong> subscription on SmartRent AI. Listings are active for <strong>30 days</strong> from purchase and automatically hidden on expiry — reactivated only when the electrician renews their subscription.
    <a href="/plans" style="color:var(--amber);font-weight:600;margin-left:4px">Register as an Electrician →</a></div>
  </div>

  <div class="sec-hdr rv d1">
    <div>
      <div class="sec-eyebrow">Electrical Services</div>
      <h2 class="sec-h2">Available <em>Electricians</em></h2>
    </div>
  </div>

  <div class="skeleton-grid" id="skeletonGrid">
    <div class="skel"><div class="skel-strip"></div><div class="skel-top"><div class="skel-av"></div><div class="skel-lines"><div class="skel-line" style="width:68%"></div><div class="skel-line" style="width:50%"></div><div class="skel-line" style="width:78%"></div></div></div><div class="skel-body"><div class="skel-line" style="height:10px;border-radius:3px;width:90%"></div><div class="skel-line" style="height:10px;border-radius:3px;width:74%"></div><div class="skel-line" style="height:10px;border-radius:3px;width:58%"></div></div></div>
    <div class="skel"><div class="skel-strip"></div><div class="skel-top"><div class="skel-av"></div><div class="skel-lines"><div class="skel-line" style="width:62%"></div><div class="skel-line" style="width:44%"></div><div class="skel-line" style="width:70%"></div></div></div><div class="skel-body"><div class="skel-line" style="height:10px;border-radius:3px;width:86%"></div><div class="skel-line" style="height:10px;border-radius:3px;width:68%"></div><div class="skel-line" style="height:10px;border-radius:3px;width:54%"></div></div></div>
    <div class="skel"><div class="skel-strip"></div><div class="skel-top"><div class="skel-av"></div><div class="skel-lines"><div class="skel-line" style="width:72%"></div><div class="skel-line" style="width:48%"></div><div class="skel-line" style="width:76%"></div></div></div><div class="skel-body"><div class="skel-line" style="height:10px;border-radius:3px;width:88%"></div><div class="skel-line" style="height:10px;border-radius:3px;width:66%"></div><div class="skel-line" style="height:10px;border-radius:3px;width:52%"></div></div></div>
  </div>

  <div class="providers-grid" id="providersGrid" style="display:none"></div>

  <div class="empty-state" id="emptyState" style="display:none">
    <span class="es-icon">⚡</span>
    <div class="es-title">No Electricians Found</div>
    <div class="es-sub">No registered electricians match your current filters. Try a different city or clear the filters. Electricians can list here by purchasing the Electrician Plan on SmartRent AI.</div>
    <a href="/plans" class="nb nb-amber" style="display:inline-flex">⚡ Register as an Electrician</a>
  </div>
</main>

<footer>
  <div class="foot-inner">
    <div class="fc2">© 2025–2026 SmartRent AI · All rights reserved</div>
    <div class="fc2">
      <a href="/">Home</a>
      <a href="/services">All Services</a>
      <a href="/plumber">Plumbers</a>
      <a href="/plans">Pricing</a>
      <a href="/privacy-policy">Privacy</a>
    </div>
  </div>
</footer>
`;

export default function ElectricianPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const $ = (id) => document.getElementById(id);
    const root = rootRef.current;

    let activeFilter = "all";
    let currentBooking = null;
    let currentRating = { providerId: null, ratingVal: 0 };
    let allProviders = [];

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      window._currentUser = user || null;
      const area = $("navAuthArea");
      if (!area) return;
      if (user) {
        area.innerHTML = `
          <span style="font-size:13px;color:var(--ink4);font-weight:500">👤 ${user.displayName || (user.email ? user.email.split("@")[0] : "User")}</span>
          <button class="nb nb-out" id="signOutBtn" style="font-size:12px;padding:6px 14px">Sign Out</button>`;
        const so = $("signOutBtn");
        if (so) so.addEventListener("click", () => signOut(auth));
      } else {
        area.innerHTML = `<a class="nb nb-out" href="/login" style="text-decoration:none">Sign In</a>`;
      }
    });

    function escHtml(str) {
      if (!str) return "";
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    let toastTimer;
    function showToast(msg, type = "") {
      const el = $("toast");
      el.textContent = msg;
      el.className = "toast " + type;
      el.style.display = "block";
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { el.style.display = "none"; }, 4400);
    }

    function hideSkeleton() { $("skeletonGrid").style.display = "none"; }
    function showEmpty() {
      $("emptyState").style.display = "block";
      $("providersGrid").style.display = "none";
      $("resultsCount").textContent = "0 electricians found";
    }

    function buildStars(avg) {
      let h = "";
      for (let i = 1; i <= 5; i++) {
        if (avg >= i) h += '<span class="star filled">★</span>';
        else if (avg >= i - 0.5) h += '<span class="star half">★</span>';
        else h += '<span class="star empty">★</span>';
      }
      return h;
    }

    function initReveal() {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }); },
        { threshold: 0.07 }
      );
      root.querySelectorAll(".rv:not(.in)").forEach((el) => obs.observe(el));
    }

    function buildCard(p) {
      const avg = parseFloat(p.averageRating) || 0;
      const count = parseInt(p.reviewCount) || 0;
      const starsHtml = buildStars(avg);
      const ratingPill = avg >= 4.5 ? '<span class="rating-pill rp-excellent">Excellent</span>'
        : avg >= 4.0 ? '<span class="rating-pill rp-good">Good</span>'
        : avg >= 3.0 ? '<span class="rating-pill rp-avg">Average</span>' : "";

      const avail = p.availability || "offline";
      const availDot = avail === "available" ? "online" : avail === "busy" ? "busy" : "offline";
      const availTxt = avail === "available" ? "Available Now" : avail === "busy" ? "Currently Busy" : "Offline";

      const badges = [];
      if (p.isVerified) badges.push('<span class="pbadge pb-v">✓ Verified</span>');
      if (p.isLicensed) badges.push('<span class="pbadge pb-lic">⚡ Licensed</span>');
      if (p.yearsExperience >= 5) badges.push(`<span class="pbadge pb-lic">${p.yearsExperience}yr Exp</span>`);
      if (p.emergencyService) badges.push('<span class="pbadge pb-fast">🚨 24/7</span>');
      if (avg >= 4.7 && count >= 5) badges.push('<span class="pbadge pb-top">⭐ Top Rated</span>');

      const tags = (p.serviceTypes || ["General Electrical Work"]).slice(0, 6).map((t) => `<span class="stag">${escHtml(t)}</span>`).join("");
      const areaChips = (p.servicesAreas || []).slice(0, 4).map((a) => `<span class="area-chip">📍${escHtml(a)}</span>`).join("");

      const now = new Date();
      const exp = p.expiresAt ? new Date(p.expiresAt) : new Date(now.getTime() + 30 * 86400000);
      const start = p.activatedAt ? new Date(p.activatedAt) : new Date(exp.getTime() - 30 * 86400000);
      const total = exp - start;
      const remain = exp - now;
      const pct = Math.max(0, Math.min(100, (remain / total) * 100));
      const daysLeft = Math.max(0, Math.ceil(remain / 86400000));
      const expiryClass = pct < 20 ? "crit" : pct < 40 ? "warn" : "";
      const expiryText = daysLeft <= 0 ? "Expires today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`;

      const price = p.priceFrom || p.startingPrice || 0;
      const priceDisp = price ? `₹${price.toLocaleString("en-IN")}` : "Call for price";
      const priceNote = price ? "per visit onwards" : "pricing on request";

      let ribbon = "";
      if (avg >= 4.7 && count >= 5) ribbon = '<div class="pcard-ribbon top">Top Rated</div>';
      else if (daysLeft <= 3) ribbon = '<div class="pcard-ribbon new">Expiring Soon</div>';

      const initial = (p.businessName || p.ownerName || "E")[0].toUpperCase();

      const safeData = JSON.stringify({
        id: p.id,
        name: p.businessName || p.ownerName || "Electrician",
        loc: [p.city, p.area].filter(Boolean).join(", "),
        phone: p.phone || "",
        wa: p.whatsapp || p.phone || "",
        price: priceDisp,
        priceNote,
        initial,
      }).replace(/"/g, "&quot;");

      return `
      <div class="pcard rv" data-avail="${avail}" data-rating="${avg}" data-price="${price}" data-exp="${p.yearsExperience || 0}" data-licensed="${!!p.isLicensed}" data-emergency="${!!p.emergencyService}" data-id="${p.id}">
        <div class="pcard-strip"></div>
        ${ribbon}
        <div class="pcard-top">
          <div class="pcard-header">
            <div class="provider-avatar">${initial}</div>
            <div class="provider-info">
              <div class="provider-name">${escHtml(p.businessName || p.ownerName || "Electrical Service")}</div>
              <div class="provider-tagline">${escHtml(p.tagline || `Licensed Electrician · ${p.city || "India"}`)}</div>
              <div class="provider-badges">${badges.join("")}</div>
            </div>
          </div>
          <div class="pcard-rating-row">
            <div class="stars">${starsHtml}</div>
            <span class="rating-num">${avg > 0 ? avg.toFixed(1) : "New"}</span>
            <span class="rating-count">(${count} review${count !== 1 ? "s" : ""})</span>
            ${ratingPill}
            <span style="margin-left:auto;font-size:12px;color:var(--ink5);cursor:pointer;text-decoration:underline" onclick="openRatingModal('${p.id}','${escHtml(p.businessName || p.ownerName || "Provider")}')">Rate ✍️</span>
          </div>
        </div>

        <div class="pcard-body">
          <div class="info-grid">
            <div class="info-item"><div class="info-item-label">Experience</div><div class="info-item-val">⏱️ ${p.yearsExperience ? p.yearsExperience + " yrs" : "Not stated"}</div></div>
            <div class="info-item"><div class="info-item-label">Response Time</div><div class="info-item-val">⚡ ${escHtml(p.responseTime || "Within 1 hr")}</div></div>
            <div class="info-item"><div class="info-item-label">Work Hours</div><div class="info-item-val">🕐 ${escHtml(p.workHours || "8am – 8pm")}</div></div>
            <div class="info-item"><div class="info-item-label">Jobs Done</div><div class="info-item-val">✅ ${p.jobsCompleted ? p.jobsCompleted + "+" : "New"}</div></div>
          </div>

          <div class="service-tags">${tags}</div>

          <div class="location-row">
            <span class="loc-icon">📍</span>
            <div>
              <div>${escHtml([p.area, p.city, p.state].filter(Boolean).join(", ") || "Location not specified")}</div>
              ${areaChips ? `<div class="area-chips">${areaChips}</div>` : ""}
            </div>
          </div>

          <div class="avail-row">
            <span class="avail-dot ${availDot}"></span>
            <span>${availTxt}</span>
            ${p.emergencyService ? '<span style="margin-left:8px;font-size:11px;font-family:\'JetBrains Mono\',monospace;background:var(--rose-bg);color:var(--rose);border:1px solid var(--rose-b);padding:1px 7px;border-radius:100px;font-weight:600">24/7 EMERGENCY</span>' : ""}
          </div>

          <div class="expiry-bar-wrap">
            <div class="expiry-label"><span>Subscription Active</span><span>${expiryText}</span></div>
            <div class="expiry-bar"><div class="expiry-fill ${expiryClass}" data-pct="${pct.toFixed(1)}" style="width:0%"></div></div>
          </div>
        </div>

        <div class="pcard-footer">
          <div class="price-block">
            <div class="price-main">${price ? `<span class="cur">₹</span>${price.toLocaleString("en-IN")}` : priceDisp}</div>
            <div class="price-note">${priceNote}</div>
          </div>
          <button class="btn btn-call" title="Call" onclick="callProvider('${escHtml(p.phone || "")}')">📞</button>
          <button class="btn btn-wa" title="WhatsApp" onclick="waProvider('${escHtml(p.whatsapp || p.phone || "")}','${escHtml(p.businessName || p.ownerName || "")}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.098.547 4.068 1.508 5.773L0 24l6.38-1.494A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 01-4.985-1.367l-.358-.213-3.714.87.895-3.626-.234-.373A9.76 9.76 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/></svg>
          </button>
          <button class="btn btn-book" onclick='openBooking(${safeData})'>📋 Book Now</button>
        </div>
      </div>`;
    }

    function renderProviders(list) {
      const grid = $("providersGrid");
      const empty = $("emptyState");
      $("resultsCount").textContent = `${list.length} electrician${list.length !== 1 ? "s" : ""} found`;
      if (!list.length) { grid.style.display = "none"; empty.style.display = "block"; return; }
      empty.style.display = "none";
      grid.style.display = "grid";
      grid.innerHTML = list.map((p) => buildCard(p)).join("");
      grid.querySelectorAll(".expiry-fill[data-pct]").forEach((el) => {
        const pct = parseFloat(el.dataset.pct);
        setTimeout(() => { el.style.width = pct + "%"; }, 80);
      });
      initReveal();
    }

    function doFilter() {
      const loc = ($("searchLoc").value || "").toLowerCase();
      const svc = ($("searchService").value || "").toLowerCase();
      const sort = $("sortSelect").value;

      let filtered = allProviders.filter((p) => {
        if (loc) {
          const ls = [p.area, p.city, p.state, ...(p.servicesAreas || [])].join(" ").toLowerCase();
          if (!ls.includes(loc)) return false;
        }
        if (svc) {
          const ss = (p.serviceTypes || []).join(" ").toLowerCase();
          if (!ss.includes(svc.split(" ")[0])) return false;
        }
        if (activeFilter === "available") return p.availability === "available";
        if (activeFilter === "top") return (parseFloat(p.averageRating) || 0) >= 4.5;
        if (activeFilter === "budget") return (p.priceFrom || p.startingPrice || 0) <= 300;
        if (activeFilter === "licensed") return !!p.isLicensed;
        if (activeFilter === "emergency") return !!p.emergencyService;
        return true;
      });

      filtered.sort((a, b) => {
        if (sort === "rating") return (parseFloat(b.averageRating) || 0) - (parseFloat(a.averageRating) || 0);
        if (sort === "price_asc") return (a.priceFrom || a.startingPrice || 0) - (b.priceFrom || b.startingPrice || 0);
        if (sort === "price_desc") return (b.priceFrom || b.startingPrice || 0) - (a.priceFrom || a.startingPrice || 0);
        if (sort === "experience") return (parseInt(b.yearsExperience) || 0) - (parseInt(a.yearsExperience) || 0);
        if (sort === "newest") return (b.createdAt || "") > (a.createdAt || "") ? 1 : -1;
        return 0;
      });

      renderProviders(filtered);
    }

    function setFilter(type, el) {
      root.querySelectorAll(".fc").forEach((c) => c.classList.remove("on"));
      el.classList.add("on");
      activeFilter = type;
      doFilter();
    }

    function showModal(id) { $(id).classList.add("show"); document.body.style.overflow = "hidden"; }
    function closeModal(id) { $(id).classList.remove("show"); document.body.style.overflow = ""; }
    function closeMoBg(e) { ["bookingModal", "ratingModal"].forEach((id) => { if (e.target === $(id)) closeModal(id); }); }

    function openBooking(data) {
      currentBooking = data;
      $("bmTitle").textContent = `Book — ${data.name}`;
      $("bmSub").textContent = "Fill in the details and the electrician will confirm within 1 hour.";
      $("bmAv").textContent = data.initial;
      $("bmName").textContent = data.name;
      $("bmLoc").textContent = "📍 " + (data.loc || "Location on file");
      $("bmPrice").textContent = data.price;
      $("bmPriceNote").textContent = data.priceNote;
      $("bkDate").min = new Date().toISOString().split("T")[0];

      ["bkName", "bkPhone", "bkArea", "bkDate", "bkNote"].forEach((id) => { $(id).value = ""; });
      $("bkTime").value = "";
      $("bkService").value = "";

      const user = window._currentUser;
      if (user?.displayName) $("bkName").value = user.displayName;

      $("bookingForm").style.display = "block";
      $("bookingSuccess").classList.remove("show");
      const btn = $("bkSubmit");
      btn.disabled = false;
      btn.innerHTML = "⚡ Confirm Booking Request";

      showModal("bookingModal");
    }

    async function saveBooking(data) {
      const ref = await addDoc(collection(db, "bookings"), {
        ...data,
        createdAt: serverTimestamp(),
        status: "pending",
        type: "service_booking",
        serviceCategory: "electrical",
      });
      return ref.id;
    }

    async function submitBooking() {
      const name = $("bkName").value.trim();
      const phone = $("bkPhone").value.replace(/\D/g, "");
      const area = $("bkArea").value.trim();
      const date = $("bkDate").value;
      const svc = $("bkService").value;

      if (!name) { showToast("Please enter your full name.", "error-t"); return; }
      if (phone.length < 10) { showToast("Enter a valid 10-digit mobile number.", "error-t"); return; }
      if (!area) { showToast("Please enter your area or city.", "error-t"); return; }
      if (!date) { showToast("Please select a preferred date.", "error-t"); return; }
      if (!svc) { showToast("Please select the electrical work needed.", "error-t"); return; }

      const btn = $("bkSubmit");
      btn.disabled = true;
      btn.innerHTML = "⏳ Submitting…";

      const bookingData = {
        providerId: currentBooking.id,
        providerName: currentBooking.name,
        providerPhone: currentBooking.phone,
        customerName: name,
        customerPhone: phone,
        area,
        preferredDate: date,
        preferredTime: $("bkTime").value,
        serviceNeeded: svc,
        notes: $("bkNote").value.trim(),
        userId: window._currentUser?.uid || "guest",
        userEmail: window._currentUser?.email || "",
      };

      try {
        let refId;
        try {
          refId = await saveBooking(bookingData);
        } catch (inner) {
          refId = "LOCAL-" + Date.now();
          const local = JSON.parse(localStorage.getItem("sr_el_bookings") || "[]");
          local.push({ ...bookingData, id: refId });
          localStorage.setItem("sr_el_bookings", JSON.stringify(local));
        }
        $("bsRef").textContent = "REF: " + refId.slice(0, 14).toUpperCase();
        $("bookingForm").style.display = "none";
        $("bookingSuccess").classList.add("show");
        showToast("⚡ Booking sent! Electrician will call you soon.", "success-t");
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = "⚡ Confirm Booking Request";
        showToast("Error: " + err.message, "error-t");
      }
    }

    function openRatingModal(id, name) {
      currentRating = { providerId: id, ratingVal: 0 };
      $("rateProviderName").textContent = `Rating for: ${name}`;
      root.querySelectorAll(".rate-star").forEach((s) => s.classList.remove("on"));
      $("rateText").value = "";
      $("rateName").value = "";
      showModal("ratingModal");
    }

    function setRating(val) {
      currentRating.ratingVal = val;
      root.querySelectorAll(".rate-star").forEach((s) => s.classList.toggle("on", parseInt(s.dataset.v) <= val));
    }

    async function submitRating() {
      if (!currentRating.ratingVal) { showToast("Please tap a star to rate.", "error-t"); return; }
      const text = $("rateText").value.trim();
      const name = $("rateName").value.trim();
      try {
        await addDoc(collection(db, "reviews"), {
          providerId: currentRating.providerId,
          serviceCategory: "electrical",
          rating: currentRating.ratingVal,
          text,
          raterName: name || "Anonymous",
          approved: false,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "services", currentRating.providerId), { reviewCount: increment(1) });
        closeModal("ratingModal");
        showToast("Thanks for your review! It will appear after moderation.", "success-t");
      } catch (e) {
        showToast("Could not save review: " + e.message, "error-t");
      }
    }

    function callProvider(phone) {
      if (!phone) { showToast("Phone number not available.", "error-t"); return; }
      window.location.href = "tel:" + phone.replace(/\s/g, "");
    }
    function waProvider(phone, name) {
      if (!phone) { showToast("WhatsApp number not available.", "error-t"); return; }
      const msg = encodeURIComponent(`Hi ${name}, I found your electrician service on SmartRent AI and would like to book an appointment.`);
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
    }

    async function loadProviders() {
      try {
        const now = new Date().toISOString();
        const q = query(collection(db, "services"), where("category", "==", "electrical"), where("status", "==", "active"), where("approved", "==", true));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((d) => {
          const data = d.data();
          if (data.expiresAt && data.expiresAt < now) return;
          list.push({ id: d.id, ...data });
        });

        allProviders = list;
        $("statTotal").textContent = list.length;
        $("statActive").textContent = list.filter((p) => p.availability !== "offline").length;

        hideSkeleton();
        if (list.length === 0) showEmpty();
        else renderProviders(list);
      } catch (err) {
        console.error("Firestore load error:", err);
        hideSkeleton();
        showEmpty();
        showToast("Could not load providers. Check your connection.", "error-t");
      }
    }

    window.closeModal = closeModal;
    window.closeMoBg = closeMoBg;
    window.openBooking = openBooking;
    window.submitBooking = submitBooking;
    window.openRatingModal = openRatingModal;
    window.setRating = setRating;
    window.submitRating = submitRating;
    window.callProvider = callProvider;
    window.waProvider = waProvider;

    const onKeydown = (e) => { if (e.key === "Escape") { closeModal("bookingModal"); closeModal("ratingModal"); } };
    document.addEventListener("keydown", onKeydown);

    const bookingModalEl = $("bookingModal");
    const ratingModalEl = $("ratingModal");
    bookingModalEl.addEventListener("click", closeMoBg);
    ratingModalEl.addEventListener("click", closeMoBg);

    const filterChips = Array.from(root.querySelectorAll(".fc"));
    const filterHandlers = filterChips.map((chip) => {
      const fn = () => setFilter(chip.dataset.f, chip);
      chip.addEventListener("click", fn);
      return { chip, fn };
    });

    const searchLoc = $("searchLoc");
    const searchService = $("searchService");
    const sortSelect = $("sortSelect");
    const heroSearchBtn = $("heroSearchBtn");
    searchLoc.addEventListener("input", doFilter);
    searchService.addEventListener("change", doFilter);
    sortSelect.addEventListener("change", doFilter);
    heroSearchBtn.addEventListener("click", doFilter);

    const mobBtn = $("mobBtn");
    const onMobClick = () => showToast("Use desktop view for full navigation.");
    mobBtn.addEventListener("click", onMobClick);

    const onScroll = () => { $("navbar").classList.toggle("solid", window.scrollY > 30); };
    window.addEventListener("scroll", onScroll);

    loadProviders();

    return () => {
      unsubAuth();
      document.removeEventListener("keydown", onKeydown);
      bookingModalEl.removeEventListener("click", closeMoBg);
      ratingModalEl.removeEventListener("click", closeMoBg);
      filterHandlers.forEach(({ chip, fn }) => chip.removeEventListener("click", fn));
      searchLoc.removeEventListener("input", doFilter);
      searchService.removeEventListener("change", doFilter);
      sortSelect.removeEventListener("change", doFilter);
      heroSearchBtn.removeEventListener("click", doFilter);
      mobBtn.removeEventListener("click", onMobClick);
      window.removeEventListener("scroll", onScroll);
      delete window.closeModal;
      delete window.closeMoBg;
      delete window.openBooking;
      delete window.submitBooking;
      delete window.openRatingModal;
      delete window.setRating;
      delete window.submitRating;
      delete window.callProvider;
      delete window.waProvider;
    };
  }, []);

  return (
    <div className="electrician-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
  );
}
