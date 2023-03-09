import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Sensors from '../views/Sensors.vue'
import Launch from '../views/Launch.vue'
import Menu from '../views/Menu.vue'

const routes = [
  {
    path: '/home/:role',
    name: 'home',
    component: Home
  },
  {
    path: '/sensors/:role',
    name: 'sensors',
    component: Sensors
  },
  {
    path: '/launch/:role',
    name: 'launch',
    component: Launch
  },
  {
    path: '/menu',
    name: 'menu',
    component: Menu
  },

  //redirect
  {
    path: '/',
    redirect: '/menu'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
