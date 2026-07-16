<template>
  <section class="seller-cta" :class="{ 'form-active': isRegistering }">

    <!-- STATE 1: The Call to Action (CTA) -->
    <div v-if="!isRegistering" class="cta-content">
      <h2>Become a Seller</h2>
      <p>Are you a local baker, florist, or party supply store owner? Expand your market reach, handle secure payments seamlessly, and scale your local business brand.</p>
      <button @click="isRegistering = true" class="btn btn-primary">Start Selling on WonderBakes</button>
    </div>

    <!-- STATE 2: The Onboarding Form (Inside the same Card) -->
    <div v-else class="form-content">
      <div class="form-header">
        <h3>Seller Application</h3>
        <span class="step-indicator">Step {{ currentStep }} of 3</span>
      </div>

      <!-- Submission success message -->
      <div v-if="submitSuccess" class="success-box">
        <div class="success-icon">✓</div>
        <h4>Application Received!</h4>
        <p>Thank you for applying to partner with WonderBakes. Your submission has been successfully transmitted to our onboarding queue.</p>
        <p class="callback-notice">Our compliance and account management team will review your credentials and call you back on your provided phone number <strong>within one business day</strong>.</p>
        <button class="btn btn-secondary" @click="resetForm">Close</button>
      </div>

      <form v-else @submit.prevent="submitForm">

        <!-- Submission error -->
        <div v-if="submitError" class="error-box">
          {{ submitError }}
        </div>

        <!-- STEP 1: Mandatory Legal & Compliance Gate -->
        <div v-if="currentStep === 1" class="step-fields">
          <div class="gate-notice">
            <h4>Review Terms & Privacy</h4>
            <p>To maintain a safe, trusted ecosystem for buyers and artisans, all prospective merchants are required to review and accept our baseline legal policies before beginning the application process.</p>
          </div>
          
          <div class="agreement-box gate-agreements">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreedTerms" />
              <span>I have read and agree to the binding <router-link to="/seller-terms" target="_blank">Seller Terms and Conditions</router-link> *</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreedPrivacy" />
              <span>I have read and agree to the <router-link to="/privacy-policy" target="_blank">Privacy Policy</router-link> regarding my data *</span>
            </label>
          </div>
        </div>

        <!-- STEP 2: Basic & Business Info -->
        <div v-if="currentStep === 2" class="step-fields">
          <div class="form-row">
            <div class="form-group">
              <label for="businessName">Business Name *</label>
              <input type="text" id="businessName" v-model="form.businessName" required placeholder="e.g., Sweet Delights Bakery" />
            </div>
            <div class="form-group">
              <label for="ownerName">Owner's Name *</label>
              <input type="text" id="ownerName" v-model="form.ownerName" required placeholder="John Doe" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Phone Number *</label>
              <input type="tel" id="phone" v-model="form.phone" required placeholder="e.g., 0712345678" />
            </div>
            <div class="form-group">
              <label for="email">Email Address (Optional)</label>
              <input type="email" id="email" v-model="form.email" placeholder="owner@example.com" />
            </div>
          </div>

          <div class="form-group">
            <label for="businessType">Business Type *</label>
            <select id="businessType" v-model="form.businessType" required>
              <option value="" disabled selected>Select business type</option>
              <option value="bakery">Bakery</option>
              <option value="flower_shop">Flower Shop</option>
              <option value="gift_shop">Gift Shop</option>
              <option value="party_supplies">Party Supplies</option>
              <option value="home_baker">Home Baker</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <!-- STEP 3: Location, ID, Payments & Description -->
        <div v-if="currentStep === 3" class="step-fields">
          <div class="form-row">
            <div class="form-group">
              <label for="county">County/City *</label>
              <input type="text" id="county" v-model="form.county" required placeholder="e.g., Nairobi" />
            </div>
            <div class="form-group">
              <label for="nationalId">National ID Number *</label>
              <input type="text" id="nationalId" v-model="form.nationalId" required placeholder="12345678" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="address">Address / Landmark *</label>
              <input type="text" id="address" v-model="form.address" required placeholder="e.g., Green House Mall, Ngong Rd" />
            </div>
            <div class="form-group">
              <label for="pickupLocation">Pickup Location (Optional)</label>
              <input type="text" id="pickupLocation" v-model="form.pickupLocation" placeholder="Where riders will pick orders" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="mpesaNumber">M-Pesa Payout Number *</label>
              <input type="tel" id="mpesaNumber" v-model="form.mpesaNumber" required placeholder="0712345678" />
            </div>
            <div class="form-group">
              <label for="accountName">M-Pesa Registered Name *</label>
              <input type="text" id="accountName" v-model="form.accountName" required placeholder="e.g., John Doe" />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Short Bio / Description (Optional)</label>
            <textarea id="description" v-model="form.description" rows="2" placeholder="Tell customers about your shop..."></textarea>
          </div>
        </div>

        <!-- Navigation Actions -->
        <div class="form-actions">
          <button type="button" @click="goBack" class="btn btn-secondary" :disabled="isSubmitting">
            {{ currentStep === 1 ? 'Cancel' : 'Back' }}
          </button>

          <button type="button" v-if="currentStep === 1" :disabled="!isGatePassed" @click="currentStep = 2" class="btn btn-primary ml-auto">
            Next Step
          </button>

          <button type="button" v-if="currentStep === 2" @click="currentStep = 3" class="btn btn-primary ml-auto">
            Next Step
          </button>

          <button type="submit" v-if="currentStep === 3" :disabled="isSubmitting" class="btn btn-success ml-auto">
            {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </form>
    </div>

  </section>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { supabase } from '../utils/supabaseClient'

const STORAGE_KEY = 'sellerApplicationDraft'

const isRegistering = ref(false)
const currentStep = ref(1)
const isSubmitting = ref(false)
const submitError = ref(null)
const submitSuccess = ref(false)

const form = reactive({
  businessName: '',
  ownerName: '',
  phone: '',
  email: '',
  businessType: '',
  county: '',
  address: '',
  pickupLocation: '',
  nationalId: '',
  mpesaNumber: '',
  accountName: '',
  description: '',
  agreedTerms: false,
  agreedPrivacy: false
})

// Check if they completed the legal step requirements
const isGatePassed = computed(() => {
  return form.agreedTerms && form.agreedPrivacy
})

// Restore working draft states
onMounted(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(form, parsed.form)
      currentStep.value = parsed.currentStep || 1
      isRegistering.value = true
    } catch (err) {
      console.error('Failed to restore seller form draft:', err)
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }
})

