"use client";

import { useEffect, useRef } from "react";
import "./page.css";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap";

const BODY_HTML = `
<div class="progress-bar" id="progressBar"></div>
<div class="amb"><div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div></div>
<div class="bg-noise"></div>
<div class="bg-grid"></div>

<!-- MOBILE MENU -->
<div class="mob-menu" id="mobMenu">
  <a class="ml" href="/">🏠 Home</a>
  <a class="ml" href="/pgs-hostels">🛏 Browse PG &amp; Hostels</a>
  <a class="ml" href="/commercial">🏢 Commercial</a>
  <a class="ml" href="/owner-guide" style="color:#c8a44a">📋 Owner Guide</a>
  <hr style="border:none;border-top:1px solid rgba(59,130,246,.1);margin:8px 0">
  <a class="nb nb-gh" href="/login" style="text-decoration:none;justify-content:center">Sign In</a>
  <a class="nb nb-blue" href="/pgs-hostels" style="text-decoration:none;justify-content:center;margin-top:7px">🔍 Find a Property</a>
</div>

<!-- NAVBAR -->
<nav class="nav" id="navbar">
  <a href="/" class="brand">
    <div class="bgem">💎</div>
    <span class="bname">SmartRent</span>
  </a>
  <div class="nav-links">
    <a class="nl" href="/">Home</a>
    <a class="nl" href="/pgs-hostels">PG &amp; Hostels</a>
    <a class="nl" href="/commercial">Commercial</a>
    <a class="nl" href="/owner-guide">Owner Guide</a>
    <a class="nl on" href="/tenant-guide">Tenant Guide</a>
  </div>
  <div class="nav-r">
    <a class="nb nb-gh" href="/login" style="text-decoration:none">Sign In</a>
    <a class="nb nb-blue" href="/pgs-hostels" style="text-decoration:none">🔍 Find Property</a>
    <button class="mob-btn" onclick="toggleMob()" id="mobBtn">☰</button>
  </div>
</nav>

<!-- HERO — Two column layout -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-left">
      <div class="hero-badge"><span class="ldot"></span>Complete Tenant Guide · 2025–2026</div>
      <h1 class="hero-t">The Smart<br><em>Tenant's Guide</em></h1>
      <div class="hero-sub">Find, Negotiate &amp; Protect Yourself</div>
      <p class="hero-desc">Everything a first-time or experienced renter needs to know — from finding the right property to signing a fair agreement, knowing your legal rights, and getting your full deposit back.</p>
      <div class="hero-ctas">
        <a class="hc-main" href="/pgs-hostels">🔍 Find Your Home</a>
        <a class="hc-sec" href="/owner-guide">📋 Owner Guide</a>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-stats-stack">
        <div class="hss"><span class="hss-icon">🏠</span><div><div class="hss-val">Direct</div><div class="hss-lbl">Talk straight to the property owner</div></div></div>
        <div class="hss"><span class="hss-icon">⚡</span><div><div class="hss-val">₹0</div><div class="hss-lbl">Zero brokerage — direct landlord contact</div></div></div>
        <div class="hss"><span class="hss-icon">🔍</span><div><div class="hss-val">Filters</div><div class="hss-lbl">Narrow by city, budget, type &amp; amenities</div></div></div>
        <div class="hss"><span class="hss-icon">✅</span><div><div class="hss-val">KYC</div><div class="hss-lbl">All landlords are identity-verified</div></div></div>
      </div>
    </div>
  </div>
</section>

<!-- PAGE BODY -->
<div class="page-wrap">

  <!-- SIDEBAR -->
  <aside class="toc">
    <div class="toc-card">
      <div class="toc-title">📖 Table of Contents</div>
      <div class="toc-list">
        <a class="toc-item active" href="#t1" onclick="setToc(this)"><span class="toc-num">01</span>Getting Started</a>
        <a class="toc-item" href="#t2" onclick="setToc(this)"><span class="toc-num">02</span>How to Search</a>
        <a class="toc-item" href="#t3" onclick="setToc(this)"><span class="toc-num">03</span>Budget Planning</a>
        <a class="toc-item" href="#t4" onclick="setToc(this)"><span class="toc-num">04</span>Property Inspection</a>
        <a class="toc-item" href="#t5" onclick="setToc(this)"><span class="toc-num">05</span>Negotiation Tips</a>
        <a class="toc-item" href="#t6" onclick="setToc(this)"><span class="toc-num">06</span>Understanding Agreements</a>
        <a class="toc-item" href="#t7" onclick="setToc(this)"><span class="toc-num">07</span>Move-In Checklist</a>
        <a class="toc-item" href="#t8" onclick="setToc(this)"><span class="toc-num">08</span>Tenant Legal Rights</a>
        <a class="toc-item" href="#t9" onclick="setToc(this)"><span class="toc-num">09</span>Deposit Protection</a>
        <a class="toc-item" href="#t10" onclick="setToc(this)"><span class="toc-num">10</span>FAQs</a>
      </div>
    </div>
    <div class="search-card">
      <div class="sc-t">Ready to Search?</div>
      <div class="sc-d">Browse verified PG, hostel and flat listings across India — zero brokerage.</div>
      <a class="sc-btn" href="/pgs-hostels">🔍 Browse PG &amp; Hostels</a>
      <a class="sc-btn-sec" href="/commercial">🏢 Commercial Spaces</a>
    </div>
  </aside>

  <!-- CONTENT -->
  <div class="content">

    <!-- ═══ T1: Getting Started ═══ -->
    <section class="guide-sec rv" id="t1">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 01</div>
        <div class="gs-title">Getting Started as a <em>Tenant on SmartRent</em></div>
        <div class="gs-sub">Understand the platform and how to use it to find your perfect home</div>
      </div>
      <div class="gs-body">
        <p class="para">SmartRent is a <strong>zero-brokerage</strong> rental platform. Unlike traditional portals, we connect you directly with verified, KYC-authenticated property owners — no middlemen, no inflated rents, no broker commissions. You pay only the actual rent and deposit as advertised.</p>

        <div class="callout co-green"><span class="callout-ic">✅</span><div class="callout-body"><div class="callout-t">Zero Brokerage — What It Means for You</div>On traditional platforms, a broker charges 1 month's rent as commission. On SmartRent, you pay nothing extra — saving you ₹8,000–₹25,000 on a typical rental. That's money back in your pocket.</div></div>

        <div class="shead">Types of Accommodation Available</div>
        <div class="info-grid">
          <div class="info-card ic-blue"><span class="ic-icon">🏠</span><div class="ic-title">PG / Paying Guest</div><div class="ic-body">Furnished room with shared/attached bath. Usually includes WiFi. Meals optional. <strong>Best for:</strong> Students, freshers, single professionals on a budget.</div></div>
          <div class="info-card ic-green"><span class="ic-icon">🏢</span><div class="ic-title">Hostel</div><div class="ic-body">Shared dormitory or semi-private rooms. Social environment. <strong>Best for:</strong> Students, budget travellers, short-term stays.</div></div>
          <div class="info-card"><span class="ic-icon">🏡</span><div class="ic-title">Flat / Apartment</div><div class="ic-body">1–4 BHK independent unit. Full privacy. Longer commitment (11 months). <strong>Best for:</strong> Families, couples, professionals wanting full independence.</div></div>
          <div class="info-card"><span class="ic-icon">🤝</span><div class="ic-title">Co-living Space</div><div class="ic-body">Fully furnished, community living with shared amenities. <strong>Best for:</strong> Young professionals seeking social + private balance.</div></div>
        </div>

        <div class="shead">What You Need to Get Started</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Aadhaar Card (for KYC verification on the platform)</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>PAN Card (required for agreements, TDS compliance)</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Employment offer letter or student ID (owners may ask)</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>3 months' bank statements (for financial verification)</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Emergency contact details</div>
          <div class="check-item"><div class="check-ic ci-warn">⚠</div>Budget for first month + deposit (typically 1–6 months' rent) upfront</div>
        </div>
      </div>
    </section>

    <!-- ═══ T2: HOW TO SEARCH ═══ -->
    <section class="guide-sec rv" id="t2">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 02</div>
        <div class="gs-title">How to Search for the <em>Right Property</em></div>
        <div class="gs-sub">Search smarter, not harder — find properties that genuinely match your needs</div>
      </div>
      <div class="gs-body">
        <div class="alert-stripe as-blue">🔍 Use the filters to narrow results by city, budget, property type and amenities, then compare your shortlist side by side.</div>

        <div class="step-list">
          <div class="step-item"><div class="step-num">01</div><div class="step-content"><div class="step-t">Define Your Requirements First</div><div class="step-d">Before searching, decide: your maximum budget (rent + deposit + bills), preferred locality (commute under 30 min), essential amenities (WiFi, meals, AC), and move-in date. Vague searches waste time.</div></div></div>
          <div class="step-item"><div class="step-num">02</div><div class="step-content"><div class="step-t">Search by Locality, Not Just City</div><div class="step-d">Search for specific areas: "Kondapur", "Koramangala 5th Block", "Andheri West" — not just "Hyderabad". Use the map view to see properties relative to your workplace or college.</div></div></div>
          <div class="step-item"><div class="step-num">03</div><div class="step-content"><div class="step-t">Use Filters Strategically</div><div class="step-d">Filter by: type (PG/flat/hostel), budget range, gender preference, furnishing, amenities (WiFi, meals, AC, gym), and availability date. Verified listings only = fewer scams.</div></div></div>
          <div class="step-item"><div class="step-num">04</div><div class="step-content"><div class="step-t">Read Listings Carefully</div><div class="step-d">Check: exact address vs nearby landmarks, what's included (utilities, WiFi, meals), house rules (curfew, guests, cooking, smoking), and minimum commitment period before calling.</div></div></div>
          <div class="step-item"><div class="step-num">05</div><div class="step-content"><div class="step-t">Contact Owner Directly</div><div class="step-d">Our platform shows direct owner contact — no broker numbers. Call to confirm availability, ask about actual bills, and schedule a visit. Always visit before committing.</div></div></div>
        </div>

        <div class="callout co-amber"><span class="callout-ic">⚠️</span><div class="callout-body"><div class="callout-t">Scam Warning — Red Flags</div>Be suspicious of listings that: are priced far below market rate, ask for deposit before visiting, request payment via UPI before signing any agreement, have stock photos instead of real images, or owners who are "abroad" and can't meet in person. <strong>Never pay deposit without a signed agreement and physical inspection.</strong></div></div>
      </div>
    </section>

    <!-- ═══ T3: BUDGET PLANNING ═══ -->
    <section class="guide-sec rv" id="t3">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 03</div>
        <div class="gs-title">Budget Planning — <em>Total Cost of Renting</em></div>
        <div class="gs-sub">Don't get surprised — understand ALL the costs before you commit</div>
      </div>
      <div class="gs-body">
        <p class="para">The advertised rent is never the complete cost. Here's how to calculate your <strong>true monthly cost of living</strong> in a rented property.</p>

        <!-- BUDGET CALCULATOR -->
        <div class="budget-calc">
          <div class="bc-title">💰 Rental Budget Calculator</div>
          <div class="bc-grid">
            <div class="bc-field"><label>Monthly Salary / Income</label><input type="number" id="bcIncome" value="50000" oninput="calcBudget()"></div>
            <div class="bc-field"><label>Furnishing Type</label><select id="bcFurn" onchange="calcBudget()"><option value="bare">Bare / Unfurnished</option><option value="semi" selected>Semi-Furnished</option><option value="full">Fully Furnished</option></select></div>
            <div class="bc-field"><label>City Tier</label><select id="bcCity" onchange="calcBudget()"><option value="metro">Metro (Hyd/Blr/Mum/Del)</option><option value="t2">Tier-2 (Pune/Chennai)</option><option value="t3">Tier-3 (Other cities)</option></select></div>
            <div class="bc-field"><label>Property Type</label><select id="bcType" onchange="calcBudget()"><option value="pg">PG / Room</option><option value="1bhk">1 BHK Flat</option><option value="2bhk">2 BHK Flat</option></select></div>
          </div>
          <div class="bc-result">
            <div class="brr-item"><div class="brr-v" id="bcRent">₹—</div><div class="brr-l">Suggested Max Rent</div></div>
            <div class="brr-item"><div class="brr-v" id="bcDeposit">₹—</div><div class="brr-l">Deposit to Save</div></div>
            <div class="brr-item"><div class="brr-v" id="bcTotal">₹—</div><div class="brr-l">First Month Total</div></div>
          </div>
        </div>

        <div class="shead">All the Costs You'll Actually Pay</div>
        <table class="guide-table">
          <tr><th>Cost Item</th><th>Typical Amount</th><th>When Paid</th><th>Refundable?</th></tr>
          <tr><td>Security Deposit</td><td>1–6 months' rent</td><td>Before move-in</td><td>Yes (on vacating)</td></tr>
          <tr><td>First Month's Rent</td><td>Pro-rated or full month</td><td>Before move-in</td><td>No</td></tr>
          <tr><td>Advance Rent</td><td>1–2 months in some PGs</td><td>Before move-in</td><td>Adjusted in rent</td></tr>
          <tr><td>Electricity Bill</td><td>₹500–₹3,000/mo</td><td>Monthly</td><td>No</td></tr>
          <tr><td>Water / Maintenance</td><td>₹500–₹2,500/mo</td><td>Monthly</td><td>No</td></tr>
          <tr><td>WiFi (if not included)</td><td>₹500–₹1,200/mo</td><td>Monthly</td><td>No</td></tr>
          <tr><td>Stamp Paper (for agreement)</td><td>₹100–₹500</td><td>One-time</td><td>No</td></tr>
          <tr><td>Notarisation / Registration</td><td>₹200–₹2,000</td><td>One-time</td><td>No</td></tr>
        </table>

        <div class="callout co-blue"><span class="callout-ic">💡</span><div class="callout-body"><div class="callout-t">The 30% Rule</div>Financial advisors recommend spending no more than 30% of your monthly take-home salary on rent (excluding utilities). If your salary is ₹60,000/month, your maximum rent should be ₹18,000. Budget ₹3,000–5,000 extra for utilities and maintenance.</div></div>
      </div>
    </section>

    <!-- ═══ T4: INSPECTION ═══ -->
    <section class="guide-sec rv" id="t4">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 04</div>
        <div class="gs-title">Property Inspection — <em>What to Check</em></div>
        <div class="gs-sub">Never commit to a property without visiting in person and checking every corner</div>
      </div>
      <div class="gs-body">
        <p class="para">A physical visit is non-negotiable. Photos can be misleading — always inspect before paying any money. Here's your complete inspection checklist.</p>

        <div class="shead">Structural &amp; Infrastructure</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Check for water seepage on walls or ceiling — especially in corners and near AC units</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Test every electrical switch, socket, and light point before signing</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Run all taps and check water pressure — flushing toilet, shower, kitchen</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Check drain flow speed — slow drains indicate plumbing issues</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Test window and door locks — ensure all operate smoothly and securely</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Check ventilation and natural light in every room — especially bedrooms</div>
          <div class="check-item"><div class="check-ic ci-warn">⚠</div>Visit at different times (evening and day) to assess noise levels from traffic, neighbours</div>
          <div class="check-item"><div class="check-ic ci-warn">⚠</div>Check mobile signal strength in your carrier inside the property</div>
        </div>

        <div class="shead">Amenities to Verify in Person</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Test the WiFi speed if it's advertised — run a speed test on your phone</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Check AC — does it cool properly? Is it maintained or rattling?</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Check parking — is your specific slot clearly assigned?</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>If meals are included — actually eat one meal before committing</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Meet current tenants if possible — they'll tell you the truth about the property and landlord</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Check lift functionality and availability of stairs if above 3rd floor</div>
        </div>

        <div class="callout co-rose"><span class="callout-ic">📸</span><div class="callout-body"><div class="callout-t">Document Everything at Inspection</div>Take photos and videos of every room, noting all existing damage — scratches, stains, marks, broken items. Share them with the owner via WhatsApp and save screenshots. This documentation protects your deposit when you vacate. Without it, unscrupulous owners can claim pre-existing damage was caused by you.</div></div>
      </div>
    </section>

    <!-- ═══ T5: NEGOTIATION ═══ -->
    <section class="guide-sec rv" id="t5">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 05</div>
        <div class="gs-title">Rent Negotiation — <em>Tips &amp; Scripts</em></div>
        <div class="gs-sub">Most owners expect negotiation — here's how to do it effectively without being awkward</div>
      </div>
      <div class="gs-body">
        <p class="para">Rent is almost always negotiable, especially for longer commitments or immediate move-in. A property vacant for 30+ days costs the owner ₹8,000–₹50,000 — they are motivated to compromise.</p>

        <div class="shead">How to Research Before Negotiating</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-info">💡</div>Check 5–8 similar properties in the same locality on SmartRent — note the average rent</div>
          <div class="check-item"><div class="check-ic ci-info">💡</div>Check how long the listing has been live — older listings = more negotiating leverage</div>
          <div class="check-item"><div class="check-ic ci-info">💡</div>Note any negatives (top floor no lift, road-facing noise, older building) as leverage points</div>
          <div class="check-item"><div class="check-ic ci-info">💡</div>Find out the previous tenant's rent if possible — the baseline for your negotiation</div>
        </div>

        <div class="shead">Effective Negotiation Strategies</div>
        <div class="step-list">
          <div class="step-item"><div class="step-num">01</div><div class="step-content"><div class="step-t">Lead with a Long Commitment</div><div class="step-d">"I'm planning to stay for 2 years minimum" — owners prize stable, long-term tenants. This alone can get you 5–10% discount.</div></div></div>
          <div class="step-item"><div class="step-num">02</div><div class="step-content"><div class="step-t">Offer Advance Rent</div><div class="step-d">Offering 2–3 months' rent in advance is a strong signal of reliability and can justify a lower monthly rate.</div></div></div>
          <div class="step-item"><div class="step-num">03</div><div class="step-content"><div class="step-t">Negotiate the Deposit More Than Rent</div><div class="step-d">If the owner won't budge on rent, negotiate a lower deposit. Reducing deposit from 5 months to 3 months frees up ₹20,000+ in working capital for you.</div></div></div>
          <div class="step-item"><div class="step-num">04</div><div class="step-content"><div class="step-t">Ask for Amenity Inclusions</div><div class="step-d">If the rent won't drop, ask for add-ons: "Can you include WiFi?" or "Can the painting be done before move-in?" — these have monetary value.</div></div></div>
          <div class="step-item"><div class="step-num">05</div><div class="step-content"><div class="step-t">Use a Polite Anchor</div><div class="step-d">If the rent is ₹15,000 and market rate is ₹13,000, say: "I've seen similar properties at ₹12,500–13,000 in this area. Could we agree on ₹13,500?" Always anchor 10–15% below your actual target.</div></div></div>
        </div>

        <div class="callout co-blue"><span class="callout-ic">💬</span><div class="callout-body"><div class="callout-t">Script: How to Start the Rent Negotiation</div>"I really like the property and I'm ready to move in immediately. I've done my research and similar flats in this area are going for ₹[X]. Would you consider ₹[Y]? I'm planning a long stay and will be a reliable tenant." — Simple, honest, and effective.</div></div>
      </div>
    </section>

    <!-- ═══ T6: AGREEMENTS ═══ -->
    <section class="guide-sec rv" id="t6">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 06</div>
        <div class="gs-title">Understanding Your <em>Rental Agreement</em></div>
        <div class="gs-sub">Every clause you need to read before you sign — simplified</div>
      </div>
      <div class="gs-body">
        <p class="para"><strong>Never sign any document you haven't fully read and understood.</strong> A rental agreement is a legal contract. Below are the critical clauses and what to watch out for.</p>

        <div class="shead">Key Clauses to Read Carefully</div>
        <table class="guide-table">
          <tr><th>Clause</th><th>What to Look For</th><th>Red Flag</th></tr>
          <tr><td>Rent Amount</td><td>Matches verbally agreed amount exactly</td><td>Amount higher than discussed</td></tr>
          <tr><td>Rent Due Date</td><td>5th of month is standard, grace of 5 days</td><td>No grace period, harsh late fees</td></tr>
          <tr><td>Rent Escalation</td><td>5–10% annual increase is standard</td><td>Escalation clause missing = surprise increases</td></tr>
          <tr><td>Deposit Amount</td><td>What's stated vs what you paid — must match</td><td>Vague "additional charges" on deposit</td></tr>
          <tr><td>Deposit Return</td><td>30 days after vacating, itemised deductions</td><td>No timeline specified = landlord delays return</td></tr>
          <tr><td>Notice Period</td><td>30–60 days for both parties</td><td>Owner can terminate immediately; tenant cannot</td></tr>
          <tr><td>Maintenance Responsibility</td><td>Clear split between owner and tenant</td><td>"Tenant responsible for all repairs" — too broad</td></tr>
          <tr><td>Penalty Clauses</td><td>Reasonable penalties for breach</td><td>Disproportionately large fines for minor breaches</td></tr>
          <tr><td>House Rules (PG)</td><td>Rules should be reasonable and specific</td><td>Overly restrictive rules about cooking, guests, religion</td></tr>
        </table>

        <div class="callout co-amber"><span class="callout-ic">⚠️</span><div class="callout-body"><div class="callout-t">Critical Warning — Biometric Clause</div>Do NOT sign an agreement that contains clauses like: "Tenant waives right to legal recourse", "Owner may evict without notice", or "Tenant is responsible for all structural repairs". These are legally unenforceable but can cause harassment. Ask for such clauses to be removed before signing.</div></div>

        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Always get the agreement on proper stamp paper (₹100–500 depending on state)</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Both parties should sign every page — not just the last page</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Keep a physical copy and a scanned digital copy in Google Drive or email</div>
          <div class="check-item"><div class="check-ic ci-warn">⚠</div>Do not accept verbal agreements — courts generally do not recognise them</div>
        </div>
      </div>
    </section>

    <!-- ═══ T7: MOVE-IN CHECKLIST ═══ -->
    <section class="guide-sec rv" id="t7">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 07</div>
        <div class="gs-title">Move-In Day — <em>Complete Checklist</em></div>
        <div class="gs-sub">Do this on your first day to protect yourself for your entire tenancy</div>
      </div>
      <div class="gs-body">
        <div class="shead">Before Handing Over Money</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Agreement is signed by both parties and you have your copy in hand</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>You've received a written receipt for every amount paid (deposit, advance, first rent)</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>All payments made via bank transfer or UPI — never cash without written receipt</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Property keys, access cards, gate remote, mailbox key — all received and counted</div>
        </div>

        <div class="shead">Property Documentation (Do This On Day 1)</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Photograph / video every room systematically — wall by wall, ceiling, floor</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Document all pre-existing damage: scratches, stains, dents, marks, broken fixtures</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Note meter readings: electricity, water, and gas (if applicable) — with photo timestamp</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Inventory all furniture and appliances provided — check they all work</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Share all documentation with the owner via WhatsApp/email and save their acknowledgment</div>
          <div class="check-item"><div class="check-ic ci-warn">⚠</div>Create a shared Google Drive folder with the owner for ongoing maintenance documentation</div>
        </div>

        <div class="shead">Administrative Tasks in First Week</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-yes">✓</div>File police verification form at local police station (usually available at the police station or online via state portal)</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Update your address in Aadhaar (visit Aadhaar Seva Kendra) and bank accounts</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Transfer your voter ID address if you plan to stay 1+ year</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Set up electricity bill account in your name or get the owner's consent for bill access</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Introduce yourself to immediate neighbours — essential for safety network and emergency contacts</div>
        </div>
      </div>
    </section>

    <!-- ═══ T8: LEGAL RIGHTS ═══ -->
    <section class="guide-sec rv" id="t8">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 08</div>
        <div class="gs-title">Your Legal Rights <em>as a Tenant</em></div>
        <div class="gs-sub">Know your rights — you have more protection than most tenants realise</div>
      </div>
      <div class="gs-body">
        <p class="para">Indian tenancy law protects tenants significantly. Most tenants are unaware of these rights and are exploited. Understanding them costs you nothing and could save you lakhs.</p>

        <div class="shead">Fundamental Tenant Rights</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-info">⚖️</div><strong>Right to Quiet Enjoyment:</strong> The owner cannot enter your premises without 24–48 hours' prior notice. Unannounced entry is a trespass violation</div>
          <div class="check-item"><div class="check-ic ci-info">⚖️</div><strong>Right to Habitable Conditions:</strong> The owner must maintain basic habitability — functional water, electricity, and sanitation. You can withhold rent if the owner fails to make essential repairs (after proper notice)</div>
          <div class="check-item"><div class="check-ic ci-info">⚖️</div><strong>Right Against Discriminatory Eviction:</strong> Owners cannot evict you based on religion, caste, gender, diet, state of origin, or marital status</div>
          <div class="check-item"><div class="check-ic ci-info">⚖️</div><strong>Right to Deposit Refund:</strong> Your deposit must be returned within 30 days of vacating (14 days in some states) with an itemised deduction statement</div>
          <div class="check-item"><div class="check-ic ci-info">⚖️</div><strong>Right to Receipt:</strong> You are entitled to a written receipt for every rent and deposit payment</div>
          <div class="check-item"><div class="check-ic ci-info">⚖️</div><strong>Protection Against Illegal Eviction:</strong> The owner CANNOT lock you out, cut utilities, or remove your belongings without a court order — doing so is a criminal offence</div>
        </div>

        <div class="shead">What to Do If Your Rights Are Violated</div>
        <div class="step-list">
          <div class="step-item"><div class="step-num">01</div><div class="step-content"><div class="step-t">Send a Written Legal Notice</div><div class="step-d">Document the violation and send a registered post letter to the owner specifying the violation and demanding remedy within 15 days. This creates a legal paper trail.</div></div></div>
          <div class="step-item"><div class="step-num">02</div><div class="step-content"><div class="step-t">Approach Rent Authority (Model Tenancy Act States)</div><div class="step-d">States that have adopted the Model Tenancy Act (AP, TN, Uttarakhand, UP) have dedicated Rent Authorities. File a complaint online — faster and cheaper than civil court.</div></div></div>
          <div class="step-item"><div class="step-num">03</div><div class="step-content"><div class="step-t">File in Consumer Court</div><div class="step-d">For issues like illegal deposit withholding, consumer courts offer fast remedy. Claims under ₹50 lakh are handled by District Consumer Disputes Redressal Commission — typically resolved within 90 days.</div></div></div>
          <div class="step-item"><div class="step-num">04</div><div class="step-content"><div class="step-t">Police Complaint for Illegal Eviction</div><div class="step-d">If an owner locks you out, cuts utilities, or threatens you — file an FIR immediately. This is a criminal offence (Section 441 IPC for criminal trespass, Section 427 for damage to property).</div></div></div>
        </div>

        <div class="callout co-green"><span class="callout-ic">⚖️</span><div class="callout-body"><div class="callout-t">Model Tenancy Act 2021 — Your New Protections</div>Caps security deposit: <strong>2 months for residential, 6 months for commercial</strong>. Mandates written agreements. Creates Rent Authority for fast dispute resolution. Prevents arbitrary evictions. Check if your state has adopted it — AP, TN, UT, UP, Assam have enacted it.</div></div>
      </div>
    </section>

    <!-- ═══ T9: DEPOSIT PROTECTION ═══ -->
    <section class="guide-sec rv" id="t9">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 09</div>
        <div class="gs-title">Protecting &amp; Recovering <em>Your Security Deposit</em></div>
        <div class="gs-sub">The most contested issue in Indian rentals — here's how to always get your money back</div>
      </div>
      <div class="gs-body">
        <p class="para">Security deposit disputes are the #1 tenant complaint in India. The key is prevention through documentation — not fighting after the fact.</p>

        <div class="shead">How to Protect Your Deposit from Day 1</div>
        <div class="check-list">
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Photo/video document every existing defect at move-in and share with owner in writing</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Keep all maintenance request messages (WhatsApp screenshots are valid evidence)</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Keep receipts for any repairs you paid for that the owner should have covered</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Conduct a pre-vacating walkthrough with the owner at least 1 week before leaving</div>
          <div class="check-item"><div class="check-ic ci-yes">✓</div>Hand over the property in the same condition as you received it — get written acknowledgment</div>
          <div class="check-item"><div class="check-ic ci-warn">⚠</div>Professional cleaning (₹1,500–₹5,000) before handover almost always prevents cleaning disputes</div>
        </div>

        <div class="shead">Legitimate vs Illegal Deductions</div>
        <table class="guide-table">
          <tr><th>Deduction Type</th><th>Legitimate?</th><th>Notes</th></tr>
          <tr><td>Unpaid rent or utility bills</td><td>✅ Yes</td><td>Must show bills and proof of non-payment</td></tr>
          <tr><td>Broken fixtures (by tenant)</td><td>✅ Yes</td><td>Must be documented damage, not pre-existing</td></tr>
          <tr><td>Deep cleaning after long vacancy of mess</td><td>✅ Yes</td><td>Professional quote must be provided</td></tr>
          <tr><td>Normal wear and tear (paint peeling, minor scuffs)</td><td>❌ No</td><td>Routine wear is owner's responsibility</td></tr>
          <tr><td>Painting (routine 3-year cycle)</td><td>❌ No</td><td>Unless tenant caused unusual damage</td></tr>
          <tr><td>"Miscellaneous charges" without itemisation</td><td>❌ No</td><td>All deductions must be specific and documented</td></tr>
          <tr><td>Damage that existed at move-in (pre-documented)</td><td>❌ No</td><td>Your move-in photos are your proof</td></tr>
          <tr><td>Society charges (owner's responsibility)</td><td>❌ No</td><td>Unless specifically agreed in the agreement</td></tr>
        </table>

        <div class="shead">If Your Deposit Is Withheld Unfairly</div>
        <div class="step-list">
          <div class="step-item"><div class="step-num">01</div><div class="step-content"><div class="step-t">Send a Formal Demand Notice</div><div class="step-d">Email + registered post. State the deposit amount, payment date, vacancy date, and demand return within 15 days. Mention that you will approach consumer court/legal authority if not returned.</div></div></div>
          <div class="step-item"><div class="step-num">02</div><div class="step-content"><div class="step-t">File in Consumer Court</div><div class="step-d">File a complaint at your District Consumer Forum. Cost: ₹200–₹1,000. No lawyer required for amounts under ₹50 lakh. You can get the deposit + 18% interest + compensation for harassment.</div></div></div>
          <div class="step-item"><div class="step-num">03</div><div class="step-content"><div class="step-t">Small Claims / Lok Adalat</div><div class="step-d">Lok Adalat (Legal Services Authority) offers free mediation. Perfect for deposit disputes under ₹1 lakh. Both parties attend one session, settlement is legally binding and usually achieved within days.</div></div></div>
        </div>

        <div class="callout co-green"><span class="callout-ic">✅</span><div class="callout-body"><div class="callout-t">Legal Reality Check</div>Indian courts consistently rule in favour of tenants for deposit disputes where the tenant has: (1) A signed agreement specifying deposit, (2) Bank records of deposit payment, (3) Move-in condition documentation, (4) Evidence of clean handover. Build this evidence from Day 1.</div></div>
      </div>
    </section>

    <!-- ═══ T10: FAQ ═══ -->
    <section class="guide-sec rv" id="t10">
      <div class="gs-head">
        <div class="gs-eyebrow">Chapter 10</div>
        <div class="gs-title">Frequently Asked <em>Tenant Questions</em></div>
        <div class="gs-sub">Real answers to questions every tenant has but is afraid to ask</div>
      </div>
      <div class="gs-body">
        <div class="faq-list">
          <div class="faq-item">
            <div class="faq-q" onclick="toggleFaq(this)">Can my landlord increase rent without notice? <span class="faq-arr">▼</span></div>
            <div class="faq-a">No. Rent can only be increased as per the escalation clause in your signed agreement. If your agreement says 5% annual increase after 11 months, that is the only valid increase. Any increase beyond the agreed clause requires your written consent. Oral announcements of rent hikes are not legally binding.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q" onclick="toggleFaq(this)">My landlord is asking for cash rent — is that legal? <span class="faq-arr">▼</span></div>
            <div class="faq-a">Under Section 269ST of the Income Tax Act, no person can receive cash of ₹2 lakh or more in a single transaction. For monthly rent this usually doesn't apply, but it's always better to pay via bank transfer or UPI for your own protection. Cash payments without receipts leave you with no proof of payment if the landlord denies receiving rent later.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q" onclick="toggleFaq(this)">Can I sub-let my rented flat to another person? <span class="faq-arr">▼</span></div>
            <div class="faq-a">Generally no, unless your agreement explicitly permits subletting with owner's consent. Sub-letting without permission is a breach of agreement and can be grounds for eviction. However, you can negotiate subletting permission into your agreement if you foresee needing it.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q" onclick="toggleFaq(this)">I've paid the deposit but the owner isn't handing over keys — what do I do? <span class="faq-arr">▼</span></div>
            <div class="faq-a">This is fraud if the deposit was paid and possession is being withheld without reason. Send a written demand via WhatsApp and email immediately. If no response within 24–48 hours, file a police complaint for cheating (Section 415/420 IPC). Always pay deposits only after the agreement is signed and you've confirmed the date for key handover.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q" onclick="toggleFaq(this)">My landlord suddenly wants me to vacate — do I have to leave? <span class="faq-arr">▼</span></div>
            <div class="faq-a">You do not have to leave immediately. The owner must give written notice as per the notice period in your agreement (usually 30–60 days). Even then, if you believe the eviction is unjust (e.g., the owner wants to sell and you have remaining tenancy), you can approach the Rent Authority or file a civil suit for injunction. Only a court order can compel you to vacate.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q" onclick="toggleFaq(this)">What happens to my deposit if the owner sells the property? <span class="faq-arr">▼</span></div>
            <div class="faq-a">Your deposit follows the tenancy, not the person. The new owner legally inherits the obligation to return your deposit. Your lease also survives the sale — the new owner must honour your remaining lease terms. Get this clause explicitly in your agreement: "The deposit obligation transfers to any new owner/transferee of the property."</div>
          </div>
          <div class="faq-item">
            <div class="faq-q" onclick="toggleFaq(this)">The PG has house rules that feel restrictive — are they enforceable? <span class="faq-arr">▼</span></div>
            <div class="faq-a">Rules that are part of the signed agreement are contractually binding. However, rules that violate constitutional rights (based on religion, caste, diet, gender) or criminal law cannot be enforced. Rules like "no vegetarian cooking" (violates Article 21) or "no persons of specific religion" are void and illegal. Reasonable rules like visitor timings, common area cleanliness, and quiet hours are valid and enforceable.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q" onclick="toggleFaq(this)">Do I need to pay TDS from my rent payments? <span class="faq-arr">▼</span></div>
            <div class="faq-a">If you are an individual or HUF paying rent exceeding ₹50,000 per month to an individual/HUF landlord, you must deduct TDS at 5% under Section 194IB and deposit it using Form 26QC. This applies only to individuals paying high rent. For most standard rentals under ₹50,000/month, no TDS obligation arises for the tenant.</div>
          </div>
        </div>

        <div style="margin-top:28px;text-align:center;padding:28px;background:var(--bg3);border:1px solid rgba(59,130,246,.12);border-radius:var(--r3)">
          <div style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:var(--t0);margin-bottom:8px">Ready to Find Your Home?</div>
          <div style="font-size:14px;color:var(--t2);margin-bottom:20px">Browse verified PG, hostel and flat listings — zero brokerage, contact owners directly</div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
            <a href="/properties" style="padding:12px 28px;border-radius:var(--r1);background:linear-gradient(135deg,var(--blue),var(--violet));color:#fff;font-weight:700;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:7px">🔍 Browse Listings</a>
            <a href="/commercial" style="padding:12px 22px;border-radius:var(--r1);background:transparent;border:1px solid var(--blue-b);color:var(--blue-lt);font-weight:600;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:7px">🏢 Commercial Spaces</a>
            <a href="/owner-guide" style="padding:12px 22px;border-radius:var(--r1);background:transparent;border:1px solid var(--div2);color:var(--t1);font-weight:600;text-decoration:none;font-size:14px;display:inline-flex;align-items:center;gap:7px">📋 Owner Guide</a>
          </div>
        </div>
      </div>
    </section>

  </div><!-- /content -->
</div><!-- /page-wrap -->

<footer style="border-top:1px solid var(--blue-b);padding:44px 28px 28px;background:var(--bg1);position:relative;z-index:1">
  <div style="max-width:1260px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px">
      <div style="font-family:'Cormorant Garamond',serif;font-size:14px;color:var(--t2)">© 2025–2026 SmartRent · All rights reserved · Built with ❤️ in India</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        <a href="/" style="font-size:13px;color:var(--t2);text-decoration:none">Home</a>
        <a href="/owner-guide" style="font-size:13px;color:#c8a44a;text-decoration:none">Owner Guide</a>
        <a href="/privacy" style="font-size:13px;color:var(--t2);text-decoration:none">Privacy Policy</a>
        <a href="/pgs-hostels" style="font-size:13px;color:var(--t2);text-decoration:none">PG Listings</a>
      </div>
    </div>
  </div>
</footer>
`;

