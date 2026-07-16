<template>
  <div class="help-center">
    <div class="help-container">
      
      <!-- ============ HERO : Friendly Header ============ -->
      <header class="help-header">
        <p class="eyebrow">Support & Ideas</p>
        <h1 class="help-title">How can we make things sweeter?</h1>
        <p class="help-subtitle">
          Having trouble with an order, or got a brilliant idea for the app? 
          We're all ears and ready to fix it.
        </p>
      </header>

      <!-- ============ SECTION 1: FAQS (Quick Troubleshooting) ============ -->
      <section class="faq-section">
        <h2 class="section-title">Common Questions & Fixes</h2>
        <div class="faq-list">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index" 
            class="faq-item" 
            :class="{ 'faq-item--active': activeFaq === index }"
          >
            <button 
              class="faq-trigger" 
              @click="toggleFaq(index)"
              :aria-expanded="activeFaq === index"
            >
              <span class="faq-question">{{ faq.question }}</span>
              <span class="faq-chevron" aria-hidden="true">
                {{ activeFaq === index ? '−' : '+' }}
              </span>
            </button>
            <div class="faq-content" v-show="activeFaq === index">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ SECTION 2: SUGGESTION & ISSUE FORM ============ -->
      <section class="form-section">
        <div class="form-card">
          <div class="form-card__head">
            <span class="form-icon">📬</span>
            <h3>Drop a Suggestion or Report an Issue</h3>
            <p>Your feedback goes straight to our kitchen and tech teams.</p>
          </div>

          <!-- Success State -->
          <div v-if="submitted" class="success-state" role="status">
            <div class="success-ring">🎉</div>
            <h4>Asante! Received loud and clear.</h4>
            <p>Our team is already on it. We'll reach out if we need to untangle anything else!</p>
            <button @click="resetForm" class="btn btn--secondary">Send another note</button>
          </div>

          <!-- Active Form -->
          <form v-else @submit.prevent="handleSubmit" class="feedback-form">
            <div class="form-group">
              <label for="feedback-type">What's on your mind?</label>
              <select id="feedback-type" v-model="form.type" required>
                <option value="" disabled selected>Select an option...</option>
                <option value="suggestion">💡 I have a great suggestion / idea</option>
                <option value="problem">⚠️ I am facing a problem / bug</option>
                <option value="order">🧁 Issue with a specific order</option>
                <option value="other">💬 General inquiry</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="name">Your Name</label>
                <input type="text" id="name" v-model="form.name" placeholder="e.g. Mwangi" required />
              </div>
              <div class="form-group">
                <label for="contact">Phone or Email</label>
                <input type="text" id="contact" v-model="form.contact" placeholder="e.g. 0712345678" required />
              </div>
            </div>

            <div class="form-group">
              <label for="message">Details</label>
              <textarea 
                id="message" 
                v-model="form.message" 
                rows="4" 
                placeholder="Tell us what happened or describe your awesome idea..." 
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn--primary">
              Submit Feedback
            </button>
          </form>
        </div>
      </section>

      <!-- ============ EMERGENCY HELP TRAY ============ -->
      <footer class="emergency-tray">
        <p>Still stuck? Chat with us directly on <a href="https://wa.me/yourphonenumber" target="_blank">WhatsApp</a> for instant order support.</p>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeFaq = ref(null)
const submitted = ref(false)

const form = ref({
  type: '',
  name: '',
  contact: '',
  message: ''
})

const faqs = ref([
  {
    question: "My M-Pesa payment went through but the order didn't update?",
    answer: "Don't panic! Sometimes cellular delays slow down the confirmation. Send your M-Pesa transaction code directly to our WhatsApp support link at the bottom of this page, and our team will instantly approve your tray."
  },
  {
    question: "What happens if my cake gets damaged during delivery?",
    answer: "We treat cakes like royalty, but Nairobi roads can be bumpy. If your boda rider delivers a smudge instead of a cake, take a quick photo and send it to us immediately. We will arrange a fresh replacement or a full refund."
  },
  {
    question: "How do I suggest a new feature for the website?",
    answer: "We love builders! Use the feedback form below, select 'I have a great suggestion', and spill the beans. Our engineering team reads every single submission."
  },
  {
    question: "Can I schedule a delivery for a future date?",
    answer: "Absolutely. During checkout on wonderbakes.shop, you can pick your exact date and delivery window up to 30 days in advance."
  }
])

function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? null : index
}

