"use client";

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import "./page.css";

const LS_KEY = "sr_subscription";
const LS_SVC_KEY = "sr_service_subscription";
const PRICE = 249;

const CLOUD_NAME = "dq3hko9hn";
const UPLOAD_PRESET = "dl6dnzau";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const SERVICES = [
  {
    id: "plumber",
    name: "Plumber",
    icon: "🔧",
    page: "/plumber",
    target: { coll: "services", category: "plumbing" },
    tags: ["Leaking tap repair", "Pipe fitting", "Bathroom fitting", "Drain cleaning", "Geyser repair", "Water tank", "New pipe fitting", "Toilet repair", "Kitchen sink repair", "Emergency plumbing"],
  },
  {
    id: "electrician",
    name: "Electrician",
    icon: "⚡",
    page: "/electrician",
    target: { coll: "services", category: "electrical" },
    tags: ["Wiring / Rewiring", "Fan installation", "Light / LED fitting", "Switchboard repair", "MCB / fuse box", "Short circuit repair", "Earthing", "Inverter / UPS", "Power socket fitting", "CCTV wiring", "Home automation", "Emergency fault"],
  },
  {
    id: "painter",
    name: "Painter",
    icon: "🎨",
    page: "/painter",
    target: { coll: "service_providers", category: "painting" },
    tags: ["Interior Painting", "Exterior Painting", "Texture / Design", "Waterproofing", "Wood Polish", "Putty Application", "Full Home"],
  },
  {
    id: "carpenter",
    name: "Carpenter",
    icon: "🪚",
    page: "/carpenter",
    target: { coll: "service_providers", category: "carpenter" },
    tags: ["Custom Furniture", "Door / Window Repair", "Wardrobe Installation", "Kitchen Fittings", "Wood Polish", "False Ceiling", "Sofa Repair"],
  },
  {
    id: "movers",
    name: "Movers & Packers",
    icon: "🚚",
    page: "/movers",
    target: { coll: "service_providers", category: "movers" },
    tags: ["Home Shifting", "Office Relocation", "Vehicle Transport", "Single Item Move"],
  },
  {
    id: "cleaner",
    name: "Home Cleaner",
    icon: "🧹",
    page: "/cleaner",
    target: { coll: "service_providers", category: "cleaner" },
    tags: ["Deep Cleaning", "Regular Housekeeping", "Sofa / Carpet Cleaning", "Bathroom Cleaning", "Kitchen Cleaning", "Move-in / Move-out Cleaning"],
  },
];

