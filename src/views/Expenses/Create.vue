<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-form v-model="valid">
          <v-autocomplete
              :disabled="isLoading"
              v-model="type"
              :items="types"
              required
              outlined
              dense
              label="Тип"
              :error="'type' in errors"
              :error-messages="errors.type"
              hide-details="auto"
          ></v-autocomplete>
          <v-autocomplete
              :disabled="isLoading"
              v-model="liquid_id"
              :items="liquids"
              required
              outlined
              dense
              class="mt-3"
              label="Топливо"
              :error="'liquid_id' in errors"
              :error-messages="errors.liquid_id"
              hide-details="auto"
              :append-icon="'mdi-reload'"
              @click:append="loadLiquids()"
          ></v-autocomplete>
          <v-text-field
              number
              :disabled="isLoading"
              v-model="amount"
              label="Количество"
              required
              outlined
              dense
              class="mt-3"
              autocomplete="off"
              :suffix="(selectedLiquid != null) ? selectedLiquid.unit + '.' : ''"
              :error="'amount' in errors"
              :error-messages="errors.amount"
              hide-details="auto"
          ></v-text-field>
          <v-text-field
              number
              :disabled="isLoading"
              v-model="number"
              autocomplete="off"
              label="Номер документа (может быть пустым)"
              outlined
              dense
              class="mt-3"
              :error="'number' in errors"
              :error-messages="errors.number"
              hide-details="auto"
          ></v-text-field>
          <v-autocomplete
              :disabled="isLoading"
              v-model="worker_id"
              :items="workers"
              required
              label="Работник"
              v-if="type == 'lc'"
              outlined
              dense
              class="mt-3"
              :error="'worker_id' in errors"
              :error-messages="errors.worker_id"
              hide-details="auto"
              :append-icon="'mdi-reload'"
              @click:append="workers = workersToList($store.getters.getWorkers)"
          ></v-autocomplete>
          <v-text-field
              :disabled="isLoading"
              v-model="purpose_who"
              label="Через кого (кому)"
              v-if="type == 'ic'"
              outlined
              dense
              class="mt-3"
              :error="'purpose' in errors"
              :error-messages="errors.purpose"
              hide-details="auto"
          ></v-text-field>
          <v-autocomplete
              :disabled="isLoading"
              v-model="vehicle_id"
              :items="vehicles"
              v-if="type == 'lc'"
              label="Техника"
              outlined
              dense
              class="mt-3"
              :error="'vehicle_id' in errors"
              :error-messages="errors.vehicle_id"
              hide-details="auto"
              :append-icon="'mdi-reload'"
              @click:append="reloadUsing"
          ></v-autocomplete>
          <v-text-field
              :disabled="isLoading"
              v-model="purpose"
              label="Назначение"
              outlined
              dense
              class="mt-3"
              v-if="type == 'ic'"
              :error="'purpose' in errors"
              :error-messages="errors.purpose"
              hide-details="auto"
          ></v-text-field>
          <v-btn
              class="mt-3 mb-3"
              block
              @click="showDate = !showDate"
              depressed
          >
            <v-icon left>
              mdi-calendar
            </v-icon>
            <b>Дата</b>
          </v-btn>
          <transition name="slide-fade">
            <v-date-picker
                v-model="date"
                v-if="showDate"
                full-width
                class="mt-3"
            ></v-date-picker>
          </transition>
          <transition name="slide-fade">
            <v-time-picker
                v-model="time"
                v-if="showDate"
                format="24hr"
                full-width
                class="mt-3 mb-3"
            ></v-time-picker>
          </transition>
          <v-spacer></v-spacer>
          <v-btn
              :disabled="isLoading"
              color="success"
              block
              depressed
              :dark="!isLoading"
              @click="validate"
          >
            <v-icon left dark>
              mdi-database-plus
            </v-icon>
            <b>Создать</b>
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import {eventBus} from '@/main'

