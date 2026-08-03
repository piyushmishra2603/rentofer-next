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
        <div class="card-btns" id="cleaner-btns">
          <button class="btn btn-teal" onclick="activateFreeTrial('cleaner','₹249','Home Cleaner Plan');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-teal" onclick="selectPlan('cleaner','₹249','Cleaner Plan');scrollToPay()">Subscribe</button>
          <button class="btn btn-ghost btn-sm">View Benefits</button>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- COMPARISON TABLE -->
<section class="sec">
  <div class="wrap">
    <div class="sec-head reveal">
      <div class="eyebrow ey-blue">📊 Feature Comparison</div>
      <h2>Compare All <span class="text-blue">Plans</span></h2>
      <p>See exactly what's included in every plan before you commit.</p>
    </div>
    <div class="table-scroll reveal">
      <div class="table-outer">
        <table class="cmp-table">
          <thead>
            <tr>
              <th class="th-feat">Feature</th>
              <th class="th-owner">⭐ Owner Plan<br><span style="font-size:12px;font-weight:400;color:var(--t3)">₹249/mo</span></th>
              <th class="th-tenant">🏠 Tenant Plan<br><span style="font-size:12px;font-weight:400;color:var(--t3)">₹149/mo</span></th>
              <th class="th-service">💎 Service Plan<br><span style="font-size:12px;font-weight:400;color:var(--t3)">₹249/mo</span></th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="td-feat">Property Listing</td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td><td><span class="c-no">—</span></td></tr>
            <tr><td class="td-feat">Unlimited Listings</td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td><td><span class="c-no">—</span></td></tr>
            <tr><td class="td-feat">Property Analytics</td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td><td><span class="c-no">—</span></td></tr>
            <tr><td class="td-feat">Post Properties</td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td><td><span class="c-no">—</span></td></tr>
            <tr><td class="td-feat">WhatsApp Owner Access</td><td><span class="c-no">—</span></td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td></tr>
            <tr><td class="td-feat">Phone Number Access</td><td><span class="c-no">—</span></td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td></tr>
            <tr><td class="td-feat">Schedule Property Visits</td><td><span class="c-no">—</span></td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td></tr>
            <tr><td class="td-feat">Save &amp; Compare Properties</td><td><span class="c-no">—</span></td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td></tr>
            <tr><td class="td-feat">Service Listing</td><td><span class="c-no">—</span></td><td><span class="c-no">—</span></td><td><span class="c-yes">✓</span></td></tr>
            <tr><td class="td-feat">Customer Leads</td><td><span class="c-no">—</span></td><td><span class="c-no">—</span></td><td><span class="c-yes">✓</span></td></tr>
            <tr><td class="td-feat">Booking Management</td><td><span class="c-no">—</span></td><td><span class="c-no">—</span></td><td><span class="c-yes">✓</span></td></tr>
            <tr><td class="td-feat">Featured Listing Visibility</td><td><span class="c-yes">✓</span></td><td><span class="c-no">—</span></td><td><span class="c-yes">✓</span></td></tr>
            <tr><td class="td-feat">Dashboard Badge</td><td><span style="color:var(--gold);font-weight:600;font-size:13px">⭐ Gold Star</span></td><td><span class="c-no">—</span></td><td><span style="color:var(--teal);font-weight:600;font-size:13px">💎 Diamond</span></td></tr>
            <tr><td class="td-feat">Priority Search Ranking</td><td><span class="c-yes">✓</span></td><td><span class="c-yes">✓</span></td><td><span class="c-yes">✓</span></td></tr>
            <tr><td class="td-feat">Performance Analytics</td><td><span class="c-yes">✓</span></td><td><span class="c-part">Basic</span></td><td><span class="c-yes">✓</span></td></tr>
            <tr><td class="td-feat">Premium Support</td><td><span class="c-yes">✓</span></td><td><span class="c-yes">✓</span></td><td><span class="c-yes">✓</span></td></tr>
            <tr><td class="td-feat">3 Months FREE Trial</td><td><span class="c-yes">✓</span></td><td><span class="c-yes">✓</span></td><td><span class="c-yes">✓</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<!-- PAYMENT SECTION -->
