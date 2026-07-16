<template>
  <section id="features">
    <div class="section-header">
      <h2>What You Can Do</h2>
      <p>Your ultimate platform for celebrating milestones. All features built for convenience.</p>
    </div>
    <div class="grid">
      <div v-for="service in services" :key="service.title" class="card">
        <div class="icon-wrapper">{{ service.icon }}</div>
        <h3>{{ service.title }}</h3>
        <p>{{ service.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const services = ref([
  { icon: '🎂', title: 'Order Cakes', desc: 'Browse signature ready-made cakes or place customized order requests with premium bakeries.' },
  { icon: '💐', title: 'Buy Flowers', desc: 'Order fresh roses, tulips, and seasonal arrangements directly from local florists.' },
  { icon: '🎉', title: 'Party Supplies', desc: 'One-stop solution for candles, balloons, party plates, banner backdrops, and decorations.' },
  { icon: '🧑‍🍳', title: 'Discover Local Bakers', desc: 'Support talented creators in your neighborhood. Discover local baking talents with high ratings.' }
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

