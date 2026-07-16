<template>
  <section class="hero">
    <div class="hero-wrapper">
      <div class="hero-content">
        <h1>🎂 Celebrate in Style with <span>WonderBakes</span></h1>
        <p>
          From beautiful artisanal custom cakes and fresh hand-tied bouquets to curated party supplies. Order from the best local bakeries right to your door.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn btn-primary">Download Now</a>
          <a href="#features" class="btn btn-secondary">Learn More</a>
        </div>
      </div>
      <div class="hero-mockup">
        <div class="phone-wrapper">
          <div class="phone-screen">
            <div class="phone-header"></div>
            <div class="phone-card">
              <div class="phone-img"></div>
              <div class="phone-line" style="width: 80%;"></div>
              <div class="phone-line" style="width: 50%;"></div>
            </div>
            <div class="phone-card">
              <div class="phone-img" style="height: 60px;"></div>
              <div class="phone-line" style="width: 70%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-wrapper {
  background: white;
  border-radius: var(--radius-lg);
  padding: 60px;
  box-shadow: var(--shadow-soft);
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  align-items: center;
  margin-top: 40px;
}

.hero-content h1 {
  font-size: 3.5rem;
  line-height: 1.15;
  margin-bottom: 20px;
}

.hero-content h1 span {
  color: var(--accent);
}

.hero-content p {
  font-size: 1.15rem;
  color: var(--text-muted);
  margin-bottom: 30px;
  max-width: 550px;
}

.hero-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.hero-mockup {
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-wrapper {
  background: #111;
  border: 12px solid #2a2a2a;
  border-radius: 40px;
  width: 280px;
  height: 520px;
  position: relative;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  overflow: hidden;
}

.phone-screen {
  background: var(--bg-light);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.phone-header {
  height: 25px;
  background: var(--primary);
  border-radius: 6px;
  margin-bottom: 15px;
}

.phone-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.phone-img {
  height: 120px;
  background: #eae9f2;
  border-radius: 8px;
  margin-bottom: 10px;
}

.phone-line {
  height: 10px;
  background: #e2e2ea;
  border-radius: 4px;
  margin-bottom: 6px;
}

@media(max-width: 968px) {
  .hero-wrapper {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 40px 30px;
  }
  .hero-content h1 {
    font-size: 2.8rem;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-mockup {
    display: none;
  }
}
</style>