<section class="sec pay-sec" id="paySection">
  <div class="wrap">
    <div class="sec-head reveal">
      <div class="eyebrow ey-green">🔐 Secure Checkout</div>
      <h2>Pay &amp; Activate <span class="text-blue">Your Plan</span></h2>
      <p>Secure Razorpay payment · Instant activation · RBI compliant · Zero hidden fees</p>
    </div>

    <div class="pay-layout reveal">

      <div>
        <div class="pay-left-card">
          <div class="pay-left-title">Select Your Plan</div>
          <div class="pay-left-sub">Choose the plan you want to pay for after your free trial ends.</div>
          <div class="plan-pills">
            <button class="ppill gold" id="pp-owner"     onclick="selectPlan('owner','₹249','Owner Plan')">⭐ Owner ₹249/mo</button>
            <button class="ppill"      id="pp-tenant"    onclick="selectPlan('tenant','₹149','Tenant Plan')">🏠 Tenant ₹149/mo</button>
            <button class="ppill"      id="pp-plumber"   onclick="selectPlan('plumber','₹249','Plumber Plan')">🔧 Plumber ₹249/mo</button>
            <button class="ppill"      id="pp-electric"  onclick="selectPlan('electrician','₹249','Electrician Plan')">⚡ Electrician ₹249/mo</button>
            <button class="ppill"      id="pp-painter"   onclick="selectPlan('painter','₹249','Painter Plan')">🎨 Painter ₹249/mo</button>
            <button class="ppill"      id="pp-carpenter" onclick="selectPlan('carpenter','₹249','Carpenter Plan')">🪚 Carpenter ₹249/mo</button>
            <button class="ppill"      id="pp-movers"    onclick="selectPlan('movers','₹249','Movers Plan')">🚚 Movers ₹249/mo</button>
            <button class="ppill"      id="pp-cleaner"   onclick="selectPlan('cleaner','₹249','Cleaner Plan')">🧹 Cleaner ₹249/mo</button>
          </div>

          <div class="pay-amount-box">
            <div class="pay-plan-name" id="payPlanLabel">Owner Plan</div>
            <div class="pay-price-big" id="payAmtDisplay">₹249</div>
            <div class="pay-price-sub">per month — billed after 90-day trial</div>
            <div><span class="pay-free-tag">🎁 FREE for first 90 days</span></div>
          </div>

          <div class="order-summary">
            <div class="os-row"><span class="os-key">Plan</span><span class="os-val" id="osPlan">Owner Plan</span></div>
            <div class="os-row"><span class="os-key">Free Trial</span><span class="os-val green">90 Days Included</span></div>
            <div class="os-row"><span class="os-key">Due Today</span><span class="os-val green">₹0</span></div>
            <div class="os-row"><span class="os-key">After Trial</span><span class="os-val" id="osAfter">₹249 / month</span></div>
          </div>

          <p style="font-size:12px;color:var(--t3);text-align:center">Payment now = Subscribe for after-trial billing. Use <strong>Start Free Trial</strong> above for the free 90-day plan.</p>
        </div>
      </div>

      <div>
        <div class="pay-card">

          <div class="pay-card-header">
            <div class="pch-icon">🔐</div>
            <div class="pch-text">
              <div class="pch-title">Secure Razorpay Checkout</div>
              <div class="pch-sub">256-bit encrypted · PCI-DSS compliant</div>
            </div>
            <div class="pch-ssl">🔒 SSL</div>
          </div>

          <div class="pay-card-body">

            <div class="upi-merchant-row">
              <div class="merchant-logo">🏠</div>
              <div class="merchant-info">
                <div class="merchant-name">SmartRent Technologies</div>
                <div class="merchant-upi">Payments powered by Razorpay</div>
                <div class="merchant-verified">✓ Verified Merchant</div>
              </div>
            </div>

            <div class="rzp-methods-row">
              <span class="rzp-method-chip">📱 UPI</span>
              <span class="rzp-method-chip">🅶 Google Pay</span>
              <span class="rzp-method-chip">📲 PhonePe</span>
              <span class="rzp-method-chip">💰 Paytm</span>
              <span class="rzp-method-chip">🇮🇳 BHIM</span>
              <span class="rzp-method-chip">💳 Cards</span>
              <span class="rzp-method-chip">🏦 Net Banking</span>
              <span class="rzp-method-chip">👛 Wallets</span>
            </div>

            <div class="rzp-pay-box" id="rzpPayBox">
              <button class="btn btn-blue rzp-pay-btn" id="rzpPayBtn" onclick="startRazorpayPayment()">
                🔐 Pay Securely <span id="rzpPayBtnAmt">₹249</span> <span class="arr">→</span>
              </button>
              <div class="rzp-pay-sub" id="rzpPaySub">One tap opens Razorpay Checkout — choose UPI, card, net banking or wallet.</div>
            </div>

            <div class="pay-status" id="payStatusCreating">
              <div class="pay-spinner"></div>
              <div class="pay-status-title">Preparing your secure order…</div>
              <div class="pay-status-sub">This takes just a second.</div>
            </div>

            <div class="pay-status" id="payStatusVerifying">
              <div class="pay-spinner"></div>
              <div class="pay-status-title">Confirming your payment…</div>
              <div class="pay-status-sub">Please don't close this window while we verify with Razorpay.</div>
            </div>

            <div class="pay-status" id="payStatusSuccess">
              <div class="pay-status-icon ok">✅</div>
              <div class="pay-status-title">Payment successful!</div>
              <div class="pay-status-sub" id="paySuccessSub">Your plan is now active.</div>
            </div>

            <div class="pay-status" id="payStatusError">
              <div class="pay-status-icon err">⚠️</div>
              <div class="pay-status-title" id="payErrorTitle">Payment didn't go through</div>
              <div class="pay-status-sub" id="payErrorSub">No amount was charged. You can safely try again.</div>
              <div class="pay-status-actions">
                <button class="btn btn-blue btn-sm" onclick="retryPayment()">Retry Payment</button>
                <button class="btn btn-ghost btn-sm" onclick="cancelPaymentUI()">Cancel</button>
              </div>
            </div>

          </div>

          <div class="pay-card-footer">
            <div class="trust-badges-mini">
              <div class="tb"><span class="ti">🔒</span> 256-bit SSL</div>
              <div class="tb"><span class="ti">🏦</span> RBI Regulated</div>
              <div class="tb"><span class="ti">⚡</span> Instant Activation</div>
              <div class="tb"><span class="rzp-badge">Razorpay</span> Secured</div>
              <div class="tb"><span class="ti">🛡️</span> Fraud Protected</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="sec">
  <div class="wrap">
    <div class="sec-head reveal">
      <div class="eyebrow ey-blue">💬 Testimonials</div>
      <h2>Trusted by <span class="text-blue">Thousands</span></h2>
      <p>See why property owners, tenants and service professionals choose SmartRent Premium.</p>
    </div>
    <div class="testi-grid">
      <div class="testi-card reveal">
        <div class="stars">★★★★★</div>
        <div class="testi-text">"Got 18 genuine tenant inquiries in the first week. No spam, no fake leads. Worth every rupee!"</div>
        <div class="testi-author"><div class="testi-av">👨‍💼</div><div><div class="testi-name">Vikram Mehta</div><div class="testi-meta">Property Owner · Mumbai</div><div class="testi-plan">⭐ Owner Plan Subscriber</div></div></div>
      </div>
      <div class="testi-card reveal d1">
        <div class="stars">★★★★★</div>
        <div class="testi-text">"Called the owner directly, scheduled a visit the same day, moved in within a week. No broker fees!"</div>
        <div class="testi-author"><div class="testi-av">👩</div><div><div class="testi-name">Priya Iyer</div><div class="testi-meta">Tenant · Bangalore</div><div class="testi-plan">🏠 Tenant Plan Subscriber</div></div></div>
      </div>
      <div class="testi-card reveal d2">
        <div class="stars">★★★★★</div>
        <div class="testi-text">"My plumbing bookings tripled after getting the Diamond Badge. The analytics helped me grow."</div>
        <div class="testi-author"><div class="testi-av">🔧</div><div><div class="testi-name">Ramesh Kumar</div><div class="testi-meta">Plumber · Pune</div><div class="testi-plan">💎 Service Provider Subscriber</div></div></div>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="wrap">
    <div class="footer-inner">
      <span>© 2026 SmartRent Technologies Pvt. Ltd. &nbsp;·&nbsp; <a href="/privacy">Privacy Policy</a> &nbsp;·&nbsp; <a href="/terms">Terms</a> &nbsp;·&nbsp; <a href="/support">Support</a></span>
      <span>🇮🇳 Made in India &nbsp;·&nbsp; CIN: U72900MH2025PTC000001</span>
    </div>
  </div>
