<template>
  <v-container>
    <div v-if="$store.getters.getUserEmployee == 999" class="mb-3">
      <v-btn depressed block color="success" :to="{ name: 'VehiclesCreate' }">
        <v-icon left dark>
          mdi-database-plus
        </v-icon>
        <b>Создать</b>
      </v-btn>
    </div>
    <transition name="slide-fade">
      <v-simple-table v-if="vehicles.length > 0" style="white-space: nowrap;">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                ID
              </th>
              <th class="text-left">
                Наименование
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="vehicle in vehicles"
              :key="vehicle.id"
            >
              <td @click="openEditing(vehicle.id)" style="cursor: pointer;"><b>{{ vehicle.id }}</b></td>
              <td @click="openFullInfoDialog(vehicle)" style="cursor: pointer;">
                <span class="grey--text mr-1" v-if="vehicle.brand">{{ vehicle.brand }}</span>
                <span class="grey--text">{{ vehicle.model }}</span>
                <br>
                <b>{{ vehicle.government_number | displayGonvNumber }}</b>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </transition>
    <transition name="slide-fade">
      <div v-if="paginateButtons.length > 0">
        <v-divider></v-divider>
        <div class="pl-4 pt-2 pb-2">
          Показано: <b>{{ currentButton.startVehicle }}-{{ currentButton.finishVehicle }}</b> из <b>{{ vehiclesCount }}</b>
        </div>
        <v-divider></v-divider>
        <div class="pt-2 text-center">
          <span
            v-for="button in paginateButtons"
            :key="button.pageNumber"
          >
            <v-btn
              small
              v-if="button.pageNumber == pagesCount && currentPage != pagesCount && currentPage != pagesCount - 1 && currentPage != pagesCount - 2"
              depressed
              class="ml-1"
              active-class="no-active"
              disabled
            >
              <b>...</b>
            </v-btn>
            <v-btn
              small
              v-if="isShowButton(button)"
              @click="switchPage(button.pageNumber)"
              depressed
              :disabled="currentPage == button.pageNumber"
              class="ml-1"
              active-class="no-active"
            >
              <b>{{ button.startVehicle }}-{{ button.finishVehicle }}</b>
            </v-btn>
            <v-btn
              small
              v-if="button.pageNumber == 1 && currentPage != 1 && currentPage != 2 && currentPage != 3"
              depressed
              class="ml-1"
              active-class="no-active"
              disabled
            >
              <b>...</b>
            </v-btn>
          </span>
        </div>
      </div>
    </transition>
    <VehiclesInfoDialog
      v-if="fullInfoVehicle"
      :dialog="fullInfoDialog"
      :vehicle="fullInfoVehicle"
      @closeDialog="fullInfoDialog = false"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import VehiclesInfoDialog from '@/components/Vehicles/InfoDialog'

export default {
  name: 'VehiclesList',
  components: {
    VehiclesInfoDialog
  },
  data() {
    return {
      vehicles: [],
      vehiclesCount: 0,
      loading: false,
      perPage: 25,
      fullInfoDialog: false,
      fullInfoVehicle: null,
      currentPage: 1,
      pagesCount: 1,
      paginateButtons: [],
      currentButton: {},
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Техника')
    this.loadVehicles()
    if(this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)
  },
  methods: {
    loadVehicles() {
      this.loading = true
      this.vehicles = []

      let url = `${process.env.VUE_APP_API_URL}vehicles/?order_column=id&order_type=desc`

      let offset = this.perPage * this.currentPage - this.perPage
      if (!offset) offset = 0
      url = url + `&offset=${offset}&limit=${this.perPage}`

      axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.vehicles = response.data.vehicles
        this.vehiclesCount = response.data.count

        this.countPages()
        this.loading = false
      })
    },
    countPages() {
      let pages = Math.ceil(this.vehiclesCount / this.perPage)

      let buttons = []

      for(var i = 0; i < pages; i++) {
        let finishVehicle = this.perPage * i + this.perPage
        if (finishVehicle > this.vehiclesCount) finishVehicle = this.vehiclesCount

        let button = {
          'pageNumber': i + 1,
          'startVehicle': this.perPage * i + 1,
          'finishVehicle': finishVehicle
        }
        buttons.push(button)

        if (this.currentPage == i + 1) this.currentButton = button
      }


      this.paginateButtons = buttons
      this.pagesCount = pages
    },
    openEditing(vehicleId) {
      this.$router.push({ name: 'VehiclesEdit', params: { id: vehicleId } })
    },
    isShowButton(button) {
      if (button.pageNumber + 1 == this.currentPage || button.pageNumber == this.currentPage || button.pageNumber - 1 == this.currentPage) return true
      if (button.pageNumber == this.pagesCount) return true
      if (button.pageNumber == 1 && this.currentPage != 1 && this.currentPage != 2) return true
      return false
    },
    switchPage(page) {
      this.$router.push({ query: { ...this.$route.query, page: page } })
    },
    openFullInfoDialog(vehicle) {
      this.fullInfoVehicle = vehicle
      this.fullInfoDialog = true
    }
  },
  watch: {
    $route() {
      if (this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)
      this.loadVehicles()

      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    },
    loading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>

<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