const BODY_HTML = `
<div class="bg-scene"><div class="orb o1"></div><div class="orb o2"></div></div>
<div class="dot-grid"></div>

<div class="toast-wrap" id="toastWrap"></div>

<nav class="topbar" id="topbar">
  <a href="/" class="brand">
    <div class="brand-gem">💎</div>
    <span class="brand-name">SmartRent<span class="brand-tag">AI</span></span>
  </a>
  <div class="nav-right">
    <a href="/" class="nav-link">🏠 Home</a>
    <a href="/services" class="nav-link">🔧 Services</a>
    <a href="/plans" class="nav-link">💎 Plans</a>
    <div class="auth-pill" id="authPill">
      <div class="auth-dot off" id="authDot"></div>
      <span class="auth-name" id="authName">Loading…</span>
    </div>
  </div>
</nav>

<div class="page">

  <div class="page-header">
    <div class="ph-eye">New Service Listing</div>
    <h1 class="ph-title">List Your Service 🔧</h1>
    <p class="ph-sub">3 quick steps. Your <strong>name, phone number and price</strong> are required — everything else is optional. Once published, you'll appear instantly on the matching services page with your phone &amp; WhatsApp visible to customers.</p>
  </div>

  <div class="stepper" id="stepper">
    <div class="step active" id="st1"><div class="sc" id="sc1">1</div><div class="step-lbl">Service Type</div></div>
    <div class="step-line" id="sl1"></div>
    <div class="step" id="st2"><div class="sc" id="sc2">2</div><div class="step-lbl">Your Details</div></div>
    <div class="step-line" id="sl2"></div>
    <div class="step" id="st3"><div class="sc" id="sc3">3</div><div class="step-lbl">Review &amp; Submit</div></div>
  </div>

  <div class="prog-wrap"><div class="prog-bar" id="progBar" style="width:0%"></div></div>

  <!-- PANEL 1 -->
  <div class="panel visible" id="p1">
    <div class="card">
      <div class="card-header">
        <div class="card-tag">Step 1 of 3</div>
        <div class="card-title">What service do you offer?</div>
        <div class="card-sub">Select your primary service. Each listing is active for 30 days and appears live on the matching services page (Plumbers, Electricians, Painters, Carpenters, Movers, Cleaners).</div>
      </div>

      <div class="svc-grid" id="svcGrid"></div>

      <div class="info-row info" style="margin-top:18px">
        <span class="ii">ℹ️</span>
        <div>All plans include a <strong>3-month FREE trial</strong>. After trial, billing is <strong>₹249/month</strong>. Cancel any time from your dashboard.</div>
      </div>

      <div class="btn-row">
        <span style="font-size:12px;color:var(--t3)">Step 1 of 3</span>
        <button class="btn btn-primary btn-lg" onclick="goStep(2)">Continue →</button>
      </div>
    </div>
  </div>

  <!-- PANEL 2 -->
  <div class="panel" id="p2">
    <div class="card">
      <div class="card-header">
        <div class="card-tag">Step 2 of 3 · ~3 min</div>
        <div class="card-title">Your Professional Profile</div>
        <div class="card-sub"><strong style="color:var(--rose)">Name, mobile number and price</strong> are required so customers can reach and book you. Everything else is optional but improves your ranking.</div>
      </div>

      <div class="divider"><span>Contact Details</span></div>
      <div class="grid-2" style="margin-bottom:6px">
        <div class="field" id="fld-name">
          <label>Full Name / Business Name <span class="req">required</span></label>
          <div class="input-icon-wrap">
            <span class="ico">👤</span>
            <input type="text" id="f-name" placeholder="Rahul Sharma">
          </div>
          <div class="field-err">Please enter your name.</div>
        </div>
        <div class="field" id="fld-phone">
          <label>Mobile Number <span class="req">required</span></label>
          <div class="input-icon-wrap">
            <span class="ico">📞</span>
            <input type="tel" id="f-phone" placeholder="+91 98765 43210" maxlength="10">
          </div>
          <div class="field-err">Enter a valid 10-digit mobile number.</div>
        </div>
      </div>

      <label class="wa-toggle" for="f-wa-same">
        <input type="checkbox" id="f-wa-same" checked onchange="toggleWaField()">
        <span>💬 My WhatsApp number is the same as my mobile number above</span>
      </label>
      <div class="field" id="fld-wa" style="display:none;margin-bottom:14px">
        <label>WhatsApp Number <span class="opt">optional</span></label>
        <div class="input-icon-wrap">
          <span class="ico">💬</span>
          <input type="tel" id="f-whatsapp" placeholder="+91 98765 43210" maxlength="10">
        </div>
        <div class="field-hint">Customers can message you directly from your listing.</div>
      </div>

      <div class="grid-2" style="margin-bottom:14px;margin-top:14px">
        <div class="field">
          <label>City <span class="opt">optional</span></label>
          <div class="input-icon-wrap">
            <span class="ico">📍</span>
            <input type="text" id="f-city" placeholder="Hyderabad">
          </div>
        </div>
        <div class="field">
          <label>Locality / Area <span class="opt">optional</span></label>
          <div class="input-icon-wrap">
            <span class="ico">🧭</span>
            <input type="text" id="f-area" placeholder="e.g. Kondapur">
          </div>
        </div>
        <div class="field span-2">
          <label>Also Covers These Areas <span class="opt">optional, comma separated</span></label>
          <input type="text" id="f-coverage" placeholder="e.g. Gachibowli, Madhapur, Kukatpally">
        </div>
        <div class="field">
          <label>Years of Experience <span class="opt">optional</span></label>
          <div class="input-suf-wrap">
            <input type="number" id="f-exp" min="0" max="60" placeholder="5">
            <span class="input-suf">yrs</span>
          </div>
        </div>
        <div class="field">
          <label>Jobs Completed <span class="opt">optional</span></label>
          <input type="number" id="f-jobs" min="0" placeholder="120">
        </div>
      </div>

      <div class="divider"><span>Service Details</span></div>
      <div class="grid-2" style="margin-bottom:14px">
        <div class="field">
          <label>Listing Title <span class="opt">optional</span></label>
          <input type="text" id="f-title" placeholder="e.g. Expert Home Plumber">
        </div>
        <div class="field" id="fld-price">
          <label>Starting Price <span class="req">required</span></label>
          <div class="input-icon-wrap">
            <span class="ico">₹</span>
            <div class="input-suf-wrap">
              <input type="number" id="f-rate" placeholder="350" style="padding-left:36px" min="1">
              <span class="input-suf">onwards</span>
            </div>
          </div>
          <div class="field-err">Please enter a starting price.</div>
        </div>
        <div class="field span-2">
          <label>Specialisations <span class="opt">tap to select — shown as tags on your listing</span></label>
          <div class="tag-wrap" id="tagWrap"></div>
        </div>
        <div class="field span-2">
          <label>About You / Description <span class="opt">optional</span></label>
          <textarea id="f-desc" placeholder="Tools you carry, specializations, certifications, languages, response time…"></textarea>
        </div>
      </div>

      <div id="extraFlagsWrap" class="grid-2" style="margin-bottom:14px"></div>

      <div class="divider"><span>Availability</span></div>
      <div class="field" style="margin-bottom:14px">
        <label>Working Days <span class="opt">tap to toggle</span></label>
        <div class="day-wrap" id="dayWrap"></div>
      </div>
      <div class="grid-3" style="margin-bottom:14px">
        <div class="field">
          <label>Available From</label>
          <input type="time" id="f-from" value="08:00">
        </div>
        <div class="field">
          <label>Available Until</label>
          <input type="time" id="f-to" value="20:00">
        </div>
        <div class="field">
          <label>Current Status</label>
          <div class="select-wrap">
            <select id="f-status">
              <option value="available">🟢 Available Now</option>
              <option value="busy">🟡 Currently Busy</option>
              <option value="offline">⚪ Offline</option>
            </select>
          </div>
        </div>
      </div>

      <div class="divider"><span>Work Photos <span class="opt" style="font-size:10px;background:transparent;color:var(--t3);letter-spacing:0;text-transform:none">— up to 5, optional</span></span></div>
      <div class="pz" id="pz">
        <input type="file" id="pi" accept="image/*" multiple>
        <span class="pz-icon">📸</span>
        <p>Drag &amp; drop or <strong>click to browse</strong></p>
        <span class="pz-limit">JPG / PNG · max 5 images · 5 MB each</span>
      </div>
      <div class="pthumb-row" id="pthumbRow"></div>

      <div class="btn-row">
        <button class="btn btn-ghost" onclick="goStep(1)">← Back</button>
        <button class="btn btn-primary btn-lg" onclick="attemptGoStep3()">Review &amp; Submit →</button>
      </div>
    </div>
  </div>

  <!-- PANEL 3 -->
  <div class="panel" id="p3">

    <div class="card">
      <div class="card-header" style="margin-bottom:16px">
        <div class="card-tag">Step 3 of 3 · Review Your Listing</div>
        <div class="card-title">Everything look good?</div>
        <div class="card-sub">Your listing will be live for 30 days once submitted, and will appear immediately on the corresponding services page.</div>
      </div>
      <div class="summary" id="summaryBox">
        <div style="text-align:center;padding:18px;color:var(--t3);font-size:13px">Fill in the previous steps to see your summary.</div>
      </div>
    </div>

    <div id="submitArea">
      <div class="sub-checking"><div class="spin"></div>Checking subscription…</div>
    </div>

    <div class="btn-row" style="margin-top:0;border-top:none">
      <button class="btn btn-ghost" onclick="goStep(2)">← Back</button>
      <div id="submitBtnArea"></div>
    </div>

  </div>

  <div class="success-screen" id="successScreen" style="display:none">
    <span class="suc-icon">🎉</span>
    <div class="suc-title">You're Live!</div>
    <div class="suc-sub">Your service listing is active and visible right now on the matching services page. Customers can call or WhatsApp you directly.</div>
    <div class="suc-active-pill" id="sucPill">Active: — → —</div>
    <div class="suc-contact-row" id="sucContactRow"></div>
    <div class="suc-btns">
      <a href="#" class="btn btn-primary btn-lg" id="sucViewLink">View My Listing →</a>
      <a href="/owner-dashboard" class="btn btn-ghost btn-lg">📊 Go to Dashboard</a>
      <button class="btn btn-ghost btn-lg" onclick="location.reload()">+ List Another Service</button>
    </div>
  </div>

</div>
`;