const BC_RATES = {
  metro: { pg: 0.22, _1bhk: 0.28, _2bhk: 0.32 },
  t2: { pg: 0.2, _1bhk: 0.25, _2bhk: 0.3 },
  t3: { pg: 0.18, _1bhk: 0.22, _2bhk: 0.26 },
};
const BC_FURN = { bare: 0.82, semi: 1, full: 1.22 };
const BC_DEP = { metro: 3, t2: 2, t3: 2 };
const SECTIONS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];

export default function TenantGuidePage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!document.querySelector("link[data-tenant-fonts]")) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = FONTS_HREF;
      l.dataset.tenantFonts = "true";
      document.head.appendChild(l);
    }

    const $ = (id) => root.querySelector("#" + id);

    function toggleMob() {
      const open = $("mobMenu").classList.toggle("open");
      $("mobBtn").textContent = open ? "✕" : "☰";
    }

    function setToc(el) {
      root.querySelectorAll(".toc-item").forEach((i) => i.classList.remove("active"));
      el.classList.add("active");
    }

    function toggleFaq(el) {
      const a = el.nextElementSibling;
      const isOpen = a.classList.contains("open");
      root.querySelectorAll(".faq-a.open").forEach((x) => x.classList.remove("open"));
      root.querySelectorAll(".faq-q.open").forEach((x) => x.classList.remove("open"));
      if (!isOpen) {
        a.classList.add("open");
        el.classList.add("open");
      }
    }

    function calcBudget() {
      const inc = parseInt($("bcIncome").value, 10) || 50000;
      const furn = $("bcFurn").value;
      const city = $("bcCity").value;
      const type = $("bcType").value;
      const key = type === "2bhk" ? "_2bhk" : type === "1bhk" ? "_1bhk" : "pg";
      const baseRate = BC_RATES[city]?.[key] || 0.25;
      const fm = BC_FURN[furn] || 1;
      const rent = Math.round((inc * baseRate * fm) / 100) * 100;
      const dep = rent * (BC_DEP[city] || 2);
      const total = rent + dep + Math.round(rent * 0.15);
      const fmt = (n) => (n >= 100000 ? "₹" + (n / 100000).toFixed(1) + "L" : "₹" + n.toLocaleString("en-IN"));
      $("bcRent").textContent = fmt(rent);
      $("bcDeposit").textContent = fmt(dep);
      $("bcTotal").textContent = fmt(total);
    }

    const onScroll = () => {
      $("navbar")?.classList.toggle("solid", window.scrollY > 40);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const bar = $("progressBar");
      if (bar) bar.style.width = Math.min(h > 0 ? (window.scrollY / h) * 100 : 0, 100) + "%";

      let cur = "t1";
      SECTIONS.forEach((id) => {
        const el = $(id);
        if (el && el.getBoundingClientRect().top < 120) cur = id;
      });
      root.querySelectorAll(".toc-item").forEach((i) => i.classList.toggle("active", i.getAttribute("href") === "#" + cur));
    };
    window.addEventListener("scroll", onScroll);

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

    const handlers = { toggleMob, setToc, toggleFaq, calcBudget };
    Object.assign(window, handlers);
    calcBudget();

    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
      Object.keys(handlers).forEach((k) => delete window[k]);
    };
  }, []);

  return <div className="tenant-guide-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
