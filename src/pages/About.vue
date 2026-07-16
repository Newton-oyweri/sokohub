<template>
  <div class="about-page">
    <div class="about-container">
      
      <!-- ============ HERO : The Vision ============ -->
      <header class="about-hero">
        <p class="eyebrow">Our Story</p>
        <h1 class="about-title">Baking the orders. Building the trust.</h1>
        <p class="about-lede">
          WonderBakes didn’t start in a sterile commercial kitchen. We started with a simple question: 
          <em>Why should a brilliant home baker in Kasarani struggle to reach a hungry customer in Kilimani?</em>
        </p>
      </header>

      <!-- ============ THE MISSION : Warm Split Section ============ -->
      <section class="mission-section">
        <div class="mission-card">
          <div class="mission-card__content">
            <h2>Fresh from the home oven, straight to your door</h2>
            <p>
              We believe the best cakes are baked by individuals, not factories. But coordinating delivery across Nairobi, managing M-Pesa tracking, and confirming orders over WhatsApp shouldn't take up a baker's precious kitchen time.
            </p>
            <p>
              <strong>wonderbakes.shop</strong> is the digital counter that makes local baking seamless. We handle the routing, secure the payments, coordinate the boda riders, and keep things simple so our bakers can focus on what they do best: whipping up perfection.
            </p>
          </div>
          <div class="mission-card__badge" aria-hidden="true">
            <div class="badge-icon">🧁</div>
            <span>Est. Nairobi</span>
          </div>
        </div>
      </section>

      <!-- ============ THE JOURNEY : Story Milestones ============ -->
      <section class="journey-section">
        <h2 class="section-title">Our Recipe for Success</h2>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-marker">01</div>
            <div class="timeline-content">
              <h3>Empowering Local Bakers</h3>
              <p>We provide home micro-bakers with a professional storefront, transforming passionate hobbies into sustainable, independent businesses.</p>
            </div>
          </div>

          <div class="timeline-item">
            <div class="timeline-marker">02</div>
            <div class="timeline-content">
              <h3>Obsessive Freshness</h3>
              <p>Our logistics are tuned to make sure cakes are delivered within hours of leaving the oven. No stale display cases here.</p>
            </div>
          </div>

          <div class="timeline-item">
            <div class="timeline-marker">03</div>
            <div class="timeline-content">
              <h3>Kenyan-First Tech</h3>
              <p>Built deliberately for how Nairobi moves. We integrate seamlessly with local payments, WhatsApp communication, and local boda routes.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ CORE VALUES : What Keeps Us Sweet ============ -->
      <section class="values-grid">
        <div class="value-box">
          <span class="value-box__icon">🤎</span>
          <h3>Deep Care</h3>
          <p>We treat every slice of cake and every M-Pesa confirmation like it's for our own family birthday.</p>
        </div>
        <div class="value-box">
          <span class="value-box__icon">⚡</span>
          <h3>Fast Delivery</h3>
          <p>Working alongside dependable boda networks to get the icing to you before it even thinks of melting.</p>
        </div>
        <div class="value-box">
          <span class="value-box__icon">💻</span>
          <h3>Simple Tech</h3>
          <p>Our platform stays out of the way. Ordering a custom cake is now as easy as sending a WhatsApp text.</p>
        </div>
      </section>

      <!-- ============ CTA : Wrap Up ============ -->
      <footer class="about-cta">
        <div class="cta-box">
          <h2>Ready to taste the difference?</h2>
          <p>Support a local Kenyan home baker and find your new favorite slice today.</p>
          <a href="https://wonderbakes.shop" class="btn btn--primary">Browse Today's Trays</a>
        </div>
      </footer>

    </div>
  </div>
</template>

<style scoped>
/* ============ BRAND SYSTEM THEME ============ */
.about-page {
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

.about-container {
  width: 100%;
  max-width: 800px;
}

/* ============ HERO ============ */
.about-hero {
  text-align: center;
  margin-bottom: 4rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--raspberry);
  margin: 0 0 0.75rem;
}

.about-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2.2rem, 6vw, 3.2rem);
  font-weight: 700;
  color: var(--cocoa);
  line-height: 1.15;
  margin: 0 0 1.5rem;
}

.about-lede {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--cocoa-soft);
  max-width: 58ch;
  margin: 0 auto;
}

.about-lede em {
  font-family: 'Fraunces', Georgia, serif;
  color: var(--raspberry-deep);
}

/* ============ MISSION CARD ============ */
.mission-section {
  margin-bottom: 4.5rem;
}

.mission-card {
  background: #fff;
  border-radius: 20px;
  border: 1.5px solid var(--dough-deep);
  padding: 3rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 3rem;
  box-shadow: 0 4px 20px rgba(47, 28, 20, 0.03);
}

.mission-card__content h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.6rem;
  color: var(--cocoa);
  margin: 0 0 1.25rem;
  line-height: 1.3;
}

.mission-card__content p {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--cocoa-soft);
  margin: 0 0 1.25rem;
}

.mission-card__content p:last-child {
  margin-bottom: 0;
}

.mission-card__badge {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: var(--dough);
  border: 2px dashed var(--raspberry);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.badge-icon {
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
}

.mission-card__badge span {
  font-family: 'Fraunces', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--cocoa);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 680px) {
  .mission-card {
    flex-direction: column-reverse;
    padding: 2.25rem 1.75rem;
    gap: 2rem;
  }
  .mission-card__badge {
    width: 110px;
    height: 110px;
  }
  .badge-icon {
    font-size: 2rem;
  }
}

/* ============ TIMELINE ============ */
.journey-section {
  margin-bottom: 4.5rem;
}

.section-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.8rem;
  color: var(--cocoa);
  margin-bottom: 2.5rem;
  text-align: center;
}

.timeline {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.timeline-item {
  background: var(--dough-deep);
  border-radius: 16px;
  padding: 1.75rem;
  position: relative;
}

.timeline-marker {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--raspberry);
  margin-bottom: 1rem;
  display: inline-block;
  border-bottom: 2px solid var(--raspberry);
  padding-bottom: 0.25rem;
}

.timeline-content h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.1rem;
  color: var(--cocoa);
  margin: 0 0 0.5rem;
}

.timeline-content p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--cocoa-soft);
  margin: 0;
}

@media (max-width: 760px) {
  .timeline {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

/* ============ VALUES GRID ============ */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 5rem;
}

.value-box {
  background: #fff;
  border: 1.5px solid var(--dough-deep);
  border-radius: 16px;
  padding: 1.75rem;
  text-align: center;
  transition: transform 0.15s ease;
}

.value-box:hover {
  transform: translateY(-3px);
}

.value-box__icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
}

.value-box h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.15rem;
  color: var(--cocoa);
  margin: 0 0 0.5rem;
}

.value-box p {
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--cocoa-soft);
  margin: 0;
}

@media (max-width: 760px) {
  .values-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* ============ CTA FOOTER ============ */
.about-cta {
  text-align: center;
}

.cta-box {
  background: var(--cocoa);
  color: var(--dough);
  border-radius: 24px;
  padding: 3.5rem 2rem;
  box-shadow: 0 10px 30px rgba(47, 28, 20, 0.15);
}

.cta-box h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  color: #fff;
  margin: 0 0 1rem;
}

.cta-box p {
  font-size: 1.05rem;
  color: #cdbfae;
  margin: 0 0 2rem;
  max-width: 44ch;
  margin-left: auto;
  margin-right: auto;
}

.btn {
  font-family: inherit;
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-block;
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
  filter: brightness(1.15);
}
</style>

