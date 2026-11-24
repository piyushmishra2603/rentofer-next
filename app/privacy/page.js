"use client";

import { useEffect, useRef } from "react";
import "./page.css";

const BODY_HTML = `
<div class="reading-progress"><div class="reading-progress-bar" id="progressBar"></div></div>

<div class="scroll-top" id="scrollTop">↑</div>

<div class="pp-grain"></div>

<div class="layout">

  <!-- ── SIDEBAR ── -->
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-logo">
        <div class="brand-gem">💎</div>
        <div class="brand-name">SmartRent AI</div>
      </div>
      <div class="brand-sub">Privacy Policy</div>
    </div>

    <div class="sidebar-label">Contents</div>
    <ul class="toc-list" id="tocList">
      <li><a class="toc-item active" href="#s1"><span class="num">01</span> Overview & Scope</a></li>
      <li><a class="toc-item" href="#s2"><span class="num">02</span> Information We Collect</a></li>
      <li><a class="toc-item" href="#s3"><span class="num">03</span> How We Use Data</a></li>
      <li><a class="toc-item" href="#s4"><span class="num">04</span> Data Sharing & Disclosure</a></li>
      <li><a class="toc-item" href="#s5"><span class="num">05</span> Cookies & Tracking</a></li>
      <li><a class="toc-item" href="#s6"><span class="num">06</span> Firebase & Third Parties</a></li>
      <li><a class="toc-item" href="#s7"><span class="num">07</span> Data Security</a></li>
      <li><a class="toc-item" href="#s8"><span class="num">08</span> Data Retention</a></li>
      <li><a class="toc-item" href="#s9"><span class="num">09</span> Your Legal Rights</a></li>
      <li><a class="toc-item" href="#s10"><span class="num">10</span> Children's Privacy</a></li>
      <li><a class="toc-item" href="#s11"><span class="num">11</span> International Transfers</a></li>
      <li><a class="toc-item" href="#s12"><span class="num">12</span> AI & Automated Decisions</a></li>
      <li><a class="toc-item" href="#s13"><span class="num">13</span> Policy Updates</a></li>
      <li><a class="toc-item" href="#s14"><span class="num">14</span> Grievance & Contact</a></li>
    </ul>

    <div class="sidebar-meta">
      <div class="meta-row"><span>Effective Date</span><span class="meta-val">01 JAN 2025</span></div>
      <div class="meta-row"><span>Last Updated</span><span class="meta-val">09 APR 2026</span></div>
      <div class="meta-row"><span>Version</span><span class="meta-val">v3.1</span></div>
      <div class="compliance-badges">
        <span class="cbadge cbadge-gold">IT Act 2000</span>
        <span class="cbadge cbadge-gold">DPDP 2023</span>
        <span class="cbadge cbadge-teal">GDPR-Ready</span>
        <span class="cbadge cbadge-teal">Firebase TOS</span>
      </div>
      <button class="print-btn" id="printBtn">🖨️ Print / Save PDF</button>
    </div>
  </aside>

  <!-- ── MAIN ── -->
  <main class="main">

    <!-- Hero -->
    <div class="hero">
      <div class="hero-label">Legal Document · Privacy Policy</div>
      <h1 class="hero-title">Your Privacy,<br><em>Our Responsibility</em></h1>
      <p class="hero-desc">
        This Privacy Policy governs how SmartRent AI ("we," "us," or "our") collects, uses, stores,
        and protects personal information of users ("you" or "Data Principal") who access or use our
        rental property platform and related services.
      </p>
      <div class="hero-meta">
        <div class="hmeta">📅 Effective: <strong>01 January 2025</strong></div>
        <div class="hmeta">🔄 Updated: <strong>09 April 2026</strong></div>
        <div class="hmeta">⚖️ Jurisdiction: <strong>India (Telangana)</strong></div>
        <div class="hmeta">📄 Version: <strong>v3.1</strong></div>
      </div>
    </div>

    <!-- Alert -->
    <div class="alert-box">
      <div class="alert-icon">ℹ️</div>
      <div>
        <strong style="color:#4ecdc4">Please read this policy carefully.</strong> By registering an account,
        listing a property, or using any feature of SmartRent AI, you explicitly acknowledge and agree to the
        collection, processing, and use of your personal data as described herein. If you do not agree,
        you must immediately discontinue use of our platform.
      </div>
    </div>

    <!-- ── SECTION 1 ── -->
    <div class="policy-section" id="s1">
      <div class="section-number">01 — OVERVIEW &amp; SCOPE</div>
      <h2 class="section-title">Overview &amp; Scope of This Policy</h2>
      <div class="section-body">
        <p>SmartRent AI is a technology-driven rental property platform that enables landlords to list properties and tenants to discover, book, and manage rental accommodations. This Privacy Policy applies to:</p>

        <ul class="policy-list">
          <li>All users who register an account on smartrentai.in or any associated subdomain</li>
          <li>Visitors who browse our platform without creating an account</li>
          <li>Property owners (Landlords) who list properties through our platform</li>
          <li>Tenants and prospective renters who submit booking requests</li>
          <li>Administrators and verified agents who manage listings on our platform</li>
        </ul>

        <div class="highlight-box">
          <strong>Governing Law:</strong> This policy is governed by and construed in accordance with the Information Technology Act, 2000 (as amended), the Information Technology (Amendment) Act, 2008, the Digital Personal Data Protection Act, 2023 (DPDP Act), and applicable rules issued thereunder. For users accessing from the European Economic Area, we also comply with the General Data Protection Regulation (GDPR) to the extent applicable.
        </div>

        <p>This policy does NOT apply to third-party websites or services linked from our platform. We encourage you to review the privacy policies of any third-party sites you visit.</p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 2 ── -->
    <div class="policy-section" id="s2">
      <div class="section-number">02 — INFORMATION WE COLLECT</div>
      <h2 class="section-title">Information We Collect</h2>
      <div class="section-body">
        <p>We collect information in three ways: information you provide directly, information collected automatically, and information from third parties.</p>

        <div class="subsection">
          <div class="subsection-title">2.1 Information You Provide Directly</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Data Collected</th>
                <th>Purpose</th>
                <th>Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Account Registration</td>
                <td>Full name, email address, phone number, password (hashed)</td>
                <td>Account creation &amp; authentication</td>
                <td>Contractual necessity</td>
              </tr>
              <tr>
                <td>Profile Information</td>
                <td>Profile photo, address, bio, occupation</td>
                <td>Trust &amp; verification</td>
                <td>Legitimate interest</td>
              </tr>
              <tr>
                <td>Property Listings</td>
                <td>Property address, photos, description, rent, amenities, ownership documents</td>
                <td>Listing creation &amp; display</td>
                <td>Contractual necessity</td>
              </tr>
              <tr>
                <td>Booking Requests</td>
                <td>Move-in date, duration, special requirements, references</td>
                <td>Rental transaction processing</td>
                <td>Contractual necessity</td>
              </tr>
              <tr>
                <td>Communications</td>
                <td>Messages, support tickets, reviews, feedback</td>
                <td>Customer support &amp; trust</td>
                <td>Legitimate interest</td>
              </tr>
              <tr>
                <td>KYC Documents</td>
                <td>Aadhaar number (last 4 digits only), PAN (for Premium landlords), government ID type</td>
                <td>Identity verification &amp; fraud prevention</td>
                <td>Legal obligation / consent</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="subsection">
          <div class="subsection-title">2.2 Information Collected Automatically</div>
          <ul class="policy-list">
            <li>Device information: browser type, operating system, device identifiers, screen resolution</li>
            <li>Log data: IP address, access times, pages viewed, referring URLs, HTTP status codes</li>
            <li>Location data: approximate geographic location derived from IP address; precise GPS only if you grant permission</li>
            <li>Usage analytics: features used, search queries entered, properties saved or bookmarked</li>
            <li>Firebase Analytics events: session duration, user engagement, crash reports</li>
            <li>Cookies and similar tracking technologies (see Section 5)</li>
          </ul>
        </div>

        <div class="subsection">
          <div class="subsection-title">2.3 Information from Third Parties</div>
          <ul class="policy-list">
            <li>Google Sign-In: name, email, profile photo, and unique Google account ID if you use Google OAuth</li>
            <li>Public property registries: to verify ownership claims on listed properties</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 3 ── -->
    <div class="policy-section" id="s3">
      <div class="section-number">03 — HOW WE USE DATA</div>
      <h2 class="section-title">How We Use Your Information</h2>
      <div class="section-body">
        <p>We process your personal data only for specific, legitimate purposes. We do not sell your personal data to third parties for their marketing purposes.</p>

        <div class="subsection">
          <div class="subsection-title">Primary Purposes</div>
          <ul class="policy-list checks">
            <li>Creating, maintaining, and securing your SmartRent AI account</li>
            <li>Displaying property listings to prospective tenants and facilitating booking requests</li>
            <li>Sending transactional emails: booking confirmations, approval notifications, password resets</li>
            <li>Providing AI-powered property recommendations based on your search history and preferences</li>
            <li>Enabling landlord–tenant communication within the platform</li>
            <li>Verifying the identity of landlords and detecting fraudulent listings</li>
            <li>Generating anonymized analytics to improve platform features</li>
            <li>Complying with applicable legal obligations and court orders</li>
          </ul>
        </div>

        <div class="subsection">
          <div class="subsection-title">We Will NOT Use Your Data For</div>
          <ul class="policy-list cross">
            <li>Selling, renting, or trading your personal data to third-party advertisers</li>
            <li>Profiling users for targeted advertising without explicit consent</li>
            <li>Processing sensitive personal data (health, religion, caste) unless legally required</li>
            <li>Any purpose incompatible with those stated herein without obtaining fresh consent</li>
          </ul>
        </div>

        <div class="highlight-box">
          <strong>Marketing Communications:</strong> We may send you promotional emails about new features or relevant listings only if you opt in. You may withdraw consent at any time by clicking "Unsubscribe" in any email or updating your notification preferences in your Account Settings.
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 4 ── -->
    <div class="policy-section" id="s4">
      <div class="section-number">04 — DATA SHARING &amp; DISCLOSURE</div>
      <h2 class="section-title">Data Sharing &amp; Disclosure</h2>
      <div class="section-body">
        <p>SmartRent AI does not sell personal data. We share data only in the limited circumstances described below.</p>

        <table class="data-table">
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Data Shared</th>
              <th>Reason</th>
              <th>Safeguard</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google Firebase</td>
              <td>Authentication tokens, usage events, crash logs</td>
              <td>Platform infrastructure &amp; analytics</td>
              <td>Google's Privacy Policy; DPA in place</td>
            </tr>
            <tr>
              <td>Other Users (Tenants)</td>
              <td>Landlord's display name, listing photos, phone (only after booking confirmed)</td>
              <td>Enabling rental transactions</td>
              <td>Contractual necessity; limited disclosure</td>
            </tr>
            <tr>
              <td>Law Enforcement / Regulators</td>
              <td>Any data as lawfully required</td>
              <td>Legal obligation, court order, national security</td>
              <td>Disclosure only upon valid legal process</td>
            </tr>
            <tr>
              <td>Business Successors</td>
              <td>All user data</td>
              <td>Merger, acquisition, or asset sale</td>
              <td>Bound by this policy; you will be notified</td>
            </tr>
          </tbody>
        </table>

        <div class="warn-box">
          <strong>⚠️ Important:</strong> If a law enforcement agency, court, or government authority provides us with a legally valid order requiring disclosure of your data, we are obligated to comply. Where legally permissible, we will notify you before disclosing your information.
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 5 ── -->
    <div class="policy-section" id="s5">
      <div class="section-number">05 — COOKIES &amp; TRACKING</div>
      <h2 class="section-title">Cookies &amp; Tracking Technologies</h2>
      <div class="section-body">
        <p>We use cookies, local storage, and similar technologies to operate and improve our platform.</p>

        <table class="data-table">
          <thead>
            <tr><th>Cookie Type</th><th>Purpose</th><th>Duration</th><th>Can Opt Out?</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Essential / Strictly Necessary</td>
              <td>Authentication session, CSRF protection, load balancing</td>
              <td>Session / 30 days</td>
              <td>No — required for platform to function</td>
            </tr>
            <tr>
              <td>Functional</td>
              <td>Remembering search filters, saved properties, language preference</td>
              <td>90 days</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>Firebase Analytics: page views, feature usage, error tracking</td>
              <td>2 years</td>
              <td>Yes — via Cookie Preferences</td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>Page load timing, API response benchmarks</td>
              <td>30 days</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>

        <p>You may manage cookie preferences through your browser settings. Note that disabling essential cookies will prevent you from logging in or using core platform features. We do not currently use advertising or third-party tracking cookies.</p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 6 ── -->
    <div class="policy-section" id="s6">
      <div class="section-number">06 — FIREBASE &amp; THIRD PARTIES</div>
      <h2 class="section-title">Firebase &amp; Third-Party Services</h2>
      <div class="section-body">
        <p>Our platform is built on Google Firebase (Project ID: <code>smart-property-portal</code>). The following Firebase services process your data:</p>

        <div class="info-card">
          <div class="info-card-title">🔥 Firebase Authentication</div>
          <p style="font-size:13px;color:var(--body)">Manages user registration, login sessions (email/password and Google OAuth), and token-based session verification. Firebase stores encrypted password hashes; we never have access to your plaintext password.</p>
        </div>

        <div class="info-card">
          <div class="info-card-title">🗄️ Cloud Firestore</div>
          <p style="font-size:13px;color:var(--body)">Our primary database stores user profiles, property listings, and booking records. Firestore data is encrypted at rest (AES-256) and in transit (TLS 1.2+). Security Rules restrict access so users can only read/write their own authorized data.</p>
        </div>

        <div class="info-card">
          <div class="info-card-title">📊 Firebase Analytics &amp; Crashlytics</div>
          <p style="font-size:13px;color:var(--body)">Collects anonymized usage events and crash reports to help us improve stability. Data is processed by Google as described in their Privacy Policy. You may opt out of analytics through your Account Settings.</p>
        </div>

        <div class="info-card">
          <div class="info-card-title">🗃️ Firebase Storage</div>
          <p style="font-size:13px;color:var(--body)">Stores property photos, profile pictures, and uploaded documents. Files are secured with Firebase Security Rules and served over signed URLs with expiry.</p>
        </div>

        <p>Google Firebase's data processing is governed by Google's Privacy Policy at <code>policies.google.com/privacy</code> and the Google Cloud Data Processing Addendum. SmartRent AI has executed a Data Processing Agreement with Google.</p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 7 ── -->
    <div class="policy-section" id="s7">
      <div class="section-number">07 — DATA SECURITY</div>
      <h2 class="section-title">Data Security Measures</h2>
      <div class="section-body">
        <p>We implement reasonable and appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, or destruction.</p>

        <ul class="policy-list checks">
          <li>All data transmissions encrypted using TLS 1.2 or higher (HTTPS enforced platform-wide)</li>
          <li>Passwords hashed using bcrypt with per-user salts; we never store plaintext passwords</li>
          <li>Firebase Firestore Security Rules enforce least-privilege access controls at the database level</li>
          <li>Firebase Storage Security Rules restrict file access to authorized users only</li>
          <li>Multi-factor authentication (MFA) available and strongly recommended for all accounts</li>
          <li>Admin panel access restricted to verified admin email addresses only</li>
          <li>Regular security reviews of Firestore rules and access permissions</li>
          <li>Firebase Authentication tokens expire and are rotated automatically</li>
          <li>Sensitive fields (Aadhaar last 4 digits) masked in database queries and logs</li>
        </ul>

        <div class="warn-box">
          <strong>⚠️ No system is 100% secure.</strong> While we strive to protect your data, we cannot guarantee absolute security of information transmitted over the internet. In the event of a data breach that poses a significant risk to you, we will notify you and the appropriate regulatory authority within 72 hours as required by applicable law.
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 8 ── -->
    <div class="policy-section" id="s8">
      <div class="section-number">08 — DATA RETENTION</div>
      <h2 class="section-title">Data Retention Policy</h2>
      <div class="section-body">
        <p>We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law.</p>

        <table class="data-table">
          <thead>
            <tr><th>Data Category</th><th>Retention Period</th><th>Post-Retention Action</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Active account data</td>
              <td>Duration of account + 1 year after deletion</td>
              <td>Permanent deletion from Firestore</td>
            </tr>
            <tr>
              <td>Property listings</td>
              <td>Duration active + 6 months after removal</td>
              <td>Soft delete, then hard delete</td>
            </tr>
            <tr>
              <td>Booking records</td>
              <td>7 years (GST &amp; legal compliance)</td>
              <td>Anonymized archival</td>
            </tr>
            <tr>
              <td>Support communications</td>
              <td>3 years from resolution date</td>
              <td>Permanent deletion</td>
            </tr>
            <tr>
              <td>Server &amp; access logs</td>
              <td>90 days</td>
              <td>Automated deletion</td>
            </tr>
            <tr>
              <td>Analytics data</td>
              <td>14 months (Firebase default)</td>
              <td>Automatic aggregation &amp; deletion</td>
            </tr>
            <tr>
              <td>Deleted account data</td>
              <td>30-day grace period, then permanent deletion</td>
              <td>Full erasure except legally mandated records</td>
            </tr>
          </tbody>
        </table>

        <p>When you delete your account, we initiate a 30-day grace period during which you may restore your account. After this period, all personal data is permanently and irrecoverably deleted, except where retention is required by law (e.g., financial records).</p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 9 ── -->
    <div class="policy-section" id="s9">
      <div class="section-number">09 — YOUR LEGAL RIGHTS</div>
      <h2 class="section-title">Your Rights as a Data Principal</h2>
      <div class="section-body">
        <p>Under the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian law, you have the following rights. We will respond to verified requests within <strong style="color:var(--teal)">30 days</strong>.</p>

        <div class="rights-grid">
          <div class="right-card">
            <div class="right-icon">📋</div>
            <div class="right-title">Right to Access</div>
            <div class="right-desc">Request a copy of all personal data we hold about you, including categories, sources, and purposes of processing.</div>
          </div>
          <div class="right-card">
            <div class="right-icon">✏️</div>
            <div class="right-title">Right to Correction</div>
            <div class="right-desc">Request correction of inaccurate or incomplete personal data. Most profile data can be updated directly in Account Settings.</div>
          </div>
          <div class="right-card">
            <div class="right-icon">🗑️</div>
            <div class="right-title">Right to Erasure</div>
            <div class="right-desc">Request deletion of your personal data. We will comply unless retention is legally required (e.g., financial records).</div>
          </div>
          <div class="right-card">
            <div class="right-icon">📦</div>
            <div class="right-title">Right to Portability</div>
            <div class="right-desc">Receive your personal data in a structured, machine-readable format (JSON/CSV) for transfer to another service.</div>
          </div>
          <div class="right-card">
            <div class="right-icon">🚫</div>
            <div class="right-title">Right to Withdraw Consent</div>
            <div class="right-desc">Withdraw consent for optional data processing at any time without affecting the lawfulness of prior processing.</div>
          </div>
          <div class="right-card">
            <div class="right-icon">🤖</div>
            <div class="right-title">Right Against Automated Decisions</div>
            <div class="right-desc">Request human review of any significant decision made solely by automated means, including AI-based listing recommendations.</div>
          </div>
          <div class="right-card">
            <div class="right-icon">📣</div>
            <div class="right-title">Right to Nominate</div>
            <div class="right-desc">Under the DPDP Act 2023, nominate another individual to exercise your rights in the event of your death or incapacity.</div>
          </div>
          <div class="right-card">
            <div class="right-icon">⚖️</div>
            <div class="right-title">Right to Grievance Redressal</div>
            <div class="right-desc">Lodge a complaint with our Grievance Officer. Unresolved complaints may be escalated to the Data Protection Board of India.</div>
          </div>
        </div>

        <p style="margin-top:20px">To exercise any of these rights, email us at <code>privacy@smartrentai.in</code> with the subject line "Privacy Rights Request" and your registered email address. We may ask you to verify your identity before processing the request.</p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 10 ── -->
    <div class="policy-section" id="s10">
      <div class="section-number">10 — CHILDREN'S PRIVACY</div>
      <h2 class="section-title">Children's Privacy</h2>
      <div class="section-body">
        <p>SmartRent AI is not directed at individuals under the age of <strong style="color:var(--white)">18 years</strong>. We do not knowingly collect personal data from minors.</p>

        <div class="warn-box">
          <strong>⚠️ Age Restriction:</strong> By creating an account or using SmartRent AI, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into binding contracts under applicable law. If you are a parent or guardian and believe your minor child has provided us with personal data, please contact us immediately at <strong>privacy@smartrentai.in</strong> and we will delete such data within 7 business days.
        </div>

        <p>Where SmartRent AI becomes aware that data has been collected from a minor, we will take immediate steps to delete such data and terminate the associated account. We reserve the right to request age verification documents at any time.</p>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 11 ── -->
    <div class="policy-section" id="s11">
      <div class="section-number">11 — INTERNATIONAL TRANSFERS</div>
      <h2 class="section-title">International Data Transfers</h2>
      <div class="section-body">
        <p>SmartRent AI is operated from India. However, some of our third-party service providers (including Google Firebase) may process data on servers located outside India, including in the United States and the European Union.</p>

        <ul class="policy-list">
          <li>Google Firebase may process data in its global data centers. Google maintains Standard Contractual Clauses and adequate safeguards for cross-border transfers under applicable data protection laws.</li>
          <li>Any international transfer of data is conducted subject to appropriate safeguards including Data Processing Agreements and standard contractual clauses.</li>
          <li>By using SmartRent AI, you consent to the transfer of your information to countries outside India that may have different data protection standards, subject to the safeguards described herein.</li>
          <li>We will comply with applicable provisions of the DPDP Act 2023 regarding cross-border data transfers once the relevant rules are notified by the Government of India.</li>
        </ul>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 12 ── -->
    <div class="policy-section" id="s12">
      <div class="section-number">12 — AI &amp; AUTOMATED DECISIONS</div>
      <h2 class="section-title">AI-Powered Features &amp; Automated Decision-Making</h2>
      <div class="section-body">
        <p>SmartRent AI uses artificial intelligence and automated algorithms in the following ways:</p>

        <div class="info-card">
          <div class="info-card-title">🔍 Property Recommendations</div>
          <p style="font-size:13px;color:var(--body)">We use your search history, saved properties, and location preferences to surface relevant listings. This is a convenience feature and does not affect any legal rights or entitlements.</p>
        </div>

        <div class="info-card">
          <div class="info-card-title">🛡️ Fraud &amp; Spam Detection</div>
          <p style="font-size:13px;color:var(--body)">Automated systems flag suspicious listings and user behavior patterns. Flagged content is reviewed by a human admin before action is taken. You may request human review of any automated decision affecting your account by contacting our Grievance Officer.</p>
        </div>

        <div class="info-card">
          <div class="info-card-title">📊 Pricing Insights</div>
          <p style="font-size:13px;color:var(--body)">Where available, AI-powered market analytics provide landlords with rental price benchmarks. These are informational only and do not constitute binding valuations or legal advice.</p>
        </div>

        <div class="highlight-box">
          <strong>Your Rights:</strong> No fully automated decision that produces a significant legal effect on you will be made without opportunity for human review. If you believe an automated decision has unfairly affected your account, contact us at <strong>grievance@smartrentai.in</strong> to request manual review within 30 days of the decision.
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 13 ── -->
    <div class="policy-section" id="s13">
      <div class="section-number">13 — POLICY UPDATES</div>
      <h2 class="section-title">Changes to This Privacy Policy</h2>
      <div class="section-body">
        <p>We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or for other legitimate business reasons.</p>

        <ul class="policy-list">
          <li>We will post the updated policy on this page with a revised "Last Updated" date at the top</li>
          <li>For material changes that significantly affect your rights or how we process your data, we will notify you via email (to your registered address) at least <strong style="color:var(--white)">30 days</strong> before the changes take effect</li>
          <li>Your continued use of SmartRent AI after the effective date of changes constitutes acceptance of the updated policy</li>
          <li>If you do not agree with the updated policy, you must discontinue use and may request account deletion before the effective date</li>
          <li>Previous versions of this policy are available on request by emailing <code>privacy@smartrentai.in</code></li>
        </ul>

        <div class="highlight-box">
          <strong>Version History:</strong> v1.0 (Jan 2025) — Initial release. v2.0 (Sep 2025) — Added DPDP Act 2023 alignment, Firebase data processing details, AI decision-making disclosures. v3.1 (Apr 2026) — Updated retention schedules, enhanced international transfer provisions, added Rights Grid.
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── SECTION 14 ── -->
    <div class="policy-section" id="s14">
      <div class="section-number">14 — GRIEVANCE &amp; CONTACT</div>
      <h2 class="section-title">Grievance Officer &amp; Contact</h2>
      <div class="section-body">
        <p>In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, we have appointed a Grievance Officer to address complaints and questions regarding the processing of your personal data.</p>

        <div class="contact-card">
          <div class="contact-title">Contact Our Grievance Officer</div>
          <div class="contact-grid">
            <div class="contact-item">
              <div class="ci-icon">👤</div>
              <div>
                <div class="ci-label">Grievance Officer</div>
                <div class="ci-val">Data Privacy Team, SmartRent AI</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="ci-icon">📧</div>
              <div>
                <div class="ci-label">Privacy Requests</div>
                <div class="ci-val">privacy@smartrentai.in</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="ci-icon">⚖️</div>
              <div>
                <div class="ci-label">Grievance Complaints</div>
                <div class="ci-val">grievance@smartrentai.in</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="ci-icon">🕐</div>
              <div>
                <div class="ci-label">Response Time</div>
                <div class="ci-val">Within 30 days of receipt</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="ci-icon">📍</div>
              <div>
                <div class="ci-label">Registered Address</div>
                <div class="ci-val">Hyderabad, Telangana, India</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="ci-icon">🌐</div>
              <div>
                <div class="ci-label">Website</div>
                <div class="ci-val">smartrentai.in/privacy</div>
              </div>
            </div>
          </div>
        </div>

        <div class="subsection">
          <div class="subsection-title">Escalation to Data Protection Board</div>
          <p style="font-size:14px">If you are not satisfied with the resolution provided by our Grievance Officer, you have the right to approach the <strong style="color:var(--white)">Data Protection Board of India</strong> once it is constituted under the DPDP Act, 2023. For grievances related to EU data subjects, you may also contact the relevant supervisory authority in your EU member state.</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="policy-footer">
      <div class="footer-left">
        <strong>SmartRent AI Privacy Policy</strong><br>
        Version 3.1 · Effective 01 January 2025 · Last Updated 09 April 2026<br>
        © 2025–2026 SmartRent AI. All rights reserved.<br>
        <br>
        <em style="font-size:11px;color:rgba(148,163,184,0.5)">
          This policy is provided for informational purposes and is intended to comply with applicable Indian law including the IT Act 2000, DPDP Act 2023, and related rules. It does not constitute legal advice. We recommend consulting a qualified legal professional for your specific circumstances.
        </em>
      </div>
      <div class="footer-legal">
        Governing Law: India<br>
        Jurisdiction: Telangana High Court<br>
        Language: English (Authoritative)<br>
        Format: HTML v3.1
      </div>
    </div>

  </main>
</div>
`;

