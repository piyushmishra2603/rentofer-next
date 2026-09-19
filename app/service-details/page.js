"use client";

import { useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import "./page.css";

const FALLBACK_FEATURES = [
  { icon: "💧", label: "Water 24/7" },
  { icon: "⚡", label: "Power Backup" },
  { icon: "🔒", label: "CCTV Security" },
  { icon: "🏋️", label: "Gym Access" },
  { icon: "🅿️", label: "Parking" },
  { icon: "🌿", label: "Garden" },
  { icon: "🛜", label: "Wi-Fi Ready" },
  { icon: "🧹", label: "Housekeeping" },
];

const FALLBACK_REVIEWS = [
  { name: "Priya M.", stars: 5, date: "Mar 2025", text: "Excellent service! The property was exactly as described. Very clean and well-maintained." },
  { name: "Arjun K.", stars: 4, date: "Feb 2025", text: "Good value for money. Provider was responsive and helpful throughout the process." },
  { name: "Sneha R.", stars: 5, date: "Jan 2025", text: "Loved the location and amenities. Would definitely recommend to friends!" },
];

const BODY_HTML = `
<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<div class="wrapper">

  <div class="topbar">
    <div class="logo">SmartRent</div>
    <a href="/services" class="back-btn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      Back to Services
    </a>
  </div>

  <div class="breadcrumb">
    <a href="/" style="color:inherit;text-decoration:none;">Home</a>
    <span class="sep">›</span>
    <a href="/services" style="color:inherit;text-decoration:none;">Services</a>
    <span class="sep">›</span>
    <span id="breadTitle">Loading...</span>
  </div>

  <div class="main-grid">

    <div class="image-panel">
      <div class="main-img-wrap">
        <div class="img-badge">✓ Available Now</div>
        <div class="img-share">
          <button class="heart-btn" onclick="toggleLike(this)" title="Save">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button onclick="shareService()" title="Share">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
        <img id="mainImage" alt="Service Image" style="opacity:0;transition:opacity 0.4s;">
      </div>
      <div id="gallery" class="gallery"></div>
    </div>

    <div class="info-panel">
      <div>
        <div class="category-tag">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
          <span id="category">Loading...</span>
        </div>
      </div>
      <h1 id="title">Loading service details...</h1>

      <div class="meta-row">
        <div class="rating-badge">
          ⭐ <span id="ratingVal">4.5</span>
          <span class="review-count" id="reviewCount">(24 reviews)</span>
        </div>
        <div style="font-size:0.8rem;color:var(--muted);" id="locationBadge">
          📍 <span id="cityText">India</span>
        </div>
      </div>

      <div class="price-section">
        <div class="price-label">Starting From</div>
        <div id="price">₹—</div>
        <div class="price-note">Per month · Negotiable</div>
      </div>

      <p id="description" style="font-size:0.88rem;color:#94a3b8;line-height:1.7;">
        Premium quality service from a verified provider. Trusted by hundreds of customers across India.
      </p>

      <div class="trust-pills">
        <div class="trust-pill">✔ Verified</div>
        <div class="trust-pill">⚡ Fast Response</div>
        <div class="trust-pill">🔒 Secure Booking</div>
        <div class="trust-pill">🏅 Top Rated</div>
      </div>

      <div class="action-row">
        <button class="btn-primary" onclick="openBooking()">
          <span>Book Now 🚀</span>
        </button>
        <button class="btn-secondary" onclick="callNow()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.48 2 2 0 0 1 3.6 2.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 17z"/></svg>
          Call
        </button>
      </div>
    </div>
  </div>

  <div class="tabs-section">
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('overview',this)">Overview</button>
      <button class="tab-btn" onclick="switchTab('features',this)">Features</button>
      <button class="tab-btn" onclick="switchTab('reviews',this)">Reviews</button>
      <button class="tab-btn" onclick="switchTab('location',this)">Location</button>
    </div>

    <div id="tab-overview" class="tab-panel active">
      <p style="color:#94a3b8;line-height:1.8;font-size:0.9rem;" id="overviewText">
        This premium service comes with a range of amenities and is managed by a highly trusted provider with years of experience in the industry. All bookings are backed by our satisfaction guarantee.
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:20px;">
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.4rem;">🏠</span>
          <div><div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Property Type</div><div style="font-weight:600;font-size:0.9rem;" id="propType">Residential</div></div>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.4rem;">📅</span>
          <div><div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Available</div><div style="font-weight:600;font-size:0.9rem;">Immediately</div></div>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.4rem;">🔑</span>
          <div><div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Min. Lease</div><div style="font-weight:600;font-size:0.9rem;">11 Months</div></div>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.4rem;">🧾</span>
          <div><div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Deposit</div><div style="font-weight:600;font-size:0.9rem;" id="depositInfo">2 Months</div></div>
        </div>
      </div>
    </div>

    <div id="tab-features" class="tab-panel">
      <div class="features-grid" id="featuresGrid"></div>
    </div>

    <div id="tab-reviews" class="tab-panel">
      <div id="reviewsContainer"></div>
    </div>

    <div id="tab-location" class="tab-panel">
      <div class="map-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <p style="font-size:0.9rem;">Map integration coming soon</p>
        <p style="font-size:0.8rem;color:var(--muted);" id="mapCity"></p>
      </div>
    </div>
  </div>

  <div class="provider-card" style="margin-top:40px;">
    <div class="provider-avatar" id="providerInitial">?</div>
    <div class="provider-info">
      <div class="provider-name" id="providerName">Loading...</div>
      <div style="font-size:0.85rem;color:var(--muted);" id="providerCity">India</div>
      <div class="provider-meta">
        <div class="provider-stat">
          <div class="provider-stat-val">4.8</div>
          <div class="provider-stat-label">Avg Rating</div>
        </div>
        <div class="provider-stat">
          <div class="provider-stat-val">12+</div>
          <div class="provider-stat-label">Listings</div>
        </div>
        <div class="provider-stat">
          <div class="provider-stat-val">98%</div>
          <div class="provider-stat-label">Response Rate</div>
        </div>
      </div>
    </div>
  </div>

  <div class="similar-section">
    <div class="section-header">
      <div class="section-title">Similar Services</div>
      <a href="/services" class="section-link">View All →</a>
    </div>
    <div class="similar-grid" id="similarGrid"></div>
  </div>

</div>

<div class="modal-overlay" id="modalOverlay">
  <div class="modal">
    <button class="modal-close" onclick="closeBooking()">✕</button>
    <div class="modal-title">Book This Service</div>
    <div class="modal-sub">Fill in your details to send a booking request</div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Your Name</label>
        <input type="text" class="form-input" placeholder="Rahul Sharma" id="bookName">
      </div>
      <div class="form-group">
        <label class="form-label">Phone</label>
        <input type="tel" class="form-input" placeholder="9876543210" id="bookPhone">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Preferred Date</label>
      <input type="date" class="form-input" id="bookDate">
    </div>
    <div class="form-group">
      <label class="form-label">Message (Optional)</label>
      <textarea class="form-input" rows="3" placeholder="Any specific requirements?" id="bookMsg" style="resize:none;"></textarea>
    </div>
    <button class="btn-primary" style="width:100%;margin-top:4px;" onclick="submitBooking()">
      <span>Confirm Booking 🚀</span>
    </button>
  </div>
</div>

<div class="toast" id="toast"></div>
`;

export default function ServiceDetailsPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const $ = (id) => document.getElementById(id);
    const cleanupFns = [];

    function showToast(msg) {
      const t = $("toast");
      t.textContent = msg;
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 3000);
    }

    function setMain(src, el) {
      const img = $("mainImage");
      img.style.opacity = 0;
      setTimeout(() => {
        img.src = src;
        img.style.opacity = 1;
      }, 200);
      rootRef.current.querySelectorAll(".gallery-thumb").forEach((t) => t.classList.remove("active"));
      el.classList.add("active");
    }

    function switchTab(name, btn) {
      rootRef.current.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      rootRef.current.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      $("tab-" + name).classList.add("active");
      btn.classList.add("active");
    }

    function openBooking() {
      $("modalOverlay").classList.add("open");
    }
    function closeBooking() {
      $("modalOverlay").classList.remove("open");
    }
    function closeOnOverlay(e) {
      if (e.target.id === "modalOverlay") closeBooking();
    }

    function submitBooking() {
      const name = $("bookName").value.trim();
      const phone = $("bookPhone").value.trim();
      if (!name || !phone) {
        showToast("⚠ Please fill your name and phone");
        return;
      }
      closeBooking();
      showToast("✅ Booking request sent! Provider will contact you soon.");
    }

    function callNow() {
      showToast("📞 Call feature coming soon!");
    }

    function toggleLike(btn) {
      btn.classList.toggle("liked");
      showToast(btn.classList.contains("liked") ? "❤️ Saved to wishlist" : "💔 Removed from wishlist");
    }

    function shareService() {
      if (navigator.share) {
        navigator.share({ title: $("title").textContent, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => showToast("🔗 Link copied to clipboard!"));
      }
    }

    function loadSimilarDemo() {
      const items = [
        { name: "Cozy Studio Flat", price: "₹9,500", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400" },
        { name: "Luxury Villa", price: "₹65,000", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400" },
        { name: "3BHK Family Home", price: "₹25,000", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" },
      ];
      $("similarGrid").innerHTML = items
        .map(
          (s) => `
        <div class="similar-card">
          <img class="similar-img" src="${s.img}" alt="${s.name}">
          <div class="similar-body">
            <div class="similar-name">${s.name}</div>
            <div class="similar-price">${s.price}/mo</div>
          </div>
        </div>`
        )
        .join("");
    }

    function loadSimilar() {
      loadSimilarDemo();
    }

    function showError() {
      $("title").textContent = "Service not found";
    }

    function loadDemoMode() {
      $("title").textContent = "Premium 2BHK Apartment";
      $("breadTitle").textContent = "Premium 2BHK Apartment";
      $("category").textContent = "Residential Rental";
      $("price").textContent = "₹18,000";
      $("cityText").textContent = "Mumbai";
      $("providerName").textContent = "Rajesh Kumar";
      $("providerCity").textContent = "📍 Mumbai, Maharashtra";
      $("mapCity").textContent = "Mumbai, Maharashtra";
      $("providerInitial").textContent = "RK";
      $("mainImage").src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";
      $("mainImage").style.opacity = 1;
      $("featuresGrid").innerHTML = FALLBACK_FEATURES.map((f) => `<div class="feature-item"><span class="feature-icon">${f.icon}</span><span>${f.label}</span></div>`).join("");
      $("reviewsContainer").innerHTML = FALLBACK_REVIEWS.map(
        (r) => `
        <div class="review-card">
          <div class="review-header">
            <div class="reviewer"><div class="reviewer-avatar">${r.name[0]}</div>
            <div><div class="reviewer-name">${r.name}</div><div class="review-date">${r.date}</div></div></div>
            <div class="review-stars">${"⭐".repeat(r.stars)}</div>
          </div><div class="review-text">${r.text}</div></div>`
      ).join("");
      loadSimilarDemo();
    }

    async function load() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (!id) {
        showError();
        return;
      }

      try {
        const snap = await getDoc(doc(db, "providers", id));
        if (!snap.exists()) {
          showError();
          return;
        }

        const p = snap.data();

        $("title").textContent = p.name || "Service Details";
        $("breadTitle").textContent = p.name || "Details";
        $("category").textContent = p.type || "Rental Service";
        $("price").textContent = "₹" + (p.price || "—");
        $("ratingVal").textContent = p.rating || "4.5";
        $("cityText").textContent = p.city || "India";
        $("providerName").textContent = p.name || "—";
        $("providerCity").textContent = "📍 " + (p.city || "India");
        $("mapCity").textContent = p.city || "India";
        $("propType").textContent = p.type || "Residential";

        const initials = (p.name || "P")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        $("providerInitial").textContent = initials;

        if (p.description) {
          $("description").textContent = p.description;
          $("overviewText").textContent = p.description;
        }

        const img = $("mainImage");
        img.src = p.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";
        img.onload = () => {
          img.style.opacity = 1;
        };
        img.onerror = () => {
          img.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";
          img.style.opacity = 1;
        };

        const gallery = $("gallery");
        const imgs = p.images || [p.image];
        if (imgs.length > 0) {
          gallery.innerHTML = imgs
            .filter(Boolean)
            .map(
              (src, i) => `
            <div class="gallery-thumb ${i === 0 ? "active" : ""}" data-src="${src}">
              <img src="${src}" alt="gallery">
            </div>`
            )
            .join("");
          gallery.querySelectorAll(".gallery-thumb").forEach((thumb) => {
            thumb.addEventListener("click", () => setMain(thumb.dataset.src, thumb));
          });
        }

        const features = p.features || FALLBACK_FEATURES;
        $("featuresGrid").innerHTML = features
          .map(
            (f) => `
          <div class="feature-item">
            <span class="feature-icon">${f.icon || "✓"}</span>
            <span>${f.label || f}</span>
          </div>`
          )
          .join("");

        const reviews = p.reviews || FALLBACK_REVIEWS;
        $("reviewsContainer").innerHTML = reviews
          .map(
            (r) => `
          <div class="review-card">
            <div class="review-header">
              <div class="reviewer">
                <div class="reviewer-avatar">${r.name[0]}</div>
                <div>
                  <div class="reviewer-name">${r.name}</div>
                  <div class="review-date">${r.date || ""}</div>
                </div>
              </div>
              <div class="review-stars">${"⭐".repeat(r.stars || 5)}</div>
            </div>
            <div class="review-text">${r.text}</div>
          </div>`
          )
          .join("");
        $("reviewCount").textContent = `(${reviews.length} reviews)`;

        loadSimilar(p.type);
      } catch (err) {
        console.error(err);
        loadDemoMode();
      }
    }

    /* ── Wire up static (non-dynamically-injected) onclick targets ── */
    const overlay = $("modalOverlay");
    const onOverlayClick = (e) => closeOnOverlay(e);
    if (overlay) {
      overlay.addEventListener("click", onOverlayClick);
      cleanupFns.push(() => overlay.removeEventListener("click", onOverlayClick));
    }

    /* ── EXPOSE HANDLERS GLOBALLY (needed for the onclick="..." attributes above) ── */
    window.setMain = setMain;
    window.switchTab = switchTab;
    window.openBooking = openBooking;
    window.closeBooking = closeBooking;
    window.closeOnOverlay = closeOnOverlay;
    window.submitBooking = submitBooking;
    window.callNow = callNow;
    window.toggleLike = toggleLike;
    window.shareService = shareService;

    load();

    return () => {
      cleanupFns.forEach((fn) => fn());
      delete window.setMain;
      delete window.switchTab;
      delete window.openBooking;
      delete window.closeBooking;
      delete window.closeOnOverlay;
      delete window.submitBooking;
      delete window.callNow;
      delete window.toggleLike;
      delete window.shareService;
    };
  }, []);

  return <div className="service-details-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