// Auto-save changes 
watch(
  [form, currentStep],
  () => {
    if (isRegistering.value && !submitSuccess.value) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ form, currentStep: currentStep.value })
      )
    }
  },
  { deep: true }
)

const clearDraft = () => {
  sessionStorage.removeItem(STORAGE_KEY)
}

const goBack = () => {
  if (currentStep.value === 1) {
    isRegistering.value = false
    clearDraft()
  } else {
    currentStep.value -= 1
  }
}

const submitForm = async () => {
  if (!isGatePassed.value || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = null

  try {
    const { error } = await supabase.from('seller_requests').insert({
      business_name: form.businessName,
      owner_name: form.ownerName,
      phone: form.phone,
      email: form.email || null,
      business_type: form.businessType,
      county: form.county,
      address: form.address,
      pickup_location: form.pickupLocation || null,
      national_id: form.nationalId,
      mpesa_number: form.mpesaNumber,
      account_name: form.accountName,
      description: form.description || null,
      status: 'pending'
    })

    if (error) throw error

    submitSuccess.value = true
    clearDraft()
  } catch (err) {
    console.error('Error submitting seller request:', err.message)
    submitError.value = 'Something went wrong submitting your application. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  isRegistering.value = false
  currentStep.value = 1
  submitSuccess.value = false
  submitError.value = null

  form.businessName = ''
  form.ownerName = ''
  form.phone = ''
  form.email = ''
  form.businessType = ''
  form.county = ''
  form.address = ''
  form.pickupLocation = ''
  form.nationalId = ''
  form.mpesaNumber = ''
  form.accountName = ''
  form.description = ''
  form.agreedTerms = false
  form.agreedPrivacy = false

  clearDraft()
}
</script>

<style scoped>
.seller-cta {
  background: #fdf6ff;
  border: 2px dashed #9c27b0;
  border-radius: var(--radius-lg, 12px);
  padding: 50px;
  text-align: center;
  transition: all 0.3s ease-in-out;
  max-width: 700px;
  margin: 0 auto;
}

.seller-cta.form-active {
  background: #ffffff;
  border-style: solid;
  border-color: #e1bee7;
  padding: 35px;
  text-align: left;
  box-shadow: 0 8px 24px rgba(156, 39, 176, 0.08);
}

.seller-cta h2 {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #333;
}

.seller-cta p {
  color: var(--text-muted, #666);
  max-width: 600px;
  margin: 0 auto 25px auto;
  line-height: 1.6;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #f3e5f5;
  padding-bottom: 12px;
  margin-bottom: 25px;
}

.form-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #4a148c;
}

.step-indicator {
  font-size: 0.85rem;
  background: #f3e5f5;
  color: #9c27b0;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
}

.gate-notice {
  margin-bottom: 20px;
  background: #fcf8ff;
  padding: 15px;
  border-left: 4px solid #9c27b0;
  border-radius: 0 6px 6px 0;
}

.gate-notice h4 {
  margin: 0 0 6px 0;
  color: #4a148c;
  font-size: 1rem;
}

.gate-notice p {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  text-align: left;
}

.gate-agreements {
  border: 1px solid #e1bee7 !important;
  background: #fffbfb !important;
  padding: 20px !important;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 500px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #444;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #9c27b0;
}

.agreement-box {
  background: #fafafa;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  border: 1px solid #eee;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #444;
}

.checkbox-label:last-child {
  margin-bottom: 0;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #9c27b0;
  cursor: pointer;
}

.error-box {
  background: #fdecea;
  color: #b71c1c;
  border: 1px solid #f5c6cb;
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 0.85rem;
}

.success-box {
  text-align: center;
  padding: 30px 10px;
}

.success-icon {
  font-size: 3rem;
  color: #2e7d32;
  margin-bottom: 15px;
}

.success-box h4 {
  font-size: 1.5rem;
  color: #2e7d32;
  margin: 0 0 12px 0;
}

.success-box p {
  color: #333;
  font-size: 1rem;
  margin-bottom: 12px;
}

.success-box .callback-notice {
  font-size: 0.95rem;
  color: #555;
  background: #edf7ed;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #c8e6c9;
  margin: 20px 0;
}

.form-actions {
  display: flex;
  margin-top: 25px;
  gap: 15px;
}

.ml-auto {
  margin-left: auto;
}

.btn {
  padding: 11px 22px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-primary {
  background: #9c27b0;
  color: white;
}

.btn-primary:hover {
  background: #7b1fa2;
}

.btn-secondary {
  background: #f1f1f1;
  color: #444;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-success {
  background: #2e7d32;
  color: white;
}

.btn-success:hover {
  background: #1b5e20;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

