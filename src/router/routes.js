
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/scanner', component: () => import('pages/Barcode.vue') },
      { path: '/disposal', component: () => import('pages/Index.vue') },
      { path: '/card-reader', component: () => import('pages/Index.vue') },
      { path: '', component: () => import('pages/Index.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
