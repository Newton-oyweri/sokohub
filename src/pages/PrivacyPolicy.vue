<template>
  <div class="legal-page">
    <div class="legal-container">
      <router-link to="/" class="back-link">&larr; Back to Home</router-link>

      <h1>Privacy Policy</h1>
      <p class="last-updated">Last updated: {{ lastUpdated }}</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy explains how WonderBakes ("we", "us", "the Platform")
          collects, uses, and protects your personal information when you use our
          services as a buyer or seller.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <ul>
          <li>Contact details: name, phone number, email address.</li>
          <li>Business details: business name, type, address, pickup location.</li>
          <li>Identity details: National ID number, for seller verification.</li>
          <li>Payment details: M-Pesa number and registered account name.</li>
          <li>Usage data: orders, app activity, and device information.</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>
          We use collected information to process orders, verify seller identity,
          facilitate M-Pesa payouts, communicate updates, and improve the Platform.
          We do not sell personal information to third parties.
        </p>
      </section>

      <section>
        <h2>4. Sharing of Information</h2>
        <p>
          Information may be shared with payment processors (e.g., Safaricom
          Daraja/M-Pesa), delivery riders, and service providers strictly to
          fulfill Platform operations. We may also disclose information if
          required by law.
        </p>
      </section>

      <section>
        <h2>5. Data Security</h2>
        <p>
          We take reasonable technical and organizational measures to protect
          your data. However, no method of transmission or storage is 100%
          secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>6. Data Retention</h2>
        <p>
          We retain personal data for as long as necessary to provide our
          services and comply with legal obligations. Sellers may request
          account deletion, subject to outstanding orders or obligations.
        </p>
      </section>

      <section>
        <h2>7. Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal
          data by contacting us. You may also withdraw consent for optional data
          collection at any time.
        </p>
      </section>

      <section>
        <h2>8. Changes to This Policy</h2>
        <p>
          This Privacy Policy may be updated periodically. Continued use of the
          Platform after changes constitutes acceptance of the revised policy.
        </p>
      </section>

      <p class="placeholder-note">
        ⚠️ This is placeholder content for development. Replace with reviewed legal
        copy before production.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lastUpdated = ref(new Date().toLocaleDateString('en-KE', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}))
</script>

<style scoped>
.legal-page {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: var(--primary-color, #d63384);
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

h1 {
  margin-bottom: 0.25rem;
}

.last-updated {
  color: #777;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 1.5rem;
}

section h2 {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}

section p,
section ul {
  color: #444;
  line-height: 1.6;
}

.placeholder-note {
  margin-top: 2rem;
  padding: 0.75rem 1rem;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #856404;
}
</style>
