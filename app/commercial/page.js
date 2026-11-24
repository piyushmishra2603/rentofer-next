"use client";

import { useEffect, useRef } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import "./page.css";

const BODY_HTML = `
<!-- Background layers -->
<div class="bg-dots"></div>
<div class="bg-orb o1"></div>
<div class="bg-orb o2"></div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<!-- Mobile drawer -->
<aside class="mob-drawer" id="mobDrawer">
  <a class="mob-l" href="/">🏠 Home</a>
  <a class="mob-l" href="/pgs-hostels">🛏️ PG &amp; Hostels</a>
  <a class="mob-l" href="/properties">🏡 Flats</a>
  <a class="mob-l" href="/properties">🤝 Co-living</a>
  <a class="mob-l" href="/commercial" style="color:var(--gold)">🏢 Commercial</a>
  <a class="mob-l" href="/owner-dashboard">📋 Dashboard</a>
  <hr style="border:none;border-top:1px solid var(--div);margin:6px 0">
  <a class="btn btn-ghost" href="/login" style="width:100%;justify-content:center;margin-top:6px">Sign In</a>
  <a class="btn btn-gold" href="/post-commercial" style="width:100%;justify-content:center;margin-top:6px">+ List Commercial</a>
</aside>

<!-- Navbar -->
<nav class="nav" id="navbar">
  <a href="/" class="brand">
    <div class="brand-gem">💎</div>
    <span class="brand-name">SmartRent</span>
  </a>
  <div class="nav-links">
    <a class="nl" href="/">Home</a>
    <a class="nl" href="/pgs-hostels">PG &amp; Hostels</a>
    <a class="nl" href="/properties">Flats</a>
    <a class="nl" href="/properties">Co-living</a>
    <a class="nl on" href="/commercial">Commercial <span class="hot">HOT</span></a>
  </div>
  <div class="nav-r">
    <a class="btn btn-ghost" href="/login">Sign In</a>
    <a class="btn btn-gold" href="/post-commercial">+ List Commercial</a>
    <button class="mob-btn" id="mobBtn">☰</button>
  </div>
</nav>

<!-- Hero -->
<header class="hero">
  <!-- Decorative rings -->
  <div class="hero-rings">
    <div class="ring r1"></div>
    <div class="ring r2"></div>
    <div class="ring r3"></div>
  </div>

  <!-- Building skyline silhouette -->
  <svg class="skyline-art" viewBox="0 0 1400 220" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <rect x="60" y="140" width="40" height="80" fill="#8a5010"/>
    <rect x="70" y="118" width="20" height="22" fill="#8a5010"/>
    <rect x="120" y="100" width="60" height="120" fill="#8a5010"/>
    <rect x="135" y="76" width="30" height="24" fill="#8a5010"/>
    <rect x="200" y="130" width="30" height="90" fill="#8a5010"/>
    <rect x="250" y="84" width="50" height="136" fill="#8a5010"/>
    <rect x="260" y="60" width="30" height="24" fill="#8a5010"/>
    <rect x="320" y="118" width="40" height="102" fill="#8a5010"/>
    <rect x="380" y="64" width="70" height="156" fill="#8a5010"/>
    <rect x="390" y="42" width="50" height="22" fill="#8a5010"/>
    <rect x="415" y="24" width="8" height="18" fill="#8a5010"/>
    <rect x="470" y="124" width="35" height="96" fill="#8a5010"/>
    <rect x="520" y="90" width="55" height="130" fill="#8a5010"/>
    <rect x="530" y="66" width="35" height="24" fill="#8a5010"/>
    <rect x="595" y="108" width="40" height="112" fill="#8a5010"/>
    <rect x="650" y="72" width="65" height="148" fill="#8a5010"/>
    <rect x="660" y="50" width="45" height="22" fill="#8a5010"/>
    <rect x="730" y="134" width="35" height="86" fill="#8a5010"/>
    <rect x="780" y="98" width="50" height="122" fill="#8a5010"/>
    <rect x="790" y="74" width="30" height="24" fill="#8a5010"/>
    <rect x="845" y="122" width="40" height="98" fill="#8a5010"/>
    <rect x="900" y="82" width="60" height="138" fill="#8a5010"/>
    <rect x="910" y="58" width="40" height="24" fill="#8a5010"/>
    <rect x="975" y="116" width="45" height="104" fill="#8a5010"/>
    <rect x="1035" y="94" width="55" height="126" fill="#8a5010"/>
    <rect x="1045" y="70" width="35" height="24" fill="#8a5010"/>
    <rect x="1105" y="128" width="38" height="92" fill="#8a5010"/>
    <rect x="1160" y="76" width="62" height="144" fill="#8a5010"/>
    <rect x="1170" y="54" width="42" height="22" fill="#8a5010"/>
    <rect x="1238" y="138" width="35" height="82" fill="#8a5010"/>
    <rect x="1285" y="104" width="50" height="116" fill="#8a5010"/>
    <rect x="1350" y="144" width="40" height="76" fill="#8a5010"/>
  </svg>

  <p class="hero-eyebrow">
    <span class="live-dot"></span>
    Commercial Real Estate · Rent Verified Spaces
  </p>
  <h1 class="hero-h1">Rent Premium<br><em>Commercial</em> Space</h1>
  <p class="hero-sub">Where your business belongs.</p>
  <p class="hero-desc">
    Discover verified office spaces, retail shops, warehouses, co-working hubs &amp;
    industrial units across India's prime business districts.
    Zero brokerage. Transparent leases. Instant owner connects.
  </p>

  <!-- Search bar -->
  <div class="search-wrap">
    <div class="search-box">
      <div class="sf">
        <span class="sf-ic">🔍</span>
        <input type="search" id="sQ" placeholder="Area, business park, city…" autocomplete="off" />
      </div>
      <div class="s-sep"></div>
      <div class="sf" style="max-width:175px">
        <span class="sf-ic">🏙️</span>
        <select id="sCity">
          <option value="">Any City</option>
          <option>Hyderabad</option><option>Bangalore</option><option>Mumbai</option>
          <option>Delhi NCR</option><option>Chennai</option><option>Pune</option>
        </select>
      </div>
      <div class="s-sep"></div>
      <div class="sf" style="max-width:162px">
        <span class="sf-ic">🏢</span>
        <select id="sType">
          <option value="">Any Type</option>
          <option value="Office">Office Space</option>
          <option value="Retail">Retail / Shop</option>
          <option value="Coworking">Co-working</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Industrial">Industrial</option>
          <option value="Showroom">Showroom</option>
        </select>
      </div>
      <button class="search-go" onclick="doSearch()">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        Find Space
      </button>
    </div>

    <div class="type-pills">
      <button class="tpill on" onclick="setPill(this,'all')">🏢 All</button>
      <button class="tpill" onclick="setPill(this,'Office')">🖥️ Office</button>
      <button class="tpill" onclick="setPill(this,'Retail')">🏪 Retail</button>
      <button class="tpill" onclick="setPill(this,'Coworking')">💻 Co-working</button>
      <button class="tpill" onclick="setPill(this,'Warehouse')">🏭 Warehouse</button>
      <button class="tpill" onclick="setPill(this,'Industrial')">⚙️ Industrial</button>
      <button class="tpill" onclick="setPill(this,'Showroom')">🚗 Showroom</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="hero-stats">
    <div class="hstat"><div class="hstat-v" id="statListings">—</div><div class="hstat-l">Live Listings</div></div>
    <div class="hstat"><div class="hstat-v">45+</div><div class="hstat-l">Business Parks</div></div>
    <div class="hstat"><div class="hstat-v">12+</div><div class="hstat-l">Cities</div></div>
    <div class="hstat"><div class="hstat-v">₹0</div><div class="hstat-l">Brokerage</div></div>
    <div class="hstat"><div class="hstat-v">24hr</div><div class="hstat-l">Response</div></div>
  </div>
</header>

<!-- Marquee -->
<div class="mqbar">
  <div class="mqtrack" id="mqtrack"></div>
</div>

<!-- Category bar -->
<nav class="cat-bar">
  <div class="cat-inner">
    <button class="ctab active" data-type="all" onclick="setCat(this,'all')">🏢 All Commercial <span class="ctab-n" id="cntAll">—</span></button>
    <button class="ctab" data-type="Office" onclick="setCat(this,'Office')">🖥️ Office <span class="ctab-n" id="cntOffice">—</span></button>
    <button class="ctab" data-type="Retail" onclick="setCat(this,'Retail')">🏪 Retail <span class="ctab-n" id="cntRetail">—</span></button>
    <button class="ctab" data-type="Coworking" onclick="setCat(this,'Coworking')">💻 Co-working <span class="ctab-n" id="cntCoworking">—</span></button>
    <button class="ctab" data-type="Warehouse" onclick="setCat(this,'Warehouse')">🏭 Warehouse <span class="ctab-n" id="cntWarehouse">—</span></button>
    <button class="ctab" data-type="Industrial" onclick="setCat(this,'Industrial')">⚙️ Industrial <span class="ctab-n" id="cntIndustrial">—</span></button>
    <button class="ctab" data-type="Showroom" onclick="setCat(this,'Showroom')">🚗 Showroom <span class="ctab-n" id="cntShowroom">—</span></button>
    <div class="cat-end">
      <a class="btn btn-gold" href="/post-commercial" style="font-size:12px;padding:6px 14px">+ List</a>
    </div>
  </div>
</nav>

<!-- Filter & Listing -->
<section class="filter-sec">
  <div class="W">

    <div class="filter-bar rv">
      <span class="f-label">🎛 Filters</span>
      <div class="fchips">
        <button class="fchip on" onclick="setChip('all',this)">All</button>
        <button class="fchip" onclick="setChip('available',this)">✅ Available Now</button>
        <button class="fchip" onclick="setChip('furnished',this)">🪑 Furnished</button>
        <button class="fchip" onclick="setChip('verified',this)">✓ Verified</button>
        <button class="fchip" onclick="setChip('new',this)">✨ New Listing</button>
        <button class="fchip" onclick="setChip('premium',this)">★ Premium</button>
      </div>
      <div class="fcontrols">
        <select class="fsel" id="fCity" onchange="applyFilters()">
          <option value="">All Cities</option>
          <option>Hyderabad</option><option>Bangalore</option><option>Mumbai</option>
          <option>Delhi NCR</option><option>Chennai</option><option>Pune</option>
        </select>
        <select class="fsel" id="fBudget" onchange="applyFilters()">
          <option value="">Any Budget</option>
          <option value="50000">Under ₹50K/mo</option>
          <option value="150000">Under ₹1.5L/mo</option>
          <option value="300000">Under ₹3L/mo</option>
          <option value="600000">Under ₹6L/mo</option>
        </select>
        <select class="fsel" id="fSort" onchange="applyFilters()">
          <option value="">Sort: Recommended</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="area">Area: Large First</option>
          <option value="rating">Highest Rated</option>
          <option value="new">Newest First</option>
        </select>
      </div>
    </div>

    <div class="results-row rv">
      <div class="rcount"><em id="rCount">0</em> commercial properties found</div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="view-sw">
          <button class="vsw on" id="gBtn" onclick="setView('grid')" title="Grid view">⊞</button>
          <button class="vsw" id="lBtn" onclick="setView('list')" title="List view">☰</button>
        </div>
      </div>
    </div>

    <div class="prop-grid rv d1" id="propGrid">
      <!-- Loaded from Firestore -->
      <div class="loading-grid">
        <div class="spinner"></div>
        <div class="loading-text">Loading listings…</div>
      </div>
    </div>

  </div>
</section>

<!-- Why SmartRent -->
<section class="why-sec">
  <div class="W">
    <div class="rv">
      <p class="sec-eyebrow">The Advantage</p>
      <h2 class="sec-h2">Why Rent Commercial Space<br><em>Through SmartRent</em></h2>
    </div>
    <div class="why-grid rv d1">
      <article class="wcard">
        <span class="wcard-ic">⚡</span>
        <h3 class="wcard-t">Zero Brokerage</h3>
        <p class="wcard-d">Connect directly with landlords — no broker commissions, no hidden charges. Transparent lease terms from day one.</p>
      </article>
      <article class="wcard">
        <span class="wcard-ic">✅</span>
        <h3 class="wcard-t">100% Verified</h3>
        <p class="wcard-d">Every listing physically inspected by our commercial team. Legal clearances, occupancy certificates, and RERA compliance all checked.</p>
      </article>
      <article class="wcard">
        <span class="wcard-ic">🎯</span>
        <h3 class="wcard-t">Right-Fit Search</h3>
        <p class="wcard-d">Filter by city, type, budget and floor area to find spaces that genuinely match your headcount, growth plans and business needs.</p>
      </article>
      <article class="wcard">
        <span class="wcard-ic">📊</span>
        <h3 class="wcard-t">Market Intelligence</h3>
        <p class="wcard-d">Real-time rent benchmarks, vacancy analytics, and micro-market trends to help you negotiate the best commercial lease.</p>
      </article>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-sec">
  <div class="W">
    <div class="cta-inner rv">
      <div>
        <p class="sec-eyebrow" style="color:rgba(181,116,42,.8)">For Commercial Landlords</p>
        <h2 class="cta-t">Own Commercial Space?<br><em>List It Free Today</em></h2>
        <p class="cta-d">Connect with verified businesses, corporates and entrepreneurs actively searching for commercial space. Receive genuine enquiries and maximise returns.</p>
      </div>
      <div class="cta-btns">
        <a class="cta-main" href="/post-commercial">🏢 List Commercial Property Free</a>
        <a class="cta-ghost" href="/owner-dashboard">📋 Owner Dashboard</a>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer>
  <div class="W">
    <div class="foot-grid">
      <div>
        <a href="/" class="brand" style="margin-bottom:16px;display:flex;text-decoration:none">
          <div class="brand-gem" style="width:30px;height:30px;font-size:14px">💎</div>
          <span class="brand-name" style="font-size:17px">SmartRent</span>
        </a>
        <p class="fb-d">India's trusted rental platform for PGs, flats, co-living &amp; commercial — zero brokerage, fully verified.</p>
        <div class="socs">
          <a class="soc" href="#" title="Twitter">𝕏</a>
          <a class="soc" href="#" title="Instagram">📸</a>
          <a class="soc" href="#" title="LinkedIn">in</a>
        </div>
      </div>
      <nav>
        <h3 class="ft-t">For Tenants</h3>
        <a class="fl" href="/pgs-hostels">Browse PG &amp; Hostels</a>
        <a class="fl" href="/properties">Flat Search</a>
        <a class="fl" href="/properties">Co-living</a>
        <a class="fl" href="/commercial">Commercial Spaces</a>
      </nav>
      <nav>
        <h3 class="ft-t">For Owners</h3>
        <a class="fl" href="/post-property">List Property Free</a>
        <a class="fl" href="/owner-dashboard">Owner Dashboard</a>
      </nav>
      <nav>
        <h3 class="ft-t">Company</h3>
        <a class="fl" href="/about-us">About Us</a>
        <a class="fl" href="/privacy">Privacy Policy</a>
        <a class="fl" href="/terms">Terms &amp; Conditions</a>
        <a class="fl" href="/contact">Contact Us</a>
      </nav>
    </div>
    <div class="foot-bot">
      <p class="foot-copy">© 2025–2026 SmartRent. All rights reserved. Built with ❤️ in India.</p>
    </div>
  </div>
</footer>
`;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";

