<template>
  <section id="download" class="download-app">
    <div class="download-card">
      <div>
        <h2 style="font-size: 2rem; margin-bottom: 15px;">Get the App</h2>
        <p style="color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">
          Download the official WonderBakes app to unlock live order tracking, access exclusive merchant deals, and build customizable gift boxes in a few taps.
        </p>
        
        <div class="download-badge-area">
          <a href="#" class="android-badge-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,3.14V20.86c0,0.5,0.3,0.8,0.7,0.8a0.6,0.6,0,0,0,.4-0.1L18,13.25a1.5,1.5,0,0,0,0-2.5L6.1,3.24a0.6,0.6,0,0,0-.4-0.1C5.3,3.14,5,3.44,5,3.14Z"/>
            </svg>
            <span>
              <span class="small">GET IT ON</span>
              <span class="big">Google Play</span>
            </span>
          </a>
        </div>
      </div>

      <div class="qr-box-wrapper">
        <div class="qr-code">
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="var(--primary-dark)">
            <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" stroke-width="6"/>
            <rect x="12" y="12" width="11" height="11"/>
            <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" stroke-width="6"/>
            <rect x="77" y="12" width="11" height="11"/>
            <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" stroke-width="6"/>
            <rect x="12" y="77" width="11" height="11"/>
            <rect x="45" y="45" width="10" height="10"/>
            <rect x="45" y="15" width="15" height="5"/>
            <rect x="45" y="25" width="5" height="15"/>
            <rect x="75" y="45" width="10" height="20"/>
            <rect x="60" y="75" width="20" height="10"/>
          </svg>
        </div>
        <div class="qr-info">
          <strong>Scan to Download</strong>
          <p>Open your mobile camera to scan the instant QR code</p>
          <span class="version">Version 2.4.1 (Stable)</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.download-app {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 50px;
  box-shadow: var(--shadow-soft);
}

.download-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.download-badge-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.android-badge-btn {
  display: flex;
  align-items: center;
  background: #000;
  color: #fff;
  border-radius: 12px;
  padding: 12px 24px;
  text-decoration: none;
  width: fit-content;
}

.android-badge-btn span {
  margin-left: 12px;
}

.android-badge-btn .small {
  font-size: 0.75rem;
  display: block;
  color: #aaa;
}

.android-badge-btn .big {
  font-size: 1.15rem;
  font-weight: bold;
}

.qr-box-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--primary-light);
  padding: 24px;
  border-radius: var(--radius-md);
}

.qr-code {
  background: white;
  width: 110px;
  height: 110px;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e1bee7;
}

.qr-info {
  font-size: 0.95rem;
  color: var(--primary-dark);
}

.qr-info .version {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 5px;
}

@media(max-width: 968px) {
  .download-card {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .download-badge-area {
    align-items: center;
  }
  .qr-box-wrapper {
    justify-content: center;
  }
}
</style>

