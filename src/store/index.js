import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

const vuexPersist = new VuexPersist({
  key: process.env.VUE_APP_PERSIST_KEY,
  storage: window.localStorage
})

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    token: null,
    appDrawer: false,
    darkTheme: false,
    workers: [],
    vehicles: [],
    liquids: [],
    using: []
  },
  mutations: {
    SET_USER (state, user) {
      state.user = user
    },
    SET_TOKEN (state, token) {
      state.token = token
    },
    SET_APP_DRAWER (state, value) {
      state.appDrawer = value
    },
    SET_DARK_THEME (state, value) {
      state.darkTheme = value
    },
    SET_WORKERS (state, workers) {
      state.workers = workers
    },
    SET_VEHICLES (state, vehicles) {
      state.vehicles = vehicles
    },
    SET_LIQUIDS (state, liquids) {
      state.liquids = liquids
    },
    SET_USING (state, using) {
      state.using = using
    }
  },
  getters: {
    getUser: state => {
      return state.user
    },
    getToken: state => {
      return state.token
    },
    getAppDrawer: state => {
      return state.appDrawer
    },
    getDarkTheme: state => {
      return state.darkTheme
    },
    getUserEmployee: state => {
      if (state.user != null) return state.user.employee
      return null
    },
    getWorkers: state => {
      return state.workers
    },
    getVehicles: state => {
      return state.vehicles
    },
    getLiquids: state => {
      return state.liquids
    },
    getUsing: state => {
      return state.using
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [vuexPersist.plugin]
})
