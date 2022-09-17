import axios from 'axios'
import {eventBus} from '@/main'

export default {
  methods: {
    displayExpense: function (expense) {
      let title = `${expense.amount} ${expense.liquid.unit}., `
      if (expense.purpose) title += expense.purpose
      else if (expense.vehicle) {
        if(expense.vehicle.brand) title += `${expense.vehicle.brand}-`
        title += `${expense.vehicle.model}`
        if(expense.vehicle.government_number) title += ` ${this.$options.filters.displayGonvNumber(expense.vehicle.government_number)}`
      }

      return title
    },
    loadLiquids(addMove = false) {
      axios.get(`${process.env.VUE_APP_API_URL}liquids/?order_column=used&order_type=desc&limit=0`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.$store.commit('SET_LIQUIDS', response.data.liquids)
        if(!addMove) eventBus.$emit('message', 'success', '<b>Кэш топлива обновлен.</b>')
      })
    },
    loadWorkers(addMove = false) {
      axios.get(`${process.env.VUE_APP_API_URL}workers/?order_column=used&order_type=desc&limit=0`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.$store.commit('SET_WORKERS', response.data.workers)
        if(!addMove) eventBus.$emit('message', 'success', '<b>Кэш работников обновлен.</b>')
      })
    },
    loadVehicles(addMove = false) {
      axios.get(`${process.env.VUE_APP_API_URL}vehicles/?order_column=used&order_type=desc&limit=0`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.$store.commit('SET_VEHICLES', response.data.vehicles)
        if(!addMove) eventBus.$emit('message', 'success', '<b>Кэш техники обновлен.</b>')
      })
    },
    loadUsing() {
      axios.get(process.env.VUE_APP_API_URL + `homestats/using`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.$store.commit('SET_USING', response.data.using)
      })
    },
    workersToList(workersData, filter=false) {
      let workers = []

      if (filter) workers.push({
        value: 0,
        text: '—',
        unit: ''
      })

      for (const worker of workersData) {
        let text = `${worker.last_name} ${worker.first_name}`
        if (worker.patronymic) text += ` ${worker.patronymic}`


        workers.push({
          value: worker.id,
          text: text,
        })
      }

      return workers
    },
    vehiclesToList(vehiclesData, filter=false) {
      let vehicles = []

      if (filter) vehicles.push({
        value: 0,
        text: '—',
        unit: ''
      })

      for (const vehicle of vehiclesData) {
        let text = ``
        if (vehicle.brand) text += `${vehicle.brand} `
        text += `${vehicle.model}`
        if (vehicle.government_number) text += ` ${this.$options.filters.displayGonvNumber(vehicle.government_number)}`


        vehicles.push({
          value: vehicle.id,
          text: text,
        })
      }

      return vehicles
    },
    liquidsToList(liquidsData, filter=false) {
      let liquids = []

      if (filter) liquids.push({
        value: 0,
        text: '—',
        unit: ''
      })

      for (const liquid of liquidsData) {
        liquids.push({
          value: liquid.id,
          text: `${liquid.title} — ${this.$options.filters.formatNumber(liquid.balance)} ${liquid.unit}.`,
          unit: liquid.unit
        })
      }

      return liquids
    }
  },
}