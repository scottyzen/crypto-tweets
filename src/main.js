import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import './index.css';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/index.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('./views/about.vue'),
    },
  ],
});

createApp(App).use(router).mount('#app');
