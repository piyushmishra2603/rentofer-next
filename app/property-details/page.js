"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import "./page.css";

const LS_KEY = "sr_subscription"; // must match /plans

const BODY_HTML = `
<div class="pgbar" id="pgBar"></div>
<div class="toast" id="toast"></div>

<div class="loading-screen" id="loadingScreen">
  <div class="ls-gem">💎</div>
  <div class="ls-bar"><div class="ls-fill"></div></div>
  <div class="ls-txt">LOADING PROPERTY…</div>
</div>

<div class="not-found" id="notFound">
  <span class="nf-icon">🔍</span>
  <div class="nf-title">Property Not Found</div>
  <div class="nf-sub">This listing may have been removed or the link is invalid. Browse all available properties below.</div>
  <a href="/properties" class="nf-btn">← Back to All Properties</a>
</div>

<div class="lightbox" id="lightbox">
  <div class="lb-inner">
    <div class="lb-close" id="lbCloseBtn">✕</div>
    <div class="lb-main" id="lbMain"></div>
    <div class="lb-nav">
      <div class="lb-btn" id="lbPrevBtn">◀</div>
      <div class="lb-counter" id="lbCounter">1 / 1</div>
      <div class="lb-btn" id="lbNextBtn">▶</div>
    </div>
    <div class="lb-thumbs" id="lbThumbs"></div>
  </div>
</div>

<div class="modal-bg" id="modalBg">
  <div class="modal-box">
    <div class="modal-head">
      <div class="modal-title" id="modalTitle">Send Enquiry</div>
      <div class="modal-close" id="modalCloseBtn">✕</div>
    </div>
    <div class="modal-body">
      <div id="moForm">
        <div class="m-2col">
          <div><label class="modal-lbl">Your Name *</label><input class="m-inp" id="eqName" placeholder="Full name"></div>
          <div><label class="modal-lbl">Mobile Number *</label><input class="m-inp" id="eqPhone" type="tel" placeholder="+91 XXXXX XXXXX"></div>
        </div>
        <label class="modal-lbl">Email Address</label>
        <input class="m-inp" id="eqEmail" type="email" placeholder="you@email.com">
        <label class="modal-lbl">Preferred Move-in Date</label>
        <input class="m-inp" id="eqDate" type="date">
        <label class="modal-lbl">Purpose of Enquiry</label>
        <select class="m-sel" id="eqPurpose">
          <option>I want to rent this property</option>
          <option>Schedule a site visit</option>
          <option>Request more details</option>
          <option>Check availability</option>
          <option>Negotiate rent</option>
        </select>
        <label class="modal-lbl">Message to Owner (Optional)</label>
        <textarea class="m-ta" id="eqMsg" placeholder="Hi, I'm interested in this property…"></textarea>
        <button class="m-submit" id="submitEnqBtn">⚡ Send Enquiry Now</button>
      </div>
      <div class="m-success" id="moSuccess">
        <span class="ms-ic">🏠</span>
        <div class="ms-t">Enquiry Sent!</div>
        <div class="ms-d">The owner will contact you within <strong>2 hours</strong>. Check your phone and email.</div>
        <div class="ms-ref" id="refId">REF: —</div>
      </div>
    </div>
  </div>
</div>

<div class="mob-drawer" id="mobDrawer">
  <a class="mob-l" href="/">🏠 Home</a>
  <a class="mob-l" href="/properties">🏘️ All Properties</a>
  <a class="mob-l" href="/pg-hostels">🛏 PG &amp; Hostels</a>
  <hr style="border:none;border-top:1.5px solid var(--div);margin:8px 0">
  <a class="nb nb-out" href="/login" style="text-decoration:none;justify-content:center">Sign In</a>
  <a class="nb nb-terra" href="/post-property" style="text-decoration:none;justify-content:center;margin-top:8px">+ List Property</a>
</div>

<nav class="nav" id="navbar">
  <a href="/" class="brand">
    <div class="bgem">💎</div>
    <span class="bname">SmartRent<span class="bai">AI</span></span>
  </a>
  <div class="breadcrumb">
    <a class="bc-a" href="/">Home</a>
    <span class="bc-sep">›</span>
    <a class="bc-a" href="/properties" id="bcListLink">All Properties</a>
    <span class="bc-sep">›</span>
    <span class="bc-cur" id="bcCur">Property Details</span>
  </div>
  <div class="nav-r">
    <a class="nb nb-out" href="/login" style="text-decoration:none">Sign In</a>
    <a class="nb nb-terra" href="/post-property" style="text-decoration:none">+ List Property</a>
    <button class="mob-btn" id="mobBtn" style="display:flex">☰</button>
  </div>
</nav>

<div class="gallery" id="gallerySection" style="display:none">
  <div class="gallery-grid" id="galleryGrid"></div>
</div>

<div class="page-wrap" id="pageWrap" style="display:none">
  <div class="left-col">
    <div class="prop-header rv">
      <div class="type-avail-row">
        <span class="type-chip" id="propTypeChip">—</span>
        <span class="status-badge" id="statusBadge">—</span>
      </div>
      <h1 class="prop-title" id="propTitle">—</h1>
      <div class="prop-loc" id="propLoc">
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <span id="propLocTxt">—</span>
      </div>
      <div class="prop-meta-row">
        <span class="meta-item">👁 <span id="propViews">0</span> views</span>
        <div class="meta-divider"></div>
        <span class="meta-item">📬 <span id="propEnq">0</span> enquiries</span>
        <div class="meta-divider"></div>
        <span class="meta-item" id="propDateMeta">—</span>
      </div>
    </div>

    <div class="spec-pills rv d1" id="specPills"></div>
    <div class="sec-line"></div>

    <div class="rv d1" id="descSection" style="display:none">
      <div class="sec-h">About this Property</div>
      <div class="desc-text" id="propDesc"></div>
      <button class="read-more-btn" id="readMoreBtn" style="display:none">Read more ▼</button>
      <div class="sec-line"></div>
    </div>

    <div class="rv d2" id="amenSection" style="display:none">
      <div class="sec-h">Amenities &amp; Features</div>
      <div class="amen-grid" id="amenGrid"></div>
      <div class="sec-line"></div>
    </div>

    <div class="rv d1" id="rulesSection" style="display:none">
      <div class="sec-h">House Rules &amp; Policies</div>
      <div class="rules-grid" id="rulesGrid"></div>
      <div class="sec-line"></div>
    </div>

    <div class="rv d2" id="tenantsSection" style="display:none">
      <div class="sec-h">Preferred Tenants</div>
      <div class="tenant-chips" id="tenantChips"></div>
      <div class="sec-line"></div>
    </div>

    <div class="rv d2" id="mapSection">
      <div class="sec-h">Location</div>
      <div class="map-card">
        <div class="map-head">
          <div class="map-head-t" id="mapAddr">—</div>
          <a id="mapsLink" href="#" target="_blank" rel="noopener" style="padding:6px 14px;border-radius:var(--r1);background:var(--terra-d);border:1.5px solid var(--terra-b);color:var(--terra);font-size:12px;font-weight:700;cursor:pointer;text-decoration:none">Open in Maps ↗</a>
        </div>
        <div class="map-iframe-wrap">
          <div class="map-loading" id="mapLoading">
            <div style="font-size:36px">🗺️</div>
            <div>Loading map…</div>
          </div>
          <iframe id="mapIframe" title="Property Location" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="display:none"></iframe>
        </div>
      </div>
    </div>
  </div>

  <aside class="sidebar">
    <div class="price-card rv">
      <div class="pc-top">
        <div class="pc-label">Monthly Rent</div>
        <div class="pc-price"><span class="cur">₹</span><span id="sidePrice">—</span></div>
        <div class="pc-per">PER MONTH</div>
        <div class="pc-deposit" id="sideDepositRow" style="display:none">Security Deposit: <strong id="sideDeposit">₹—</strong></div>
      </div>
      <div class="pc-body">
        <button class="btn-enquire" id="enquireBtn">⚡ Send Enquiry</button>
        <button class="btn-visit" id="visitBtn">📅 Schedule Site Visit</button>
        <div id="contactButtonsWrap"></div>
        <div class="pc-perks">
          <div class="perk-row"><span class="perk-ic">✅</span>Zero brokerage · Direct owner</div>
          <div class="perk-row"><span class="perk-ic">🛡️</span>KYC-verified &amp; safe listing</div>
          <div class="perk-row"><span class="perk-ic">📋</span>Free rental agreement support</div>
        </div>
      </div>
    </div>

    <div class="owner-card rv d1" id="ownerCard">
      <div class="oc-head">
        <div class="oc-avatar">🧑‍💼<div class="oc-verified">✓</div></div>
        <div>
          <div class="oc-name" id="ownerNameEl">Owner</div>
          <div class="oc-type">Property Owner</div>
        </div>
      </div>
      <div class="oc-detail" id="ownerDetail"></div>
      <div id="ownerContactBtns"></div>
    </div>

    <div class="safety-card rv d2">
      <div class="safety-t">🛡️ Your Safety First</div>
      Never transfer money before visiting the property in person. SmartRent AI supports direct, secure communication — we never ask for payment outside the platform.
    </div>
  </aside>
</div>

<div class="share-bar" id="shareBar">
  <div><div class="sb-price">₹<span id="sbPrice">—</span><span>/month</span></div></div>
  <div class="sb-btns">
    <div id="sbContactBtn"></div>
    <button id="sbEnquireBtn" style="padding:11px 16px;border-radius:var(--r1);background:linear-gradient(135deg,var(--terra),var(--terra-dk));border:none;color:#fff;font-size:13px;font-weight:800;cursor:pointer">Enquire</button>
  </div>
</div>
`;

