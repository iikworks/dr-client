import Vue from 'vue'
import VueRouter from 'vue-router'
import guest from '../middlewares/guest'
import developer from '../middlewares/developer'
import middlewarePipeline from './middlewarePipeline'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  }, {
    path: '/stats/:id',
    name: 'Stats',
    component: () => import('../views/Stats.vue')
  }, {
    path: '/numbers',
    name: 'Numbers',
    component: () => import('../views/Numbers.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Auth/Login.vue'),
    meta: {
      middleware: [
        guest
      ]
    }
  }, {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Auth/Register.vue'),
    meta: {
      middleware: [
        guest
      ]
    }
  }, {
    path: '/liquids',
    name: 'Liquids',
    component: () => import('../views/Liquids/List.vue'),
  }, {
    path: '/liquids/create',
    name: 'LiquidsCreate',
    component: () => import('../views/Liquids/Create.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/liquids/:id/edit',
    name: 'LiquidsEdit',
    component: () => import('../views/Liquids/Edit.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/vehicles',
    name: 'Vehicles',
    component: () => import('../views/Vehicles/List.vue'),
  }, {
    path: '/vehicles/create',
    name: 'VehiclesCreate',
    component: () => import('../views/Vehicles/Create.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/vehicles/:id/edit',
    name: 'VehiclesEdit',
    component: () => import('../views/Vehicles/Edit.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/workers',
    name: 'Workers',
    component: () => import('../views/Workers/List.vue'),
  }, {
    path: '/workers/create',
    name: 'WorkersCreate',
    component: () => import('../views/Workers/Create.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/workers/:id/edit',
    name: 'WorkersEdit',
    component: () => import('../views/Workers/Edit.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/incoming',
    name: 'Incoming',
    component: () => import('../views/Incoming/List.vue'),
  }, {
    path: '/incoming/create',
    name: 'IncomingCreate',
    component: () => import('../views/Incoming/Create.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/incoming/:id/edit',
    name: 'IncomingEdit',
    component: () => import('../views/Incoming/Edit.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/expenses',
    name: 'Expenses',
    component: () => import('../views/Expenses/List.vue'),
  }, {
    path: '/expenses/create',
    name: 'ExpensesCreate',
    component: () => import('../views/Expenses/Create.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/expenses/:id/edit',
    name: 'ExpensesEdit',
    component: () => import('../views/Expenses/Edit.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/admin/homestats',
    name: 'PanelHomeStatsList',
    component: () => import('../views/Panel/HomeStats/List.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/admin/homestats/create',
    name: 'PanelHomeStatsCreate',
    component: () => import('../views/Panel/HomeStats/Create.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/admin/homestats/:id',
    name: 'PanelHomeStatsEdit',
    component: () => import('../views/Panel/HomeStats/Edit.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/admin',
    name: 'PanelHome',
    component: () => import('../views/Panel/Home.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/admin/invites',
    name: 'PanelInvites',
    component: () => import('../views/Panel/Invites.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/admin/news/create',
    name: 'PanelNewsCreate',
    component: () => import('../views/Panel/News/Create.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/users/:id',
    name: 'UsersView',
    component: () => import('../views/Users/View.vue')
  }, {
    path: '/news',
    name: 'News',
    component: () => import('../views/Posts/List.vue')
  }, {
    path: '/news/create',
    name: 'NewsCreate',
    component: () => import('../views/Posts/Create.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  }, {
    path: '/news/:id/edit',
    name: 'NewsEdit',
    component: () => import('../views/Posts/Edit.vue'),
    meta: {
      middleware: [
        developer
      ]
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (!to.meta.middleware) {
    return next()
  }
  const middleware = to.meta.middleware
  const context = {
    to,
    from,
    next,
    store
  }

  return middleware[0]({
    ...context,
    next: middlewarePipeline(context, middleware, 1)
  })
})

export default router
