<template>
  <div class="legal-page">
    <div class="legal-container">
      <router-link to="/" class="back-link">&larr; Back to Home</router-link>

      <h1>Seller Terms & Conditions</h1>
      <p class="last-updated">Last updated: {{ lastUpdated }}</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          These Seller Terms & Conditions ("Terms") govern your participation as a
          seller on WonderBakes ("the Platform"). By submitting a seller application,
          you agree to be bound by these Terms.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p>
          Sellers must provide accurate business information, a valid National ID,
          and a functioning M-Pesa account for payouts. WonderBakes reserves the
          right to approve or reject any application at its discretion.
        </p>
      </section>

      <section>
        <h2>3. Seller Responsibilities</h2>
        <ul>
          <li>Provide accurate product descriptions, pricing, and availability.</li>
          <li>Fulfill orders in a timely manner and communicate delays to customers.</li>
          <li>Maintain quality and food safety standards where applicable.</li>
        </ul>
      </section>

      <section>
        <h2>4. Payments & Payouts</h2>
        <p>
          Payouts are processed via M-Pesa to the number provided at registration.
          WonderBakes may deduct applicable commission fees before payout. Payout
          schedules and fee structures are subject to change with notice.
        </p>
      </section>

      <section>
        <h2>5. Order Cancellations & Disputes</h2>
        <p>
          Sellers are expected to resolve order disputes in good faith. WonderBakes
          may mediate disputes and reserves the right to issue refunds where
          warranted.
        </p>
      </section>

      <section>
        <h2>6. Termination</h2>
        <p>
          WonderBakes reserves the right to suspend or terminate a seller account
          for violation of these Terms, fraudulent activity, or repeated customer
          complaints.
        </p>
      </section>

      <section>
        <h2>7. Changes to These Terms</h2>
        <p>
          These Terms may be updated periodically. Continued use of the Platform
          after changes constitutes acceptance of the revised Terms.
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
