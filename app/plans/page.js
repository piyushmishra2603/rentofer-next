"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "@/lib/firebase";
import "./page.css";

const LS_KEY = "sr_subscription";
const LS_OWNER_KEY = "sr_owner_subscription";

const BODY_HTML = `
<div class="page-bg" aria-hidden="true">
  <div class="bg-blob bg-blob-1"></div>
  <div class="bg-blob bg-blob-2"></div>
  <div class="bg-blob bg-blob-3"></div>
</div>
<div id="toasts"></div>

<!-- NAVBAR -->
<nav class="navbar" id="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo">
      <div class="logo-icon">🏠</div>
      SmartRent
    </a>
    <div class="nav-back"><a href="/">← Back to Home</a></div>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="eyebrow ey-blue reveal">✦ Pricing &amp; Plans</div>
  <h1 class="reveal">Unlock <span class="accent">Premium Access</span><br>&amp; Grow Faster</h1>
  <p class="reveal">List properties, connect with tenants, showcase your services, and grow your business — starting completely <strong>FREE for 3 months</strong>.</p>
  <div class="trust-row reveal">
    <div class="trust-pill"><span class="trust-tick">✓</span> Secure Payments</div>
    <div class="trust-pill"><span class="trust-tick">✓</span> Instant Access</div>
    <div class="trust-pill"><span class="trust-tick">✓</span> Trusted Platform</div>
    <div class="trust-pill"><span class="trust-tick">✓</span> Verified Members</div>
    <div class="trust-pill"><span class="trust-tick">✓</span> Premium Visibility</div>
  </div>
</section>

<!-- PROMO BANNER -->
<div class="promo-wrap">
  <div class="promo-card reveal">
    <div class="promo-emoji">🎉</div>
    <div class="promo-body">
      <h3>FREE for the First 3 Months</h3>
      <p>Every new account gets 3 months of full premium access completely FREE. Trial is tied to your account — sign in on any device to access it.</p>
    </div>
    <div class="promo-checks">
      <div class="promo-chk"><div class="chk-icon">✓</div>No Upfront Charges</div>
      <div class="promo-chk"><div class="chk-icon">✓</div>Full Premium Access</div>
      <div class="promo-chk"><div class="chk-icon">✓</div>Account-Linked Trial</div>
      <div class="promo-chk"><div class="chk-icon">✓</div>Monthly After Trial</div>
    </div>
    <div class="countdown">
      <div class="cd-label">Offer Ends In</div>
      <div class="cd-digits">
        <div class="cd-block"><span class="cd-num" id="cd-d">00</span><div class="cd-unit">Days</div></div>
        <span class="cd-colon">:</span>
        <div class="cd-block"><span class="cd-num" id="cd-h">00</span><div class="cd-unit">Hrs</div></div>
        <span class="cd-colon">:</span>
        <div class="cd-block"><span class="cd-num" id="cd-m">00</span><div class="cd-unit">Min</div></div>
        <span class="cd-colon">:</span>
        <div class="cd-block"><span class="cd-num" id="cd-s">00</span><div class="cd-unit">Sec</div></div>
      </div>
    </div>
  </div>
</div>

<!-- STATS -->
<div class="wrap">
  <div class="stats-bar reveal">
    <div class="stat-cell"><span class="stat-val" data-target="12400" data-suf="+">0</span><div class="stat-lbl">Active Subscribers</div></div>
    <div class="stat-cell"><span class="stat-val" data-target="8900" data-suf="+">0</span><div class="stat-lbl">Verified Owners</div></div>
    <div class="stat-cell"><span class="stat-val" data-target="3600" data-suf="+">0</span><div class="stat-lbl">Service Professionals</div></div>
    <div class="stat-cell"><span class="stat-val" data-target="4.9" data-suf="★" data-dec="1">0</span><div class="stat-lbl">Avg Platform Rating</div></div>
  </div>
</div>

<!-- PROPERTY PLANS -->
<section class="sec">
  <div class="wrap">
    <div class="sec-head reveal">
      <div class="eyebrow ey-gold">🏠 Property Plans</div>
      <h2>Perfect for <span class="text-gold">Property Owners</span> &amp; Tenants</h2>
      <p>Whether you're listing a property or searching for your next home — we have the right plan.</p>
    </div>
    <div class="plans-2">
      <div class="plan-card card-gold reveal">
        <div class="badge-popular">⭐ Most Popular</div>
        <div class="plan-icon icon-gold">⭐</div>
        <div class="plan-name">Owner Plan</div>
        <div class="plan-desc">Built for property owners who want maximum tenant reach with zero broker fees.</div>
        <div class="price-row"><span class="price-num price-gold">₹249</span><span class="price-per">/month</span></div>
        <div class="trial-tag tag-gold">🎁 3 Months FREE — Start Today</div>
        <div class="plan-divider"></div>
        <div class="feat-list">
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>List Rental Properties</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Unlimited Property Listings</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Property Analytics &amp; Insights</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Tenant Inquiry Management</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Dashboard Management</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Property Performance Reports</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Premium Owner Visibility</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Featured Listing Eligibility</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Faster Discovery in Search</div>
          <div class="feat-row"><div class="feat-tick ft-gold">✓</div>Owner Profile Verification</div>
        </div>
        <div class="activate-note act-gold">
          <span style="font-size:18px">⭐</span>
          <span><strong>After Activation:</strong> Gold Star Badge on your Profile, Dashboard, Listings &amp; Search</span>
        </div>
        <div class="card-btns" id="owner-btns">
          <button class="btn btn-gold btn-lg" onclick="activateFreeTrial('owner','₹249','Owner Plan');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-gold" onclick="selectPlan('owner','₹249','Owner Plan');scrollToPay()">Subscribe Now</button>
          <button class="btn btn-ghost btn-sm" onclick="toast('Owner plan details coming soon…','info')">Learn More</button>
        </div>
      </div>

      <div class="plan-card card-blue reveal d1">
        <div class="plan-icon icon-blue">🏠</div>
        <div class="plan-name">Tenant Plan</div>
        <div class="plan-desc">Unlock direct owner contact and schedule property visits instantly — no middlemen.</div>
        <div class="price-row"><span class="price-num price-blue">₹149</span><span class="price-per">/month</span></div>
        <div class="trial-tag tag-blue">🎁 3 Months FREE — Start Today</div>
        <div class="plan-divider"></div>
        <div class="feat-list">
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Unlock Owner Phone Number</div>
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Unlock WhatsApp Owner Contact</div>
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Direct Communication Access</div>
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Schedule Property Visits</div>
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Save Unlimited Properties</div>
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Compare Multiple Properties</div>
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Priority Support</div>
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Rental Application Access</div>
          <div class="feat-row"><div class="feat-tick ft-blue">✓</div>Faster Contact Requests</div>
        </div>
        <div class="activate-note act-blue">
          <span style="font-size:18px">📞</span>
          <span><strong>After Activation:</strong> Unlocks <strong>📞 Call Owner</strong> and <strong>📲 WhatsApp Owner</strong> on all listings</span>
        </div>
        <div class="card-btns" id="tenant-btns">
          <button class="btn btn-blue btn-lg" onclick="activateFreeTrial('tenant','₹149','Tenant Plan');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-blue" onclick="selectPlan('tenant','₹149','Tenant Plan');scrollToPay()">Subscribe Now</button>
          <button class="btn btn-ghost btn-sm" onclick="toast('Tenant plan details coming soon…','info')">Learn More</button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SERVICE PLANS -->
<section class="sec" style="padding-top:16px;background:var(--surface-2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap">
    <div class="sec-head reveal">
      <div class="eyebrow ey-teal">💎 Service Provider Plans</div>
      <h2>Grow Your <span class="text-teal">Service Business</span></h2>
      <p>Get discovered by thousands of homeowners. Book more jobs. Build a 5-star reputation.</p>
    </div>
    <div class="plans-3">

      <div class="plan-card card-teal reveal">
        <div class="plan-icon icon-teal">🔧</div><div class="plan-name">Plumber</div>
        <div class="plan-desc">Get listed as a verified plumber and receive direct booking requests.</div>
        <div class="price-row"><span class="price-num price-teal">₹249</span><span class="price-per">/month</span></div>
        <div class="trial-tag tag-teal">🎁 3 Months FREE Trial</div>
        <div class="plan-divider"></div>
        <div class="feat-list">
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Listing</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Appear in Search Results</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Customer Leads</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Direct Contact Requests</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Dashboard</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Performance Analytics</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Booking Management</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Premium Visibility</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Verified Professional Badge</div>
        </div>
        <div class="activate-note act-teal"><span>💎</span><span><strong>After Activation:</strong> Diamond Badge on Dashboard, Profile, Listings &amp; Search</span></div>
        <div class="card-btns" id="plumber-btns">
          <button class="btn btn-teal" onclick="activateFreeTrial('plumber','₹249','Plumber Plan');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-teal" onclick="selectPlan('plumber','₹249','Plumber Plan');scrollToPay()">Subscribe</button>
          <button class="btn btn-ghost btn-sm">View Benefits</button>
        </div>
      </div>

      <div class="plan-card card-teal reveal d1">
        <div class="plan-icon icon-teal">⚡</div><div class="plan-name">Electrician</div>
        <div class="plan-desc">Connect with homeowners needing electrical repairs and installations.</div>
        <div class="price-row"><span class="price-num price-teal">₹249</span><span class="price-per">/month</span></div>
        <div class="trial-tag tag-teal">🎁 3 Months FREE Trial</div>
        <div class="plan-divider"></div>
        <div class="feat-list">
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Listing</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Appear in Search Results</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Customer Leads</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Direct Contact Requests</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Dashboard</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Performance Analytics</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Booking Management</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Premium Visibility</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Verified Professional Badge</div>
        </div>
        <div class="activate-note act-teal"><span>💎</span><span><strong>After Activation:</strong> Diamond Badge on Dashboard, Profile, Listings &amp; Search</span></div>
        <div class="card-btns" id="electrician-btns">
          <button class="btn btn-teal" onclick="activateFreeTrial('electrician','₹249','Electrician Plan');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-teal" onclick="selectPlan('electrician','₹249','Electrician Plan');scrollToPay()">Subscribe</button>
          <button class="btn btn-ghost btn-sm">View Benefits</button>
        </div>
      </div>

      <div class="plan-card card-teal reveal d2">
        <div class="plan-icon icon-teal">🪚</div><div class="plan-name">Carpenter</div>
        <div class="plan-desc">Showcase woodwork expertise and fill your schedule with quality bookings.</div>
        <div class="price-row"><span class="price-num price-teal">₹249</span><span class="price-per">/month</span></div>
        <div class="trial-tag tag-teal">🎁 3 Months FREE Trial</div>
        <div class="plan-divider"></div>
        <div class="feat-list">
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Listing</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Appear in Search Results</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Customer Leads</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Direct Contact Requests</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Dashboard</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Performance Analytics</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Booking Management</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Premium Visibility</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Verified Professional Badge</div>
        </div>
        <div class="activate-note act-teal"><span>💎</span><span><strong>After Activation:</strong> Diamond Badge on all public profiles</span></div>
        <div class="card-btns" id="carpenter-btns">
          <button class="btn btn-teal" onclick="activateFreeTrial('carpenter','₹249','Carpenter Plan');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-teal" onclick="selectPlan('carpenter','₹249','Carpenter Plan');scrollToPay()">Subscribe</button>
          <button class="btn btn-ghost btn-sm">View Benefits</button>
        </div>
      </div>

      <div class="plan-card card-teal reveal d3">
        <div class="plan-icon icon-teal">🎨</div><div class="plan-name">Painter</div>
        <div class="plan-desc">Get hired for interior and exterior painting projects across the city.</div>
        <div class="price-row"><span class="price-num price-teal">₹249</span><span class="price-per">/month</span></div>
        <div class="trial-tag tag-teal">🎁 3 Months FREE Trial</div>
        <div class="plan-divider"></div>
        <div class="feat-list">
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Listing</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Appear in Search Results</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Customer Leads</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Direct Contact Requests</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Dashboard</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Performance Analytics</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Booking Management</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Premium Visibility</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Verified Professional Badge</div>
        </div>
        <div class="activate-note act-teal"><span>💎</span><span><strong>After Activation:</strong> Diamond Badge on all public profiles</span></div>
        <div class="card-btns" id="painter-btns">
          <button class="btn btn-teal" onclick="activateFreeTrial('painter','₹249','Painter Plan');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-teal" onclick="selectPlan('painter','₹249','Painter Plan');scrollToPay()">Subscribe</button>
          <button class="btn btn-ghost btn-sm">View Benefits</button>
        </div>
      </div>

      <div class="plan-card card-teal reveal d4">
        <div class="plan-icon icon-teal">🚚</div><div class="plan-name">Movers &amp; Packers</div>
        <div class="plan-desc">Reach families moving within the city and handle full-service relocations.</div>
        <div class="price-row"><span class="price-num price-teal">₹249</span><span class="price-per">/month</span></div>
        <div class="trial-tag tag-teal">🎁 3 Months FREE Trial</div>
        <div class="plan-divider"></div>
        <div class="feat-list">
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Listing</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Appear in Search Results</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Customer Leads</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Direct Contact Requests</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Service Dashboard</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Performance Analytics</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Booking Management</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Premium Visibility</div>
          <div class="feat-row"><div class="feat-tick ft-teal">✓</div>Verified Professional Badge</div>
        </div>
        <div class="activate-note act-teal"><span>💎</span><span><strong>After Activation:</strong> Diamond Badge on all public profiles</span></div>
        <div class="card-btns" id="movers-btns">
          <button class="btn btn-teal" onclick="activateFreeTrial('movers','₹249','Movers Plan');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-teal" onclick="selectPlan('movers','₹249','Movers Plan');scrollToPay()">Subscribe</button>
          <button class="btn btn-ghost btn-sm">View Benefits</button>
        </div>
      </div>

      <div class="plan-card card-teal reveal d5">
        <div class="plan-icon icon-teal">🧹</div><div class="plan-name">Home Cleaner</div>
        <div class="plan-desc">Get regular cleaning jobs from verified homeowners and tenants near you.</div>
        <div class="price-row"><span class="price-num price-teal">₹249</span><span class="price-per">/month</span></div>
        <div class="trial-tag tag-teal">🎁 3 Months FREE Trial</div>
        <div class="plan-divider"></div>
        <div class="feat-list">
          <div class="feat-row"><div class="feat-tick ft-
