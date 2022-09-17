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
                v-if="type == 'lc'"
                label="Работник"
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
              <b>Сохранить</b>
            </v-btn>
            <v-btn
              :disabled="isLoading"
              color="error"
              block
              text
              class="mt-1"
              depressed
              :dark="!isLoading"
              @click="openDeleteDialog(expense)"
            >
              <v-icon left dark>
                mdi-delete
              </v-icon>
              <b>Удалить</b>
            </v-btn>
          </v-form>
      </v-col>
    </v-row>
    <ExpenseDeleteDialog
      :dialogActive="deleteDialog"
      :expense="expenseToBeRemoved"
      @closeDialog="deleteDialog = false"
      @successfulDeleting="successfulDeleting"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import moment from 'moment'
import ExpenseDeleteDialog from '@/components/Expenses/DeleteDialog'

export default {
  name: 'ExpensesEdit',
  components: {
    ExpenseDeleteDialog
  },
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
      amount: 0.00,
      number: '',
      vehicle_id: 0,
      vehicle_setted: false,
      worker_id: 0,
      purpose: '',
      purpose_who: '',
      date: '',
      time: '',
      workers: this.workersToList(this.$store.getters.getWorkers),
      vehicles: this.vehiclesToList(this.$store.getters.getVehicles),
      expense: null,
      showDate: false,
      errors: {},
      deleteDialog: false,
      expenseToBeRemoved: {},
      types: [
        {
          value: 'lc',
          text: 'Лимитно-заборная карта'
        }, {
          value: 'ic',
          text: 'Требование-накладная'
        }
      ],
    }
  },
  mounted() {
    this.loadExpense(this.$route.params.id)
    eventBus.$emit('setTitle', 'Редактирование расхода')
  },
  methods: {
    loadExpense(expenseId) {
      this.isLoading = true
      axios.get(process.env.VUE_APP_API_URL + `expenses/${expenseId}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.expense = response.data

        this.liquid_id = this.expense.liquid.id
        this.type = this.expense.type
        this.changeSelectedLiquid()
        this.amount = this.expense.amount
        if(this.expense.number) this.number = this.expense.number
        if(this.expense.purpose) this.purpose = this.expense.purpose
        if(this.expense.purpose_who) this.purpose_who = this.expense.purpose_who
        if(this.expense.worker) this.worker_id = this.expense.worker.id
        this.date = moment(this.expense.date).format('YYYY-MM-DD')
        this.time = moment(this.expense.date).format('HH:mm')

        this.reloadUsing()

        this.isLoading = false
      })
    },
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {
        date: `${this.date}T${this.time}`
      }
      if (this.number != this.expense.number) data['number'] = this.number
      if (this.type == 'lc' && this.vehicle_id != this.expense.vehicle_id) data['vehicle_id'] = this.vehicle_id
      if (this.type == 'ic' && this.purpose != this.expense.purpose) data['purpose'] = this.purpose
      if (this.type == 'ic' && this.purpose_who != this.expense.purpose_who) data['purpose_who'] = this.purpose_who
      if (this.type != this.expense.type) data['type'] = this.type
      if (this.type == 'lc' && this.worker_id != this.expense.worker_id) data['worker_id'] = this.worker_id
      if (this.amount != this.expense.amount) data['amount'] = this.amount
      if (this.liquid_id != this.expense.liquid.id) data['liquid_id'] = this.liquid_id
      if (this.number != this.expense.number) data['number'] = this.number

      axios.put(process.env.VUE_APP_API_URL + `expenses/${this.expense.id}?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let message = `Расход <b>${this.displayExpense(this.expense)}</b> успешно сохранен.`
        eventBus.$emit('message', 'success', message)

        this.expense = response.data

        this.liquid_id = this.expense.liquid.id
        this.type = this.expense.type
        this.changeSelectedLiquid()
        this.amount = this.expense.amount
        if(this.expense.number) this.number = this.expense.number
        if(this.expense.purpose) this.purpose = this.expense.purpose
        if(this.expense.purpose_who) this.purpose_who = this.expense.purpose_who

        this.worker_id = this.expense.worker.id
        this.date = moment(this.expense.date).format('YYYY-MM-DD')
        this.time = moment(this.expense.date).format('HH:mm')

        this.loadLiquids(true)
        this.loadUsing()
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
    openDeleteDialog(expense) {
      this.expenseToBeRemoved = expense
      this.deleteDialog = true
    },
    successfulDeleting() {
      this.expenseToBeRemoved = {}
      this.deleteDialog = false
      this.loadLiquids(true)

      return this.$router.go(-1)
    },
    changeSelectedLiquid() {
      for (const liquid of this.liquids) {
        if (this.liquid_id == liquid.value) this.selectedLiquid = liquid
      }
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
  },
  watch: {
    liquid_id() {
      this.changeSelectedLiquid()
    },
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
    worker_id() {
      this.reloadUsing()

      if(!this.vehicle_setted) {
        this.vehicle_setted = true

        if(this.expense.vehicle) this.vehicle_id = this.expense.vehicle.id
      }
    },
  }
}
</script>