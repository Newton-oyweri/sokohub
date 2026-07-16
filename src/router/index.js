import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import SellerTerms from '../pages/SellerTerms.vue'
 import PrivacyPolicy from '../pages/PrivacyPolicy.vue'
import Careers from '../pages/Careers.vue'
import Media from '../pages/Media.vue'
import Help from '../pages/Help.vue'
import About from '../pages/About.vue'
import Press from '../pages/Presskit.vue'
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
    },
  {
      path: '/careers',
      name: 'career',
      component: Careers
    },
    {
          path: '/media',
        name: 'media',
      component: Media
    },
    {

          path: '/help',
       name: 'help center',
      component: Help
    },
    {

            path: '/about',
         name: 'about us',
      component: About
    },
    {


          path: '/press',
        name: 'press kit',
      component: Press
    }
  ],
})

export default router