export default function PrivacyPolicyPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const progressBar = root.querySelector("#progressBar");
    const scrollTopBtn = root.querySelector("#scrollTop");
    const printBtn = root.querySelector("#printBtn");
    const sections = root.querySelectorAll(".policy-section");
    const tocItems = root.querySelectorAll(".toc-item");

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = progress + "%";

      if (scrollTopBtn) scrollTopBtn.classList.toggle("visible", scrollTop > 400);

      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 80) current = s.id;
      });

      tocItems.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    }

    function onScrollTopClick() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function onPrintClick() {
      window.print();
    }

    function onTocClick(e) {
      e.preventDefault();
      const href = e.currentTarget.getAttribute("href");
      const target = root.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.addEventListener("scroll", onScroll);
    if (scrollTopBtn) scrollTopBtn.addEventListener("click", onScrollTopClick);
    if (printBtn) printBtn.addEventListener("click", onPrintClick);
    tocItems.forEach((a) => a.addEventListener("click", onTocClick));

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTopBtn) scrollTopBtn.removeEventListener("click", onScrollTopClick);
      if (printBtn) printBtn.removeEventListener("click", onPrintClick);
      tocItems.forEach((a) => a.removeEventListener("click", onTocClick));
    };
  }, []);

  return (
    <div className="privacy-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
  );
}