function PropertyDetailsInner() {
  const searchParams = useSearchParams();
  const rootRef = useRef(null);

  useEffect(() => {
    const $ = (id) => document.getElementById(id);
    const root = rootRef.current;
    let lbIdx = 0;
    let savedState = false;
    let toastTimer;

    function showToast(msg) {
      const el = $("toast");
      el.innerHTML = msg;
      el.style.display = "block";
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { el.style.display = "none"; }, 3600);
    }

    /* ── lightbox ── */
    function openLb(idx) {
      const images = window._propImages || [];
      if (!images.length) return;
      lbIdx = idx;
      updateLb();
      $("lightbox").classList.add("show");
      document.body.style.overflow = "hidden";
    }
    function closeLb() {
      $("lightbox").classList.remove("show");
      document.body.style.overflow = "";
    }
    function closeLbOnBg(e) { if (e.target === $("lightbox")) closeLb(); }
    function lbPrev() { const n = (window._propImages || []).length; lbIdx = ((lbIdx - 1) + n) % n; updateLb(); }
    function lbNext() { const n = (window._propImages || []).length; lbIdx = (lbIdx + 1) % n; updateLb(); }
    function lbGoTo(i) { lbIdx = i; updateLb(); }
    function updateLb() {
      const images = window._propImages || [];
      if (!images.length) return;
      const n = images.length;
      lbIdx = ((lbIdx % n) + n) % n;
      $("lbMain").innerHTML = `<img src="${images[lbIdx]}" alt="Photo ${lbIdx + 1}" style="width:100%;height:100%;object-fit:contain">`;
      $("lbCounter").textContent = (lbIdx + 1) + " / " + n;
      $("lbThumbs").innerHTML = images.map((url, i) =>
        `<div class="lb-thumb ${i === lbIdx ? "on" : ""}" onclick="lbGoTo(${i})"><img src="${url}" alt="thumb"></div>`
      ).join("");
    }

    function toggleSave() {
      savedState = !savedState;
      const btn = $("galSave");
      if (btn) { btn.textContent = savedState ? "❤️" : "🤍"; btn.classList.toggle("saved", savedState); }
      showToast(savedState ? "❤️ Saved to wishlist!" : "💔 Removed from wishlist");
    }

    /* ── enquiry modal ── */
    function openMo(type) {
      const titles = { enquiry: "⚡ Send Enquiry", visit: "📅 Schedule Site Visit", message: "✉️ Message Owner" };
      $("modalTitle").textContent = titles[type] || "⚡ Send Enquiry";
      $("moForm").style.display = "block";
      $("moSuccess").classList.remove("show");
      $("eqDate").min = new Date().toISOString().split("T")[0];
      if (type === "visit") $("eqPurpose").value = "Schedule a site visit";
      $("modalBg").classList.add("show");
      document.body.style.overflow = "hidden";
    }
    function closeMo() {
      $("modalBg").classList.remove("show");
      document.body.style.overflow = "";
    }
    function closeMoBg(e) { if (e.target === $("modalBg")) closeMo(); }
    function submitEnq() {
      const name = $("eqName").value.trim();
      const phone = $("eqPhone").value.trim();
      if (!name) { showToast("⚠️ Please enter your full name"); return; }
      if (!phone || phone.replace(/\D/g, "").length < 10) { showToast("⚠️ Please enter a valid 10-digit phone number"); return; }
      const refId = "SR-" + Math.floor(100000 + Math.random() * 900000);
      $("refId").textContent = "REF: " + refId;
      $("moForm").style.display = "none";
      $("moSuccess").classList.add("show");
      showToast("✅ Enquiry sent! Owner will contact you within 2 hours.");
    }

    function toggleMob() {
      const d = $("mobDrawer");
      const b = $("mobBtn");
      const open = d.classList.toggle("open");
      b.textContent = open ? "✕" : "☰";
    }

    /* ── subscription check ── */
    function getLocalSubscription() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
    function getLocalSubscriptionState() {
      const sub = getLocalSubscription();
      if (!sub) return "none";
      const isKnownStatus = sub.status === "trial_active" || sub.status === "active";
      if (!isKnownStatus) return "none";
      if (sub.trialEndDate && Date.now() > new Date(sub.trialEndDate).getTime()) return "expired";
      return "active";
    }
    async function checkFirebaseSubscription(uid) {
      if (!uid) return false;
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) return false;
        const data = snap.data();
        const isActive = data.subscriptionStatus === "active";
        const isTenantPlan = (data.subscriptionPlan || "").startsWith("tenant");
        return isActive && isTenantPlan;
      } catch (e) {
        console.error("Firebase subscription check failed:", e);
        return false;
      }
    }

    function buildWaNum(raw) {
      if (!raw) return null;
      let digits = String(raw).replace(/\D/g, "");
      if (digits.length === 10) digits = "91" + digits;
      else if (digits.startsWith("0")) digits = "91" + digits.slice(1);
      return digits || null;
    }

    function renderSpecs(p) {
      const specs = [];
      if (p.bhk) specs.push({ ic: "🛏️", val: p.bhk, lbl: "Configuration" });
      if (p.area) specs.push({ ic: "📐", val: p.area + " sq.ft", lbl: "Carpet Area" });
      if (p.floor) specs.push({ ic: "🏢", val: p.floor, lbl: "Floor" });
      if (p.furnishing) specs.push({ ic: "🪑", val: p.furnishing, lbl: "Furnishing" });
      if (p.availableFrom) specs.push({ ic: "📅", val: p.availableFrom, lbl: "Available From" });
      else specs.push({ ic: "📅", val: "Immediate", lbl: "Available" });
      if (p.deposit) specs.push({ ic: "🔐", val: "₹" + Number(p.deposit).toLocaleString("en-IN"), lbl: "Deposit" });
      if (p.facing) specs.push({ ic: "🧭", val: p.facing, lbl: "Facing" });
      if (p.propAge) specs.push({ ic: "🏗️", val: p.propAge, lbl: "Property Age" });
      $("specPills").innerHTML = specs.map((s) => `
        <div class="spec-pill">
          <span class="sp-ic">${s.ic}</span>
          <div><div class="sp-val">${s.val}</div><div class="sp-lbl">${s.lbl}</div></div>
        </div>`).join("");
    }

    function renderGallery(p) {
      const images = (p.images || []).filter(Boolean);
      const grid = $("galleryGrid");
      const pendingBadge = !p.approved ? '<div class="gal-pending-badge">⏳ PENDING REVIEW</div>' : "";

      if (images.length > 0) {
        const totalCount = images.length;
        grid.innerHTML = `
          <div class="gal-cell gal-main" onclick="openLb(0)">
            <img class="gal-img" src="${images[0]}" alt="Property main photo" loading="eager">
            <div class="gal-ov"></div>
            ${pendingBadge}
            <div class="gal-save" id="galSave" onclick="event.stopPropagation();toggleSave()">🤍</div>
            <div class="gal-count-btn" onclick="event.stopPropagation();openLb(0)">📷 ${totalCount} Photo${totalCount > 1 ? "s" : ""}</div>
          </div>
          <div class="gal-cell gal-thumb" onclick="openLb(1)">
            <img class="gal-img" src="${images[1] || images[0]}" alt="Photo 2" loading="lazy">
            <div class="gal-ov"></div>
          </div>
          <div class="gal-cell gal-thumb" onclick="openLb(${Math.min(2, images.length - 1)})">
            <img class="gal-img" src="${images[2] || images[0]}" alt="Photo 3" loading="lazy">
            <div class="gal-ov"></div>
          </div>`;
        window._propImages = images;
      } else {
        grid.innerHTML = `
          <div class="gal-cell gal-main" style="background:linear-gradient(145deg,#e8ede4,#d4dcc8)">
            <div class="gal-emoji-ph">🏠</div>
            <div class="gal-ov"></div>
            ${pendingBadge}
            <div class="gal-save" id="galSave" onclick="toggleSave()">🤍</div>
          </div>
          <div class="gal-cell gal-thumb" style="background:linear-gradient(145deg,#e4e8ec,#c8d4dc)"><div class="gal-emoji-ph">🛋️</div><div class="gal-ov"></div></div>
          <div class="gal-cell gal-thumb" style="background:linear-gradient(145deg,#ece8e4,#d8d0c8)"><div class="gal-emoji-ph">🏙️</div><div class="gal-ov"></div></div>`;
        window._propImages = [];
      }
    }

    function initScrollReveal() {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }); },
        { threshold: 0.08 }
      );
      root.querySelectorAll(".rv").forEach((el) => obs.observe(el));
    }

    const onNavScroll = () => {
      $("navbar").classList.toggle("solid", window.scrollY > 80);
      const t = document.documentElement;
      const pct = (window.scrollY / (t.scrollHeight - window.innerHeight)) * 100;
      $("pgBar").style.width = Math.min(pct, 100) + "%";
    };

    function setupShareBar() {
      const bar = $("shareBar");
      const check = () => { bar.style.display = window.innerWidth <= 1100 ? "flex" : "none"; };
      check();
      window.addEventListener("resize", check);
      return check;
    }

    function showNotFound() {
      $("loadingScreen").classList.add("hide");
      setTimeout(() => { $("loadingScreen").style.display = "none"; }, 400);
      $("notFound").style.display = "block";
    }

    function renderProperty(p, hasSubscription, trialExpired, isLoggedIn) {
      const ls = $("loadingScreen");
      ls.classList.add("hide");
      setTimeout(() => { ls.style.display = "none"; }, 400);

      $("gallerySection").style.display = "block";
      $("pageWrap").style.display = "grid";

      const title = p.title || "Untitled Property";
      document.title = title + " — SmartRent AI";

      $("bcCur").textContent = title.length > 44 ? title.slice(0, 44) + "…" : title;
      const listLink = $("bcListLink");
      if (p.type === "Commercial" || p.type === "commercial") {
        listLink.href = "/commercial"; listLink.textContent = "Commercial";
      } else if (p.type === "PG / Hostel" || p.type === "pg" || p.type === "hostel") {
        listLink.href = "/pg-hostels"; listLink.textContent = "PG & Hostels";
      } else {
        listLink.href = "/properties"; listLink.textContent = "All Properties";
      }

      const statusEl = $("statusBadge");
      if (p.status === "active" || p.approved === true) {
        statusEl.textContent = "Available Now";
        statusEl.className = "status-badge available";
      } else if (p.status === "pending" || !p.approved) {
        statusEl.textContent = "⏳ Pending Review";
        statusEl.className = "status-badge pending";
      } else {
        statusEl.textContent = "Leased";
        statusEl.className = "status-badge leased";
      }

      $("propTypeChip").textContent = p.type || "Property";
      $("propTitle").textContent = title;

      const locParts = [p.locality, p.city].filter(Boolean);
      $("propLocTxt").textContent = locParts.join(", ") || "—";

      $("propViews").textContent = (p.views || 1).toLocaleString("en-IN");
      $("propEnq").textContent = (p.enquiries || 0).toLocaleString("en-IN");
      if (p.createdAt) {
        const d = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        $("propDateMeta").textContent = "📅 Listed " + d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      }

      renderSpecs(p);

      if (p.description && p.description.trim()) {
        $("descSection").style.display = "block";
        const descEl = $("propDesc");
        const fullDesc = p.description.trim();
        const SHORT_LEN = 300;
        if (fullDesc.length > SHORT_LEN) {
          descEl.textContent = fullDesc.slice(0, SHORT_LEN) + "…";
          const rmBtn = $("readMoreBtn");
          rmBtn.style.display = "flex";
          let expanded = false;
          rmBtn.onclick = () => {
            expanded = !expanded;
            descEl.textContent = expanded ? fullDesc : fullDesc.slice(0, SHORT_LEN) + "…";
            rmBtn.innerHTML = expanded ? "Show less ▲" : "Read more ▼";
          };
        } else {
          descEl.textContent = fullDesc;
        }
      }

      const amenities = p.amenities || [];
      if (amenities.length > 0) {
        $("amenSection").style.display = "block";
        $("amenGrid").innerHTML = amenities.map((a) => {
          const parts = a.trim().split(" ");
          const ic = parts[0];
          const txt = parts.slice(1).join(" ") || a;
          return `<div class="amen-item"><span class="amen-ic">${ic}</span><span>${txt}</span></div>`;
        }).join("");
      }

      const rules = [];
      if (p.cooking) rules.push({ ic: "🍳", lbl: "Cooking", val: p.cooking });
      if (p.nonveg) rules.push({ ic: "🍖", lbl: "Non-Veg", val: p.nonveg });
      if (p.smoking) rules.push({ ic: "🚬", lbl: "Smoking", val: p.smoking });
      if (p.drinking) rules.push({ ic: "🍷", lbl: "Drinking", val: p.drinking });
      if (p.guests) rules.push({ ic: "👥", lbl: "Visitors", val: p.guests });
      if (p.maintenance) rules.push({ ic: "🔧", lbl: "Maintenance", val: p.maintenance });
      if (rules.length > 0) {
        $("rulesSection").style.display = "block";
        $("rulesGrid").innerHTML = rules.map((r) => `
          <div class="rule-item">
            <span class="rule-ic">${r.ic}</span>
            <div><div class="rule-lbl">${r.lbl}</div><div class="rule-val">${r.val}</div></div>
          </div>`).join("");
      }

      const tenants = p.preferredTenants || [];
      if (tenants.length > 0) {
        $("tenantsSection").style.display = "block";
        $("tenantChips").innerHTML = tenants.map((t) => `<div class="tenant-chip">${t}</div>`).join("");
      }

      const mapQuery = encodeURIComponent([p.locality, p.city, "India"].filter(Boolean).join(", "));
      const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`;
      $("mapAddr").textContent = [p.locality, p.city].filter(Boolean).join(", ");
      $("mapsLink").href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
      const mapIframe = $("mapIframe");
      const mapLoading = $("mapLoading");
      const mapObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          mapIframe.src = mapSrc;
          mapIframe.style.display = "block";
          mapIframe.onload = () => mapLoading.classList.add("hidden");
          mapObs.disconnect();
        }
      }, { threshold: 0.1 });
      mapObs.observe($("mapSection"));

      $("sidePrice").textContent = (p.price || 0).toLocaleString("en-IN");
      $("sbPrice").textContent = (p.price || 0).toLocaleString("en-IN");
      if (p.deposit) {
        $("sideDepositRow").style.display = "flex";
        $("sideDeposit").textContent = "₹" + Number(p.deposit).toLocaleString("en-IN");
      }

      const owner = p.owner || {};
      const ownerName = owner.name || p.ownerName || "Property Owner";
      const ownerPhone = owner.phone || p.ownerPhone || "";
      const ownerWA = owner.whatsapp || ownerPhone || "";
      const ownerEmail = owner.email || "";

      $("ownerNameEl").textContent = ownerName;

      const propUrl = window.location.href;
      const waMsg = encodeURIComponent(
        `Hi ${ownerName}! I'm interested in your property "${title}" listed on SmartRent AI.\n` +
        `📍 ${locParts.join(", ")}\n` +
        `💰 ₹${(p.price || 0).toLocaleString("en-IN")}/month\n\n` +
        `Could you please share availability and more details?\n${propUrl}`
      );
      const waNum = buildWaNum(ownerWA) || buildWaNum(ownerPhone);
      const waHref = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : "#";
      const callHref = ownerPhone ? `tel:${ownerPhone.replace(/\s/g, "")}` : "#";
      const waSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

      if (hasSubscription) {
        const detailHtml = [];
        if (ownerPhone) detailHtml.push(`<div class="oc-row"><span>📞</span>${ownerPhone}</div>`);
        if (ownerWA && ownerWA !== ownerPhone) detailHtml.push(`<div class="oc-row"><span>💬</span>${ownerWA} (WhatsApp)</div>`);
        if (ownerEmail) detailHtml.push(`<div class="oc-row"><span>📧</span>${ownerEmail}</div>`);
        $("ownerDetail").innerHTML = detailHtml.join("");

        const cbWrap = $("contactButtonsWrap");
        cbWrap.innerHTML = "";
        if (waNum) {
          const waBtn = document.createElement("a");
          waBtn.className = "btn-wa-contact";
          waBtn.href = waHref; waBtn.target = "_blank"; waBtn.rel = "noopener";
          waBtn.innerHTML = `${waSvg} Contact Owner on WhatsApp`;
          cbWrap.appendChild(waBtn);
        }
        if (ownerPhone) {
          const callBtn = document.createElement("a");
          callBtn.className = "btn-call-owner";
          callBtn.href = callHref;
          callBtn.textContent = "📞 Call Owner";
          cbWrap.appendChild(callBtn);
        }

        const ocBtns = $("ownerContactBtns");
        ocBtns.innerHTML = "";
        if (waNum) ocBtns.innerHTML += `<a class="oc-wa-btn" href="${waHref}" target="_blank" rel="noopener">${waSvg} WhatsApp Owner</a>`;
        if (ownerPhone) ocBtns.innerHTML += `<a class="oc-call-btn" href="${callHref}">📞 Call Owner</a>`;

        $("sbContactBtn").innerHTML = waNum ? `<a class="sb-wa" href="${waHref}" target="_blank" rel="noopener">${waSvg} Contact Owner</a>` : "";
      } else if (trialExpired) {
        const lockedDetailHtml = [];
        if (ownerPhone) lockedDetailHtml.push('<div class="oc-row-locked"><span>📞</span><span class="blurred-val">+91 98765 43210</span></div>');
        if (ownerEmail) lockedDetailHtml.push('<div class="oc-row-locked"><span>📧</span><span class="blurred-val">owner@email.com</span></div>');
        $("ownerDetail").innerHTML = lockedDetailHtml.join("");

        const expiredHTML = `
          <div class="trial-expired-notice">
            <span class="ten-icon">⏰</span>
            <div class="ten-title">Your Free Trial Ended</div>
            <div class="ten-sub">Your 3-month free trial has expired. Subscribe to continue accessing owner contact details.</div>
            <a class="btn-renew" href="/plans">Subscribe to Continue →</a>
          </div>`;
        $("contactButtonsWrap").innerHTML = expiredHTML;
        $("ownerContactBtns").innerHTML = expiredHTML;
        $("sbContactBtn").innerHTML = `<a class="sb-wa-locked" href="/plans">🔒 Renew Access</a>`;
      } else {
        const lockedDetailHtml = [];
        if (ownerPhone) lockedDetailHtml.push('<div class="oc-row-locked"><span>📞</span><span class="blurred-val">+91 98765 43210</span></div>');
        if (ownerEmail) lockedDetailHtml.push('<div class="oc-row-locked"><span>📧</span><span class="blurred-val">owner@email.com</span></div>');
        $("ownerDetail").innerHTML = lockedDetailHtml.join("");

        const lockHTML = `
          <div class="contact-lock">
            <span class="lock-icon">🔒</span>
            <div class="lock-title">Contact Info Locked</div>
            <div class="lock-sub">Get direct access to the owner's WhatsApp &amp; phone number — no agents, no brokerage.</div>
            <div class="lock-badge">✨ Free Trial Available</div>
            <a class="btn-subscribe" href="/plans">Start Free Trial — Unlock Now</a>
            ${!isLoggedIn ? `<a class="btn-login-lock" href="/login?redirect=${encodeURIComponent(window.location.href)}">Already subscribed? Sign In</a>` : ""}
          </div>`;
        $("contactButtonsWrap").innerHTML = lockHTML;
        $("ownerContactBtns").innerHTML = lockHTML;
        $("sbContactBtn").innerHTML = `<a class="sb-wa-locked" href="/plans">🔒 Unlock Contact</a>`;
      }

      renderGallery(p);
      initScrollReveal();
    }

    /* ── expose functions the innerHTML markup's inline onclick attrs need ── */
    window.openLb = openLb;
    window.closeLb = closeLb;
    window.closeLbOnBg = closeLbOnBg;
    window.lbPrev = lbPrev;
    window.lbNext = lbNext;
    window.lbGoTo = lbGoTo;
    window.toggleSave = toggleSave;

    /* ── wire up static controls ── */
    const onKeydown = (e) => {
      if (e.key === "Escape") { closeLb(); closeMo(); }
      if (e.key === "ArrowRight" && $("lightbox").classList.contains("show")) lbNext();
      if (e.key === "ArrowLeft" && $("lightbox").classList.contains("show")) lbPrev();
    };
    document.addEventListener("keydown", onKeydown);

    const lightboxEl = $("lightbox");
    const modalBgEl = $("modalBg");
    lightboxEl.addEventListener("click", closeLbOnBg);
    modalBgEl.addEventListener("click", closeMoBg);

    $("lbCloseBtn").addEventListener("click", closeLb);
    $("lbPrevBtn").addEventListener("click", lbPrev);
    $("lbNextBtn").addEventListener("click", lbNext);
    $("modalCloseBtn").addEventListener("click", closeMo);
    $("submitEnqBtn").addEventListener("click", submitEnq);
    $("enquireBtn").addEventListener("click", () => openMo("enquiry"));
    $("visitBtn").addEventListener("click", () => openMo("visit"));
    $("sbEnquireBtn").addEventListener("click", () => openMo("enquiry"));
    $("mobBtn").addEventListener("click", toggleMob);

    window.addEventListener("scroll", onNavScroll);
    const checkShareBar = setupShareBar();

    /* ── boot: auth + property fetch + subscription check ── */
    let unsubAuth = () => {};
    (async () => {
      const urlId = searchParams.get("id");
      if (!urlId) { showNotFound(); return; }

      try {
        const userPromise = new Promise((resolve) => {
          unsubAuth = onAuthStateChanged(auth, (u) => resolve(u), () => resolve(null));
        });
        const [userResult, propSnap] = await Promise.all([userPromise, getDoc(doc(db, "properties", urlId))]);

        window._currentUser = userResult || null;

        if (!propSnap.exists()) { showNotFound(); return; }

        const data = { id: propSnap.id, ...propSnap.data() };
        window._propData = data;

        try { await updateDoc(doc(db, "properties", urlId), { views: increment(1) }); } catch {}

        const localState = getLocalSubscriptionState();
        let hasSubscription = false;
        let trialExpired = false;

        if (localState === "active") {
          hasSubscription = true;
        } else if (localState === "expired") {
          trialExpired = true;
        } else {
          hasSubscription = await checkFirebaseSubscription(window._currentUser?.uid);
        }

        renderProperty(data, hasSubscription, trialExpired, !!window._currentUser);
      } catch (err) {
        console.error("Error loading property:", err);
        showNotFound();
      }
    })();

    return () => {
      unsubAuth();
      document.removeEventListener("keydown", onKeydown);
      lightboxEl.removeEventListener("click", closeLbOnBg);
      modalBgEl.removeEventListener("click", closeMoBg);
      window.removeEventListener("scroll", onNavScroll);
      window.removeEventListener("resize", checkShareBar);
      delete window.openLb;
      delete window.closeLb;
      delete window.closeLbOnBg;
      delete window.lbPrev;
      delete window.lbNext;
      delete window.lbGoTo;
      delete window.toggleSave;
    };
  }, [searchParams]);

  return (
    <div className="property-details-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
  );
}

export default function PropertyDetailsPage() {
  return (
    <Suspense fallback={null}>
      <PropertyDetailsInner />
    </Suspense>
  );
}
