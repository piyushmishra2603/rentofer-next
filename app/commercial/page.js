"use client";

import { useEffect, useRef } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import "./page.css";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";

const TYPE_EMOJI = { Office: "🖥️", Retail: "🏪", Coworking: "💻", Warehouse: "🏭", Industrial: "⚙️", Showroom: "🚗" };
const TYPE_LABEL = { Office: "Office", Retail: "Retail", Coworking: "Co-working", Warehouse: "Warehouse", Industrial: "Industrial", Showroom: "Showroom" };
const TYPES = Object.keys(TYPE_LABEL);
const TYPE_BG = "linear-gradient(145deg,#e4e0d8,#ccc4b8)";

const BUDGET_MIN = 10000;
const BUDGET_MAX = 1000000;

const IDEAL_KEYS = {
  corp: /corporate|mnc/i, startup: /startup/i, retail: /retail/i, mfg: /manufactur/i,
  logi: /logistic|3pl/i, it: /\bit\b|ites/i, fnb: /f&b|restaurant|f&amp;b/i,
};
const AMEN_KEYS = {
  parking: /parking/i, power: /power/i, ac: /\bac\b|air cond/i, fibre: /fibre|fiber|internet|wifi/i,
  security: /security/i, lift: /lift|elevator/i, cafe: /cafeteria|pantry/i, cctv: /cctv/i,
};

