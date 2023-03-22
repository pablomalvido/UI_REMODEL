import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Sensors from '../views/Sensors.vue'
import Launch from '../views/Launch.vue'
import Menu from '../views/Menu.vue'
import Contact from '../views/Contact.vue'
import Config from '../views/Config.vue'  
import Alarms from '../views/Alarms.vue'

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
    path: '/alarms/:role',
    name: 'alarms',
    component: Alarms
  },
  {
    path: '/launch/:role',
    name: 'launch',
    component: Launch
  },
  {
    path: '/config/:role',
    name: 'config',
    component: Config
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact
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
