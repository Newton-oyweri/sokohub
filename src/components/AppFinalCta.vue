<template>
  <section class="final-cta">
    <h2>Ready to make every celebration special?</h2>
    <p>Install our app now to order custom items, schedule surprise drop-offs, and elevate your special dates.</p>
    <a href="#download" class="btn btn-light">Download WonderBakes</a>
  </section>
</template>

<style scoped>
.final-cta {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border-radius: var(--radius-lg);
  padding: 80px 40px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(106, 27, 154, 0.25);
}

.final-cta h2 {
  color: white;
  font-size: 2.8rem;
  margin-bottom: 20px;
}

.final-cta p {
  max-width: 600px;
  margin: 0 auto 35px auto;
  font-size: 1.15rem;
  opacity: 0.9;
}

.final-cta .btn-light {
  background: white;
  color: var(--primary-dark);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.final-cta .btn-light:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

@media(max-width: 580px) {
  .final-cta h2 {
    font-size: 2rem;
  }
}
</style>

