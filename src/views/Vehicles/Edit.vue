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
              dense
              outlined
              label="Тип"
              :error="'type' in errors"
              :error-messages="errors.type"
              hide-details="auto"
            ></v-autocomplete>
            <v-text-field
              :disabled="isLoading"
              v-model="brand"
              label="Брэнд (может быть пустым)"
              placeholder="МТЗ"
              autocomplete="off"
              class="mt-3"
              dense
              outlined
              :error="'brand' in errors"
              :error-messages="errors.brand"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              :disabled="isLoading"
              v-model="model"
              label="Модель"
              autocomplete="off"
              required
              placeholder="3022 ДЦ.1"
              class="mt-3"
              dense
              outlined
              :error="'model' in errors"
              :error-messages="errors.model"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              number
              :disabled="isLoading"
              v-model="government_number"
              label="Цифры гос. номера (может быть пустым)"
              placeholder="0000"
              autocomplete="off"
              class="mt-3"
              dense
              outlined
              :error="'government_number' in errors"
              :error-messages="errors.government_number"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              number
              :disabled="isLoading"
              v-model="government_number_letters"
              label="Буквы гос. номера (может быть пустым)"
              placeholder="АА"
              autocomplete="off"
              class="mt-3"
              dense
              outlined
              :error="'government_number_letters' in errors"
              :error-messages="errors.government_number_letters"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              number
              :disabled="isLoading"
              v-model="government_number_region"
              label="Регион гос. номера (может быть пустым)"
              placeholder="2"
              autocomplete="off"
              class="mt-3"
              dense
              outlined
              :error="'government_number_region' in errors"
              :error-messages="errors.government_number_region"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              number
              :disabled="isLoading"
              v-model="year_of_ussue"
              label="Год выпуска (может быть пустым)"
              placeholder="2009"
              autocomplete="off"
              class="mt-3"
              dense
              outlined
              :error="'year_of_ussue' in errors"
              :error-messages="errors.year_of_ussue"
              hide-details="auto"
            ></v-text-field>
            <v-autocomplete
              :disabled="isLoading"
              v-model="workerId"
              class="mt-3"
              :items="workers"
              dense
              outlined
              label="Механизатор (может быть пустым)"
              :error="'worker_id' in errors"
              :error-messages="errors.worker_id"
              hide-details="auto"
              :append-icon="'mdi-reload'"
              @click:append="loadWorkers"
            ></v-autocomplete>
          <v-spacer></v-spacer>
        <v-btn
            :disabled="isLoading"
            color="success"
            block
              class="mt-3"
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
            @click="openDeleteDialog(vehicle)"
        >
            <v-icon left dark>
            mdi-delete
            </v-icon>
            <b>Удалить</b>
        </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <VehiclesDeleteDialog
      :dialogActive="deleteDialog"
      :vehicle="vehicleToBeRemoved"
      @closeDialog="deleteDialog = false"
      @successfulDeleting="successfulDeleting"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import VehiclesDeleteDialog from '@/components/Vehicles/DeleteDialog'

export default {
  name: 'VehiclesEdit',
  components: {
    VehiclesDeleteDialog
  },
  computed: {
    workers: function() {
      return this.workersToList(this.$store.getters.getWorkers)
    }
  },
  data() {
    return {
      valid: false,
      isLoading: false,
      deleteDialog: false,
      vehicleToBeRemoved: {},
      type: '',
      brand: '',
      model: '',
      government_number: '',
      government_number_letters: '',
      government_number_region: '',
      year_of_ussue: '',
      workerId: 0,
      types: [
        {
          value: 'tractor',
          text: 'Трактор'
        },
        {
          value: 'car',
          text: 'Автомобиль'
        },
        {
          value: 'harvester',
          text: 'С/х техника'
        },
        {
          value: 'other',
          text: 'Другое'
        },
      ],
      vehicle: {},
      errors: {}
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Редактирование техники')

    this.loadVehicle(this.$route.params.id)
  },
  methods: {
    loadVehicle(vehicleId) {
      this.isLoading = true
      axios.get(process.env.VUE_APP_API_URL + `vehicles/${vehicleId}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.vehicle = response.data

        this.type = this.vehicle.type
        this.brand = this.vehicle.brand
        this.model = this.vehicle.model
        this.government_number = this.vehicle.government_number
        this.government_number_letters = this.vehicle.government_number_letters
        this.government_number_region = this.vehicle.government_number_region
        this.year_of_ussue = this.vehicle.year_of_ussue
        if(this.vehicle.worker) this.workerId = this.vehicle.worker.id

        this.isLoading = false
      })
    },
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {}
      if (this.type != this.vehicle.type) data['type'] = this.type
      if (this.model != this.vehicle.model) data['model'] = this.model
      if (this.government_number != this.vehicle.government_number) data['government_number'] = this.government_number
      if (data['government_number'] == '') data['government_number'] = 0
      if (this.brand != this.vehicle.brand) data['brand'] = this.brand
      if (this.government_number_region != this.vehicle.government_number_region) data['government_number_region'] = this.government_number_region
      if (this.government_number_letters != this.vehicle.government_number_letters) data['government_number_letters'] = this.government_number_letters
      if (this.year_of_ussue != this.vehicle.year_of_ussue) data['year_of_ussue'] = this.year_of_ussue
      if (this.vehicle.worker && this.workerId != this.vehicle.worker.id) data['worker_id'] = this.workerId
      if (!this.vehicle.worker && this.workerId != 0) data['worker_id'] = this.workerId

      axios.put(process.env.VUE_APP_API_URL + `vehicles/${this.vehicle.id}?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let title = ''
        if (response.data.brand) title += `${response.data.brand} `
        title += `${response.data.model}`

        let message = `Техника <b>${title}</b> успешно сохранена.`
        eventBus.$emit('message', 'success', message)

        this.vehicle = response.data

        this.type = this.vehicle.type
        this.brand = this.vehicle.brand
        this.model = this.vehicle.model
        this.government_number = this.vehicle.government_number
        this.government_number_letters = this.vehicle.government_number_letters
        this.government_number_region = this.vehicle.government_number_region
        this.year_of_ussue = this.vehicle.year_of_ussue
        if(this.vehicle.worker) this.workerId = this.vehicle.worker.id

        this.loadVehicles(true)
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
    openDeleteDialog(vehicle) {
      this.vehicleToBeRemoved = vehicle
      this.deleteDialog = true
    },
    successfulDeleting() {
      this.vehicleToBeRemoved = {}
      this.deleteDialog = false

      return this.$router.go(-1)
    }
  },
  watch: {
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>