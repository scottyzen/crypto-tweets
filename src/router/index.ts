import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    { path: '/', name: 'Home', component: () => import('../views/index.vue') },
    { path: '/about', name: 'About', component: () => import('../views/about.vue') },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router