</footer>

<!-- SUCCESS MODAL -->
<div class="modal-overlay" id="successModal">
  <div class="modal-box" id="modalBox">
    <canvas id="confettiCanvas" width="500" height="500"></canvas>
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div class="modal-check">✅</div>
    <div class="modal-title" id="modalTitle">Subscription Activated!</div>
    <div class="modal-sub">
      Your <strong id="modalPlanName">plan</strong> has been activated successfully.<br>
      Your 3-month FREE trial starts today — enjoy full premium access!
    </div>
    <div class="modal-trial-box">
      <div class="modal-trial-label">Trial Period</div>
      <div class="modal-trial-dates" id="trialDates">—</div>
    </div>
    <div class="modal-btns" id="modalBtns"></div>
  </div>
</div>
`;

export default function PlansPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const $ = (id) => document.getElementById(id);
    const cleanupFns = [];

    /* ── AUTH WATCHER ── */
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      window.__currentUser = user || null;
      document.querySelectorAll(".auth-name").forEach((el) => {
        el.textContent = user ? user.displayName || user.email : "Guest";
      });
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          window.__accountTrialUsed = snap.exists() && snap.data().trialUsed === true;
          window.__accountActivePlan = snap.exists() ? snap.data().planId || null : null;
          window.__accountTrialEnd = snap.exists() ? snap.data().trialEndDate || null : null;
        } catch (e) {
          window.__accountTrialUsed = false;
          window.__accountActivePlan = null;
          window.__accountTrialEnd = null;
        }
      } else {
        window.__accountTrialUsed = false;
        window.__accountActivePlan = null;
        window.__accountTrialEnd = null;
      }
      refreshTrialButtons();
    });

    /* ── NAVBAR STUCK STATE ── */
    const onScroll = () => {
      const nav = $("nav");
      if (nav) nav.classList.toggle("stuck", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll);
    cleanupFns.push(() => window.removeEventListener("scroll", onScroll));

    /* ── COUNTDOWN ── */
    const cdKey = "sr_promo_expiry_lt";
    let exp = sessionStorage.getItem(cdKey);
    if (!exp) {
      exp = Date.now() + 7 * 86400000;
      sessionStorage.setItem(cdKey, exp);
    }
    function cdTick() {
      const d = +exp - Date.now();
      if (d <= 0) return;
      const pad = (n) => String(n).padStart(2, "0");
      if ($("cd-d")) $("cd-d").textContent = pad(Math.floor(d / 86400000));
      if ($("cd-h")) $("cd-h").textContent = pad(Math.floor((d % 86400000) / 3600000));
      if ($("cd-m")) $("cd-m").textContent = pad(Math.floor((d % 3600000) / 60000));
      if ($("cd-s")) $("cd-s").textContent = pad(Math.floor((d % 60000) / 1000));
    }
    cdTick();
    const cdInterval = setInterval(cdTick, 1000);
    cleanupFns.push(() => clearInterval(cdInterval));

    /* ── ANIMATED COUNTERS ── */
    const cObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll("[data-target]").forEach((el) => {
            const tgt = parseFloat(el.dataset.target);
            const suf = el.dataset.suf || "";
            const dec = parseInt(el.dataset.dec || 0);
            let cur = 0;
            const step = tgt / 70;
            const t = setInterval(() => {
              cur += step;
              if (cur >= tgt) {
                cur = tgt;
                clearInterval(t);
              }
              el.textContent = dec ? cur.toFixed(dec) + suf : Math.floor(cur).toLocaleString("en-IN") + suf;
            }, 20);
          });
          cObs.unobserve(e.target);
        });
      },
      { threshold: 0.5 }
    );
    rootRef.current.querySelectorAll(".stats-bar").forEach((s) => cObs.observe(s));
    cleanupFns.push(() => cObs.disconnect());

    /* ── SCROLL REVEAL ── */
    const rObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) setTimeout(() => e.target.classList.add("in"), i * 50);
        });
      },
      { threshold: 0.08 }
    );
    rootRef.current.querySelectorAll(".reveal").forEach((el) => rObs.observe(el));
    cleanupFns.push(() => rObs.disconnect());

    /* ── SUBSCRIPTION HELPERS ── */
    function getStoredSubscription() {
      try {
        const r = localStorage.getItem(LS_KEY);
        return r ? JSON.parse(r) : null;
      } catch (e) {
        return null;
      }
    }
    function isSubscriptionActive(sub) {
      if (!sub) return false;
      if (sub.status !== "trial_active" && sub.status !== "active") return false;
      if (sub.trialEndDate && Date.now() > new Date(sub.trialEndDate).getTime()) return false;
      return true;
    }

    /* ── REFRESH TRIAL BUTTONS ── */
    function refreshTrialButtons() {
      const sub = getStoredSubscription();
      const lsActive = isSubscriptionActive(sub);

      const allPlans = [
        { id: "owner", btnId: "owner-btns", color: "gold", amount: "₹249", name: "Owner Plan" },
        { id: "tenant", btnId: "tenant-btns", color: "blue", amount: "₹149", name: "Tenant Plan" },
        { id: "plumber", btnId: "plumber-btns", color: "teal", amount: "₹249", name: "Plumber Plan" },
        { id: "electrician", btnId: "electrician-btns", color: "teal", amount: "₹249", name: "Electrician Plan" },
        { id: "carpenter", btnId: "carpenter-btns", color: "teal", amount: "₹249", name: "Carpenter Plan" },
        { id: "painter", btnId: "painter-btns", color: "teal", amount: "₹249", name: "Painter Plan" },
        { id: "movers", btnId: "movers-btns", color: "teal", amount: "₹249", name: "Movers Plan" },
        { id: "cleaner", btnId: "cleaner-btns", color: "teal", amount: "₹249", name: "Home Cleaner Plan" },
      ];

      allPlans.forEach((plan) => {
        const container = $(plan.btnId);
        if (!container) return;
        const primaryClass = plan.color === "gold" ? "btn-gold" : plan.color === "blue" ? "btn-blue" : "btn-teal";

        if (!window.__currentUser) {
          container.innerHTML = `
            <div style="padding:12px 14px;border-radius:var(--r);background:var(--blue-pale);border:1.5px solid var(--blue-soft);font-size:13px;color:var(--blue);font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:8px">
              <span>🔐</span><span>Sign in to start your free trial</span>
            </div>
            <a class="btn btn-blue btn-lg" href="/login" style="text-decoration:none">Sign In to Start Trial <span class="arr">→</span></a>
            <button class="btn btn-outline-${plan.color}" onclick="selectPlan('${plan.id}','${plan.amount}','${plan.name}');scrollToPay()">Subscribe Now</button>`;
          return;
        }

        if (window.__accountTrialUsed && window.__accountActivePlan === plan.id) {
          const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
          const endStr = window.__accountTrialEnd ? fmt(window.__accountTrialEnd) : "—";
          container.innerHTML = `
            <div class="active-sub-banner">
              <span style="font-size:18px">✅</span>
              <div>
                <div style="font-weight:700;font-size:13px">Trial Active Until ${endStr}</div>
                <div style="font-size:12px;font-weight:400;color:var(--green);opacity:.8">Full access unlocked${plan.id === "owner" ? " · Property posting enabled" : ""}</div>
              </div>
            </div>
            <button class="btn btn-outline-${plan.color}" onclick="selectPlan('${plan.id}','${plan.amount}','${plan.name}');scrollToPay()">Subscribe to Continue After Trial</button>
            <button class="btn btn-ghost btn-sm" onclick="toast('Plan details coming soon…','info')">Learn More</button>`;
          return;
        }

        if (window.__accountTrialUsed && window.__accountActivePlan !== plan.id) {
          container.innerHTML = `
            <div class="trial-used-badge">
              <span style="font-size:16px">ℹ️</span>
              <span>Free trial used on <strong>${window.__accountActivePlan || "another plan"}</strong> for this account</span>
            </div>
            <button class="btn btn-outline-${plan.color}" onclick="selectPlan('${plan.id}','${plan.amount}','${plan.name}');scrollToPay()">Subscribe Now</button>
            <button class="btn btn-ghost btn-sm" onclick="toast('Plan details coming soon…','info')">Learn More</button>`;
          return;
        }

        if (lsActive && sub.planId === plan.id) {
          const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
          container.innerHTML = `
            <div class="active-sub-banner">
              <span style="font-size:18px">✅</span>
              <div>
                <div style="font-weight:700;font-size:13px">Trial Active Until ${fmt(sub.trialEndDate)}</div>
                <div style="font-size:12px;font-weight:400;color:var(--green);opacity:.8">Full access unlocked</div>
              </div>
            </div>
            <button class="btn btn-outline-${plan.color}" onclick="selectPlan('${plan.id}','${plan.amount}','${plan.name}');scrollToPay()">Subscribe to Continue After Trial</button>
            <button class="btn btn-ghost btn-sm" onclick="toast('Plan details coming soon…','info')">Learn More</button>`;
          return;
        }

        container.innerHTML = `
          <button class="btn ${primaryClass} btn-lg" onclick="activateFreeTrial('${plan.id}','${plan.amount}','${plan.name}');addRipple(this)">Start Free Trial <span class="arr">→</span></button>
          <button class="btn btn-outline-${plan.color}" onclick="selectPlan('${plan.id}','${plan.amount}','${plan.name}');scrollToPay()">Subscribe Now</button>
          <button class="btn btn-ghost btn-sm" onclick="toast('Plan details coming soon…','info')">Learn More</button>`;
      });
    }

    /* ── ACTIVATE FREE TRIAL ── */
    async function activateFreeTrial(planId, amount, planName) {
      if (!window.__currentUser) {
        toast("Please sign in first to activate your free trial.", "info");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1400);
        return;
      }

      if (window.__accountTrialUsed === true) {
        toast(`Your free trial was already used for this account (${window.__accountActivePlan || "a plan"}). Subscribe to continue.`, "info");
        scrollToPay();
        return;
      }

      const now = new Date();
      const trial = new Date(now);
      trial.setDate(trial.getDate() + 90);
      const uid = window.__currentUser.uid;

      const sub = {
        planId,
        planName,
        planAmount: amount,
        status: "trial_active",
        trialType: "free",
        trialStartDate: now.toISOString(),
        trialEndDate: trial.toISOString(),
        activatedAt: Date.now(),
        uid,
      };

      localStorage.setItem(LS_KEY, JSON.stringify(sub));
      if (planId === "owner") {
        localStorage.setItem(
          LS_OWNER_KEY,
          JSON.stringify({
            status: "trial_active",
            trialType: "free",
            planId: "owner",
            planName,
            trialStartDate: now.toISOString(),
            trialEndDate: trial.toISOString(),
            activatedAt: Date.now(),
            uid,
          })
        );
      }

      try {
        await setDoc(
          doc(db, "users", uid),
          {
            trialUsed: true,
            planId,
            planName,
            trialEndDate: trial.toISOString(),
            subscriptionStatus: "active",
            subscriptionPlan: planId === "tenant" ? "tenant_basic" : planId,
            updatedAt: serverTimestamp(),
            ...(planId === "owner"
              ? {
                  ownerPlan: true,
                  canPostProperty: true,
                  ownerSubscription: { plan: "owner", status: "active", active: true, expiresAt: trial.toISOString() },
                }
              : {}),
          },
          { merge: true }
        );

        await setDoc(doc(db, "subscriptions", uid), { ...sub, updatedAt: serverTimestamp() });

        window.__accountTrialUsed = true;
        window.__accountActivePlan = planId;
        window.__accountTrialEnd = trial.toISOString();
      } catch (e) {
        console.warn("Firestore write failed (non-critical):", e);
      }

      refreshTrialButtons();
      showSuccess(sub, trial);
    }

    /* ── PLAN SELECTION ── */
    let selectedPlan = { id: "owner", amount: "₹249", name: "Owner Plan" };

    function selectPlan(id, amount, name) {
      selectedPlan = { id, amount, name };

      if ($("payAmtDisplay")) $("payAmtDisplay").textContent = amount;
      if ($("payPlanLabel")) $("payPlanLabel").textContent = name;
      if ($("osPlan")) $("osPlan").textContent = name;
      if ($("osAfter")) $("osAfter").textContent = amount + " / month";
      if ($("rzpPayBtnAmt")) $("rzpPayBtnAmt").textContent = amount;

      rootRef.current.querySelectorAll(".ppill").forEach((p) => (p.className = "ppill"));
      const colorMap = { owner: "gold", tenant: "blue", plumber: "teal", electrician: "teal", painter: "teal", carpenter: "teal", movers: "teal", cleaner: "teal" };
      const idMap = { plumber: "plumber", electrician: "electric", painter: "painter", carpenter: "carpenter", movers: "movers", cleaner: "cleaner", owner: "owner", tenant: "tenant" };
      const pp = $("pp-" + (idMap[id] || id));
      if (pp) pp.className = "ppill " + (colorMap[id] || "teal");

      resetPayCardUI();
      toast(`${name} selected — ₹0 for 3 months, then ${amount}/month`, "info");
    }

    function scrollToPay() {
      const el = $("paySection");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* ── PAY CARD UI STATE ── */
    let rzpBusy = false;

    function showPayState(stateId) {
      ["rzpPayBox", "payStatusCreating", "payStatusVerifying", "payStatusSuccess", "payStatusError"].forEach((id) => {
        const el = $(id);
        if (!el) return;
        if (id === "rzpPayBox") el.style.display = id === stateId ? "" : "none";
        else el.classList.toggle("show", id === stateId);
      });
    }
    function resetPayCardUI() {
      rzpBusy = false;
      showPayState("rzpPayBox");
    }
    function cancelPaymentUI() {
      resetPayCardUI();
    }
    function retryPayment() {
      resetPayCardUI();
      startRazorpayPayment();
    }

    /* ── RAZORPAY PAYMENT FLOW ── */
    async function startRazorpayPayment() {
      if (rzpBusy) return;

      if (!window.__currentUser) {
        toast("Please sign in to make a payment.", "info");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
        return;
      }
      if (typeof window.Razorpay === "undefined") {
        toast("Payment library failed to load. Check your connection and retry.", "err");
        return;
      }

      rzpBusy = true;
      showPayState("payStatusCreating");

      let orderResult;
      try {
        const createOrder = httpsCallable(functions, "createRazorpayOrder");
        const res = await createOrder({ planId: selectedPlan.id });
        orderResult = res.data;
      } catch (err) {
        console.error("createRazorpayOrder failed:", err);
        rzpBusy = false;
        if ($("payErrorTitle")) $("payErrorTitle").textContent = "Could not start payment";
        if ($("payErrorSub")) $("payErrorSub").textContent = err && err.message ? err.message : "Please check your connection and try again.";
        showPayState("payStatusError");
        return;
      }

      const options = {
        key: orderResult.keyId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: "SmartRent Technologies",
        description: orderResult.planName,
        order_id: orderResult.orderId,
        prefill: {
          name: window.__currentUser.displayName || "",
          email: window.__currentUser.email || "",
        },
        theme: { color: "#2563eb" },
        method: { upi: true, card: true, netbanking: true, wallet: true },
        handler: async function (response) {
          showPayState("payStatusVerifying");
          try {
            const verifyPayment = httpsCallable(functions, "verifyRazorpayPayment");
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const data = verifyRes.data;
            if ($("paySuccessSub"))
              $("paySuccessSub").textContent = `${data.planName} is active until ${new Date(data.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`;
            showPayState("payStatusSuccess");
            rzpBusy = false;

            window.__accountTrialUsed = true;
            window.__accountActivePlan = data.planId;
            window.__accountTrialEnd = data.expiryDate;

            const sub = {
              planId: data.planId,
              planName: data.planName,
              planAmount: selectedPlan.amount,
              status: "active",
              trialType: "paid",
              trialStartDate: data.activationDate,
              trialEndDate: data.expiryDate,
              activatedAt: Date.now(),
              uid: window.__currentUser.uid,
              paymentMethod: "razorpay",
            };
            localStorage.setItem(LS_KEY, JSON.stringify(sub));
            if (data.planId === "owner") {
              localStorage.setItem(
                LS_OWNER_KEY,
                JSON.stringify({
                  status: "active",
                  trialType: "paid",
                  planId: "owner",
                  planName: data.planName,
                  trialStartDate: data.activationDate,
                  trialEndDate: data.expiryDate,
                  activatedAt: Date.now(),
                  uid: window.__currentUser.uid,
                })
              );
            }

            refreshTrialButtons();
            showSuccess(sub, new Date(data.expiryDate));

            setTimeout(() => {
              closeModal();
              resetPayCardUI();
            }, 6000);
          } catch (err) {
            console.error("verifyRazorpayPayment failed:", err);
            rzpBusy = false;
            if ($("payErrorTitle")) $("payErrorTitle").textContent = "Payment could not be verified";
            if ($("payErrorSub"))
              $("payErrorSub").textContent =
                err && err.message ? err.message : "If money was deducted, it will be auto-refunded within 5-7 business days. Please contact support if this persists.";
            showPayState("payStatusError");
          }
        },
        modal: {
          ondismiss: function () {
            rzpBusy = false;
            resetPayCardUI();
            toast("Payment cancelled — no amount was charged.", "info");
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          rzpBusy = false;
          if ($("payErrorTitle")) $("payErrorTitle").textContent = "Payment failed";
          if ($("payErrorSub"))
            $("payErrorSub").textContent = (resp && resp.error && resp.error.description) || "Your bank or UPI app declined the payment. No amount was charged.";
          showPayState("payStatusError");
        });
        rzp.open();
        showPayState("rzpPayBox");
      } catch (err) {
        console.error("Razorpay open() failed:", err);
        rzpBusy = false;
        if ($("payErrorTitle")) $("payErrorTitle").textContent = "Could not open payment window";
        if ($("payErrorSub")) $("payErrorSub").textContent = "Please refresh the page and try again.";
        showPayState("payStatusError");
      }
    }

    /* ── SUCCESS MODAL ── */
    function showSuccess(sub, trialEnd) {
      const isTrial = sub.trialType === "free";
      const isOwner = sub.planId === "owner";
      const isSvc = ["plumber", "electrician", "painter", "carpenter", "movers", "cleaner"].includes(sub.planId);

      if ($("modalTitle")) $("modalTitle").textContent = isTrial ? "🎉 Free Trial Activated!" : "✅ Subscription Activated!";
      if ($("modalPlanName")) $("modalPlanName").textContent = sub.planName;
      const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      if ($("trialDates")) $("trialDates").textContent = `${fmt(sub.trialStartDate)}  →  ${fmt(sub.trialEndDate)}${isTrial ? " (FREE)" : ""}`;

      const btnsEl = $("modalBtns");
      if (btnsEl) {
        if (isOwner) {
          btnsEl.innerHTML = `
            <button class="btn btn-gold btn-lg" onclick="window.location.href='/post-property'">🏘️ Post a Property Now <span class="arr">→</span></button>
            <button class="btn btn-ghost" onclick="closeModal()">Stay on Plans Page</button>`;
        } else if (isSvc) {
          btnsEl.innerHTML = `
            <button class="btn btn-teal btn-lg" onclick="window.location.href='/post-service'">🔧 Post Your Service Now <span class="arr">→</span></button>
            <button class="btn btn-ghost" onclick="closeModal()">Stay on Plans Page</button>`;
        } else {
          btnsEl.innerHTML = `
            <button class="btn btn-blue btn-lg" onclick="window.location.href='/properties'">🏠 Browse Properties <span class="arr">→</span></button>
            <button class="btn btn-ghost" onclick="closeModal()">Stay on Plans Page</button>`;
        }
      }

      const modal = $("successModal");
      if (modal) modal.classList.add("open");
      confetti();
    }
    function closeModal() {
      const modal = $("successModal");
      if (modal) modal.classList.remove("open");
    }

    /* ── CONFETTI ── */
    function confetti() {
      const canvas = $("confettiCanvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      canvas.width = canvas.parentElement.offsetWidth || 480;
      canvas.height = canvas.parentElement.offsetHeight || 520;
      const W = canvas.width,
        H = canvas.height;
      const cols = ["#2563eb", "#06b6d4", "#d97706", "#059669", "#dc2626", "#7c3aed", "#f59e0b"];
      const pts = Array.from({ length: 110 }, () => ({
        x: W / 2 + (Math.random() - 0.5) * 60,
        y: H * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: -(Math.random() * 15 + 5),
        r: Math.random() * 5 + 3,
        col: cols[Math.floor(Math.random() * cols.length)],
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 8,
        life: 1,
      }));
      (function draw() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach((p) => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.col;
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
          ctx.restore();
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.38;
          p.vx *= 0.99;
          p.rot += p.rv;
          p.life -= 0.011;
        });
        if (pts.some((p) => p.life > 0)) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, W, H);
      })();
    }

    /* ── RIPPLE ── */
    function addRipple(btn) {
      const r = document.createElement("span");
      r.className = "btn-ripple";
      const s = Math.max(btn.offsetWidth, btn.offsetHeight) * 2;
      r.style.cssText = `width:${s}px;height:${s}px;top:50%;left:50%;margin:-${s / 2}px`;
      btn.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
    }
    const rippleHandler = function (e) {
      const r = document.createElement("span");
      r.className = "btn-ripple";
      const rect = this.getBoundingClientRect();
      const s = Math.max(rect.width, rect.height) * 2;
      r.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - rect.left - s / 2}px;top:${e.clientY - rect.top - s / 2}px`;
      this.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
    };
    const rippleEls = rootRef.current.querySelectorAll(".btn");
    rippleEls.forEach((b) => b.addEventListener("click", rippleHandler));
    cleanupFns.push(() => rippleEls.forEach((b) => b.removeEventListener("click", rippleHandler)));

    /* ── TOAST ── */
    function toast(msg, type = "info") {
      const tc = $("toasts");
      if (!tc) return;
      const t = document.createElement("div");
      const icons = { info: "ℹ️", success: "✅", err: "⚠️" };
      t.className = `toast ${type}`;
      t.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;
      tc.appendChild(t);
      setTimeout(() => {
        t.style.transition = "all .3s";
        t.style.opacity = "0";
        t.style.transform = "translateY(8px)";
        setTimeout(() => t.remove(), 300);
      }, 3800);
    }

    /* ── EXPOSE HANDLERS GLOBALLY (needed for the onclick="..." attributes above) ── */
    window.activateFreeTrial = activateFreeTrial;
    window.selectPlan = selectPlan;
    window.scrollToPay = scrollToPay;
    window.toast = toast;
    window.addRipple = addRipple;
    window.startRazorpayPayment = startRazorpayPayment;
    window.retryPayment = retryPayment;
    window.cancelPaymentUI = cancelPaymentUI;
    window.closeModal = closeModal;

    /* ── INIT ── */
    refreshTrialButtons();

    return () => {
      unsubAuth();
      cleanupFns.forEach((fn) => fn());
      delete window.activateFreeTrial;
      delete window.selectPlan;
      delete window.scrollToPay;
      delete window.toast;
      delete window.addRipple;
      delete window.startRazorpayPayment;
      delete window.retryPayment;
      delete window.cancelPaymentUI;
      delete window.closeModal;
    };
  }, []);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="plans-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </>
  );
}      
