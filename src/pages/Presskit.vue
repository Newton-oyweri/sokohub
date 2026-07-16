<template>
  <div class="press-kit">
    <div class="press-container">
      
      <!-- ============ HERO : Welcome & Main Download ============ -->
      <header class="press-hero">
        <p class="eyebrow">Media Resources</p>
        <h1 class="press-title">WonderBakes Press Kit</h1>
        <p class="press-subtitle">
          Everything you need to write about wonderbakes.shop. Download high-resolution logos, product assets, and read our story.
        </p>
        <div class="hero-actions">
          <!-- Main ZIP Download Call to Action -->
          <a href="/assets/wonderbakes-press-assets.zip" class="btn btn--primary" download>
            <span class="btn__icon">⬇️</span>
            <span>Download All Assets (ZIP)</span>
          </a>
          <a href="#fact-sheet" class="btn btn--secondary">Quick Facts</a>
        </div>
      </header>

      <!-- ============ SECTION 1: ABOUT & ELEVATOR PITCHES ============ -->
      <section class="press-section card-box">
        <h2>About WonderBakes</h2>
        <p class="section-desc">Feel free to copy or edit these descriptions for your articles.</p>
        
        <div class="pitch-group">
          <div class="pitch-item">
            <h3>The 50-Word Elevator Pitch</h3>
            <div class="copy-box">
              <p>WonderBakes is a Kenyan-first digital counter connecting talented home micro-bakers with local customers across Nairobi. By integrating seamless M-Pesa payments, reliable boda delivery networks, and instant updates, we take care of the logistics so independent bakers can focus on baking beautiful, fresh cakes.</p>
            </div>
          </div>

          <div class="pitch-item">
            <h3>The Full Story</h3>
            <div class="copy-box">
              <p>Founded in Nairobi, WonderBakes exists so a home baker in Kasarani can sell and safely deliver a custom cake to a customer in Kilimani before the icing sets. We built the platform because we realized local, passionate home bakers cook the best cakes—but coordinating multi-party delivery, tracking M-Pesa payments, and organizing schedules over chaotic WhatsApp messages is a headache. WonderBakes is the elegant tech layer that simplifies order management and guarantees fresh, intact delivery right to the doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ SECTION 2: QUICK FACTS (TABLE) ============ -->
      <section id="fact-sheet" class="press-section">
        <h2 class="section-title">Fast Facts</h2>
        <div class="table-wrapper">
          <table class="facts-table">
            <tbody>
              <tr>
                <td><strong>Official Brand Name</strong></td>
                <td>WonderBakes (always written as one word with a capital 'W' and 'B')</td>
              </tr>
              <tr>
                <td><strong>Website</strong></td>
                <td><a href="https://wonderbakes.shop" target="_blank">wonderbakes.shop</a></td>
              </tr>
              <tr>
                <td><strong>Headquarters</strong></td>
                <td>Nairobi, Kenya</td>
              </tr>
              <tr>
                <td><strong>Key Coverage Areas</strong></td>
                <td>Kasarani, Kilimani, Westlands, and greater Nairobi</td>
              </tr>
              <tr>
                <td><strong>Core Features</strong></td>
                <td>Direct home-baker ordering, M-Pesa mobile money checkout, real-time boda delivery routing, WhatsApp customer notifications</td>
              </tr>
              <tr>
                <td><strong>Media Inquiries</strong></td>
                <td><a href="mailto:press@wonderbakes.shop">press@wonderbakes.shop</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ============ SECTION 3: BRAND ASSETS PREVIEW ============ -->
      <section class="press-section">
        <h2 class="section-title">Brand Assets Preview</h2>
        <p class="section-intro">High-resolution vector files and transparent PNGs are available in the main ZIP package above.</p>
        
        <div class="assets-grid">
          <div class="asset-card">
            <div class="asset-preview asset-preview--dark">
              <!-- Dark background logo placeholder -->
              <span class="placeholder-logo">WonderBakes</span>
            </div>
            <div class="asset-details">
              <h4>Primary Logo (Dark Background)</h4>
              <p>For dark layouts. SVG & PNG</p>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-preview asset-preview--light">
              <!-- Light background logo placeholder -->
              <span class="placeholder-logo placeholder-logo--dark">WonderBakes</span>
            </div>
            <div class="asset-details">
              <h4>Primary Logo (Light Background)</h4>
              <p>For light layouts. SVG & PNG</p>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-preview asset-preview--product">
              <span class="placeholder-emoji">🧁📱</span>
            </div>
            <div class="asset-details">
              <h4>Product Screenshots</h4>
              <p>High-res dashboard & mobile layouts</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ FOOTER / CONTACT ============ -->
      <footer class="press-footer">
        <div class="contact-box">
          <h3>Are you working on a story?</h3>
          <p>We’d love to answer your questions, arrange an interview with our founders, or provide custom baking insights.</p>
          <a href="mailto:press@wonderbakes.shop" class="press-email">press@wonderbakes.shop</a>
        </div>
      </footer>

    </div>
  </div>
