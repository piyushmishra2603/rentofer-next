"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./page.css";

export default function TermsPage() {
  const [lastUpdated, setLastUpdated] = useState("April 9, 2026");

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    );
  }, []);

  return (
    <div className="terms-page">
      <header className="tp-header">
        <div className="tp-header-in">
          <div className="tp-brand">
            <div className="tp-logo">🏠</div>
            <div>
              <div className="tp-name">SmartRent</div>
              <div className="tp-sub">Terms &amp; Conditions</div>
            </div>
          </div>
          <Link href="/" className="tp-back">← Back</Link>
        </div>
      </header>

      <main className="tp-main">
        <div className="tp-card">
          <h1>Terms &amp; Conditions</h1>
          <p className="tp-updated">Last updated: <span>{lastUpdated}</span></p>

          <div className="tp-body">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using SmartRent (the “Website” and “Service”), including any account, messaging,
                listings, and booking-related functionality, you agree to be bound by these Terms &amp; Conditions
                (the “Terms”). If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2>2. Eligibility (Adults Only)</h2>
              <p>
                You must be at least <strong>18 years</strong> of age to use the Service.
                By using the Service, you represent that you are an adult and have legal capacity to enter into binding terms.
                If you do not meet this requirement, you must not use the Service.
              </p>
            </section>

            <section>
              <h2>3. Our Role; User-to-User Rentals</h2>
              <p>
                SmartRent provides an online platform to enable users to browse property listings and communicate through
                messaging. The actual rental/booking arrangement is strictly between the relevant host/landlord and tenant/guest.
              </p>
              <p>
                Unless explicitly stated otherwise on the Website, SmartRent is not a party to any rental agreement and does not
                guarantee the condition, legality, availability, or fitness for purpose of any property.
              </p>
            </section>

            <section>
              <h2>4. Accounts and Responsibility</h2>
              <ul>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to provide accurate information and keep it updated.</li>
                <li>You must not impersonate others or provide false information.</li>
                <li>We may suspend or terminate access where we reasonably believe there is a violation of these Terms or applicable law.</li>
              </ul>
            </section>

            <section>
              <h2>5. User Conduct and Prohibited Activities</h2>
              <p>You agree not to, directly or indirectly:</p>
              <ul>
                <li>Engage in fraud, misleading conduct, or unlawful acts.</li>
                <li>Harass, threaten, or abuse other users.</li>
                <li>Request, facilitate, or transmit illegal payments or contravene applicable Indian laws.</li>
                <li>Upload malware or attempt to disrupt the Service.</li>
                <li>Attempt unauthorized access to accounts, systems, or data.</li>
                <li>Violate intellectual property rights or use the Service for prohibited commercial activities.</li>
              </ul>
            </section>

            <section>
              <h2>6. Listings and Communications</h2>
              <ul>
                <li>Hosts/landlords are responsible for the accuracy of their listings.</li>
                <li>Tenants/guests are responsible for verifying property details and rental terms before booking.</li>
                <li>All communications through messaging are between users, and you use messaging at your own risk.</li>
              </ul>
            </section>

            <section>
              <h2>7. Fees and Payments</h2>
              <p>
                SmartRent is currently free to use: there are no subscription plans, listing fees, or platform charges, and
                SmartRent does not process payments between users. Any rent, deposit, or other payment is arranged and paid
                directly between the host/landlord and the tenant/guest.
              </p>
              <p>
                SmartRent is not responsible for transaction issues arising between users (e.g., disputes, refunds,
                chargebacks). If we introduce paid features in the future, we will update these Terms before they apply.
              </p>
            </section>

            <section>
              <h2>8. Deposits, Refunds, Cancellations (User Responsibility)</h2>
              <p>
                Deposits, cancellations, rescheduling, and refunds (if any) are governed by the rental/booking terms agreed between
                the host/landlord and tenant/guest. SmartRent does not control the outcome of such disputes unless explicitly required by law.
              </p>
              <p>
                You agree to resolve disputes directly with the other user, and to cooperate with any reasonable moderation or
                reporting process.
              </p>
            </section>

            <section>
              <h2>9. Content You Submit (License to Us)</h2>
              <p>
                You retain ownership of content you submit (e.g., messages, images, listing text) but you grant SmartRent a
                non-exclusive, worldwide, royalty-free license to host, store, reproduce, and display such content for the purpose
                of operating and improving the Service.
              </p>
              <p>
                You represent that you have the rights to submit the content and that it does not violate applicable laws or third-party rights.
              </p>
            </section>

            <section>
              <h2>10. Moderation, Removal, and Suspension</h2>
              <p>
                We may review, moderate, restrict access, or remove content that we reasonably believe violates these Terms,
                infringes rights, or is unlawful. We may also suspend accounts for repeated or serious violations.
              </p>
              <p>You acknowledge that we may not be able to review every piece of content in real time.</p>
            </section>

            <section>
              <h2>11. Disclaimers</h2>
              <p>The Service is provided on an “as is” and “as available” basis. To the maximum extent permitted by law:</p>
              <ul>
                <li>We do not warrant that the Service will be uninterrupted or error-free.</li>
                <li>We do not guarantee the accuracy, completeness, or reliability of listings or communications.</li>
                <li>We do not guarantee property condition, safety, compliance, or suitability.</li>
              </ul>
            </section>

            <section>
              <h2>12. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, SmartRent will not be liable for any indirect, incidental, special, consequential,
                or punitive damages, or for any loss of profits, revenue, goodwill, data, or similar losses.
              </p>
              <p>
                Our total liability (if any) arising out of or related to the Service shall not exceed the amounts paid by you to SmartRent
                in the <strong>three (3) months</strong> preceding the event giving rise to the claim (which, while the Service is free, is
                zero), except where liability cannot be limited by applicable law.
              </p>
            </section>

            <section>
              <h2>13. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless SmartRent, its affiliates, and partners from claims, liabilities, damages, losses, and
                expenses (including reasonable legal fees) arising out of:
              </p>
              <ul>
                <li>your use of the Service;</li>
                <li>your violation of these Terms or applicable law;</li>
                <li>your infringement of any third-party rights; and/or</li>
                <li>any content or conduct you submit or engage in through the Service.</li>
              </ul>
            </section>

            <section>
              <h2>14. Intellectual Property</h2>
              <p>
                SmartRent and its logos, designs, and technology are owned by SmartRent or its licensors. You may not copy, distribute,
                modify, or create derivative works of the Service without prior written permission.
              </p>
            </section>

            <section>
              <h2>15. Third-Party Links and Services</h2>
              <p>
                The Service may link to third-party websites or services. We do not control and are not responsible for third-party policies,
                content, or practices.
              </p>
            </section>

            <section>
              <h2>16. Privacy</h2>
              <p>
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy" className="tp-link"><strong>Privacy Policy</strong></Link>.
                By using the Service, you consent to the processing of your data as described there.
              </p>
            </section>

            <section>
              <h2>17. Governing Law (India)</h2>
              <p>
                These Terms are governed by the laws of <strong>India</strong>. Disputes shall be subject to the jurisdiction of the competent
                courts in <strong>Hyderabad, Telangana</strong>, unless otherwise required by applicable law.
              </p>
            </section>

            <section>
              <h2>18. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. Your continued use of the Service after the changes become effective
                constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2>19. Contact</h2>
              <p>
                Questions about these Terms should be sent to: <strong>support@smartrentai.in</strong>
              </p>
            </section>
          </div>

          <div className="tp-foot">
            <p>
              Disclaimer: This is a template and should be reviewed by a qualified legal professional in India for your specific business model,
              and compliance requirements.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
