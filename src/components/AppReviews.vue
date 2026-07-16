<template>
  <section>
    <div class="section-header">
      <h2>Customer Reviews</h2>
      <p>Read true experiences from users who made their celebrations perfect.</p>
    </div>
    <div class="grid">
      <div v-for="(review, index) in reviews" :key="index" class="card">
        <div class="rating">{{ review.stars }}</div>
        <p>"{{ review.comment }}"</p>
        <span class="reviewer">{{ review.author }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const reviews = ref([
  { stars: '★★★★★', comment: 'The custom cake arrived exactly as specified in the mock-up upload tool! Delivery was perfectly on time.', author: '— Amanda K., Nairobi' },
  { stars: '★★★★★', comment: 'Wonderful bouquets. The option to bundle party balloons directly with the floral order is incredibly smart.', author: '— Michael T., Kisumu' },
  { stars: '★★★★★', comment: 'Fantastic customer service! I updated the drop-off time through the app messaging panel instantly.', author: '— Grace M., Mombasa' }
])
</script>

<style scoped>
.rating {
  color: #ffb300;
  margin-bottom: 10px;
  font-size: 1.1rem;
}
.reviewer {
  font-weight: 700;
  margin-top: 15px;
  font-size: 0.9rem;
  display: block;
  color: var(--primary-dark);
}
</style>

