<template>
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3>🎂 WonderBakes</h3>
          <p>Bringing quality local bakeries and premium floral artisans directly to your neighborhood. Fresh memories are just one click away.</p>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press Kit</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Merchant Rules</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Support</a></li>
            <li><a href="#">Social Media Links</a></li>
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

