import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import numeral from 'numeral'
import CripLoading from 'crip-vue-loading'
import axios from 'axios'
import './assets/style.css'
import mixin from '@/mixin'

Vue.config.productionTip = false

export const eventBus = new Vue()

Vue.filter('formatNumber', value => {
    return numeral(value).format('0,0.00').replaceAll(',', ' ').replaceAll('.', ',')
})

Vue.filter('displayGonvNumber', value => {
  if (value == null) return '—'

  let strValue = ''
  if (value >= 1 && value <= 9) strValue = `000${value}`
  else if (value >= 10 && value <= 99) strValue = `00${value}`
  else if (value >= 100 && value <= 999) strValue = `0${value}`
  else strValue = `${value}`

  return `${strValue[0]}${strValue[1]}-${strValue[2]}${strValue[3]}`
})

Vue.filter('displayGonvNumberNormal', value => {
  if (value == null) return '—'

  let strValue = ''
  if (value >= 1 && value <= 9) strValue = `000${value}`
  else if (value >= 10 && value <= 99) strValue = `00${value}`
  else if (value >= 100 && value <= 999) strValue = `0${value}`
  else strValue = `${value}`

  return strValue
})

Vue.use(CripLoading, {
  axios: axios,
  color: '#5561E5',
  height: "2px",
})

Vue.mixin(mixin)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
