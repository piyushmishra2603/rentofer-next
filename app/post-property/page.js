"use client";

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, getDoc, doc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import "./page.css";

const CLOUD_NAME = "dq3hko9hn";
const UPLOAD_PRESET = "dl6dnzau";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const LS_OWNER_KEY = "sr_owner_subscription";
const LS_ANY_KEY = "sr_subscription";

const BODY_HTML = `
<div class="bg-scene"><div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div></div>
<div class="dot-grid"></div>

<div class="toast" id="toast">
  <div class="toast-dot"></div>
  <span id="toastMsg">Message</span>
  <button class="toast-close" onclick="dismissToast()">×</button>
</div>

<nav class="topbar" id="topbar">
  <a href="/" class="brand">
    <div class="brand-gem">💎</div>
    <span class="brand-name">SmartRent<span class="brand-tag">AI</span></span>
  </a>
  <div class="nav-links">
    <div class="fb-pill connecting" id="fbPill"><div class="fb-dot"></div><span id="fbPillText">CONNECTING</span></div>
    <a href="/" class="nav-link">🏠 Home</a>
    <a href="/owner-dashboard" class="nav-link">📊 Dashboard</a>
    <a href="/properties" class="nav-link">🔍 Browse</a>
  </div>
</nav>

<div class="page">

  <div class="page-header">
    <div class="ph-eyebrow">New Listing</div>
    <h1 class="ph-title">Post Your Property 🏘️</h1>
    <p class="ph-sub">Fill in 3 simple steps — go live and reach 50,000+ verified tenants instantly.</p>
  </div>

  <div id="authGate" style="display:none">
    <div class="auth-gate">
      <span class="ag-icon">🔐</span>
      <div class="ag-title">Sign In to List Your Property</div>
      <div class="ag-sub">You need a SmartRent AI account to post properties. It's free and takes under 60 seconds.</div>
      <div class="ag-btns">
        <a class="btn btn-primary btn-lg" href="/login">Sign In</a>
        <a class="btn btn-teal btn-lg" href="/register">Create Free Account →</a>
      </div>
    </div>
  </div>

  <div id="mainForm" style="display:none">

    <div class="form-progress-wrap">
      <div class="form-progress-bar" id="formProgressBar" style="width:0%"></div>
    </div>

    <div class="stepper" id="stepper">
      <div class="step active" id="s1"><div class="step-circle" id="sc1">1</div><div class="step-label">Basic Info</div></div>
      <div class="step-line" id="sl1"></div>
      <div class="step" id="s2"><div class="step-circle" id="sc2">2</div><div class="step-label">Details &amp; Rules</div></div>
      <div class="step-line" id="sl2"></div>
      <div class="step" id="s3"><div class="step-circle" id="sc3">3</div><div class="step-label">Photos &amp; Review</div></div>
    </div>

    <!-- STEP 1 -->
    <div class="step-panel active" id="panel1">
      <div class="card">
        <div class="sec-header">
          <div class="sec-tag">Step 1 of 3 · ~3 min</div>
          <div class="sec-title">Basic Information</div>
          <div class="sec-sub">Start with the essentials. Accurate details attract better-quality tenants.</div>
        </div>

        <div class="field">
          <label>Property Type <span class="req">*</span></label>
          <div class="type-grid" id="typeGrid">
            <div class="type-card selected" data-type="Apartment" onclick="selectType(this)"><span class="type-icon">🏢</span><div class="type-name">Apartment</div></div>
            <div class="type-card" data-type="Independent House" onclick="selectType(this)"><span class="type-icon">🏠</span><div class="type-name">House</div></div>
            <div class="type-card" data-type="Villa" onclick="selectType(this)"><span class="type-icon">🏡</span><div class="type-name">Villa</div></div>
            <div class="type-card" data-type="Studio" onclick="selectType(this)"><span class="type-icon">🛋️</span><div class="type-name">Studio</div></div>
            <div class="type-card" data-type="Builder Floor" onclick="selectType(this)"><span class="type-icon">🏗️</span><div class="type-name">Builder Floor</div></div>
            <div class="type-card" data-type="PG / Hostel" onclick="selectType(this)"><span class="type-icon">🛏️</span><div class="type-name">PG / Hostel</div></div>
          </div>
        </div>

        <div class="field" id="f-title">
          <label>Property Title <span class="req">*</span> <span class="hint-tag">mention BHK + area + USP</span></label>
          <input id="title" placeholder="e.g. Spacious 2BHK with Modular Kitchen in Bandra West" maxlength="90"
                 oninput="updateCharCount('title','titleCount',90);updateS1Progress()">
          <div class="char-count" id="titleCount">0 / 90</div>
          <div class="input-error">Please enter a title (minimum 10 characters).</div>
        </div>

        <div class="grid-2">
          <div class="field" id="f-price">
            <label>Monthly Rent <span class="req">*</span></label>
            <div class="input-wrap">
              <span class="input-icon">₹</span>
              <input id="price" type="number" placeholder="25000" min="1000" max="2000000" oninput="updateS1Progress()">
            </div>
            <div class="input-hint">Expected monthly rent amount</div>
            <div class="input-error">Enter a valid rent (min ₹1,000).</div>
          </div>
          <div class="field" id="f-bhk">
            <label>Configuration <span class="req">*</span></label>
            <div class="select-wrap">
              <select id="bhk" onchange="updateS1Progress()">
                <option value="">— Select BHK —</option>
                <option>1 RK / Studio</option><option>1 BHK</option><option>2 BHK</option>
                <option>3 BHK</option><option>4 BHK</option><option>4+ BHK</option>
                <option>Villa</option><option>Penthouse</option><option>Commercial Space</option>
              </select>
            </div>
            <div class="input-error">Please select a configuration.</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="field" id="f-city">
            <label>City <span class="req">*</span></label>
            <div class="select-wrap">
              <select id="city" onchange="updateS1Progress()">
                <option value="">— Select City —</option>
                <option>Hyderabad</option><option>Bangalore</option><option>Mumbai</option>
                <option>Delhi</option><option>Chennai</option><option>Pune</option>
                <option>Kolkata</option><option>Ahmedabad</option><option>Noida</option>
                <option>Gurgaon</option><option>Kochi</option><option>Jaipur</option>
                <option>Chandigarh</option><option>Indore</option><option>Vizag</option>
              </select>
            </div>
            <div class="input-error">Please select a city.</div>
          </div>
          <div class="field" id="f-locality">
            <label>Locality <span class="req">*</span></label>
            <input id="locality" placeholder="e.g. Banjara Hills, Koramangala" oninput="updateS1Progress()">
            <div class="input-error">Please enter the locality.</div>
          </div>
        </div>

        <div class="field">
          <label>Full Address <span class="hint-tag">Revealed to tenants only after contact</span></label>
          <input id="fullAddress" placeholder="Flat No., Building, Street, PIN code">
          <div class="input-hint">Exact address is only shown to verified tenants</div>
        </div>

        <div class="grid-3">
          <div class="field">
            <label>Carpet Area</label>
            <div class="input-suf-wrap">
              <input id="area" type="number" placeholder="850" min="50">
              <span class="input-suffix">sq.ft</span>
            </div>
          </div>
          <div class="field">
            <label>Floor Number</label>
            <div class="select-wrap">
              <select id="floor">
                <option value="">—</option>
                <option>Ground Floor</option><option>1st Floor</option><option>2nd Floor</option>
                <option>3rd Floor</option><option>4th Floor</option><option>5th Floor</option>
                <option>6–10th Floor</option><option>11–20th Floor</option><option>20+ Floor</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>Total Floors</label>
            <input id="totalFloors" type="number" placeholder="12" min="1">
          </div>
        </div>

        <div class="grid-2">
          <div class="field">
            <label>Security Deposit <span class="hint-tag">Typical: 1–3 months rent</span></label>
            <div class="input-wrap">
              <span class="input-icon">₹</span>
              <input id="deposit" type="number" placeholder="50000" min="0">
            </div>
          </div>
          <div class="field">
            <label>Available From</label>
            <input id="availableFrom" type="date">
          </div>
        </div>

        <div class="grid-2">
          <div class="field">
            <label>Property Facing</label>
            <div class="select-wrap">
              <select id="facing">
                <option value="">— Select —</option>
                <option>East Facing</option><option>North Facing</option>
                <option>West Facing</option><option>South Facing</option>
                <option>North-East</option><option>North-West</option>
                <option>South-East</option><option>South-West</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>Age of Property</label>
            <div class="select-wrap">
              <select id="propAge">
                <option value="">— Select —</option>
                <option>Under Construction</option><option>0–1 year</option>
                <option>1–3 years</option><option>3–7 years</option>
                <option>7–10 years</option><option>10+ years</option>
              </select>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <div class="s1-prog">Step 1 of 3 · <span id="s1prog">0</span>/5 required fields</div>
          <button class="btn btn-primary btn-lg" onclick="nextStep(1)">Continue →</button>
        </div>
      </div>
    </div>

    <!-- STEP 2 -->
    <div class="step-panel" id="panel2">
      <div class="card">
        <div class="sec-header">
          <div class="sec-tag">Step 2 of 3 · ~4 min</div>
          <div class="sec-title">Details, Amenities &amp; Rules</div>
          <div class="sec-sub">More detail = higher ranking = better enquiries. Take 4 minutes here.</div>
        </div>

        <div class="field">
          <label>Furnishing Status <span class="req">*</span></label>
          <div class="furnish-grid" id="furnishGrid">
            <div class="furnish-card selected" data-f="Unfurnished" onclick="selectFurnish(this)"><span class="f-icon">📦</span><div class="f-name">Unfurnished</div></div>
            <div class="furnish-card" data-f="Semi-Furnished" onclick="selectFurnish(this)"><span class="f-icon">🪑</span><div class="f-name">Semi-Furnished</div></div>
            <div class="furnish-card" data-f="Fully Furnished" onclick="selectFurnish(this)"><span class="f-icon">🛋️</span><div class="f-name">Fully Furnished</div></div>
            <div class="furnish-card" data-f="Premium Furnished" onclick="selectFurnish(this)"><span class="f-icon">💎</span><div class="f-name">Premium</div></div>
          </div>
        </div>

        <div class="sec-divider"><span>Amenities &amp; Features</span></div>

        <div class="field">
          <label>Amenities <span class="hint-tag">Select all that apply</span></label>
          <div class="chips-wrap" id="amenitiesWrap">
            <div class="chip" onclick="toggleChip(this)">🅿️ Covered Parking</div>
            <div class="chip" onclick="toggleChip(this)">🏊 Swimming Pool</div>
            <div class="chip" onclick="toggleChip(this)">🏋️ Gym</div>
            <div class="chip" onclick="toggleChip(this)">🔒 24/7 Security</div>
            <div class="chip" onclick="toggleChip(this)">📹 CCTV</div>
            <div class="chip" onclick="toggleChip(this)">🛗 Lift / Elevator</div>
            <div class="chip" onclick="toggleChip(this)">⚡ Power Backup</div>
            <div class="chip" onclick="toggleChip(this)">💧 24H Water Supply</div>
            <div class="chip" onclick="toggleChip(this)">📶 Fibre WiFi Ready</div>
            <div class="chip" onclick="toggleChip(this)">🌿 Garden / Park</div>
            <div class="chip" onclick="toggleChip(this)">🐾 Pet Friendly</div>
            <div class="chip" onclick="toggleChip(this)">🍳 Modular Kitchen</div>
            <div class="chip" onclick="toggleChip(this)">♨️ Geyser</div>
            <div class="chip" onclick="toggleChip(this)">❄️ Air Conditioning</div>
            <div class="chip" onclick="toggleChip(this)">🎾 Clubhouse</div>
            <div class="chip" onclick="toggleChip(this)">🚿 Attached Bathroom</div>
            <div class="chip" onclick="toggleChip(this)">🏠 Society Maintenance</div>
            <div class="chip" onclick="toggleChip(this)">🌞 Balcony</div>
            <div class="chip" onclick="toggleChip(this)">🌳 Gated Society</div>
            <div class="chip" onclick="toggleChip(this)">🏗️ Rainwater Harvesting</div>
          </div>
        </div>

        <div class="field">
          <label>Preferred Tenants</label>
          <div class="chips-wrap" id="tenantWrap">
            <div class="chip selected" onclick="toggleChip(this)">👨‍👩‍👧 Family</div>
            <div class="chip" onclick="toggleChip(this)">🧑‍💼 Working Professional</div>
            <div class="chip" onclick="toggleChip(this)">🎓 Student</div>
            <div class="chip" onclick="toggleChip(this)">👥 Bachelors</div>
            <div class="chip" onclick="toggleChip(this)">🌍 Anyone Welcome</div>
            <div class="chip" onclick="toggleChip(this)">👩 Women Only</div>
          </div>
        </div>

        <div class="sec-divider"><span>Property Rules &amp; Policies</span></div>

        <div class="grid-3">
          <div class="field">
            <label>Cooking</label>
            <div class="select-wrap"><select id="cooking"><option value="">—</option><option>Yes</option><option>Veg Only</option><option>No</option></select></div>
          </div>
          <div class="field">
            <label>Non-Vegetarian</label>
            <div class="select-wrap"><select id="nonveg"><option value="">—</option><option>Allowed</option><option>Not Allowed</option></select></div>
          </div>
          <div class="field">
            <label>Smoking</label>
            <div class="select-wrap"><select id="smoking"><option value="">—</option><option>Not Allowed</option><option>Outside Only</option><option>Allowed</option></select></div>
          </div>
          <div class="field">
            <label>Drinking</label>
            <div class="select-wrap"><select id="drinking"><option value="">—</option><option>Not Allowed</option><option>In Rooms Only</option><option>Allowed</option></select></div>
          </div>
          <div class="field">
            <label>Visitors</label>
            <div class="select-wrap"><select id="guests"><option value="">—</option><option>Reasonable Hours</option><option>Not Allowed</option><option>24/7 Allowed</option></select></div>
          </div>
          <div class="field">
            <label>Maintenance</label>
            <div class="select-wrap"><select id="maintenance"><option value="">—</option><option>Included in Rent</option><option>Extra Charge</option><option>Owner Pays</option></select></div>
          </div>
        </div>

        <div class="sec-divider"><span>Owner &amp; Contact Details</span></div>

        <div class="grid-2">
          <div class="field" id="f-ownerName">
            <label>Owner / Contact Name <span class="req">*</span></label>
            <div class="input-wrap">
              <span class="input-icon">👤</span>
              <input id="ownerName" placeholder="Your full name">
            </div>
            <div class="input-error">Please enter your name.</div>
          </div>
          <div class="field" id="f-ownerPhone">
            <label>Mobile Number <span class="req">*</span></label>
            <div class="input-wrap">
              <span class="input-icon">📞</span>
              <input id="ownerPhone" type="tel" placeholder="+91 98765 43210" maxlength="15">
            </div>
            <div class="input-error">Please enter a valid 10-digit phone number.</div>
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>WhatsApp Number <span class="hint-tag">Leave blank to use mobile</span></label>
            <div class="input-wrap">
              <span class="input-icon">💬</span>
              <input id="ownerWA" type="tel" placeholder="Same as mobile or alternate">
            </div>
          </div>
          <div class="field">
            <label>Email Address</label>
            <div class="input-wrap">
              <span class="input-icon">📧</span>
              <input id="ownerEmail" type="email" placeholder="you@email.com">
            </div>
          </div>
        </div>

        <div class="sec-divider"><span>Property Description</span></div>

        <div class="field" id="f-desc">
          <label>Description <span class="req">*</span> <span class="hint-tag">min 50 characters</span></label>
          <textarea id="description" maxlength="800"
            placeholder="Describe your property — natural light, room sizes, nearby metro/schools/IT parks, community vibe, what makes it special…"
            oninput="updateCharCount('description','descCount',800)"></textarea>
          <div class="char-count" id="descCount">0 / 800</div>
          <div class="input-error">Description must be at least 50 characters.</div>
        </div>

        <div class="btn-row">
          <button class="btn btn-ghost" onclick="goStep(1)">← Back</button>
          <button class="btn btn-primary btn-lg" onclick="nextStep(2)">Continue →</button>
        </div>
      </div>
    </div>

    <!-- STEP 3 -->
    <div class="step-panel" id="panel3">

      <div class="card">
        <div class="sec-header">
          <div class="sec-tag">Step 3 of 3</div>
          <div class="sec-title">Photos &amp; Final Review</div>
          <div class="sec-sub">Great photos get <strong>3× more enquiries.</strong> Upload at least 3. First photo = cover image.</div>
        </div>

        <div class="info-row info">
          <span class="ii">☁️</span>
          <div>Photos upload to <strong>Cloudinary CDN</strong> for fast delivery worldwide. Max <strong>5 MB</strong> per photo · JPG, PNG, WEBP · Up to <strong>15 photos</strong>. Click ⭐ to set your cover photo.</div>
        </div>

        <div class="photo-bar">
          <label style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--t2);font-weight:600;">Upload Photos</label>
          <div class="photo-count-badge" id="photoCountBadge">0 / 15</div>
        </div>

        <div id="dropZone" class="drop-zone">
          <span class="drop-icon">📸</span>
          <div class="drop-title">Drag &amp; Drop photos here</div>
          <div class="drop-sub">or click to browse from your device</div>
          <span class="drop-limit">JPG · PNG · WEBP · Max 5 MB each · Up to 15 photos</span>
          <input type="file" id="imageInput" multiple accept="image/jpeg,image/png,image/webp" hidden>
        </div>

        <div id="imgGrid" class="img-grid"></div>
        <div id="uploadItemsList" style="margin-top:14px;"></div>
      </div>

      <div class="card">
        <div class="sec-header" style="margin-bottom:16px;">
          <div class="sec-tag">Review Before Publishing</div>
          <div class="sec-title" style="font-size:22px;">Listing Summary</div>
          <div class="sec-sub">Verify all details. You can edit anytime from your Owner Dashboard.</div>
        </div>

        <div class="info-row notice">
          <span class="ii">⏳</span>
          <div>Your listing will be <strong>reviewed within 24 hours</strong> and go live after approval. You'll receive an email notification.</div>
        </div>

        <div class="summary-wrap" id="summaryCard">
          <div style="text-align:center;padding:20px;color:var(--t3);font-size:13.5px;">Complete the previous steps to see your summary.</div>
        </div>
      </div>

      <div class="btn-row" id="step3BtnRow">
        <button class="btn btn-ghost" onclick="goStep(2)">← Back</button>
        <div id="submitArea" class="submit-area">
          <div class="sub-checking">
            <div class="spin"></div>
            Checking your subscription…
          </div>
        </div>
      </div>

    </div>

    <div class="success-screen" id="successScreen">
      <span class="success-icon">🎉</span>
      <div class="success-title">Property Submitted!</div>
      <div class="success-sub">Your property has been submitted to SmartRent AI.<br>Our team will review it and you'll get notified once it's live.</div>
      <div class="success-approval-note">
        ⏳ <strong>Pending Review</strong> — Your listing will be reviewed within 24 hours. Once approved, it becomes visible to 50,000+ tenants across India.
      </div>
      <div class="success-id" id="successDocId">Property ID: Generating…</div>
      <div class="success-images" id="successImageRow"></div>
      <div class="success-btns">
        <a href="/owner-dashboard" class="btn btn-primary btn-lg">📊 Go to Dashboard</a>
        <a href="/properties" class="btn btn-ghost btn-lg">🔍 Browse Listings</a>
        <button class="btn btn-ghost btn-lg" onclick="location.reload()">+ Post Another</button>
      </div>
    </div>

  </div>

</div>
`;

