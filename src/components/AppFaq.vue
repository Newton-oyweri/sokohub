<template>
  <section>
    <div class="section-header">
      <h2>Frequently Asked Questions</h2>
      <p>Quick answers to our platform processes.</p>
    </div>
    
    <div class="faq-list">
      <div 
        v-for="(faq, index) in faqs" 
        :key="index" 
        class="faq-item"
        :class="{ active: activeIndex === index }"
      >
        <button class="faq-question" @click="toggleFaq(index)">
          {{ faq.question }}
        </button>
        <div class="faq-answer">
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const activeIndex = ref(null)

const faqs = ref([
  {
    question: "What is WonderBakes?",
    answer: "WonderBakes is a marketplace where you can discover and order cakes, flowers, gifts, party supplies, and other celebration essentials from trusted local sellers."
  },
  {
    question: "How do I place an order?",
    answer: "Browse products, choose your preferred item, add it to your cart, and complete checkout. Your order is then sent to the seller for confirmation and preparation."
  },
  {
    question: "Can I order a custom cake?",
    answer: "Yes. Many bakeries accept custom cake orders. Simply provide your preferred design, flavor, size, message, and any reference images during checkout."
  },
 {
  question: "How do deliveries work?",
  answer: "Choose your preferred delivery option during checkout. You can select a convenient pickup location, or we'll deliver directly to your specified address. For homes and hostels, our delivery partner can call you upon arrival or leave your order at your door if you've requested contactless delivery."
},
  {
    question: "Can I become a seller on WonderBakes?",
    answer: "Yes. If you own a bakery, flower shop, or celebration business, you can register as a seller, upload your products, receive orders, and grow your business through the platform."
  },
  {
    question: "What payment methods are supported?",
    answer: "WonderBakes supports secure digital payments. Available payment options may vary depending on your region and will be shown during checkout."
  }
])
const toggleFaq = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>

<style scoped>
.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: white;
  margin-bottom: 15px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.faq-question {
  width: 100%;
  text-align: left;
  padding: 22px;
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-dark);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-answer {
  padding: 0 22px 22px 22px;
  color: var(--text-muted);
  font-size: 0.95rem;
  display: none;
}

.faq-item.active .faq-answer {
  display: block;
}

.faq-item.active .faq-question::after {
  content: "−";
}

.faq-question::after {
  content: "+";
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--accent);
}
</style>

