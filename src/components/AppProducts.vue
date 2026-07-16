<template>
  <section>
    <div class="section-header">
      <h2>Featured Products</h2>
      <p>Fresh choices ordered by hundreds of celebrants today.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="status-msg">
      Loading amazing products...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="status-msg error">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="status-msg">
      No products featured right now. Check back soon!
    </div>

    <!-- Products Grid -->
    <div v-else class="grid">
      <div v-for="product in products" :key="product.id" class="card">
        <!-- Show image if it exists in the array, otherwise fallback to placeholder -->
        <div class="image-container">
          <img 
            v-if="product.image_urls && product.image_urls.length > 0" 
            :src="product.image_urls[0]" 
            :alt="product.name" 
            class="product-img"
          />
          <div v-else class="image-placeholder">
            No image available
          </div>
        </div>
        
        <h3>{{ product.name }}</h3>
        
        <!-- Graceful Description Fallback -->
        <p class="description">
          {{ product.description || "Premium quality item, hand-prepared fresh on order." }}
        </p>

        <span class="price">KSh {{ formatPrice(product.price) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../utils/supabaseClient'

const products = ref([])
const loading = ref(true)
const error = ref(null)

// Format price cleanly
const formatPrice = (value) => {
  return Number(value).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Fisher-Yates Shuffle Algorithm to randomize the product array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Fetch active products
    const { data, error: supabaseError } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .limit(20) // Fetch up to 20 products to select a random batch from

    if (supabaseError) throw supabaseError

    // Shuffle the items and take the first 6
    const randomized = shuffleArray([...data])
    products.value = randomized.slice(0, 6)

  } catch (err) {
    console.error('Error loading products:', err.message)
    error.value = 'Failed to load products. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.status-msg {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 1.1rem;
}
.error {
  color: #e53e3e;
}
.image-container {
  height: 200px;
  background: #eae9f0;
  border-radius: 12px;
  margin-bottom: 18px;
  overflow: hidden;
}
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.description {
  min-height: 48px; /* Keeps card heights consistent even with varied descriptions */
  font-style: v-bind('!product?.description ? "italic" : "normal"');
}
.price {
  font-weight: 700;
  color: var(--accent);
  font-size: 1.2rem;
  margin-top: 8px;
  display: block;
}
</style>