</template>

<style scoped>
/* ============ BRAND SYSTEM THEME ============ */
.press-kit {
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
  padding: 5rem 1.25rem;
  display: flex;
  justify-content: center;
}

.press-container {
  width: 100%;
  max-width: 800px;
}

/* ============ HERO HEADER ============ */
.press-hero {
  text-align: center;
  margin-bottom: 4.5rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--raspberry);
  margin: 0 0 0.75rem;
}

.press-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2.2rem, 6vw, 3.2rem);
  font-weight: 700;
  color: var(--cocoa);
  line-height: 1.1;
  margin: 0 0 1.25rem;
}

.press-subtitle {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--cocoa-soft);
  max-width: 54ch;
  margin: 0 auto 2.25rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.95rem 1.75rem;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  transition: transform 0.1s ease, filter 0.15s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn--primary {
  background: var(--raspberry);
  color: #fff;
  box-shadow: 0 4px 14px rgba(183, 53, 92, 0.2);
}

.btn--primary:hover {
  filter: brightness(1.1);
}

.btn--secondary {
  background: var(--dough-deep);
  color: var(--cocoa);
  border: 1.5px solid rgba(47, 28, 20, 0.15);
}

.btn--secondary:hover {
  background: #ebdcc7;
}

/* ============ CARDS & SECTIONS ============ */
.press-section {
  margin-bottom: 4rem;
}

.card-box {
  background: #fff;
  border-radius: 20px;
  border: 1.5px solid var(--dough-deep);
  padding: 2.5rem 2.25rem;
  box-shadow: 0 4px 20px rgba(47, 28, 20, 0.03);
}

.press-section h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.6rem;
  color: var(--cocoa);
  margin: 0 0 0.5rem;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 1.5rem !important;
}

.section-desc {
  font-size: 0.92rem;
  color: var(--cocoa-soft);
  margin: 0 0 2rem;
}

.section-intro {
  text-align: center;
  font-size: 0.95rem;
  color: var(--cocoa-soft);
  margin: -1rem 0 2rem;
}

/* ============ PITCH LAYOUTS ============ */
.pitch-group {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.pitch-item h3 {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--cocoa-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
}

.copy-box {
  background: var(--dough);
  border-left: 4px solid var(--raspberry);
  border-radius: 0 10px 10px 0;
  padding: 1.25rem 1.5rem;
}

.copy-box p {
  font-size: 0.98rem;
  line-height: 1.65;
  color: var(--ink);
  margin: 0;
}

/* ============ FACTS TABLE ============ */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid var(--dough-deep);
  overflow: hidden;
}

.facts-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.facts-table td {
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid var(--dough);
  font-size: 0.95rem;
  line-height: 1.5;
}

.facts-table tr:last-child td {
  border-bottom: none;
}

.facts-table tr td:first-child {
  width: 30%;
  color: var(--cocoa);
  background: rgba(246, 237, 224, 0.4);
}

.facts-table tr td:last-child {
  color: var(--ink);
}

.facts-table a {
  color: var(--raspberry);
  text-decoration: none;
  font-weight: 600;
}

.facts-table a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .facts-table tr {
    display: flex;
    flex-direction: column;
  }
  .facts-table tr td:first-child {
    width: 100%;
    padding-bottom: 0.4rem;
  }
  .facts-table tr td:last-child {
    padding-top: 0.4rem;
  }
}

/* ============ BRAND ASSETS PREVIEW ============ */
.assets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.asset-card {
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid var(--dough-deep);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.asset-preview {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-preview--dark {
  background: var(--cocoa);
}

.asset-preview--light {
  background: var(--dough);
}

.asset-preview--product {
  background: var(--dough-deep);
}

.placeholder-logo {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--dough);
}

.placeholder-logo--dark {
  color: var(--cocoa);
}

.placeholder-emoji {
  font-size: 2.25rem;
}

.asset-details {
  padding: 1rem;
  flex-grow: 1;
}

.asset-details h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--cocoa);
  margin: 0 0 0.25rem;
}

.asset-details p {
  font-size: 0.8rem;
  color: var(--cocoa-soft);
  margin: 0;
}

@media (max-width: 760px) {
  .assets-grid {
    grid-template-columns: 1fr;
  }
}

/* ============ MEDIA CONTACT FOOTER ============ */
.press-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2.5rem;
  border-top: 1px dashed var(--dough-deep);
}

.contact-box h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.4rem;
  color: var(--cocoa);
  margin: 0 0 0.5rem;
}

.contact-box p {
  font-size: 0.98rem;
  line-height: 1.5;
  color: var(--cocoa-soft);
  max-width: 48ch;
  margin: 0 auto 1.5rem;
}

.press-email {
  font-family: 'Fraunces', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--raspberry);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.15s ease;
}

.press-email:hover {
  border-color: var(--raspberry);
}
</style>