const TYPE_EMOJI = {
  Office: "🏢", Retail: "🏪", Coworking: "💻",
  Warehouse: "🏭", Industrial: "⚙️", Showroom: "🚗",
};

export default function CommercialPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!document.querySelector("link[data-commercial-fonts]")) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = FONTS_HREF;
      l.dataset.commercialFonts = "true";
      document.head.appendChild(l);
    }

    const $ = (id) => root.querySelector("#" + id);
    const $$ = (sel) => root.querySelectorAll(sel);

    let _all = [];
    let _catType = "all";
    let _chipType = "all";
    const _saved = new Set();
    let toastTimer;
    let cancelled = false;

    const esc = (v) =>
      String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    function showToast(msg, ms = 3200) {
      const t = $("toast");
      if (!t) return;
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove("show"), ms);
    }

    const isAvail = (p) => p.available !== false && p.avail !== false;
    const isNewL = (p) => p.isNew || p.newListing;

    /* ── load from Firestore ── */
    async function loadListings() {
      try {
        const snap = await getDocs(query(collection(db, "commercialProperties"), limit(100)));
        if (cancelled) return;
        _all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        _all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        updateCounters();
        applyFilters();
      } catch (err) {
        console.error("Firestore error:", err);
        if (cancelled) return;
        $("propGrid").innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🏢</div>
            <div class="empty-text">No listings found. Be the first to list a commercial property.</div>
            <div style="margin-top:14px"><a class="btn btn-gold" href="/post-commercial">+ List Commercial Property</a></div>
          </div>`;
        $("rCount").textContent = "0";
      }
    }

    function updateCounters() {
      $("statListings").textContent = _all.length;
      $("cntAll").textContent = _all.length;
      ["Office", "Retail", "Coworking", "Warehouse", "Industrial", "Showroom"].forEach((t) => {
        const el = $("cnt" + t);
        if (el) el.textContent = _all.filter((p) => p.type === t).length;
      });
    }

    function renderGrid(data) {
      $("rCount").textContent = data.length;
      const grid = $("propGrid");
      if (!data.length) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-text">${_all.length ? "No properties match your filters." : "No listings yet. Be the first to list a commercial property."}</div>
          </div>`;
        return;
      }
      grid.innerHTML = data.map((p, i) => buildCard(p, i)).join("");
    }

    function buildCard(p, i) {
      const saved = _saved.has(p.id);
      const imgSrc = p.coverPhoto || p.photos?.[0] || "";
      const emoji = TYPE_EMOJI[p.type] || "🏢";
      const price = typeof p.price === "number" ? p.price.toLocaleString("en-IN") : esc(p.price || "—");
      const per = esc(p.per || "month");
      const sqft = esc(p.sqft || p.area || "—");
      const unit = esc(p.unit || "sqft");
      const floor = esc(String(p.floor || "—").split(" ")[0]);
      const furnished = p.furnished ? "Yes" : "Shell";
      const tags = Array.isArray(p.tags) ? p.tags.slice(0, 3) : [];

      const badges = [];
      if (p.verified) badges.push('<span class="badge badge-verified">✓ Verified</span>');
      if (p.premium) badges.push('<span class="badge badge-premium">★ Premium</span>');
      if (isNewL(p)) badges.push('<span class="badge badge-new">New</span>');
      if (p.hot) badges.push('<span class="badge badge-hot">Hot</span>');

      const imgHtml = imgSrc
        ? `<img src="${esc(imgSrc)}" alt="${esc(p.name || "Property")}" loading="lazy" />`
        : `<div class="card-img-placeholder">${emoji}</div>`;
      const id = esc(p.id);

      return `
<div class="prop-card" style="animation-delay:${i * 0.05}s">
  <div class="card-img">
    ${imgHtml}
    <div class="img-overlay"></div>
    <div class="img-badges">${badges.join("")}</div>
    <button class="save-btn" onclick="toggleSave(this,'${id}')" title="${saved ? "Remove" : "Save"}">${saved ? "❤️" : "🤍"}</button>
    <div class="img-foot">
      ${p.rating ? `<div class="img-rating">⭐ ${esc(p.rating)} <span style="opacity:.6;font-size:10px">(${esc(p.reviews || 0)})</span></div>` : "<div></div>"}
      <div class="img-area">${sqft} ${unit}</div>
    </div>
  </div>
  <div class="card-body">
    <div class="type-avail">
      <span class="type-chip">${esc(p.type || "Commercial")}</span>
      ${isAvail(p) ? '<span class="avail-yes">● Available</span>' : '<span class="avail-no">● Leased</span>'}
    </div>
    <div class="card-name" title="${esc(p.name || "")}">${esc(p.name || "Unnamed Property")}</div>
    <div class="card-loc">
      <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 12.414a4 4 0 10-5.656 5.656L8 19l6-6"/>
      </svg>
      ${esc([p.area, p.city].filter(Boolean).join(", ") || "—")}
    </div>
    <div class="specs">
      <div class="spec"><div class="spec-v">${sqft}</div><div class="spec-l">${unit}</div></div>
      <div class="spec"><div class="spec-v">${floor}</div><div class="spec-l">Floor</div></div>
      <div class="spec"><div class="spec-v">${furnished}</div><div class="spec-l">Furnished</div></div>
    </div>
    ${tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
    <div class="card-foot">
      <div class="price-block">
        <div class="price-val"><span class="cur">₹</span>${price}</div>
        <div class="price-per">/${per}</div>
      </div>
      <div class="card-btns">
        <button class="btn-call" onclick="callOwner('${id}')">📞 Call</button>
        <a class="btn-view" href="/property-detail?id=${encodeURIComponent(p.id)}&type=commercial">View →</a>
      </div>
    </div>
  </div>
</div>`;
    }

    /* ── filters ── */
    function setCat(el, type) {
      $$(".ctab").forEach((t) => t.classList.remove("active"));
      el.classList.add("active");
      _catType = type;
      applyFilters();
    }
    function setChip(type, el) {
      $$(".fchip").forEach((c) => c.classList.remove("on"));
      el.classList.add("on");
      _chipType = type;
      applyFilters();
    }
    function applyFilters() {
      let d = [..._all];
      if (_catType !== "all") d = d.filter((p) => p.type === _catType);

      if (_chipType === "available") d = d.filter(isAvail);
      else if (_chipType === "furnished") d = d.filter((p) => p.furnished);
      else if (_chipType === "verified") d = d.filter((p) => p.verified);
      else if (_chipType === "new") d = d.filter(isNewL);
      else if (_chipType === "premium") d = d.filter((p) => p.premium);

      const city = $("fCity").value;
      if (city) d = d.filter((p) => p.city === city);

      const bud = parseInt($("fBudget").value, 10);
      if (bud) d = d.filter((p) => typeof p.price === "number" && p.price <= bud);

      const sort = $("fSort").value;
      const sq = (p) => parseInt(String(p.sqft || "0").replace(/,/g, ""), 10) || 0;
      if (sort === "price_asc") d.sort((a, b) => (a.price || 0) - (b.price || 0));
      if (sort === "price_desc") d.sort((a, b) => (b.price || 0) - (a.price || 0));
      if (sort === "area") d.sort((a, b) => sq(b) - sq(a));
      if (sort === "rating") d.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (sort === "new") d.sort((a, b) => (isNewL(b) ? 1 : 0) - (isNewL(a) ? 1 : 0));

      renderGrid(d);
    }

    function doSearch() {
      const q = $("sQ").value.trim().toLowerCase();
      const city = $("sCity").value;
      const type = $("sType").value;
      let d = [..._all];
      if (q)
        d = d.filter(
          (p) =>
            (p.name || "").toLowerCase().includes(q) ||
            (p.area || "").toLowerCase().includes(q) ||
            (p.city || "").toLowerCase().includes(q)
        );
      if (city) d = d.filter((p) => p.city === city);
      if (type) {
        _catType = type;
        d = d.filter((p) => p.type === type);
      }
      renderGrid(d);
      root.querySelector(".filter-sec")?.scrollIntoView({ behavior: "smooth" });
    }

    function setPill(el, type) {
      $$(".tpill").forEach((p) => p.classList.remove("on"));
      el.classList.add("on");
      _catType = type === "all" ? "all" : type;
      $$(".ctab").forEach((t) => t.classList.toggle("active", t.getAttribute("data-type") === _catType));
      applyFilters();
    }

    function setView(v) {
      $("propGrid").classList.toggle("list-view", v === "list");
      $("gBtn").classList.toggle("on", v === "grid");
      $("lBtn").classList.toggle("on", v === "list");
    }

    function toggleSave(btn, id) {
      if (_saved.has(id)) {
        _saved.delete(id);
        btn.textContent = "🤍";
        showToast("💔 Removed from watchlist");
      } else {
        _saved.add(id);
        btn.textContent = "❤️";
        showToast("❤️ Added to watchlist!");
      }
      try { localStorage.setItem("sr_watchlist", JSON.stringify([..._saved])); } catch (_) {}
    }

    function callOwner(id) {
      const p = _all.find((x) => x.id === id);
      const phone = (p?.owner?.phone || p?.phone || "").replace(/[^\d+]/g, "");
      if (!phone) {
        showToast("📞 Phone number not available — open the listing to enquire.");
        return;
      }
      window.location.href = "tel:" + phone;
    }

    /* ── marquee / reveal / menu / navbar ── */
    const items = [
      "📍 Hyderabad IT Parks — ₹65/sqft",
      "🌟 Zero Brokerage Guaranteed",
      "✅ 100% Verified Commercial Spaces",
      "🚀 Right-Fit Space Search",
      "💼 12+ Cities Covered",
      "🎯 Instant Owner Connect",
      "🏭 Warehouses From ₹18/sqft",
      "🏢 Grade-A Offices Available Now",
    ];
    $("mqtrack").innerHTML = [...items, ...items]
      .map((it) => `<div class="mqitem"><span>🏢</span><span class="mqitem-tx">${it}</span></div>`)
      .join("");

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        }),
      { threshold: 0.1 }
    );
    $$(".rv").forEach((el) => io.observe(el));

    const btn = $("mobBtn");
    const drawer = $("mobDrawer");
    const onBtn = () => drawer.classList.toggle("open");
    const onDocClick = (e) => {
      if (!drawer.contains(e.target) && e.target !== btn) drawer.classList.remove("open");
    };
    btn.addEventListener("click", onBtn);
    document.addEventListener("click", onDocClick);

    const onScroll = () => $("navbar")?.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll);

    try {
      const s = localStorage.getItem("sr_watchlist");
      if (s) JSON.parse(s).forEach((id) => _saved.add(id));
    } catch (_) {}

    Object.assign(window, { setCat, setChip, applyFilters, doSearch, setPill, setView, toggleSave, callOwner });

    loadListings();

    return () => {
      cancelled = true;
      clearTimeout(toastTimer);
      io.disconnect();
      btn.removeEventListener("click", onBtn);
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("scroll", onScroll);
      ["setCat", "setChip", "applyFilters", "doSearch", "setPill", "setView", "toggleSave", "callOwner"].forEach((k) => delete window[k]);
    };
  }, []);

  return <div className="commercial-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
