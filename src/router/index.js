import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Sensors from '../views/Sensors.vue'
import Launch from '../views/Launch.vue'

const routes = [
  {
    path: '/home',
    name: 'home',
    component: Home
  },
  {
    path: '/sensors',
    name: 'sensors',
    component: Sensors
  },
  {
    path: '/launch',
    name: 'launch',
    component: Launch
  },

  //redirect
  {
    path: '/',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