const BODY_HTML = `
<div class="bg-texture"></div>
<div class="pgbar" id="pgBar"></div>
<div class="toast" id="toast"></div>

<div class="compare-bar" id="compareBar">
  <div style="font-family:'DM Serif Display',serif;font-size:16px;color:var(--ink);flex-shrink:0">Compare</div>
  <div class="cb-slots" id="compareSlots">
    <div class="cb-slot" id="cs1">+ Add property</div>
    <div class="cb-slot" id="cs2">+ Add property</div>
    <div class="cb-slot" id="cs3">+ Add property</div>
  </div>
  <button class="cb-compare-btn" onclick="doCompare()">Compare Now →</button>
  <button class="cb-close" onclick="clearCompare()">✕ Clear</button>
</div>

<div class="mob-drawer" id="mobDrawer">
  <a class="mob-l" href="/">🏠 Home</a>
  <a class="mob-l" href="/properties">🏘️ All Properties</a>
  <a class="mob-l" href="/pgs-hostels">🛏 PG &amp; Hostels</a>
  <a class="mob-l" href="/commercial" style="color:var(--terra)">🏢 Commercial</a>
  <a class="mob-l" href="#" style="opacity:.55;cursor:not-allowed" onclick="event.preventDefault();showToast('🔒 Home services are coming soon — stay tuned!')">🔧 Services · Stay tuned</a>
  <hr style="border:none;border-top:1.5px solid var(--div);margin:8px 0">
  <a class="nb nb-out" href="/login" style="text-decoration:none;justify-content:center">Sign In</a>
  <a class="nb nb-terra" href="/post-commercial" style="text-decoration:none;justify-content:center;margin-top:8px">+ List Commercial</a>
</div>

<nav class="nav" id="navbar">
  <a href="/" class="brand">
    <div class="bgem">💎</div>
    <span class="bname">SmartRent</span>
  </a>
  <div class="nav-links">
    <a class="nl" href="/">Home</a>
    <a class="nl" href="/properties">All Properties</a>
    <a class="nl" href="/pgs-hostels">PG &amp; Hostels</a>
    <a class="nl on" href="/commercial">Commercial</a>
    <a class="nl" href="#" style="opacity:.55;cursor:not-allowed" onclick="event.preventDefault();showToast('🔒 Home services are coming soon — stay tuned!')">Services · Soon</a>
    <a class="nl" href="/about-us">About</a>
  </div>
  <div class="nav-r">
    <a class="nb nb-out" href="/login" style="text-decoration:none">Sign In</a>
    <a class="nb nb-terra" href="/post-commercial" style="text-decoration:none">+ List Commercial</a>
    <button class="mob-btn" onclick="toggleMob()" id="mobBtn">☰</button>
  </div>
</nav>

<div class="page-hero">
  <div class="ph-inner">
    <div class="ph-top">
      <div class="ph-left">
        <div class="ph-eyebrow">Verified Listings · India</div>
        <h1 class="ph-title">Find Your<br><em>Perfect Workspace</em></h1>
        <p class="ph-sub">Offices · Retail · Co-working · Warehouses · Industrial · Showrooms — all in one place. Zero brokerage.</p>
      </div>
      <div class="ph-stats-row">
        <div class="phs"><div class="phs-v" id="stat-listings">0</div><div class="phs-l">Live Listings</div></div>
        <div class="phs"><div class="phs-v">₹0</div><div class="phs-l">Brokerage</div></div>
        <div class="phs"><div class="phs-v" id="stat-cities">0</div><div class="phs-l">Cities</div></div>
        <div class="phs"><div class="phs-v" id="stat-owners">0</div><div class="phs-l">Verified Owners</div></div>
      </div>
    </div>

    <div class="search-bar rv">
      <div class="sf">
        <span class="sf-ic">🔍</span>
        <input type="text" id="searchQ" placeholder="Search area, business park, city…" oninput="liveSearch(this.value)">
      </div>
      <div class="sf-sep"></div>
      <div class="sf" style="max-width:180px">
        <span class="sf-ic">🏙️</span>
        <select id="searchCity" onchange="applyAllFilters()">
          <option value="">Any City</option>
          <option>Hyderabad</option><option>Bangalore</option><option>Mumbai</option>
          <option>Delhi NCR</option><option>Chennai</option><option>Pune</option>
          <option>Kolkata</option><option>Noida</option><option>Ahmedabad</option>
        </select>
      </div>
      <div class="sf-sep"></div>
      <div class="sf" style="max-width:165px">
        <span class="sf-ic">🏢</span>
        <select id="searchType" onchange="applyAllFilters()">
          <option value="">Any Type</option>
          <option value="Office">Office Space</option>
          <option value="Retail">Retail / Shop</option>
          <option value="Coworking">Co-working</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Industrial">Industrial</option>
          <option value="Showroom">Showroom</option>
        </select>
      </div>
      <button class="search-go" onclick="applyAllFilters()">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        Search
      </button>
    </div>

    <div class="cat-tabs rv d1" id="catTabs">
      <button class="cat-tab on" data-cat="all" onclick="setCat(this,'all')">🏢 All <span class="ct-count" id="cnt-all">0</span></button>
      <button class="cat-tab" data-cat="Office" onclick="setCat(this,'Office')">🖥️ Office <span class="ct-count" id="cnt-Office">0</span></button>
      <button class="cat-tab" data-cat="Retail" onclick="setCat(this,'Retail')">🏪 Retail <span class="ct-count" id="cnt-Retail">0</span></button>
      <button class="cat-tab" data-cat="Coworking" onclick="setCat(this,'Coworking')">💻 Co-working <span class="ct-count" id="cnt-Coworking">0</span></button>
      <button class="cat-tab" data-cat="Warehouse" onclick="setCat(this,'Warehouse')">🏭 Warehouse <span class="ct-count" id="cnt-Warehouse">0</span></button>
      <button class="cat-tab" data-cat="Industrial" onclick="setCat(this,'Industrial')">⚙️ Industrial <span class="ct-count" id="cnt-Industrial">0</span></button>
      <button class="cat-tab" data-cat="Showroom" onclick="setCat(this,'Showroom')">🚗 Showroom <span class="ct-count" id="cnt-Showroom">0</span></button>
    </div>
  </div>
</div>

<div class="main-layout">

  <aside class="filter-sidebar">
    <div class="filter-sticky">

      <div class="filter-card rv">
        <div class="fc-head">
          <div class="fc-title">Filters</div>
          <button class="fc-reset" onclick="resetFilters()">Reset All</button>
        </div>

        <div class="filter-group">
          <div class="filter-label">Monthly Rent (up to)</div>
          <div class="range-row"><span>₹10,000</span><span class="range-val" id="budgetLabel">Any</span></div>
          <input type="range" class="frange" id="budgetRange" min="10000" max="1000000" value="1000000" step="10000" oninput="updateBudget(this.value)">
        </div>

        <div class="filter-group">
          <div class="filter-label">Space Type</div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="type-Office"><div class="fcheck-box"></div><span class="fcheck-lbl">Office Space</span><span class="fcheck-count" id="fc-Office">0</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="type-Retail"><div class="fcheck-box"></div><span class="fcheck-lbl">Retail / Shop</span><span class="fcheck-count" id="fc-Retail">0</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="type-Coworking"><div class="fcheck-box"></div><span class="fcheck-lbl">Co-working</span><span class="fcheck-count" id="fc-Coworking">0</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="type-Warehouse"><div class="fcheck-box"></div><span class="fcheck-lbl">Warehouse</span><span class="fcheck-count" id="fc-Warehouse">0</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="type-Industrial"><div class="fcheck-box"></div><span class="fcheck-lbl">Industrial</span><span class="fcheck-count" id="fc-Industrial">0</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="type-Showroom"><div class="fcheck-box"></div><span class="fcheck-lbl">Showroom</span><span class="fcheck-count" id="fc-Showroom">0</span></div>
        </div>

        <div class="filter-group">
          <div class="filter-label">Area (sq.ft)</div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="area-s"><div class="fcheck-box"></div><span class="fcheck-lbl">Under 1,000</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="area-m"><div class="fcheck-box"></div><span class="fcheck-lbl">1,000 – 3,000</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="area-l"><div class="fcheck-box"></div><span class="fcheck-lbl">3,000 – 10,000</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="area-xl"><div class="fcheck-box"></div><span class="fcheck-lbl">10,000+</span></div>
        </div>

        <div class="filter-group">
          <div class="filter-label">Furnishing</div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="furn-Fully Furnished"><div class="fcheck-box"></div><span class="fcheck-lbl">Fully Furnished</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="furn-Semi-Furnished"><div class="fcheck-box"></div><span class="fcheck-lbl">Semi-Furnished</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="furn-Bare Shell"><div class="fcheck-box"></div><span class="fcheck-lbl">Bare Shell</span></div>
        </div>

        <div class="filter-group">
          <div class="filter-label">Ideal For</div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="ideal-corp"><div class="fcheck-box"></div><span class="fcheck-lbl">Corporate / MNC</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="ideal-startup"><div class="fcheck-box"></div><span class="fcheck-lbl">Startup</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="ideal-retail"><div class="fcheck-box"></div><span class="fcheck-lbl">Retail Brand</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="ideal-mfg"><div class="fcheck-box"></div><span class="fcheck-lbl">Manufacturing</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="ideal-logi"><div class="fcheck-box"></div><span class="fcheck-lbl">Logistics / 3PL</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="ideal-it"><div class="fcheck-box"></div><span class="fcheck-lbl">IT / ITES</span></div>
          <div class="fcheck" onclick="toggleCheck(this)" data-filter="ideal-fnb"><div class="fcheck-box"></div><span class="fcheck-lbl">F&amp;B / Restaurant</span></div>
        </div>
      </div>

      <div class="filter-card rv d1">
        <div class="fc-head"><div class="fc-title">Must-Have Amenities</div></div>
        <div class="ftoggle" data-filter="amen-parking" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🅿️ Parking</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="amen-power" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">⚡ Power Backup</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="amen-ac" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">❄️ Air Conditioning</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="amen-fibre" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">📶 Fibre / Internet</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="amen-security" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🔒 24/7 Security</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="amen-lift" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🛗 Lift / Elevator</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="amen-cafe" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🍽️ Cafeteria / Pantry</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="amen-cctv" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">📹 CCTV</span><div class="ftoggle-sw"></div></div>
      </div>

      <div class="filter-card rv d2" style="background:linear-gradient(135deg,rgba(196,92,60,.06),rgba(196,92,60,.02))">
        <div class="fc-head"><div class="fc-title">Quality Filters</div></div>
        <div class="ftoggle" data-filter="q-verified" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">✅ Verified Properties Only</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="q-available" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🟢 Available Now</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" data-filter="q-new" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">✨ New Listings Only</span><div class="ftoggle-sw"></div></div>
      </div>

    </div>
  </aside>

  <div>

    <div class="map-view-banner rv">
      <div>
        <div class="mvb-t">🗺️ Looking for spaces by location?</div>
        <div style="font-size:12px;color:var(--sage);margin-top:2px">Map view is on the way — you'll soon be able to see every space on a neighbourhood map.</div>
      </div>
      <button class="mvb-btn" onclick="showToast('🗺️ Map view is coming soon!')">Map View · Soon</button>
    </div>

    <div class="sort-bar rv d1">
      <div class="sort-count"><em id="resultCount">0</em> commercial properties found</div>
      <div class="sort-controls">
        <select class="fsel" id="sortSel" onchange="applyAllFilters()">
          <option value="">Sort: Recommended</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="area">Area: Large First</option>
          <option value="newest">Newest First</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Viewed</option>
        </select>
        <div class="view-toggle">
          <button class="vbtn on" id="gridBtn" onclick="setView('grid')" title="Grid">⊞</button>
          <button class="vbtn" id="listBtn" onclick="setView('list')" title="List">☰</button>
        </div>
      </div>
    </div>

    <div class="cards-grid rv d2" id="cardsGrid">
      <div class="empty-state"><span class="es-ic">⏳</span><div class="es-t">Loading listings…</div></div>
    </div>

  </div>

</div>
`;

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

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
    const cleanupFns = [];

    /* ── STATE ── */
    let allProps = [];
    let activeCategory = "all";
    let currentView = "grid";
    let budgetMax = BUDGET_MAX;
    let savedIds = new Set();
    let compareIds = new Set();
    let cancelled = false;

    try {
      const s = localStorage.getItem("sr_watchlist");
      if (s) JSON.parse(s).forEach((id) => savedIds.add(id));
    } catch (_) {}

    const esc = (v) =>
      String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    /* ── Firestore doc → card shape ── */
    function isRecent(createdAt, days = 7) {
      try {
        const d = createdAt?.toDate ? createdAt.toDate() : createdAt ? new Date(createdAt) : null;
        return d ? Date.now() - d.getTime() < days * 86400000 : false;
      } catch (e) {
        return false;
      }
    }

    function mapDoc(d) {
      const isNew = !!(d.isNew || d.newListing) || isRecent(d.createdAt);
      const badges = [];
      if (d.verified) badges.push({ c: "pb-v", l: "✓ VERIFIED" });
      if (d.premium) badges.push({ c: "pb-p", l: "★ PREMIUM" });
      if (d.hot) badges.push({ c: "pb-h", l: "🔥 HOT" });
      if (isNew) badges.push({ c: "pb-n", l: "✨ NEW" });
      const furn = d.furnishing === "Shell" ? "Bare Shell" : d.furnishing || (d.furnished ? "Furnished" : "Bare Shell");
      const sqft = Number(String(d.sqft || "").replace(/,/g, "")) || 0;
      const phone = d.owner?.phone || d.phone || "";
      return {
        id: d.id,
        subtype: d.type || "Office",
        title: d.name || "Untitled Space",
        city: d.city || "",
        area: d.area || "",
        price: Number(d.price) || 0,
        per: d.per || "month",
        rating: d.rating || null,
        reviews: d.reviews || 0,
        furnish: furn,
        floor: d.floor && d.floor !== "—" ? d.floor : "",
        size: sqft || null,
        badges,
        amenities: Array.isArray(d.amenities) && d.amenities.length ? d.amenities : Array.isArray(d.tags) ? d.tags : [],
        ideal: Array.isArray(d.idealFor) ? d.idealFor : [],
        whatsapp: d.owner?.whatsapp || phone,
        phone,
        ownerUid: d.ownerUid || d.owner?.uid || "",
        verified: !!d.verified,
        available: d.available !== false && d.avail !== false,
        isNew,
        views: d.views || 0,
        coverImage: d.coverPhoto || (Array.isArray(d.photos) ? d.photos[0] : null) || null,
        createdAt: d.createdAt?.seconds || 0,
      };
    }

    /* ── RENDER CARDS ── */
    function renderCards(data) {
      const grid = $("cardsGrid");
      $("resultCount").textContent = data.length;

      if (!data.length) {
        grid.innerHTML = allProps.length
          ? `<div class="empty-state"><span class="es-ic">🏢</span><div class="es-t">No properties match your filters</div><div class="es-d">Try adjusting the filters or search with different keywords.</div></div>`
          : `<div class="empty-state"><span class="es-ic">🏢</span><div class="es-t">No commercial listings yet</div><div class="es-d">Be the first to list a commercial space.</div><a class="nb nb-terra" href="/post-commercial" style="text-decoration:none;margin-top:16px;display:inline-flex">+ List Commercial</a></div>`;
        return;
      }

      grid.innerHTML = data
        .map((p, i) => {
          const emoji = TYPE_EMOJI[p.subtype] || "🏢";
          const isSaved = savedIds.has(p.id);
          const isCompare = compareIds.has(p.id);
          const id = esc(p.id);
          const waNum = (p.whatsapp || "").replace(/[^\d]/g, "");
          const waLink = waNum
            ? `https://wa.me/${waNum.length === 10 ? "91" + waNum : waNum}?text=${encodeURIComponent(`Hi! I'm interested in your property: ${p.title} listed on SmartRent. Could you please share more details?`)}`
            : "";
          const ratingLabel = p.rating ? `⭐ ${esc(p.rating)}` : "🆕 New";
          const reviewsLabel = p.reviews ? ` <span style="opacity:.6;font-size:10px">(${esc(p.reviews)})</span>` : "";
          const viewsLabel = p.views >= 1000 ? (p.views / 1000).toFixed(1) + "K" : p.views;

          const cardImageInner = p.coverImage
            ? `<img class="pcard-photo" src="${esc(p.coverImage)}" alt="${esc(p.title)}" loading="lazy"
                onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
               <div class="pcard-emoji" style="display:none">${emoji}</div>`
            : `<div class="pcard-emoji">${emoji}</div>`;

          return `
          <div class="pcard" style="animation-delay:${i * 0.05}s" onclick="goToDetail('${id}')">
            <div class="pcard-img" style="background:${TYPE_BG}">
              ${cardImageInner}
              <div class="pcard-img-ov"></div>
              <div class="pcard-badges">${p.badges.map((b) => `<span class="pbdg ${b.c}">${b.l}</span>`).join("")}</div>
              <div class="pcard-save ${isSaved ? "saved" : ""}" onclick="event.stopPropagation();toggleSave(this,'${id}')" title="Save to wishlist">${isSaved ? "❤️" : "🤍"}</div>
              <div class="pcard-img-foot">
                <div class="pif-rat">${ratingLabel}${reviewsLabel}</div>
                <div class="pif-views">👁 ${viewsLabel} views</div>
              </div>
            </div>

            <div class="pcard-body">
              <div class="pcard-type-row">
                <span class="pcard-type">${esc(TYPE_LABEL[p.subtype] || p.subtype)}</span>
                <span class="pcard-avail ${p.available ? "" : "leased"}">${p.available ? "Available" : "Leased"}</span>
              </div>
              <div class="pcard-title">${esc(p.title)}</div>
              <div class="pcard-loc">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ${esc([p.area, p.city].filter(Boolean).join(", ") || "—")}
              </div>
              <div class="pcard-specs">
                ${p.size ? `<div class="pspec"><span class="pspec-ic">📐</span>${p.size.toLocaleString("en-IN")} sqft</div>` : ""}
                ${p.floor ? `<div class="pspec"><span class="pspec-ic">🏢</span>${esc(p.floor)}</div>` : ""}
                ${p.furnish ? `<div class="pspec"><span class="pspec-ic">🪑</span>${esc(p.furnish)}</div>` : ""}
              </div>
              <div class="pcard-amens">${p.amenities.slice(0, 5).map((a) => `<span class="pa">${esc(a)}</span>`).join("")}</div>

              <div class="pcard-footer">
                <div class="pcard-price">
                  <span class="cur">₹</span>${p.price.toLocaleString("en-IN")}
                  <span class="per">/ ${esc(p.per)}</span>
                </div>
                <div class="pcard-actions">
                  <button class="btn-call ${isCompare ? "active-compare" : ""}" title="Compare" onclick="event.stopPropagation();toggleCompare(this,'${id}')" style="${isCompare ? "background:var(--terra-d);border-color:var(--terra-b);color:var(--terra)" : ""}">⊞</button>
                  ${waLink ? `<a class="btn-wa" href="${waLink}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="${WA_PATH}"/></svg>
                    WhatsApp
                  </a>` : ""}
                  <a class="btn-view" href="/property-detail?id=${encodeURIComponent(p.id)}&type=commercial" onclick="event.stopPropagation()">View →</a>
                </div>
              </div>
            </div>
          </div>`;
        })
        .join("");
    }

    /* ── FILTERS ── */
    function activeFilters(prefix) {
      return [...root.querySelectorAll(`[data-filter^="${prefix}-"].on`)].map((el) => el.getAttribute("data-filter").slice(prefix.length + 1));
    }

    function applyAllFilters() {
      let data = [...allProps];
      const q = $("searchQ").value.trim().toLowerCase();
      const city = $("searchCity").value;
      const type = $("searchType").value;
      const sort = $("sortSel").value;

      if (activeCategory !== "all") data = data.filter((p) => p.subtype === activeCategory);
      if (type) data = data.filter((p) => p.subtype === type);
      if (city) data = data.filter((p) => p.city === city);
      if (q)
        data = data.filter((p) => [p.title, p.area, p.city, p.subtype].some((s) => (s || "").toLowerCase().includes(q)));

      if (budgetMax < BUDGET_MAX) data = data.filter((p) => p.price <= budgetMax);

      const types = activeFilters("type");
      if (types.length) data = data.filter((p) => types.includes(p.subtype));

      const areas = activeFilters("area");
      if (areas.length) {
        const inB = (s, b) => (b === "s" ? s < 1000 : b === "m" ? s >= 1000 && s < 3000 : b === "l" ? s >= 3000 && s < 10000 : s >= 10000);
        data = data.filter((p) => areas.some((b) => inB(p.size || 0, b)));
      }

      const furns = activeFilters("furn");
      if (furns.length)
        data = data.filter((p) => furns.some((f) => (p.furnish || "").toLowerCase().startsWith(f.toLowerCase().split(" ")[0]) || (p.furnish || "").toLowerCase() === f.toLowerCase()));

      const ideals = activeFilters("ideal");
      if (ideals.length) data = data.filter((p) => ideals.some((k) => p.ideal.some((s) => IDEAL_KEYS[k].test(s))));

      activeFilters("amen").forEach((k) => {
        data = data.filter((p) => p.amenities.some((a) => AMEN_KEYS[k].test(a)));
      });

      const quality = activeFilters("q");
      if (quality.includes("verified")) data = data.filter((p) => p.verified);
      if (quality.includes("available")) data = data.filter((p) => p.available);
      if (quality.includes("new")) data = data.filter((p) => p.isNew);

      if (sort === "price_asc") data.sort((a, b) => a.price - b.price);
      else if (sort === "price_desc") data.sort((a, b) => b.price - a.price);
      else if (sort === "area") data.sort((a, b) => (b.size || 0) - (a.size || 0));
      else if (sort === "newest") data.sort((a, b) => b.createdAt - a.createdAt);
      else if (sort === "rating") data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (sort === "popular") data.sort((a, b) => b.views - a.views);

      renderCards(data);
    }

    function setCat(el, cat) {
      root.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("on"));
      el.classList.add("on");
      activeCategory = cat;
      applyAllFilters();
    }

    function liveSearch() {
      applyAllFilters();
    }

    function resetFilters() {
      $("searchQ").value = "";
      $("searchCity").value = "";
      $("searchType").value = "";
      $("sortSel").value = "";
      $("budgetRange").value = BUDGET_MAX;
      setBudgetLabel(BUDGET_MAX);
      root.querySelectorAll(".fcheck").forEach((c) => {
        c.classList.remove("on");
        c.querySelector(".fcheck-box").textContent = "";
      });
      root.querySelectorAll(".ftoggle").forEach((t) => t.classList.remove("on"));
      activeCategory = "all";
      const tabs = root.querySelectorAll(".cat-tab");
      tabs.forEach((t) => t.classList.remove("on"));
      if (tabs[0]) tabs[0].classList.add("on");
      applyAllFilters();
      toast("🔄 Filters reset");
    }

    function toggleCheck(el) {
      el.classList.toggle("on");
      el.querySelector(".fcheck-box").textContent = el.classList.contains("on") ? "✓" : "";
      applyAllFilters();
    }

    function toggleSwitch(el) {
      el.classList.toggle("on");
      applyAllFilters();
    }

    function setBudgetLabel(val) {
      budgetMax = parseInt(val, 10);
      const pct = ((val - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
      $("budgetRange").style.setProperty("--range-pct", pct + "%");
      $("budgetLabel").textContent =
        budgetMax >= BUDGET_MAX ? "Any" : budgetMax >= 100000 ? "₹" + (budgetMax / 100000).toFixed(1) + "L" : "₹" + budgetMax.toLocaleString("en-IN");
    }

    function updateBudget(val) {
      setBudgetLabel(val);
      applyAllFilters();
    }

    /* ── VIEW ── */
    function setView(v) {
      currentView = v;
      $("cardsGrid").classList.toggle("list-view", v === "list");
      $("gridBtn").classList.toggle("on", v === "grid");
      $("listBtn").classList.toggle("on", v === "list");
    }

    /* ── SAVE (this browser) ── */
    function toggleSave(btn, id) {
      if (savedIds.has(id)) {
        savedIds.delete(id);
        btn.textContent = "🤍";
        btn.classList.remove("saved");
        toast("💔 Removed from wishlist");
      } else {
        savedIds.add(id);
        btn.textContent = "❤️";
        btn.classList.add("saved");
        toast("❤️ Saved to wishlist!");
      }
      try { localStorage.setItem("sr_watchlist", JSON.stringify([...savedIds])); } catch (_) {}
    }

    /* ── COMPARE ── */
    const ACTIVE_CMP = "background:var(--terra-d);border-color:var(--terra-b);color:var(--terra)";
    function toggleCompare(btn, id) {
      if (compareIds.has(id)) {
        compareIds.delete(id);
        btn.style.cssText = "";
        toast("⊟ Removed from compare");
      } else {
        if (compareIds.size >= 3) {
          toast("⚠️ Max 3 properties can be compared");
          return;
        }
        compareIds.add(id);
        btn.style.cssText = ACTIVE_CMP;
        toast("⊞ Added to compare!");
      }
      updateCompareBar();
    }

    function updateCompareBar() {
      const ids = [...compareIds];
      ["cs1", "cs2", "cs3"].forEach((slotId, i) => {
        const el = $(slotId);
        if (ids[i] !== undefined) {
          const p = allProps.find((x) => x.id === ids[i]);
          el.className = "cb-slot filled";
          el.textContent = p ? p.title.substring(0, 22) + "…" : "";
        } else {
          el.className = "cb-slot";
          el.textContent = "+ Add property";
        }
      });
      $("compareBar").classList.toggle("show", compareIds.size > 0);
    }

    function doCompare() {
      toast("📊 Property comparison launching soon! We're building something great.");
    }
    function clearCompare() {
      compareIds.clear();
      root.querySelectorAll(".btn-call").forEach((b) => (b.style.cssText = ""));
      updateCompareBar();
    }

    function goToDetail(id) {
      window.location.href = "/property-detail?id=" + encodeURIComponent(id) + "&type=commercial";
    }

    /* ── STAT COUNTERS ── */
    function animCount(id, target, delay = 0) {
      const el = $(id);
      if (!el) return;
      setTimeout(() => {
        const dur = 1200, start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 4)) * target);
          if (p < 1 && !cancelled) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
      }, delay);
    }

    function updateCounts() {
      $("cnt-all").textContent = allProps.length;
      TYPES.forEach((t) => {
        const n = allProps.filter((p) => p.subtype === t).length;
        const a = $("cnt-" + t);
        const b = $("fc-" + t);
        if (a) a.textContent = n;
        if (b) b.textContent = n;
      });
      const cities = new Set(allProps.map((p) => p.city).filter(Boolean));
      const owners = new Set(allProps.filter((p) => p.verified).map((p) => p.ownerUid).filter(Boolean));
      animCount("stat-listings", allProps.length);
      animCount("stat-cities", cities.size, 150);
      animCount("stat-owners", owners.size, 300);
    }

    /* ── NAVBAR, MOBILE MENU, TOAST, REVEAL ── */
    const onScroll = () => {
      $("navbar")?.classList.toggle("solid", window.scrollY > 40);
      const t = document.documentElement;
      const h = t.scrollHeight - window.innerHeight;
      if ($("pgBar")) $("pgBar").style.width = Math.min(h > 0 ? (window.scrollY / h) * 100 : 0, 100) + "%";
    };
    window.addEventListener("scroll", onScroll);
    cleanupFns.push(() => window.removeEventListener("scroll", onScroll));

    function toggleMob() {
      const open = $("mobDrawer").classList.toggle("open");
      $("mobBtn").textContent = open ? "✕" : "☰";
    }

    let toastTimer;
    function toast(msg) {
      const el = $("toast");
      if (!el) return;
      el.innerHTML = msg;
      el.style.display = "block";
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (el.style.display = "none"), 3500);
    }
    cleanupFns.push(() => clearTimeout(toastTimer));

    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.08 }
    );
    root.querySelectorAll(".rv").forEach((el) => obs.observe(el));
    cleanupFns.push(() => obs.disconnect());

    /* ── expose handlers used by inline onclick="" ── */
    const handlers = {
      setCat, applyAllFilters, liveSearch, resetFilters, toggleCheck, toggleSwitch, updateBudget,
      setView, toggleSave, toggleCompare, doCompare, clearCompare, goToDetail, toggleMob, showToast: toast,
    };
    Object.assign(window, handlers);

    setBudgetLabel(BUDGET_MAX);

    /* ── load live listings ── */
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "commercialProperties"), limit(100)));
        if (cancelled) return;
        allProps = snap.docs.map((d) => mapDoc({ id: d.id, ...d.data() }));
        allProps.sort((a, b) => b.createdAt - a.createdAt);
        updateCounts();
        applyAllFilters();
      } catch (e) {
        console.error("Could not load commercial listings:", e);
        if (cancelled) return;
        $("cardsGrid").innerHTML = `<div class="empty-state"><span class="es-ic">⚠️</span><div class="es-t">Couldn't load listings</div><div class="es-d">Please check your connection and refresh the page.</div></div>`;
      }
    })();

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
      Object.keys(handlers).forEach((k) => delete window[k]);
    };
  }, []);

  return <div className="properties-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