export default function PostServicePage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const $ = (id) => document.getElementById(id);
    const cleanupFns = [];

    /* ── STATE ── */
    let selSvc = null;
    let selDays = new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    let selTags = new Set();
    let photoFiles = [];
    let currentUser = null;
    let subStatus = null;
    let currentStep = 1;

    /* ── SUBSCRIPTION CHECK ── */
    function _isLocalSubValid(sub) {
      if (!sub) return false;
      if (sub.status !== "trial_active" && sub.status !== "active") return false;
      if (sub.trialEndDate && new Date(sub.trialEndDate) < new Date()) return false;
      return true;
    }
    function _getServicePlanIds() {
      return new Set(SERVICES.map((s) => s.id));
    }
    async function checkServiceSubscription(uid) {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const sub = JSON.parse(raw);
          const svcPlanIds = _getServicePlanIds();
          if (svcPlanIds.has(sub.planId) && _isLocalSubValid(sub)) {
            return { hasAccess: true, planName: sub.planName || "Service Plan", source: "localStorage" };
          }
        }
      } catch (e) {}
      try {
        const raw = localStorage.getItem(LS_SVC_KEY);
        if (raw) {
          const sub = JSON.parse(raw);
          if (_isLocalSubValid(sub)) {
            return { hasAccess: true, planName: sub.planName || "Service Plan", source: "localStorage:svc" };
          }
        }
      } catch (e) {}
      try {
        try {
          const subSnap = await getDoc(doc(db, "subscriptions", uid));
          if (subSnap.exists()) {
            const s = subSnap.data();
            const active = s.status === "active" || s.status === "trial_active";
            let notExpired = true;
            const expField = s.trialEndDate || s.expiresAt;
            if (expField) {
              const e = expField.toDate ? expField.toDate() : new Date(expField);
              notExpired = e > new Date();
            }
            if (active && notExpired) {
              return { hasAccess: true, planName: s.plan ? s.plan + " Plan" : "Service Plan", source: "firestore:subscriptions" };
            }
          }
        } catch (e) {}

        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) return { hasAccess: false, planName: null, source: "firestore:no-doc" };
        const data = snap.data();

        const sub = data.subscription || data.serviceSubscription || null;
        if (sub) {
          const svcPlanIds = _getServicePlanIds();
          const planOk = !sub.plan || svcPlanIds.has(String(sub.plan).toLowerCase());
          const active = sub.status === "active" || sub.active === true;
          let notExp = true;
          if (sub.expiresAt) {
            const e = sub.expiresAt.toDate ? sub.expiresAt.toDate() : new Date(sub.expiresAt);
            notExp = e > new Date();
          }
          if (planOk && active && notExp) return { hasAccess: true, planName: sub.plan || "Service Plan", source: "firestore:sub" };
        }

        if (data.serviceProvider === true || data.isProvider === true || data.canListService === true) {
          return { hasAccess: true, planName: data.planName || "Service Plan", source: "firestore:flags" };
        }
        const roles = Array.isArray(data.roles) ? data.roles : [data.role || ""];
        if (roles.some((r) => ["provider", "professional", "service_pro"].includes(String(r).toLowerCase()))) {
          return { hasAccess: true, planName: data.planName || "Service Plan", source: "firestore:roles" };
        }
        return { hasAccess: false, planName: null, source: "firestore:no-match" };
      } catch (err) {
        console.error("Sub check error:", err);
        return { hasAccess: false, planName: null, source: "error", error: err.message };
      }
    }

    function esc(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /* ── RENDER SUBMIT AREA ── */
    function renderSubmitArea(hasAccess, planName) {
      const area = $("submitArea");
      const btnArea = $("submitBtnArea");
      if (!area) return;

      if (hasAccess) {
        area.innerHTML = `
          <div class="info-row success" style="margin-top:0;margin-bottom:16px">
            <span class="ii">✅</span>
            <div><strong>Subscription active</strong> — you're ready to publish your listing.</div>
          </div>`;
        btnArea.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-end">
            <div class="sub-badge">
              <div class="sb-dot"></div>
              PLAN ACTIVE
              <span class="sb-plan">${esc(planName || "Service Plan")}</span>
            </div>
            <button class="btn btn-success btn-lg" id="submitBtn" onclick="submitListing()">
              🚀 Publish Listing
            </button>
          </div>`;
      } else {
        area.innerHTML = `
          <div class="sub-gate">
            <div class="sg-banner">
              <div class="sg-inner">
                <div class="sg-lock">🔒</div>
                <div class="sg-text">
                  <div class="sg-title">Service Plan Required</div>
                  <div class="sg-sub">Activate a free trial or subscribe to publish your listing and start getting leads.</div>
                </div>
                <div class="sg-chip">SERVICE PLAN · ₹${PRICE}/mo</div>
              </div>
            </div>
            <div class="sg-body">
              <div class="sg-perks">
                <div class="sg-perk"><span class="sg-perk-ic">📋</span><div><div class="sg-perk-title">Your Listing Goes Live</div><div class="sg-perk-desc">Visible instantly to homeowners searching your service type.</div></div></div>
                <div class="sg-perk"><span class="sg-perk-ic">💎</span><div><div class="sg-perk-title">Verified Professional Badge</div><div class="sg-perk-desc">Builds trust and increases booking rate.</div></div></div>
                <div class="sg-perk"><span class="sg-perk-ic">📞</span><div><div class="sg-perk-title">Call &amp; WhatsApp Visible</div><div class="sg-perk-desc">Customers can reach you directly, no middlemen.</div></div></div>
                <div class="sg-perk"><span class="sg-perk-ic">🎁</span><div><div class="sg-perk-title">3 Months FREE Trial</div><div class="sg-perk-desc">No upfront cost — ₹${PRICE}/mo only after trial ends.</div></div></div>
              </div>
              <div class="sg-cta">
                <div class="sg-cta-text">
                  <div class="sg-cta-title">Activate a free trial to publish</div>
                  <div class="sg-cta-sub">Already activated? <a onclick="recheckSub()">Refresh subscription status</a></div>
                </div>
                <div class="sg-cta-btns">
                  <a href="/plans" class="btn btn-primary btn-lg">View Plans →</a>
                  <button class="btn btn-outline" onclick="startFreeTrial()">🎁 Start Free Trial Now</button>
                </div>
              </div>
            </div>
          </div>`;
        btnArea.innerHTML = `<button class="btn btn-success btn-lg" disabled style="opacity:.35;cursor:not-allowed;filter:grayscale(.5)">🔒 Publish Listing</button>`;
      }
    }

    /* ── START FREE TRIAL ── */
    async function startFreeTrial() {
      if (!currentUser) {
        toast("Please sign in first.", "err");
        return;
      }
      if (!selSvc) {
        toast("Please choose a service type first.", "err");
        goStep(1);
        return;
      }

      try {
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 90);

        await setDoc(doc(db, "subscriptions", currentUser.uid), {
          userId: currentUser.uid,
          userEmail: currentUser.email || "",
          plan: selSvc.id,
          status: "trial_active",
          trialStartDate: now.toISOString(),
          trialEndDate: trialEnd.toISOString(),
          createdAt: serverTimestamp(),
        });

        localStorage.setItem(
          LS_KEY,
          JSON.stringify({
            planId: selSvc.id,
            planName: selSvc.name + " Plan",
            status: "trial_active",
            trialEndDate: trialEnd.toISOString(),
          })
        );

        toast("🎉 Free trial activated!", "ok");
        await recheckSub();
      } catch (err) {
        console.error(err);
        toast("Could not start trial: " + err.message, "err");
      }
    }

    async function recheckSub() {
      if (!currentUser) return;
      $("submitArea").innerHTML = `<div class="sub-checking"><div class="spin"></div>Re-checking subscription…</div>`;
      subStatus = await checkServiceSubscription(currentUser.uid);
      renderSubmitArea(subStatus.hasAccess, subStatus.planName);
      if (subStatus.hasAccess) toast("✅ Subscription confirmed!", "ok");
      else toast("No active service subscription found.", "err");
    }

    /* ── BUILD SERVICE GRID ── */
    const grid = $("svcGrid");
    SERVICES.forEach((s) => {
      const c = document.createElement("div");
      c.className = "svc-card";
      c.dataset.id = s.id;
      c.innerHTML = `
        <div class="sel-check">✓</div>
        <span class="svc-icon">${s.icon}</span>
        <div class="svc-name">${s.name}</div>
        <div class="svc-price">₹${PRICE}/mo after trial</div>`;
      c.onclick = () => {
        selSvc = s;
        selTags = new Set();
        rootRef.current.querySelectorAll(".svc-card").forEach((x) => x.classList.remove("sel"));
        c.classList.add("sel");
        buildTagChips();
        buildExtraFlags();
      };
      grid.appendChild(c);
    });

    /* ── BUILD DAY CHIPS ── */
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d) => {
      const t = document.createElement("div");
      t.className = "day-chip" + (selDays.has(d) ? " on" : "");
      t.textContent = d;
      t.onclick = () => {
        selDays.has(d) ? selDays.delete(d) : selDays.add(d);
        t.classList.toggle("on");
      };
      $("dayWrap").appendChild(t);
    });

    /* ── TAG CHIPS ── */
    function buildTagChips() {
      const wrap = $("tagWrap");
      wrap.innerHTML = "";
      if (!selSvc) return;
      selSvc.tags.forEach((tag) => {
        const t = document.createElement("div");
        t.className = "tag-chip";
        t.textContent = tag;
        t.onclick = () => {
          selTags.has(tag) ? selTags.delete(tag) : selTags.add(tag);
          t.classList.toggle("on");
        };
        wrap.appendChild(t);
      });
    }

    /* ── EXTRA FLAGS ── */
    function buildExtraFlags() {
      const wrap = $("extraFlagsWrap");
      wrap.innerHTML = "";
      if (!selSvc) return;
      const flags = [];
      if (selSvc.id === "plumber" || selSvc.id === "electrician") {
        flags.push({ id: "f-emergency", label: "🚨 I offer 24/7 Emergency Service" });
      }
      if (selSvc.id === "electrician") {
        flags.push({ id: "f-licensed", label: "🎓 I am Licensed / Certified" });
      }
      if (!flags.length) return;
      flags.forEach((fl) => {
        const d = document.createElement("label");
        d.className = "wa-toggle";
        d.style.background = "var(--gold-d)";
        d.style.borderColor = "var(--gold-b)";
        d.innerHTML = `<input type="checkbox" id="${fl.id}"><span>${fl.label}</span>`;
        wrap.appendChild(d);
      });
    }

    /* ── WHATSAPP TOGGLE ── */
    function toggleWaField() {
      const same = $("f-wa-same").checked;
      $("fld-wa").style.display = same ? "none" : "flex";
    }

    /* ── PHONE / WHATSAPP INPUT: digits only ── */
    const phoneInput = $("f-phone");
    const waInput = $("f-whatsapp");
    const digitsOnly = (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    };
    if (phoneInput) phoneInput.addEventListener("input", digitsOnly);
    if (waInput) waInput.addEventListener("input", digitsOnly);
    cleanupFns.push(() => {
      phoneInput && phoneInput.removeEventListener("input", digitsOnly);
      waInput && waInput.removeEventListener("input", digitsOnly);
    });

    /* ── AUTH ── */
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      const dotEl = $("authDot");
      const nameEl = $("authName");
      if (user) {
        dotEl.className = "auth-dot on";
        nameEl.textContent = user.displayName || user.email || "Signed In";
        const nameF = $("f-name");
        if (nameF && !nameF.value && user.displayName) nameF.value = user.displayName;
        subStatus = await checkServiceSubscription(user.uid);
      } else {
        dotEl.className = "auth-dot off";
        nameEl.textContent = "Not signed in";
        subStatus = { hasAccess: false, planName: null, source: "not-authed" };
      }
      if (currentStep === 3) renderSubmitArea(subStatus?.hasAccess, subStatus?.planName);
    });

    /* ── VALIDATION ── */
    function clearFieldError(id) {
      const f = $(id);
      if (f) f.classList.remove("error");
    }
    function setFieldError(id) {
      const f = $(id);
      if (f) f.classList.add("error");
    }
    function validateStep2() {
      let ok = true;
      clearFieldError("fld-name");
      clearFieldError("fld-phone");
      clearFieldError("fld-price");

      const name = $("f-name").value.trim();
      const phone = $("f-phone").value.trim();
      const price = $("f-rate").value.trim();

      if (!name) {
        setFieldError("fld-name");
        ok = false;
      }
      if (!phone || phone.length !== 10) {
        setFieldError("fld-phone");
        ok = false;
      }
      if (!price || Number(price) <= 0) {
        setFieldError("fld-price");
        ok = false;
      }

      return ok;
    }
    function attemptGoStep3() {
      if (!selSvc) {
        toast("Please choose a service type first.", "err");
        goStep(1);
        return;
      }
      if (!validateStep2()) {
        toast("Please fill Name, Phone Number and Price to continue.", "err");
        $("fld-name").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      goStep(3);
    }

    /* ── STEP NAVIGATION ── */
    function goStep(n) {
      if (n === 2 && !selSvc) {
        toast("Please choose a service type first.", "err");
        return;
      }
      if (n === 3 && !validateStep2()) {
        attemptGoStep3();
        return;
      }
      if (n === 3) buildSummary();

      currentStep = n;
      ["p1", "p2", "p3"].forEach((id, i) => {
        $(id).classList.toggle("visible", i + 1 === n);
      });
      [1, 2, 3].forEach((i) => {
        const sc = $("sc" + i);
        const st = $("st" + i);
        const sl = $("sl" + i);
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
        if (sl) sl.classList.toggle("done", i < n);
      });
      $("progBar").style.width = ((n - 1) / 2) * 100 + "%";

      if (n === 3) resolveSubmitArea();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function resolveSubmitArea() {
      if (subStatus && subStatus.source) {
        renderSubmitArea(subStatus.hasAccess, subStatus.planName);
      } else if (currentUser) {
        $("submitArea").innerHTML = `<div class="sub-checking"><div class="spin"></div>Checking subscription…</div>`;
        subStatus = await checkServiceSubscription(currentUser.uid);
        renderSubmitArea(subStatus.hasAccess, subStatus.planName);
      } else {
        renderSubmitArea(false, null);
      }
    }

    /* ── SUMMARY ── */
    function getWhatsapp() {
      const same = $("f-wa-same").checked;
      const phone = $("f-phone").value.trim();
      const wa = $("f-whatsapp").value.trim();
      return same ? phone : wa || phone;
    }

    function buildSummary() {
      if (!selSvc) return;
      const gv = (id) => ($(id)?.value || "").trim();
      const days = [...selDays].join(", ") || "Not set";
      const now = new Date();
      const exp = new Date(now);
      exp.setDate(exp.getDate() + 30);
      const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const name = gv("f-name"),
        phone = gv("f-phone"),
        price = gv("f-rate");
      const rows = [
        ["SERVICE", `${selSvc.icon} ${selSvc.name}`],
        ["LISTING ACTIVE", `${fmt(now)} → ${fmt(exp)}`],
        ["NAME *", name || '<span class="s-val req-missing">Missing</span>'],
        ["PHONE *", phone ? phone : '<span class="s-val req-missing">Missing</span>'],
        ["WHATSAPP", getWhatsapp() || "—"],
        ["PRICE *", price ? "₹" + price + " onwards" : '<span class="s-val req-missing">Missing</span>'],
        ["CITY", [gv("f-area"), gv("f-city")].filter(Boolean).join(", ") || "—"],
        ["EXP", gv("f-exp") ? gv("f-exp") + " yrs" : "—"],
        ["TAGS", [...selTags].join(", ") || "—"],
        ["DAYS", days],
        ["HOURS", gv("f-from") + " – " + gv("f-to")],
        ["PHOTOS", photoFiles.length ? photoFiles.length + " selected" : "None"],
        ["PLAN", `₹${PRICE}/mo after 3-month free trial`],
      ];
      $("summaryBox").innerHTML = rows.map(([k, v]) => `<div class="summary-row"><span class="s-key">${k}</span><span class="s-val">${v}</span></div>`).join("");
    }

    /* ── PHOTOS ── */
    const pz = $("pz");
    const pi = $("pi");

    function addPhotos(files) {
      Array.from(files).forEach((f) => {
        if (photoFiles.length >= 5) {
          toast("Maximum 5 photos allowed.", "err");
          return;
        }
        if (f.size > 5 * 1024 * 1024) {
          toast(`${f.name} is over 5 MB.`, "err");
          return;
        }
        if (!f.type.startsWith("image/")) {
          toast("Only image files allowed.", "err");
          return;
        }
        photoFiles.push(f);
      });
      renderThumbs();
    }

    function renderThumbs() {
      const row = $("pthumbRow");
      row.innerHTML = "";
      photoFiles.forEach((f, i) => {
        const w = document.createElement("div");
        w.className = "pthumb-wrap";
        w.innerHTML = `<img src="${URL.createObjectURL(f)}" class="pthumb">
          <button class="pthumb-rm" data-i="${i}" title="Remove">✕</button>`;
        row.appendChild(w);
      });
      row.querySelectorAll(".pthumb-rm").forEach((btn) => {
        btn.addEventListener("click", () => {
          photoFiles.splice(Number(btn.dataset.i), 1);
          renderThumbs();
        });
      });
    }

    const onPzClick = () => pi.click();
    const onPiChange = () => {
      addPhotos(pi.files);
      pi.value = "";
    };
    const onDragOver = (e) => {
      e.preventDefault();
      pz.classList.add("drag-over");
    };
    const onDragLeave = () => pz.classList.remove("drag-over");
    const onDrop = (e) => {
      e.preventDefault();
      pz.classList.remove("drag-over");
      addPhotos(e.dataTransfer.files);
    };
    if (pz) {
      pz.addEventListener("click", onPzClick);
      pz.addEventListener("dragover", onDragOver);
      pz.addEventListener("dragleave", onDragLeave);
      pz.addEventListener("drop", onDrop);
      cleanupFns.push(() => {
        pz.removeEventListener("click", onPzClick);
        pz.removeEventListener("dragover", onDragOver);
        pz.removeEventListener("dragleave", onDragLeave);
        pz.removeEventListener("drop", onDrop);
      });
    }
    if (pi) {
      pi.addEventListener("change", onPiChange);
      cleanupFns.push(() => pi.removeEventListener("change", onPiChange));
    }

    /* ── SUBMIT ── */
    async function submitListing() {
      if (!validateStep2()) {
        toast("Please complete Name, Phone and Price first.", "err");
        goStep(2);
        return;
      }

      const uid = currentUser?.uid;
      if (!uid) {
        toast("Please sign in first.", "err");
        return;
      }

      const status = await checkServiceSubscription(uid);
      if (!status.hasAccess) {
        toast("A service subscription is required to publish.", "err");
        renderSubmitArea(false, null);
        return;
      }

      const btn = $("submitBtn");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spin" style="border-top-color:#fff"></span> Publishing…';
      }

      try {
        const photoUrls = await uploadPhotos();
        const gv = (id) => ($(id)?.value || "").trim();
        const now = new Date();
        const exp = new Date(now);
        exp.setDate(exp.getDate() + 30);

        const name = gv("f-name");
        const phone = gv("f-phone");
        const whatsapp = getWhatsapp();
        const price = Number(gv("f-rate")) || 0;
        const city = gv("f-city");
        const area = gv("f-area");
        const coverage = gv("f-coverage")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const title = gv("f-title") || `${selSvc.name} — ${name}`;
        const tagsArr = [...selTags];
        const emergency = $("f-emergency")?.checked || false;
        const licensed = $("f-licensed")?.checked || false;
        const status2 = gv("f-status") || "available";
        const workHours = `${gv("f-from")} – ${gv("f-to")}`;

        let docRef;

        if (selSvc.target.coll === "services") {
          const payload = {
            category: selSvc.target.category,
            status: "active",
            approved: true,
            businessName: name,
            ownerName: name,
            phone,
            whatsapp,
            city,
            area,
            state: "",
            servicesAreas: coverage,
            serviceTypes: tagsArr.length ? tagsArr : [selSvc.name],
            yearsExperience: Number(gv("f-exp")) || 0,
            jobsCompleted: Number(gv("f-jobs")) || 0,
            priceFrom: price,
            startingPrice: price,
            averageRating: 0,
            reviewCount: 0,
            isVerified: true,
            isLicensed: licensed,
            emergencyService: emergency,
            availability: status2,
            responseTime: "Within 1 hr",
            workHours,
            tagline: title,
            description: gv("f-desc"),
            photos: photoUrls,
            uid,
            activatedAt: now.toISOString(),
            expiresAt: exp.toISOString(),
            createdAt: serverTimestamp(),
          };
          docRef = await addDoc(collection(db, "services"), payload);
        } else {
          const payload = {
            category: selSvc.target.category,
            active: true,
            verified: true,
            name,
            phone,
            whatsapp,
            city,
            locality: area,
            servicesAreas: coverage,
            priceFrom: price,
            rating: 0,
            reviewCount: 0,
            experience: gv("f-exp") ? gv("f-exp") + " yrs exp." : "",
            yearsExperience: Number(gv("f-exp")) || 0,
            jobsCompleted: Number(gv("f-jobs")) || 0,
            avatarEmoji: selSvc.icon,
            services: tagsArr.length ? tagsArr : [selSvc.name],
            description: gv("f-desc"),
            tagline: title,
            availability: status2,
            workHours,
            photos: photoUrls,
            uid,
            activatedAt: now.toISOString(),
            expiresAt: exp.toISOString(),
            createdAt: serverTimestamp(),
          };
          docRef = await addDoc(collection(db, "service_providers"), payload);
        }

        if (docRef) {
          const propId = docRef.id;
          await setDoc(doc(db, "users", uid, "listings", propId), {
            listingId: propId,
            collection: selSvc.target.coll,
            category: selSvc.target.category,
            title,
            phone,
            whatsapp,
            active: true,
            activeTo: exp.toISOString(),
            createdAt: serverTimestamp(),
          });
        }

        $("stepper").style.display = "none";
        $("progBar").parentElement.style.display = "none";
        ["p1", "p2", "p3"].forEach((id) => ($(id).style.display = "none"));
        const ss = $("successScreen");
        ss.style.display = "block";
        const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        $("sucPill").textContent = `Active: ${fmt(now)} → ${fmt(exp)}`;
        $("sucViewLink").href = selSvc.page;
        $("sucContactRow").innerHTML = `
          <span class="suc-contact ph">📞 ${esc(phone)}</span>
          <span class="suc-contact wa">💬 ${esc(whatsapp)}</span>`;
        toast("🎉 Listing published!", "ok");
      } catch (err) {
        console.error(err);
        toast("Something went wrong. Please try again.", "err");
        const btn2 = $("submitBtn");
        if (btn2) {
          btn2.disabled = false;
          btn2.innerHTML = "🚀 Publish Listing";
        }
      }
    }

    /* ── CLOUDINARY UPLOAD ── */
    function uploadSingleImage(file) {
      return new Promise((resolve, reject) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", UPLOAD_PRESET);
        fd.append("cloud_name", CLOUD_NAME);
        fd.append("folder", "smartrent/service-photos");
        const xhr = new XMLHttpRequest();
        xhr.open("POST", CLOUDINARY_URL, true);
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

    async function uploadPhotos() {
      if (!photoFiles.length) return [];
      const urls = [];
      for (const f of photoFiles) {
        try {
          urls.push(await uploadSingleImage(f));
        } catch (e) {
          console.warn("Photo upload skipped:", e.message);
        }
      }
      return urls;
    }

    /* ── TOAST ── */
    let toastTimer;
    function toast(msg, type = "info") {
      const wrap = $("toastWrap");
      if (!wrap) return;
      const t = document.createElement("div");
      const typeMap = { ok: "ok", err: "err", info: "info" };
      t.className = "toast " + (typeMap[type] || "info");
      const icons = { ok: "✅", err: "⚠️", info: "ℹ️" };
      t.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
      wrap.appendChild(t);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        t.style.transition = "all .3s";
        t.style.opacity = "0";
        t.style.transform = "translateY(8px)";
        setTimeout(() => t.remove(), 300);
      }, 3500);
    }

    /* ── NAVBAR SCROLL ── */
    const onScroll = () => {
      const tb = $("topbar");
      if (tb) tb.classList.toggle("solid", window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll);
    cleanupFns.push(() => window.removeEventListener("scroll", onScroll));

    /* ── EXPOSE HANDLERS GLOBALLY (needed for onclick="..." attributes above) ── */
    window.goStep = goStep;
    window.attemptGoStep3 = attemptGoStep3;
    window.toggleWaField = toggleWaField;
    window.startFreeTrial = startFreeTrial;
    window.recheckSub = recheckSub;
    window.submitListing = submitListing;

    /* ── INIT ── */
    buildTagChips();
    buildExtraFlags();

    return () => {
      unsubAuth();
      cleanupFns.forEach((fn) => fn());
      delete window.goStep;
      delete window.attemptGoStep3;
      delete window.toggleWaField;
      delete window.startFreeTrial;
      delete window.recheckSub;
      delete window.submitListing;
    };
  }, []);

  return <div className="post-service-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
