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
    question: "How do I track my order delivery in real-time?",
    answer: "Once your seller accepts and packages your celebration order, your dynamic tracker will show you active rider details with continuous GPS coordinate markers inside the WonderBakes app."
  },
  {
    question: "Can I order custom cake designs?",
    answer: "Yes! You can connect with registered bakeries on the app, upload reference custom images, detail weight specifications, and request personalized flavor mixtures directly."
  },
  {
    question: "Which areas do you deliver to?",
    answer: "We currently support delivery logistics across Nairobi, Mombasa, Kisumu, Nakuru, and their immediate metropolitan areas. Stay tuned as we scale locations!"
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