export default function PostPropertyPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const $ = (id) => document.getElementById(id);
    const cleanupFns = [];

    /* ── STATE ── */
    let selectedType = "Apartment";
    let selectedFurnish = "Unfurnished";
    let uploadedFiles = [];
    let coverIdx = 0;
    let currentStep = 1;

    /* ── SUBSCRIPTION CHECK ── */
    function _isLocalSubValid(sub) {
      if (!sub) return false;
      if (sub.status !== "trial_active" && sub.status !== "active") return false;
      if (sub.trialEndDate) {
        const exp = new Date(sub.trialEndDate);
        if (isNaN(exp.getTime()) || exp < new Date()) return false;
      }
      return true;
    }

    async function checkOwnerSubscription(uid) {
      try {
        const raw = localStorage.getItem(LS_OWNER_KEY);
        if (raw) {
          const sub = JSON.parse(raw);
          if (_isLocalSubValid(sub)) {
            return { hasAccess: true, planName: sub.planName || "Owner Plan", source: "localStorage:owner" };
          }
        }
      } catch (e) {}

      try {
        const raw = localStorage.getItem(LS_ANY_KEY);
        if (raw) {
          const sub = JSON.parse(raw);
          if (sub.planId === "owner" && _isLocalSubValid(sub)) {
            return { hasAccess: true, planName: sub.planName || "Owner Plan", source: "localStorage:generic" };
          }
        }
      } catch (e) {}

      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) return { hasAccess: false, planName: null, source: "firestore:no-doc" };

        const data = snap.data();

        const sub = data.ownerSubscription || data.subscription || null;
        if (sub) {
          const isOwnerPlan =
            sub.plan &&
            (String(sub.plan).toLowerCase().includes("owner") ||
              String(sub.plan).toLowerCase().includes("landlord") ||
              String(sub.plan).toLowerCase().includes("pro"));
          const isActive = sub.status === "active" || sub.active === true;
          let notExpired = true;
          if (sub.expiresAt) {
            const exp = sub.expiresAt.toDate ? sub.expiresAt.toDate() : new Date(sub.expiresAt);
            notExpired = exp > new Date();
          }
          if (isOwnerPlan && isActive && notExpired) {
            return { hasAccess: true, planName: sub.plan || "Owner Plan", source: "firestore:sub-object" };
          }
        }

        if (data.ownerPlan === true || data.isOwner === true || data.canPostProperty === true) {
          return { hasAccess: true, planName: data.planName || data.subscriptionPlan || "Owner Plan", source: "firestore:flags" };
        }

        const roles = data.roles || data.role || [];
        const roleArr = Array.isArray(roles) ? roles : [roles];
        if (roleArr.some((r) => ["owner", "landlord", "pro", "premium"].includes(String(r).toLowerCase()))) {
          return { hasAccess: true, planName: data.planName || "Owner Plan", source: "firestore:roles" };
        }

        return { hasAccess: false, planName: null, source: "firestore:no-match" };
      } catch (err) {
        console.error("Subscription check error:", err);
        return { hasAccess: false, planName: null, source: "error", error: err.message };
      }
    }

    function escHtml(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function renderSubChecking() {
      const area = $("submitArea");
      if (area)
        area.innerHTML = `
        <div class="sub-checking">
          <div class="spin"></div>
          Checking your subscription…
        </div>`;
    }

    function renderSubmitArea(hasAccess, planName) {
      const area = $("submitArea");
      if (!area) return;

      if (hasAccess) {
        area.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-end;">
            <div class="sub-active-badge">
              <div class="sub-dot"></div>
              OWNER PLAN ACTIVE
              <span class="sub-plan-name">${escHtml(planName || "Owner")}</span>
            </div>
            <button class="btn btn-success btn-lg" id="submitBtn" onclick="submitProperty()">
              🚀 Upload &amp; Submit for Review
            </button>
          </div>`;
      } else {
        area.innerHTML = `
          <div style="width:100%;">
            <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
              <button class="btn btn-success btn-lg btn-locked" disabled title="Owner Subscription required">
                Upload &amp; Submit for Review
              </button>
            </div>
            <div class="sub-gate">
              <div class="sg-banner">
                <div class="sg-banner-inner">
                  <div class="sg-lock-circle">🔒</div>
                  <div class="sg-banner-text">
                    <div class="sg-banner-title">Owner Subscription Required</div>
                    <div class="sg-banner-sub">Unlock property listings with an Owner plan — post unlimited properties and reach verified tenants instantly.</div>
                  </div>
                  <div class="sg-plan-chip">OWNER PLAN</div>
                </div>
              </div>
              <div class="sg-body">
                <div class="sg-benefits">
                  <div class="sg-benefit">
                    <span class="sg-benefit-icon">🏘️</span>
                    <div class="sg-benefit-text">
                      <div class="sg-benefit-title">Post Unlimited Properties</div>
                      <div class="sg-benefit-desc">List as many properties as you own — no caps.</div>
                    </div>
                  </div>
                  <div class="sg-benefit">
                    <span class="sg-benefit-icon">⚡</span>
                    <div class="sg-benefit-text">
                      <div class="sg-benefit-title">Priority Listing Boost</div>
                      <div class="sg-benefit-desc">Your properties rank higher in search results.</div>
                    </div>
                  </div>
                  <div class="sg-benefit">
                    <span class="sg-benefit-icon">📊</span>
                    <div class="sg-benefit-text">
                      <div class="sg-benefit-title">Owner Analytics Dashboard</div>
                      <div class="sg-benefit-desc">Track views, enquiries, and lead conversion.</div>
                    </div>
                  </div>
                  <div class="sg-benefit">
                    <span class="sg-benefit-icon">✅</span>
                    <div class="sg-benefit-text">
                      <div class="sg-benefit-title">Verified Owner Badge</div>
                      <div class="sg-benefit-desc">Build trust with a verified checkmark on listings.</div>
                    </div>
                  </div>
                </div>
                <div class="sg-cta-row">
                  <div class="sg-cta-text">
                    <div class="sg-cta-title">Get Owner Plan to start listing</div>
                    <div class="sg-cta-sub">Already subscribed? <a href="javascript:void(0)" onclick="recheckSubscription()" style="color:var(--teal);font-weight:600;text-decoration:underline;">Refresh subscription status</a></div>
                  </div>
                  <div class="sg-cta-btns">
                    <a href="/plans" class="btn btn-primary btn-lg">View Plans →</a>
                    <a href="/plans" class="btn btn-teal">Get Owner Plan</a>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      }
    }

    async function recheckSubscription() {
      const user = window._currentUser;
      if (!user) return;
      renderSubChecking();
      const { hasAccess, planName } = await checkOwnerSubscription(user.uid);
      window._ownerSubStatus = { hasAccess, planName, checked: true };
      renderSubmitArea(hasAccess, planName);
      if (hasAccess) {
        showToast("✅ Subscription confirmed! You can now submit.", "success");
      } else {
        showToast("No active Owner subscription found. Activate a free trial on the Plans page.", "warn");
      }
    }

    /* ── AUTH ── */
    const setFbPill = (state) => {
      const pill = $("fbPill");
      const txt = $("fbPillText");
      if (!pill) return;
      pill.className = "fb-pill " + state;
      txt.textContent = state.toUpperCase();
    };
    setFbPill("connecting");

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      window._currentUser = user;
      setFbPill("connected");

      const gate = $("authGate");
      const mainForm = $("mainForm");

      if (user) {
        gate.style.display = "none";
        mainForm.style.display = "block";

        const emailEl = $("ownerEmail");
        const nameEl = $("ownerName");
        if (emailEl && !emailEl.value && user.email) emailEl.value = user.email;
        if (nameEl && !nameEl.value && user.displayName) nameEl.value = user.displayName;

        const { hasAccess, planName } = await checkOwnerSubscription(user.uid);
        window._ownerSubStatus = { hasAccess, planName, checked: true };

        if (currentStep === 3) renderSubmitArea(hasAccess, planName);
      } else {
        gate.style.display = "block";
        mainForm.style.display = "none";
        setFbPill("error");
        $("fbPillText").textContent = "NOT SIGNED IN";
      }
    });

    /* ── STEP NAVIGATION ── */
    async function resolveSubmitArea() {
      const status = window._ownerSubStatus;
      if (status && status.checked) {
        renderSubmitArea(status.hasAccess, status.planName);
      } else if (window._currentUser) {
        renderSubChecking();
        const { hasAccess, planName } = await checkOwnerSubscription(window._currentUser.uid);
        window._ownerSubStatus = { hasAccess, planName, checked: true };
        renderSubmitArea(hasAccess, planName);
      } else {
        renderSubChecking();
      }
    }

    function setStep(n) {
      currentStep = n;
      [1, 2, 3].forEach((i) => {
        $(`panel${i}`).classList.toggle("active", i === n);
        const sc = $(`sc${i}`);
        const st = $(`s${i}`);
        if (i < n) {
          st.className = "step done";
          sc.textContent = "✓";
        } else if (i === n) {
          st.className = "step active";
          sc.textContent = String(i);
        } else {
          st.className = "step";
          sc.textContent = String(i);
        }
        if (i < 3) $(`sl${i}`).classList.toggle("done", i < n);
      });
      $("formProgressBar").style.width = ((n - 1) / 2) * 100 + "%";

      if (n === 3) resolveSubmitArea();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function goStep(n) {
      if (n > currentStep) return;
      setStep(n);
    }

    function validateStep1() {
      let ok = true;
      const errs = [];

      const title = $("title");
      const titleF = $("f-title");
      if (!title.value.trim() || title.value.trim().length < 10) {
        title.classList.add("err");
        titleF.classList.add("error");
        ok = false;
        errs.push(title);
      } else {
        title.classList.remove("err");
        titleF.classList.remove("error");
      }

      const price = $("price");
      const priceF = $("f-price");
      if (!price.value || isNaN(price.value) || Number(price.value) < 1000) {
        price.classList.add("err");
        priceF.classList.add("error");
        ok = false;
        if (!errs.length) errs.push(price);
      } else {
        price.classList.remove("err");
        priceF.classList.remove("error");
      }

      const bhk = $("bhk");
      const bhkF = $("f-bhk");
      if (!bhk.value) {
        bhk.classList.add("err");
        bhkF.classList.add("error");
        ok = false;
        if (!errs.length) errs.push(bhk);
      } else {
        bhk.classList.remove("err");
        bhkF.classList.remove("error");
      }

      const city = $("city");
      const cityF = $("f-city");
      if (!city.value) {
        city.classList.add("err");
        cityF.classList.add("error");
        ok = false;
        if (!errs.length) errs.push(city);
      } else {
        city.classList.remove("err");
        cityF.classList.remove("error");
      }

      const loc = $("locality");
      const locF = $("f-locality");
      if (!loc.value.trim()) {
        loc.classList.add("err");
        locF.classList.add("error");
        ok = false;
        if (!errs.length) errs.push(loc);
      } else {
        loc.classList.remove("err");
        locF.classList.remove("error");
      }

      if (!ok) {
        showToast("Please fill in all required fields.", "error");
        errs[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return ok;
    }

    function validateStep2() {
      let ok = true;

      const desc = $("description");
      const descF = $("f-desc");
      if (!desc.value.trim() || desc.value.trim().length < 50) {
        desc.classList.add("err");
        descF.classList.add("error");
        ok = false;
        desc.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        desc.classList.remove("err");
        descF.classList.remove("error");
      }

      const ownerName = $("ownerName");
      const ownerNameF = $("f-ownerName");
      if (!ownerName.value.trim()) {
        ownerName.classList.add("err");
        ownerNameF.classList.add("error");
        ok = false;
      } else {
        ownerName.classList.remove("err");
        ownerNameF.classList.remove("error");
      }

      const ownerPhone = $("ownerPhone");
      const ownerPhoneF = $("f-ownerPhone");
      const digits = ownerPhone.value.replace(/\D/g, "");
      if (!digits || digits.length < 10) {
        ownerPhone.classList.add("err");
        ownerPhoneF.classList.add("error");
        ok = false;
      } else {
        ownerPhone.classList.remove("err");
        ownerPhoneF.classList.remove("error");
      }

      if (!ok) showToast("Please fill in all required fields in this step.", "error");
      return ok;
    }

    function nextStep(from) {
      if (from === 1 && !validateStep1()) return;
      if (from === 2 && !validateStep2()) return;
      if (from === 2) buildSummary();
      setStep(from + 1);
    }

    /* ── UI SELECTORS ── */
    function selectType(el) {
      rootRef.current.querySelectorAll(".type-card").forEach((c) => c.classList.remove("selected"));
      el.classList.add("selected");
      selectedType = el.dataset.type;
    }
    function selectFurnish(el) {
      rootRef.current.querySelectorAll(".furnish-card").forEach((c) => c.classList.remove("selected"));
      el.classList.add("selected");
      selectedFurnish = el.dataset.f;
    }
    function toggleChip(el) {
      el.classList.toggle("selected");
    }

    function updateS1Progress() {
      let count = 0;
      if ($("title").value.trim().length >= 10) count++;
      if (Number($("price").value) >= 1000) count++;
      if ($("bhk").value) count++;
      if ($("city").value) count++;
      if ($("locality").value.trim()) count++;
      $("s1prog").textContent = count;
    }

    function updateCharCount(id, countId, max) {
      const el = $(id);
      const cc = $(countId);
      if (!el || !cc) return;
      const len = el.value.length;
      cc.textContent = `${len} / ${max}`;
      cc.className = "char-count" + (len > max * 0.88 ? " warn" : "");
    }

    /* Phone field: strip non-numeric characters as the user types */
    const phoneInput = $("ownerPhone");
    const phoneHandler = (e) => {
      e.target.value = e.target.value.replace(/[^0-9+\s]/g, "");
    };
    if (phoneInput) phoneInput.addEventListener("input", phoneHandler);
    cleanupFns.push(() => phoneInput && phoneInput.removeEventListener("input", phoneHandler));

    /* ── IMAGE UPLOAD ── */
    const dropZone = $("dropZone");
    const fileInput = $("imageInput");
    const imgGrid = $("imgGrid");

    const onDropZoneClick = (e) => {
      if (e.target !== fileInput) fileInput.click();
    };
    const onDragOver = (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    };
    const onDragLeave = () => dropZone.classList.remove("drag-over");
    const onDrop = (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      addFiles([...e.dataTransfer.files]);
    };
    const onFileChange = () => {
      addFiles([...fileInput.files]);
      fileInput.value = "";
    };

    if (dropZone) {
      dropZone.addEventListener("click", onDropZoneClick);
      ["dragover", "dragenter"].forEach((ev) => dropZone.addEventListener(ev, onDragOver));
      ["dragleave", "dragend", "drop"].forEach((ev) => dropZone.addEventListener(ev, onDragLeave));
      dropZone.addEventListener("drop", onDrop);
      cleanupFns.push(() => {
        dropZone.removeEventListener("click", onDropZoneClick);
        ["dragover", "dragenter"].forEach((ev) => dropZone.removeEventListener(ev, onDragOver));
        ["dragleave", "dragend", "drop"].forEach((ev) => dropZone.removeEventListener(ev, onDragLeave));
        dropZone.removeEventListener("drop", onDrop);
      });
    }
    if (fileInput) {
      fileInput.addEventListener("change", onFileChange);
      cleanupFns.push(() => fileInput.removeEventListener("change", onFileChange));
    }

    function addFiles(newFiles) {
      const MAX_SIZE = 5 * 1024 * 1024;
      const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
      const tooLarge = newFiles.filter((f) => f.size > MAX_SIZE);
      const wrongType = newFiles.filter((f) => !VALID_TYPES.includes(f.type));
      const valid = newFiles.filter((f) => VALID_TYPES.includes(f.type) && f.size <= MAX_SIZE);

      if (tooLarge.length) showToast(`${tooLarge.length} file(s) skipped — must be under 5 MB.`, "warn");
      if (wrongType.length) showToast(`${wrongType.length} file(s) skipped — JPG, PNG, WEBP only.`, "warn");

      const remaining = 15 - uploadedFiles.length;
      if (valid.length > remaining) showToast(`Only ${remaining} more photo(s) allowed (max 15).`, "warn");
      valid.slice(0, remaining).forEach((file) => {
        uploadedFiles.push({ file, previewUrl: URL.createObjectURL(file), cloudinaryUrl: null, status: "pending" });
      });
      renderPreviews();
      updatePhotoCount();
    }

    function renderPreviews() {
      imgGrid.innerHTML = "";
      uploadedFiles.forEach((item, i) => {
        const div = document.createElement("div");
        div.className = "img-thumb" + (i === coverIdx ? " cover-img" : "");
        div.innerHTML = `
          <img src="${item.previewUrl}" alt="Photo ${i + 1}" loading="lazy">
          <div class="img-overlay">
            <div class="img-actions">
              <button class="img-action-btn img-btn-cover" onclick="setCover(${i})" title="Set as cover">⭐</button>
              <button class="img-action-btn img-btn-remove" onclick="removeImg(${i})" title="Remove">✕</button>
            </div>
            <span class="img-badge ${i === coverIdx ? "img-badge-cover" : "img-badge-num"}">${i === coverIdx ? "Cover" : "Photo " + (i + 1)}</span>
          </div>`;
        imgGrid.appendChild(div);
      });
    }

    function setCover(i) {
      const cover = uploadedFiles.splice(i, 1)[0];
      uploadedFiles.unshift(cover);
      coverIdx = 0;
      renderPreviews();
      showToast("Cover photo updated!", "success");
    }
    function removeImg(i) {
      URL.revokeObjectURL(uploadedFiles[i].previewUrl);
      uploadedFiles.splice(i, 1);
      if (coverIdx >= uploadedFiles.length) coverIdx = 0;
      renderPreviews();
      updatePhotoCount();
    }

    function updatePhotoCount() {
      const b = $("photoCountBadge");
      if (b) b.textContent = `${uploadedFiles.length} / 15`;
    }

    function uploadSingleImage(file, idx) {
      return new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", UPLOAD_PRESET);
        fd.append("cloud_name", CLOUD_NAME);
        fd.append("folder", "smartrent/properties");
        const xhr = new XMLHttpRequest();
        xhr.open("POST", CLOUDINARY_URL, true);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 92);
            const bar = $(`ui-bar-${idx}`);
            if (bar) bar.style.width = pct + "%";
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url.replace("/upload/", "/upload/f_auto,q_auto:good/"));
          } else {
            reject(new Error(`Cloudinary HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during Cloudinary upload"));
        xhr.send(fd);
      });
    }

    async function uploadAllToCloudinary() {
      const listEl = $("uploadItemsList");
      listEl.innerHTML = "";
      const urls = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const item = uploadedFiles[i];
        const fname = item.file.name;
        const fsize = (item.file.size / 1024).toFixed(0) + " KB";

        const row = document.createElement("div");
        row.className = "upload-item";
        row.id = `ui-row-${i}`;
        row.innerHTML = `
          <span class="ui-icon">🖼️</span>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px">
              <span class="ui-name">${fname}</span>
              <span class="ui-size">${fsize}</span>
              <span class="ui-status" id="ui-st-${i}" style="color:var(--t3)">Uploading…</span>
            </div>
            <div class="ui-prog-wrap"><div class="ui-prog-bar" id="ui-bar-${i}"></div></div>
          </div>`;
        listEl.appendChild(row);

        try {
          const url = await uploadSingleImage(item.file, i);
          urls.push(url);
          uploadedFiles[i].cloudinaryUrl = url;
          uploadedFiles[i].status = "done";
          const bar = $(`ui-bar-${i}`);
          const st = $(`ui-st-${i}`);
          if (bar) bar.style.width = "100%";
          if (st) {
            st.textContent = "✓ Done";
            st.style.color = "var(--emerald)";
          }
          row.classList.add("done");
        } catch (err) {
          uploadedFiles[i].status = "error";
          const st = $(`ui-st-${i}`);
          if (st) {
            st.textContent = "✗ Failed";
            st.style.color = "var(--rose)";
          }
          row.classList.add("error");
          console.error(`Upload failed for ${fname}:`, err);
        }
      }
      return urls.filter(Boolean);
    }

    /* ── SUMMARY ── */
    function buildSummary() {
      const gv = (id) => $(id)?.value?.trim() || "";
      const amenities = [...rootRef.current.querySelectorAll("#amenitiesWrap .chip.selected")].map((c) => c.textContent.trim());
      const tenants = [...rootRef.current.querySelectorAll("#tenantWrap .chip.selected")].map((c) => c.textContent.trim());
      const price = Number(gv("price")),
        deposit = Number(gv("deposit"));

      const rows = [
        ["TYPE", selectedType],
        ["TITLE", gv("title")],
        ["RENT", `₹${price.toLocaleString("en-IN")} / month`],
        ["DEPOSIT", deposit ? `₹${deposit.toLocaleString("en-IN")}` : "Not specified"],
        ["CONFIG", gv("bhk") || "—"],
        ["CITY", gv("city")],
        ["LOCALITY", gv("locality")],
        ["AREA", gv("area") ? gv("area") + " sq.ft" : "—"],
        ["FLOOR", gv("floor") || "—"],
        ["FACING", gv("facing") || "—"],
        ["AGE", gv("propAge") || "—"],
        ["FURNISHING", selectedFurnish],
        ["AVAILABLE", gv("availableFrom") || "Immediately"],
        ["AMENITIES", amenities.length ? amenities.slice(0, 7).join(", ") + (amenities.length > 7 ? ` +${amenities.length - 7} more` : "") : "None selected"],
        ["TENANTS", tenants.length ? tenants.join(", ") : "Anyone"],
        ["SMOKING", gv("smoking") || "—"],
        ["GUESTS", gv("guests") || "—"],
        ["MAINTENANCE", gv("maintenance") || "—"],
        ["OWNER", gv("ownerName")],
        ["PHONE", gv("ownerPhone")],
        ["PHOTOS", `${uploadedFiles.length} selected (uploaded on submit)`],
      ];

      let html = rows.map(([k, v]) => `<div class="summary-row"><span class="summary-key">${k}</span><span class="summary-val${k === "RENT" ? " price" : ""}">${v}</span></div>`).join("");

      if (uploadedFiles.length > 0) {
        html += `<div class="summary-row" style="align-items:flex-start"><span class="summary-key">PHOTOS</span><div class="summary-imgs">`;
        uploadedFiles.slice(0, 6).forEach((item, i) => {
          html += `<img src="${item.previewUrl}" class="summary-img" alt="Photo ${i + 1}">`;
        });
        if (uploadedFiles.length > 6)
          html += `<div style="width:46px;height:46px;border-radius:9px;background:var(--bg4);border:1px solid var(--line2);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--t3)">+${uploadedFiles.length - 6}</div>`;
        html += `</div></div>`;
      }
      $("summaryCard").innerHTML = html;
    }

    /* ── SUBMIT ── */
    async function submitProperty() {
      const user = window._currentUser;
      if (!user) {
        showToast("You must be signed in to post a property.", "error");
        return;
      }

      const { hasAccess } = await checkOwnerSubscription(user.uid);
      if (!hasAccess) {
        showToast("Owner Subscription required to post a property.", "error");
        renderSubmitArea(false, null);
        return;
      }

      if (uploadedFiles.length < 1) {
        showToast("Please upload at least 1 photo before submitting.", "error");
        return;
      }

      const btn = $("submitBtn");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "⏳ Uploading photos…";
      }

      showToast(`Uploading ${uploadedFiles.length} photo(s) to Cloudinary…`, "info");

      try {
        const imageUrls = await uploadAllToCloudinary();
        if (imageUrls.length === 0) throw new Error("All photo uploads failed. Please check your connection and try again.");
        if (imageUrls.length < uploadedFiles.length) showToast(`${uploadedFiles.length - imageUrls.length} photo(s) failed — continuing with ${imageUrls.length}.`, "warn");

        if (btn) btn.innerHTML = "⏳ Saving listing…";
        showToast("Photos uploaded! Saving to database…", "success");

        const gv = (id) => $(id)?.value?.trim() || "";
        const amenities = [...rootRef.current.querySelectorAll("#amenitiesWrap .chip.selected")].map((c) => c.textContent.trim());
        const tenants = [...rootRef.current.querySelectorAll("#tenantWrap .chip.selected")].map((c) => c.textContent.trim());

        const docRef = await addDoc(collection(db, "properties"), {
          ownerUid: user.uid,
          owner: {
            uid: user.uid,
            name: gv("ownerName"),
            phone: gv("ownerPhone"),
            whatsapp: gv("ownerWA") || gv("ownerPhone"),
            email: gv("ownerEmail") || user.email || "",
          },
          type: selectedType,
          title: gv("title"),
          price: Number(gv("price")),
          bhk: gv("bhk"),
          city: gv("city"),
          locality: gv("locality"),
          fullAddress: gv("fullAddress"),
          area: gv("area") ? Number(gv("area")) : null,
          floor: gv("floor") || null,
          totalFloors: gv("totalFloors") ? Number(gv("totalFloors")) : null,
          facing: gv("facing") || null,
          propAge: gv("propAge") || null,
          deposit: gv("deposit") ? Number(gv("deposit")) : null,
          availableFrom: gv("availableFrom") || null,
          maintenance: gv("maintenance") || null,
          furnishing: selectedFurnish,
          description: gv("description"),
          amenities,
          preferredTenants: tenants,
          cooking: gv("cooking") || null,
          nonveg: gv("nonveg") || null,
          smoking: gv("smoking") || null,
          drinking: gv("drinking") || null,
          guests: gv("guests") || null,
          images: imageUrls,
          coverImage: imageUrls[0] || null,
          imageCount: imageUrls.length,
          approved: false,
          status: "pending",
          views: 0,
          enquiries: 0,
          savedCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        showSuccess(docRef.id, imageUrls);
      } catch (err) {
        console.error("Submission error:", err);
        showToast("Error: " + (err.message || "Unknown error"), "error");
        const btn2 = $("submitBtn");
        if (btn2) {
          btn2.disabled = false;
          btn2.innerHTML = "🚀 Upload &amp; Submit for Review";
        }
      }
    }

    function showSuccess(docId, imageUrls) {
      $("stepper").style.display = "none";
      $("formProgressBar").parentElement.style.display = "none";
      rootRef.current.querySelectorAll(".step-panel").forEach((p) => (p.style.display = "none"));

      const ss = $("successScreen");
      ss.style.display = "block";
      $("successDocId").textContent = "Property ID: " + docId;

      const imgRow = $("successImageRow");
      imageUrls.slice(0, 5).forEach((url, i) => {
        const img = new Image();
        img.src = url;
        img.className = "success-img";
        img.alt = "Photo " + (i + 1);
        imgRow.appendChild(img);
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast("🎉 Property submitted! Pending review.", "success");
    }

    /* ── TOAST ── */
    function showToast(msg, type = "info") {
      const t = $("toast");
      if (!t) return;
      $("toastMsg").textContent = msg;
      t.className = `toast ${type} show`;
      clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(() => t.classList.remove("show"), 4800);
    }
    function dismissToast() {
      const t = $("toast");
      if (t) t.classList.remove("show");
    }

    /* ── NAVBAR SCROLL EFFECT ── */
    const onScroll = () => {
      const tb = $("topbar");
      if (tb) tb.classList.toggle("solid", window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll);
    cleanupFns.push(() => window.removeEventListener("scroll", onScroll));

    /* ── EXPOSE HANDLERS GLOBALLY (needed for the onclick="..." attributes above and for dynamically-injected buttons) ── */
    window.dismissToast = dismissToast;
    window.selectType = selectType;
    window.selectFurnish = selectFurnish;
    window.toggleChip = toggleChip;
    window.updateCharCount = updateCharCount;
    window.updateS1Progress = updateS1Progress;
    window.goStep = goStep;
    window.nextStep = nextStep;
    window.setCover = setCover;
    window.removeImg = removeImg;
    window.submitProperty = submitProperty;
    window.recheckSubscription = recheckSubscription;
    window.showToast = showToast;

    return () => {
      unsubAuth();
      cleanupFns.forEach((fn) => fn());
      delete window.dismissToast;
      delete window.selectType;
      delete window.selectFurnish;
      delete window.toggleChip;
      delete window.updateCharCount;
      delete window.updateS1Progress;
      delete window.goStep;
      delete window.nextStep;
      delete window.setCover;
      delete window.removeImg;
      delete window.submitProperty;
      delete window.recheckSubscription;
      delete window.showToast;
    };
  }, []);

  return <div className="post-property-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
