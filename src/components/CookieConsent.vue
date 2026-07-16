<template>
  <Transition name="fade-slide">
    <div v-if="isVisible" class="cookie-banner" role="dialog" aria-live="polite">
      <div class="cookie-content">
        <div class="cookie-text">
          <span class="cookie-emoji">🍪</span>
          <div class="cookie-message">
            <h3>We Value Your Privacy</h3>
            <p>
              We use cookies to sweeten your browsing experience, analyze site traffic, and ensure our checkout flows smoothly. By clicking "Accept", you agree to our platform's <strong>Privacy Policy</strong>.
            </p>
          </div>
        </div>
        <div class="cookie-actions">
          <button @click="acceptCookies" class="btn btn-cookie-accept">Accept All</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('cookie_consent_accepted')
  if (!consent) {
    setTimeout(() => {
      isVisible.value = true
    }, 1500)
  }
})

const acceptCookies = () => {
  localStorage.setItem('cookie_consent_accepted', 'true')
  isVisible.value = false
}
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: min(720px, 92%); /* Larger, more prominent design */
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(106, 27, 154, 0.15);
  border: 1px solid rgba(106, 27, 154, 0.15);
  padding: 24px 32px; /* Increased padding for breathing room */
  z-index: 1000;
}

.cookie-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.cookie-text {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.cookie-emoji {
  font-size: 2.5rem; /* Larger emoji */
  line-height: 1;
}

.cookie-message h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary-dark);
  margin-bottom: 6px;
}

.cookie-message p {
  color: var(--text-dark);
  font-size: 0.98rem; /* Highly readable, larger text */
  line-height: 1.5;
}

/* Bold formatting for policy reference */
.cookie-message strong {
  color: var(--primary);
  font-weight: 700;
}

.btn-cookie-accept {
  background: var(--primary);
  color: white;
  font-size: 1rem;
  padding: 12px 28px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(106, 27, 154, 0.2);
}

.btn-cookie-accept:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 27, 154, 0.3);
}

/* Transition Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, 40px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 30px);
}

@media (max-width: 768px) {
  .cookie-banner {
    padding: 20px;
  }
  
  .cookie-content {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .cookie-text {
    gap: 14px;
  }
  
  .btn-cookie-accept {
    width: 100%;
    padding: 14px;
  }
}
</style>

