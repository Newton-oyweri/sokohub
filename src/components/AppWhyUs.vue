<template>
  <section>
    <div class="section-header">
      <h2>Why WonderBakes</h2>
      <p>Designed with absolute peace of mind, prioritizing swift timelines and high security.</p>
    </div>
    <div class="grid">
      <div v-for="benefit in benefits" :key="benefit.title" class="card">
        <div class="icon-wrapper">{{ benefit.icon }}</div>
        <h3>{{ benefit.title }}</h3>
        <p>{{ benefit.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const benefits = ref([
  { icon: '⚡', title: 'Fast Delivery', desc: 'With real-time courier coordination, we keep deliveries precise and fresh to your doorstep.' },
  { icon: '🛡️', title: 'Trusted Sellers', desc: 'Every single baker and artisan store goes through an onboarding health and hygiene vetting checklist.' },
  { icon: '💳', title: 'Secure Payments', desc: 'Fully compliant checkout channels including major mobile payment options (e.g. M-Pesa) & cards.' },
  { icon: '📍', title: 'Real-time Tracking', desc: 'Watch your celebratory cake journey dynamically from the baker\'s oven right to your venue.' }
])
</script>

<style scoped>
.icon-wrapper {
  background: var(--primary-light);
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: var(--primary);
  font-size: 1.5rem;
}
</style>

