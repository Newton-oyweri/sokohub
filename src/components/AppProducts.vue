<template>
  <section>
    <div class="section-header">
      <h2>Featured Products</h2>
      <p>Fresh choices ordered by hundreds of celebrants today.</p>
    </div>
    <div class="grid">
      <div v-for="product in products" :key="product.title" class="card">
        <div class="image-placeholder">{{ product.placeholder }}</div>
        <h3>{{ product.title }}</h3>
        <p>{{ product.desc }}</p>
        <span class="price">{{ product.price }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const products = ref([
  { placeholder: 'Custom Cake Visual', title: 'Classic Chocolate Fudge', desc: 'Premium 1.5kg dark chocolate multi-layered sponge.', price: 'KSh 2,500' },
  { placeholder: 'Flower Arrangement Visual', title: 'The Velvet Rose Bouquet', desc: '12 hand-picked Red Roses layered with fine foliage.', price: 'KSh 1,800' },
  { placeholder: 'Party Essentials Pack Visual', title: 'Complete Birthday Set', desc: 'Balloons, banner, crown, and gold-foiled candles.', price: 'KSh 3,200' }
])
</script>

<style scoped>
.image-placeholder {
  height: 200px;
  background: #eae9f0;
  border-radius: 12px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.price {
  font-weight: 700;
  color: var(--accent);
  font-size: 1.2rem;
  margin-top: 8px;
  display: block;
}
</style>