export default {
  name: 'ExpensesCreate',
  computed: {
    liquids: function() {
      return this.liquidsToList(this.$store.getters.getLiquids)
    }
  },
  data() {
    return {
      valid: false,
      isLoading: false,
      liquid_id: 0,
      selectedLiquid: null,
      type: 'lc',
      amount: '',
      number: '',
      workers: this.workersToList(this.$store.getters.getWorkers),
      vehicles: this.vehiclesToList(this.$store.getters.getVehicles),
      vehicle_id: 0,
      worker_id: 0,
      purpose: '',
      purpose_who: '',
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm'),
      showDate: false,
      types: [
        {
          value: 'lc',
          text: 'Лимитно-заборная карта'
        }, {
          value: 'ic',
          text: 'Требование-накладная'
        }
      ],
      errors: {}
    }
  },
  mounted() {
    if (this.$store.getters.getLiquids.length > 0) {
      this.liquid_id = this.$store.getters.getLiquids[0].id
    }
    eventBus.$emit('setTitle', 'Создание расхода')
  },
  methods: {
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {
        liquid_id: this.liquid_id,
        type: this.type,
        amount: this.amount,
        date: `${this.date}T${this.time}`
      }
      if (this.number != '') data['number'] = this.number
      if (this.vehicle_id != 0) data['vehicle_id'] = this.vehicle_id
      if (this.worker_id != 0) data['worker_id'] = this.worker_id
      if (this.purpose != '') data['purpose'] = this.purpose
      if (this.purpose_who != '') data['purpose_who'] = this.purpose_who

      axios.post(process.env.VUE_APP_API_URL + `expenses/?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.loadLiquids(true)
        this.loadUsing()
        let message = `Расход <b>${this.displayExpense(response.data)}</b> успешно создан.`
        eventBus.$emit('message', 'success', message)

        return this.$router.go(-1)
      }).catch(error => {
        if (error.response.status == 422) {
          this.errors = error.response.data.errors.json
        } else {
          this.snackbar = {
            active: true,
            text: 'Произошла какая-то ошибка. Попробуйте позже.'
          }
        }
      })

      this.isLoading = false
    },
    reloadUsing() {
      let usingData = this.$store.getters.getUsing
      let vehiclesData = this.$store.getters.getVehicles
      let vehicles = []
      let willBeIgnored = []
      let selectedVehicle = 0

      for (const using of usingData) {
        if (using.worker_id == this.worker_id) {
          for (const vehicle of vehiclesData) {
            if (using.vehicle_id == vehicle.id) {
              let text = ``
              if (vehicle.brand) text += `${vehicle.brand}-`
              text += `${vehicle.model}`
              if (vehicle.government_number) text += ` ${this.$options.filters.displayGonvNumber(vehicle.government_number)}`

              vehicles.push({
                value: vehicle.id,
                text: `${text}, использований: ${using.used}`,
              })

              willBeIgnored.push(vehicle)

              if(selectedVehicle == 0) selectedVehicle = vehicle.id
            }
          }
        }
      }

      for (const vehicle of vehiclesData) {
        let ifIgnored = false
        for (const ignored of willBeIgnored) {
          if(ignored == vehicle) ifIgnored = true
        }

        if(!ifIgnored) {
          let text = ``
          if (vehicle.brand) text += `${vehicle.brand}-`
          text += `${vehicle.model}`
          if (vehicle.government_number) text += ` ${this.$options.filters.displayGonvNumber(vehicle.government_number)}`

          vehicles.push({
            value: vehicle.id,
            text: text
          })
        }
      }

      this.vehicles = vehicles
      this.vehicle_id = selectedVehicle
    },
    updateVehicles() {
      this.loadVehicles()
      if(this.worker_id != 0) {
        this.loadUsing()
        this.reloadUsing()
      }
    }
  },
  watch: {
    liquid_id() {
      for (const liquid of this.liquids) {
        if (this.liquid_id == liquid.value) this.selectedLiquid = liquid
      }
    },
    worker_id() {
      this.reloadUsing()
    },
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>