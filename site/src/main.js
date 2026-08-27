import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ProjectView from './views/ProjectView.vue'
import ProfileView from './views/ProfileView.vue'
import StoreView from './views/StoreView.vue'
import './style.css'

const routes = [
  { path: '/', component: HomeView },
  { path: '/:owner/:repo/issues/:number', component: ProjectView },
  { path: '/:owner/:repo/pull/:number', component: StoreView },
  { path: '/:login', component: ProfileView }
]

const router = createRouter({ history: createWebHistory(), routes })
createApp(App).use(router).mount('#app')
