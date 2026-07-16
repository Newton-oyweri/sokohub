<template>
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>🎂 WonderBakes</h3>
          <p>Bringing quality local bakeries and premium floral artisans directly to your neighborhood. Fresh memories are just one click away.</p>
        </div>
        
        <!-- Company Section -->
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><router-link to="/about">About Us</router-link></li>
            <li><router-link to="/careers">Careers</router-link></li>
            <li><router-link to="/press">Press Kit</router-link></li>
          </ul>
        </div>
        
        <!-- Legal Section -->
        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><router-link to="/privacy-policy">Privacy Policy</router-link></li>
            <li><router-link to="/seller-terms">Merchant Rules</router-link></li>
            <!-- Keeping as external or internal link fallback if you don't have a terms page yet -->
            <li><router-link to="/privacy-policy">Terms of Service</router-link></li>
          </ul>
        </div>
        
        <!-- Support Section -->
        <div class="footer-col">
          <h4>Support</h4>
          <ul>
            <li><router-link to="/help">Help Center</router-link></li>
            <li><router-link to="/media">Media Center</router-link></li>
            <li><a href="https://wa.me/yourphonenumber" target="_blank" rel="noopener">WhatsApp Support</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2026 WonderBakes. Beautiful moments delivered with care.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
footer {
  background: white;
  padding: 60px 0 40px 0;
  border-top: 1px solid #eaebf2;
  margin-top: 120px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 40px;
}

.footer-brand h3 {
  margin-bottom: 15px;
}

.footer-brand p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer-col h4 {
  color: var(--primary-dark);
  margin-bottom: 15px;
  font-size: 1rem;
}

.footer-col ul {
  list-style: none;
}

.footer-col ul li {
  margin-bottom: 10px;
}

/* Styled for both router-links (which render as anchors) and raw links */
.footer-col ul li a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.footer-col ul li a:hover {
  color: var(--primary);
}

.footer-bottom {
  border-top: 1px solid #eaebf2;
  padding-top: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

@media(max-width: 968px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media(max-width: 580px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>

