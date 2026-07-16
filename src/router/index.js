import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import SellerTerms from '../pages/SellerTerms.vue'
 import PrivacyPolicy from '../pages/PrivacyPolicy.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/seller-terms',
      name: 'SellerTerms',
      component: SellerTerms,
    },
    {
      path: '/privacy-policy',
      name: 'PrivacyPolicy',
      component: PrivacyPolicy,
    } 
  ],
})

export default router