function handleSubmit() {
  // Simulate API post
  console.log('Feedback submitted:', form.value)
  submitted.value = true
}

function resetForm() {
  form.value = { type: '', name: '', contact: '', message: '' }
  submitted.value = false
}
</script>

<style scoped>
/* ============ SYSTEM STYLES ============ */
.help-center {
  --cocoa: #2f1c14;
  --cocoa-soft: #6b4a37;
  --dough: #f6ede0;
  --dough-deep: #ebdcc7;
  --raspberry: #b7355c;
  --raspberry-deep: #8f2a49;
  --pistachio: #7f9b76;
  --ink: #241511;

  font-family: 'Inter', 'Work Sans', system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background: var(--dough);
  min-height: 100vh;
  padding: 4rem 1.25rem;
  display: flex;
  justify-content: center;
}

.help-container {
  width: 100%;
  max-width: 680px;
}

/* ============ HERO HEADER ============ */
.help-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--raspberry);
  margin: 0 0 0.5rem;
}

.help-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2rem, 5vw, 2.6rem);
  font-weight: 700;
  color: var(--cocoa);
  line-height: 1.15;
  margin: 0 0 1rem;
}

.help-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--cocoa-soft);
  max-width: 52ch;
  margin: 0 auto;
}

/* ============ FAQ SECTION ============ */
.faq-section {
  margin-bottom: 3.5rem;
}

.section-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.4rem;
  color: var(--cocoa);
  margin-bottom: 1.5rem;
  text-align: center;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  background: #fff;
  border: 1.5px solid var(--dough-deep);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.faq-item--active {
  border-color: var(--raspberry);
}

.faq-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.faq-question {
  font-weight: 600;
  color: var(--cocoa);
  font-size: 1rem;
  padding-right: 1rem;
}

.faq-chevron {
  font-size: 1.4rem;
  color: var(--raspberry);
  font-family: monospace;
}

.faq-content {
  padding: 0 1.5rem 1.25rem;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--cocoa-soft);
  border-top: 1px dashed var(--dough-deep);
  padding-top: 1rem;
}

/* ============ FORM CARD ============ */
.form-section {
  margin-bottom: 3rem;
}

.form-card {
  background: #fff;
  border-radius: 20px;
  border: 1.5px solid var(--dough-deep);
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 20px rgba(47, 28, 20, 0.04);
}

.form-card__head {
  text-align: center;
  margin-bottom: 2rem;
}

.form-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.form-card__head h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.4rem;
  color: var(--cocoa);
  margin: 0 0 0.5rem;
}

.form-card__head p {
  font-size: 0.9rem;
  color: var(--cocoa-soft);
  margin: 0;
}

/* Form Layout */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 580px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cocoa);
}

.form-group input,
.form-group select,
.form-group textarea {
  font-family: inherit;
  font-size: 0.95rem;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: 1.5px solid var(--dough-deep);
  background: var(--dough);
  color: var(--ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--raspberry);
  box-shadow: 0 0 0 3px rgba(183, 53, 92, 0.1);
  background: #fff;
}

/* Buttons */
.btn {
  font-family: inherit;
  font-weight: 600;
  font-size: 0.98rem;
  padding: 0.9rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  transition: transform 0.1s ease, filter 0.15s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn--primary {
  background: var(--raspberry);
  color: #fff;
}

.btn--primary:hover {
  filter: brightness(1.1);
}

.btn--secondary {
  background: var(--dough);
  color: var(--cocoa);
  border: 1.5px solid var(--dough-deep);
}

.btn--secondary:hover {
  background: var(--dough-deep);
}

/* Success State */
.success-state {
  text-align: center;
  padding: 1.5rem 0;
}

.success-ring {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-state h4 {
  font-family: 'Fraunces', serif;
  font-size: 1.3rem;
  color: var(--cocoa);
  margin: 0 0 0.5rem;
}

.success-state p {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--cocoa-soft);
  margin-bottom: 1.5rem;
  max-width: 40ch;
  margin-left: auto;
  margin-right: auto;
}

/* ============ EMERGENCY HELP TRAY ============ */
.emergency-tray {
  text-align: center;
  padding: 1rem;
  border-top: 1px dashed var(--dough-deep);
}

.emergency-tray p {
  font-size: 0.88rem;
  color: var(--cocoa-soft);
}

.emergency-tray a {
  color: var(--raspberry);
  font-weight: 600;
  text-decoration: none;
}

.emergency-tray a:hover {
  text-decoration: underline;
}
</style>

