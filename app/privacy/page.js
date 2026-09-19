"use client";

import { useEffect, useState } from "react";
import "./privacy.css";

const TOC = [
  ["s1", "01", "Overview & Scope"],
  ["s2", "02", "Information We Collect"],
  ["s3", "03", "How We Use Data"],
  ["s4", "04", "Data Sharing & Disclosure"],
  ["s5", "05", "Cookies & Tracking"],
  ["s6", "06", "Firebase & Third Parties"],
  ["s7", "07", "Data Security"],
  ["s8", "08", "Data Retention"],
  ["s9", "09", "Your Legal Rights"],
  ["s10", "10", "Children's Privacy"],
  ["s11", "11", "International Transfers"],
  ["s12", "12", "AI & Automated Decisions"],
  ["s13", "13", "Policy Updates"],
  ["s14", "14", "Grievance & Contact"],
];

function DataTable({ head, rows }) {
  return (
    <table className="data-table">
      <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
      </tbody>
    </table>
  );
}
function PolicyList({ items, variant }) {
  return (
    <ul className={`policy-list ${variant || ""}`}>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}
function RightsGrid({ items }) {
  return (
    <div className="rights-grid">
      {items.map(([icon, title, desc]) => (
        <div className="right-card" key={title}>
          <div className="right-icon">{icon}</div>
          <div className="right-title">{title}</div>
          <div className="right-desc">{desc}</div>
        </div>
      ))}
    </div>
  );
}
function InfoCard({ title, children }) {
  return (
    <div className="info-card">
      <div className="info-card-title">{title}</div>
      <p style={{ fontSize: 13, color: "var(--body)" }}>{children}</p>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [active, setActive] = useState("s1");

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowTop(scrollTop > 400);

      let current = "s1";
      document.querySelectorAll(".policy-section").forEach((s) => {
        if (window.scrollY >= s.offsetTop - 80) current = s.id;
      });
      setActive(current);
    }
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function jumpTo(e, id) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div className="reading-progress"><div className="reading-progress-bar" style={{ width: `${progress}%` }} /></div>
      <div className={`scroll-top ${showTop ? "visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</div>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <div className="brand-gem">💎</div>
              <div className="brand-name">SmartRent AI</div>
            </div>
            <div className="brand-sub">Privacy Policy</div>
          </div>

          <div className="sidebar-label">Contents</div>
          <ul className="toc-list">
            {TOC.map(([id, num, label]) => (
              <li key={id}>
                <a className={`toc-item ${active === id ? "active" : ""}`} href={`#${id}`} onClick={(e) => jumpTo(e, id)}>
                  <span className="num">{num}</span> {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="sidebar-meta">
            <div className="meta-row"><span>Effective Date</span><span className="meta-val">01 JAN 2025</span></div>
            <div className="meta-row"><span>Last Updated</span><span className="meta-val">09 APR 2026</span></div>
            <div className="meta-row"><span>Version</span><span className="meta-val">v3.1</span></div>
            <div className="compliance-badges">
              <span className="cbadge cbadge-gold">IT Act 2000</span>
              <span className="cbadge cbadge-gold">DPDP 2023</span>
              <span className="cbadge cbadge-teal">GDPR-Ready</span>
              <span className="cbadge cbadge-teal">Firebase TOS</span>
            </div>
            <button className="print-btn" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
          </div>
        </aside>

        <main className="main">
          <div className="hero">
            <div className="hero-label">Legal Document · Privacy Policy</div>
            <h1 className="hero-title">Your Privacy,<br /><em>Our Responsibility</em></h1>
            <p className="hero-desc">
              This Privacy Policy governs how SmartRent AI ("we," "us," or "our") collects, uses, stores,
              and protects personal information of users ("you" or "Data Principal") who access or use our
              rental property platform and related services.
            </p>
            <div className="hero-meta">
              <div className="hmeta">📅 Effective: <strong>01 January 2025</strong></div>
              <div className="hmeta">🔄 Updated: <strong>09 April 2026</strong></div>
              <div className="hmeta">⚖️ Jurisdiction: <strong>India (Telangana)</strong></div>
              <div className="hmeta">📄 Version: <strong>v3.1</strong></div>
            </div>
          </div>

          <div className="alert-box">
            <div className="alert-icon">ℹ️</div>
            <div>
              <strong style={{ color: "#4ecdc4" }}>Please read this policy carefully.</strong> By registering an account,
              listing a property, or using any feature of SmartRent AI, you explicitly acknowledge and agree to the
              collection, processing, and use of your personal data as described herein. If you do not agree,
              you must immediately discontinue use of our platform.
            </div>
          </div>

          {/* SECTION 1 */}
          <div className="policy-section" id="s1">
            <div className="section-number">01 — OVERVIEW &amp; SCOPE</div>
            <h2 className="section-title">Overview &amp; Scope of This Policy</h2>
            <div className="section-body">
              <p>SmartRent AI is a technology-driven rental property platform that enables landlords to list properties and tenants to discover, book, and manage rental accommodations. This Privacy Policy applies to:</p>
              <PolicyList items={[
                "All users who register an account on smartrentai.in or any associated subdomain",
                "Visitors who browse our platform without creating an account",
                "Property owners (Landlords) who list properties through our platform",
                "Tenants and prospective renters who submit booking requests",
                "Administrators and verified agents who manage listings on our platform",
              ]} />
              <div className="highlight-box">
                <strong>Governing Law:</strong> This policy is governed by and construed in accordance with the Information Technology Act, 2000 (as amended), the Information Technology (Amendment) Act, 2008, the Digital Personal Data Protection Act, 2023 (DPDP Act), and applicable rules issued thereunder. For users accessing from the European Economic Area, we also comply with the General Data Protection Regulation (GDPR) to the extent applicable.
              </div>
              <p>This policy does NOT apply to third-party websites or services linked from our platform. We encourage you to review the privacy policies of any third-party sites you visit.</p>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 2 */}
          <div className="policy-section" id="s2">
            <div className="section-number">02 — INFORMATION WE COLLECT</div>
            <h2 className="section-title">Information We Collect</h2>
            <div className="section-body">
              <p>We collect information in three ways: information you provide directly, information collected automatically, and information from third parties.</p>

              <div className="subsection">
                <div className="subsection-title">2.1 Information You Provide Directly</div>
                <DataTable
                  head={["Category", "Data Collected", "Purpose", "Legal Basis"]}
                  rows={[
                    ["Account Registration", "Full name, email address, phone number, password (hashed)", "Account creation & authentication", "Contractual necessity"],
                    ["Profile Information", "Profile photo, address, bio, occupation", "Trust & verification", "Legitimate interest"],
                    ["Property Listings", "Property address, photos, description, rent, amenities, ownership documents", "Listing creation & display", "Contractual necessity"],
                    ["Booking Requests", "Move-in date, duration, special requirements, references", "Rental transaction processing", "Contractual necessity"],
                    ["Payment Information", "Subscription plan details (payment processed via third-party gateway; we do not store raw card data)", "Subscription billing", "Contractual necessity"],
                    ["Communications", "Messages, support tickets, reviews, feedback", "Customer support & trust", "Legitimate interest"],
                    ["KYC Documents", "Aadhaar number (last 4 digits only), PAN (for Premium landlords), government ID type", "Identity verification & fraud prevention", "Legal obligation / consent"],
                  ]}
                />
              </div>

              <div className="subsection">
                <div className="subsection-title">2.2 Information Collected Automatically</div>
                <PolicyList items={[
                  "Device information: browser type, operating system, device identifiers, screen resolution",
                  "Log data: IP address, access times, pages viewed, referring URLs, HTTP status codes",
                  "Location data: approximate geographic location derived from IP address; precise GPS only if you grant permission",
                  "Usage analytics: features used, search queries entered, properties saved or bookmarked",
                  "Firebase Analytics events: session duration, user engagement, crash reports",
                  "Cookies and similar tracking technologies (see Section 5)",
                ]} />
              </div>

              <div className="subsection">
                <div className="subsection-title">2.3 Information from Third Parties</div>
                <PolicyList items={[
                  "Google Sign-In: name, email, profile photo, and unique Google account ID if you use Google OAuth",
                  "Payment gateway callbacks: transaction status, anonymized payment reference IDs",
                  "Public property registries: to verify ownership claims on listed properties",
                ]} />
              </div>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 3 */}
          <div className="policy-section" id="s3">
            <div className="section-number">03 — HOW WE USE DATA</div>
            <h2 className="section-title">How We Use Your Information</h2>
            <div className="section-body">
              <p>We process your personal data only for specific, legitimate purposes. We do not sell your personal data to third parties for their marketing purposes.</p>

              <div className="subsection">
                <div className="subsection-title">Primary Purposes</div>
                <PolicyList variant="checks" items={[
                  "Creating, maintaining, and securing your SmartRent AI account",
                  "Displaying property listings to prospective tenants and facilitating booking requests",
                  "Processing and managing subscription plans and associated payments",
                  "Sending transactional emails: booking confirmations, approval notifications, password resets",
                  "Providing AI-powered property recommendations based on your search history and preferences",
                  "Enabling landlord–tenant communication within the platform",
                  "Verifying the identity of landlords and detecting fraudulent listings",
                  "Generating anonymized analytics to improve platform features",
                  "Complying with applicable legal obligations and court orders",
                ]} />
              </div>

              <div className="subsection">
                <div className="subsection-title">We Will NOT Use Your Data For</div>
                <PolicyList variant="cross" items={[
                  "Selling, renting, or trading your personal data to third-party advertisers",
                  "Profiling users for targeted advertising without explicit consent",
                  "Processing sensitive personal data (health, religion, caste) unless legally required",
                  "Any purpose incompatible with those stated herein without obtaining fresh consent",
                ]} />
              </div>

              <div className="highlight-box">
                <strong>Marketing Communications:</strong> We may send you promotional emails about new features or relevant listings only if you opt in. You may withdraw consent at any time by clicking "Unsubscribe" in any email or updating your notification preferences in your Account Settings.
              </div>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 4 */}
          <div className="policy-section" id="s4">
            <div className="section-number">04 — DATA SHARING &amp; DISCLOSURE</div>
            <h2 className="section-title">Data Sharing &amp; Disclosure</h2>
            <div className="section-body">
              <p>SmartRent AI does not sell personal data. We share data only in the limited circumstances described below.</p>
              <DataTable
                head={["Recipient", "Data Shared", "Reason", "Safeguard"]}
                rows={[
                  ["Google Firebase", "Authentication tokens, usage events, crash logs", "Platform infrastructure & analytics", "Google's Privacy Policy; DPA in place"],
                  ["Payment Gateway (Razorpay / Stripe)", "Order amount, user email, transaction reference", "Subscription payment processing", "PCI-DSS compliant; DPA in place"],
                  ["Other Users (Tenants)", "Landlord's display name, listing photos, phone (only after booking confirmed)", "Enabling rental transactions", "Contractual necessity; limited disclosure"],
                  ["Law Enforcement / Regulators", "Any data as lawfully required", "Legal obligation, court order, national security", "Disclosure only upon valid legal process"],
                  ["Business Successors", "All user data", "Merger, acquisition, or asset sale", "Bound by this policy; you will be notified"],
                ]}
              />
              <div className="warn-box">
                <strong>⚠️ Important:</strong> If a law enforcement agency, court, or government authority provides us with a legally valid order requiring disclosure of your data, we are obligated to comply. Where legally permissible, we will notify you before disclosing your information.
              </div>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 5 */}
          <div className="policy-section" id="s5">
            <div className="section-number">05 — COOKIES &amp; TRACKING</div>
            <h2 className="section-title">Cookies &amp; Tracking Technologies</h2>
            <div className="section-body">
              <p>We use cookies, local storage, and similar technologies to operate and improve our platform.</p>
              <DataTable
                head={["Cookie Type", "Purpose", "Duration", "Can Opt Out?"]}
                rows={[
                  ["Essential / Strictly Necessary", "Authentication session, CSRF protection, load balancing", "Session / 30 days", "No — required for platform to function"],
                  ["Functional", "Remembering search filters, saved properties, language preference", "90 days", "Yes"],
                  ["Analytics", "Firebase Analytics: page views, feature usage, error tracking", "2 years", "Yes — via Cookie Preferences"],
                  ["Performance", "Page load timing, API response benchmarks", "30 days", "Yes"],
                ]}
              />
              <p>You may manage cookie preferences through your browser settings. Note that disabling essential cookies will prevent you from logging in or using core platform features. We do not currently use advertising or third-party tracking cookies.</p>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 6 */}
          <div className="policy-section" id="s6">
            <div className="section-number">06 — FIREBASE &amp; THIRD PARTIES</div>
            <h2 className="section-title">Firebase &amp; Third-Party Services</h2>
            <div className="section-body">
              <p>Our platform is built on Google Firebase (Project ID: <code>smart-property-portal</code>). The following Firebase services process your data:</p>

              <InfoCard title="🔥 Firebase Authentication">
                Manages user registration, login sessions (email/password and Google OAuth), and token-based session verification. Firebase stores encrypted password hashes; we never have access to your plaintext password.
              </InfoCard>
              <InfoCard title="🗄️ Cloud Firestore">
                Our primary database stores user profiles, property listings, booking records, and subscription data. Firestore data is encrypted at rest (AES-256) and in transit (TLS 1.2+). Security Rules restrict access so users can only read/write their own authorized data.
              </InfoCard>
              <InfoCard title="📊 Firebase Analytics & Crashlytics">
                Collects anonymized usage events and crash reports to help us improve stability. Data is processed by Google as described in their Privacy Policy. You may opt out of analytics through your Account Settings.
              </InfoCard>
              <InfoCard title="🗃️ Firebase Storage">
                Stores property photos, profile pictures, and uploaded documents. Files are secured with Firebase Security Rules and served over signed URLs with expiry.
              </InfoCard>

              <p>Google Firebase's data processing is governed by Google's Privacy Policy at <code>policies.google.com/privacy</code> and the Google Cloud Data Processing Addendum. SmartRent AI has executed a Data Processing Agreement with Google.</p>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 7 */}
          <div className="policy-section" id="s7">
            <div className="section-number">07 — DATA SECURITY</div>
            <h2 className="section-title">Data Security Measures</h2>
            <div className="section-body">
              <p>We implement reasonable and appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, or destruction.</p>
              <PolicyList variant="checks" items={[
                "All data transmissions encrypted using TLS 1.2 or higher (HTTPS enforced platform-wide)",
                "Passwords hashed using bcrypt with per-user salts; we never store plaintext passwords",
                "Firebase Firestore Security Rules enforce least-privilege access controls at the database level",
                "Firebase Storage Security Rules restrict file access to authorized users only",
                "Multi-factor authentication (MFA) available and strongly recommended for all accounts",
                "Admin panel access restricted to verified admin email addresses only",
                "Regular security reviews of Firestore rules and access permissions",
                "Firebase Authentication tokens expire and are rotated automatically",
                "Sensitive fields (Aadhaar last 4 digits) masked in database queries and logs",
              ]} />
              <div className="warn-box">
                <strong>⚠️ No system is 100% secure.</strong> While we strive to protect your data, we cannot guarantee absolute security of information transmitted over the internet. In the event of a data breach that poses a significant risk to you, we will notify you and the appropriate regulatory authority within 72 hours as required by applicable law.
              </div>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 8 */}
          <div className="policy-section" id="s8">
            <div className="section-number">08 — DATA RETENTION</div>
            <h2 className="section-title">Data Retention Policy</h2>
            <div className="section-body">
              <p>We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law.</p>
              <DataTable
                head={["Data Category", "Retention Period", "Post-Retention Action"]}
                rows={[
                  ["Active account data", "Duration of account + 1 year after deletion", "Permanent deletion from Firestore"],
                  ["Property listings", "Duration active + 6 months after removal", "Soft delete, then hard delete"],
                  ["Booking records", "7 years (GST & legal compliance)", "Anonymized archival"],
                  ["Payment transaction records", "8 years (Income Tax Act requirement)", "Encrypted archival"],
                  ["Support communications", "3 years from resolution date", "Permanent deletion"],
                  ["Server & access logs", "90 days", "Automated deletion"],
                  ["Analytics data", "14 months (Firebase default)", "Automatic aggregation & deletion"],
                  ["Deleted account data", "30-day grace period, then permanent deletion", "Full erasure except legally mandated records"],
                ]}
              />
              <p>When you delete your account, we initiate a 30-day grace period during which you may restore your account. After this period, all personal data is permanently and irrecoverably deleted, except where retention is required by law (e.g., financial records).</p>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 9 */}
          <div className="policy-section" id="s9">
            <div className="section-number">09 — YOUR LEGAL RIGHTS</div>
            <h2 className="section-title">Your Rights as a Data Principal</h2>
            <div className="section-body">
              <p>Under the Digital Personal Data Protection Act, 2023 (DPDP Act) and applicable Indian law, you have the following rights. We will respond to verified requests within <strong style={{ color: "var(--teal)" }}>30 days</strong>.</p>

              <RightsGrid items={[
                ["📋", "Right to Access", "Request a copy of all personal data we hold about you, including categories, sources, and purposes of processing."],
                ["✏️", "Right to Correction", "Request correction of inaccurate or incomplete personal data. Most profile data can be updated directly in Account Settings."],
                ["🗑️", "Right to Erasure", "Request deletion of your personal data. We will comply unless retention is legally required (e.g., financial records)."],
                ["📦", "Right to Portability", "Receive your personal data in a structured, machine-readable format (JSON/CSV) for transfer to another service."],
                ["🚫", "Right to Withdraw Consent", "Withdraw consent for optional data processing at any time without affecting the lawfulness of prior processing."],
                ["🤖", "Right Against Automated Decisions", "Request human review of any significant decision made solely by automated means, including AI-based listing recommendations."],
                ["📣", "Right to Nominate", "Under the DPDP Act 2023, nominate another individual to exercise your rights in the event of your death or incapacity."],
                ["⚖️", "Right to Grievance Redressal", "Lodge a complaint with our Grievance Officer. Unresolved complaints may be escalated to the Data Protection Board of India."],
              ]} />

              <p style={{ marginTop: 20 }}>To exercise any of these rights, email us at <code>privacy@smartrentai.in</code> with the subject line "Privacy Rights Request" and your registered email address. We may ask you to verify your identity before processing the request.</p>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 10 */}
          <div className="policy-section" id="s10">
            <div className="section-number">10 — CHILDREN'S PRIVACY</div>
            <h2 className="section-title">Children's Privacy</h2>
            <div className="section-body">
              <p>SmartRent AI is not directed at individuals under the age of <strong style={{ color: "var(--white)" }}>18 years</strong>. We do not knowingly collect personal data from minors.</p>
              <div className="warn-box">
                <strong>⚠️ Age Restriction:</strong> By creating an account or using SmartRent AI, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into binding contracts under applicable law. If you are a parent or guardian and believe your minor child has provided us with personal data, please contact us immediately at <strong>privacy@smartrentai.in</strong> and we will delete such data within 7 business days.
              </div>
              <p>Where SmartRent AI becomes aware that data has been collected from a minor, we will take immediate steps to delete such data and terminate the associated account. We reserve the right to request age verification documents at any time.</p>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 11 */}
          <div className="policy-section" id="s11">
            <div className="section-number">11 — INTERNATIONAL TRANSFERS</div>
            <h2 className="section-title">International Data Transfers</h2>
            <div className="section-body">
              <p>SmartRent AI is operated from India. However, some of our third-party service providers (including Google Firebase) may process data on servers located outside India, including in the United States and the European Union.</p>
              <PolicyList items={[
                "Google Firebase may process data in its global data centers. Google maintains Standard Contractual Clauses and adequate safeguards for cross-border transfers under applicable data protection laws.",
                "Any international transfer of data is conducted subject to appropriate safeguards including Data Processing Agreements and standard contractual clauses.",
                "By using SmartRent AI, you consent to the transfer of your information to countries outside India that may have different data protection standards, subject to the safeguards described herein.",
                "We will comply with applicable provisions of the DPDP Act 2023 regarding cross-border data transfers once the relevant rules are notified by the Government of India.",
              ]} />
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 12 */}
          <div className="policy-section" id="s12">
            <div className="section-number">12 — AI &amp; AUTOMATED DECISIONS</div>
            <h2 className="section-title">AI-Powered Features &amp; Automated Decision-Making</h2>
            <div className="section-body">
              <p>SmartRent AI uses artificial intelligence and automated algorithms in the following ways:</p>

              <InfoCard title="🔍 Property Recommendations">
                We use your search history, saved properties, and location preferences to surface relevant listings. This is a convenience feature and does not affect any legal rights or entitlements.
              </InfoCard>
              <InfoCard title="🛡️ Fraud & Spam Detection">
                Automated systems flag suspicious listings and user behavior patterns. Flagged content is reviewed by a human admin before action is taken. You may request human review of any automated decision affecting your account by contacting our Grievance Officer.
              </InfoCard>
              <InfoCard title="📊 Pricing Insights">
                Where available, AI-powered market analytics provide landlords with rental price benchmarks. These are informational only and do not constitute binding valuations or legal advice.
              </InfoCard>

              <div className="highlight-box">
                <strong>Your Rights:</strong> No fully automated decision that produces a significant legal effect on you will be made without opportunity for human review. If you believe an automated decision has unfairly affected your account, contact us at <strong>grievance@smartrentai.in</strong> to request manual review within 30 days of the decision.
              </div>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 13 */}
          <div className="policy-section" id="s13">
            <div className="section-number">13 — POLICY UPDATES</div>
            <h2 className="section-title">Changes to This Privacy Policy</h2>
            <div className="section-body">
              <p>We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or for other legitimate business reasons.</p>
              <PolicyList items={[
                'We will post the updated policy on this page with a revised "Last Updated" date at the top',
                <>For material changes that significantly affect your rights or how we process your data, we will notify you via email (to your registered address) at least <strong style={{ color: "var(--white)" }}>30 days</strong> before the changes take effect</>,
                "Your continued use of SmartRent AI after the effective date of changes constitutes acceptance of the updated policy",
                "If you do not agree with the updated policy, you must discontinue use and may request account deletion before the effective date",
                <>Previous versions of this policy are available on request by emailing <code>privacy@smartrentai.in</code></>,
              ]} />
              <div className="highlight-box">
                <strong>Version History:</strong> v1.0 (Jan 2025) — Initial release. v2.0 (Sep 2025) — Added DPDP Act 2023 alignment, Firebase data processing details, AI decision-making disclosures. v3.1 (Apr 2026) — Updated retention schedules, enhanced international transfer provisions, added Rights Grid.
              </div>
            </div>
          </div>
          <div className="divider" />

          {/* SECTION 14 */}
          <div className="policy-section" id="s14">
            <div className="section-number">14 — GRIEVANCE &amp; CONTACT</div>
            <h2 className="section-title">Grievance Officer &amp; Contact</h2>
            <div className="section-body">
              <p>In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, we have appointed a Grievance Officer to address complaints and questions regarding the processing of your personal data.</p>

              <div className="contact-card">
                <div className="contact-title">Contact Our Grievance Officer</div>
                <div className="contact-grid">
                  <div className="contact-item"><div className="ci-icon">👤</div><div><div className="ci-label">Grievance Officer</div><div className="ci-val">Data Privacy Team, SmartRent AI</div></div></div>
                  <div className="contact-item"><div className="ci-icon">📧</div><div><div className="ci-label">Privacy Requests</div><div className="ci-val">privacy@smartrentai.in</div></div></div>
                  <div className="contact-item"><div className="ci-icon">⚖️</div><div><div className="ci-label">Grievance Complaints</div><div className="ci-val">grievance@smartrentai.in</div></div></div>
                  <div className="contact-item"><div className="ci-icon">🕐</div><div><div className="ci-label">Response Time</div><div className="ci-val">Within 30 days of receipt</div></div></div>
                  <div className="contact-item"><div className="ci-icon">📍</div><div><div className="ci-label">Registered Address</div><div className="ci-val">Hyderabad, Telangana, India</div></div></div>
                  <div className="contact-item"><div className="ci-icon">🌐</div><div><div className="ci-label">Website</div><div className="ci-val">smartrentai.in/privacy</div></div></div>
                </div>
              </div>

              <div className="subsection">
                <div className="subsection-title">Escalation to Data Protection Board</div>
                <p style={{ fontSize: 14 }}>If you are not satisfied with the resolution provided by our Grievance Officer, you have the right to approach the <strong style={{ color: "var(--white)" }}>Data Protection Board of India</strong> once it is constituted under the DPDP Act, 2023. For grievances related to EU data subjects, you may also contact the relevant supervisory authority in your EU member state.</p>
              </div>
            </div>
          </div>

          <div className="policy-footer">
            <div className="footer-left">
              <strong>SmartRent AI Privacy Policy</strong><br />
              Version 3.1 · Effective 01 January 2025 · Last Updated 09 April 2026<br />
              © 2025–2026 SmartRent AI. All rights reserved.<br /><br />
              <em style={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>
                This policy is provided for informational purposes and is intended to comply with applicable Indian law including the IT Act 2000, DPDP Act 2023, and related rules. It does not constitute legal advice. We recommend consulting a qualified legal professional for your specific circumstances.
              </em>
            </div>
            <div className="footer-legal">
              Governing Law: India<br />
              Jurisdiction: Telangana High Court<br />
              Language: English (Authoritative)<br />
              Format: Next.js v3.1
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
