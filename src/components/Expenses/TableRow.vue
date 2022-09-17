<template>
  <tr>
    <td @click="openEditing(expense.id)" style="cursor: pointer;">
      <span v-if="!isHome">
        <b>{{ moment(expense.date).format('DD.MM.YYYY') }}</b>
        <br>
      </span>
      <span :class="{ 'grey--text': !isHome }">{{ moment(expense.date).format('HH:mm') }}</span>
    </td>
    <td style="margin:0px;padding:0px;">
      <v-tooltip bottom v-if="expense.verified === 0">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            @click="setVerified(expense)"
            class="red--text text--lighten-1"
            style="cursor: pointer;"
            v-bind="attrs"
            v-on="on"
          >
            mdi-close
          </v-icon>
        </template>
        <span>Не проверен</span>
      </v-tooltip>
      <v-tooltip bottom v-if="expense.verified === 1">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            @click="setVerified(expense)"
            class="yellow--text text--lighten-1"
            style="cursor: pointer;"
            v-bind="attrs"
            v-on="on"
          >
            mdi-check
          </v-icon>
        </template>
        <span>Сверен с документацией</span>
      </v-tooltip>
      <v-tooltip bottom v-if="expense.verified === 2">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            @click="setVerified(expense)"
            class="green--text text--lighten-1"
            style="cursor: pointer;"
            v-bind="attrs"
            v-on="on"
          >
            mdi-check-all
          </v-icon>
        </template>
        <span>Включен в сводку</span>
      </v-tooltip>
    </td>
    <td @click="openFullInfoLiquidDialog(expense.liquid)" style="cursor: pointer;">
      <b>
        {{ expense.amount | formatNumber }}</b> <span class="grey--text">{{ expense.liquid.unit }}.</span>
      <span v-if="!isHome" class="grey--text text--lighten-1">
        <br>
        {{ expense.liquid.prefix }} <b>{{ expense.liquid.title }}</b>
      </span>
    </td>
    <td v-if="expense.type === 'ic'">
      <b>{{ expense.purpose_who }}</b>
    </td>
    <td v-else @click="openFullInfoWorkerDialog(expense.worker)" style="cursor: pointer;">
      <b>{{ expense.worker.last_name }}</b>
      <span class="grey--text" v-if="expense.worker.show_full_name"><br> {{ expense.worker.first_name }}</span>
      <span class="grey--text" v-else> {{ expense.worker.first_name[0] }}.</span>
      <span class="grey--text" v-if="expense.worker.show_full_name && expense.worker.patronymic"> {{ expense.worker.patronymic }}</span>
    </td>
    
    <td v-if="expense.type === 'ic'"><b>{{ expense.purpose }}</b></td>
    <td v-else @click="openFullVehicleInfoDialog(expense.vehicle)" style="cursor: pointer;">
      <span class="grey--text mr-1" v-if="expense.vehicle.brand">{{ expense.vehicle.brand }}</span>
      <span class="grey--text">{{ expense.vehicle.model }}</span>
      <span>
        <br>
        <b v-if="expense.vehicle.government_number"> {{ expense.vehicle.government_number | displayGonvNumber }}</b>
        <b v-else> —</b>
      </span>
    </td>
    <VehiclesInfoDialog
      v-if="fullInfoVehicle"
      :dialog="fullInfoVehicleDialog"
      :vehicle="fullInfoVehicle"
      @closeDialog="fullInfoVehicleDialog = false"
    />
    <WorkersInfoDialog
      v-if="fullInfoWorker"
      :dialog="fullInfoWorkerDialog"
      :worker="fullInfoWorker"
      @closeDialog="fullInfoWorkerDialog = false"
    />
    <LiquidsInfoDialog
      v-if="fullInfoLiquid"
      :dialog="fullInfoLiquidDialog"
      :liquid="fullInfoLiquid"
      @closeDialog="fullInfoLiquidDialog = false"
    />
  </tr>
</template>

<script>
import moment from "moment";
import axios from "axios";
import VehiclesInfoDialog from '@/components/Vehicles/InfoDialog'
import WorkersInfoDialog from '@/components/Workers/InfoDialog'
import LiquidsInfoDialog from '@/components/Liquids/InfoDialog'
import {eventBus} from '@/main'

export default {
  name: 'ExpenseTableRow',
  props: {
    expense: Object,
    loadingVerified: Number,
    isHome: {
      type: Boolean,
      default: false
    },
    loadExpenses: {
      type: Function,
      default: () => {}
    }
  },
  components: {
    VehiclesInfoDialog,
    WorkersInfoDialog,
    LiquidsInfoDialog
  },
  data() {
    return {
      fullInfoVehicle: null,
      fullInfoVehicleDialog: false,
      fullInfoWorker: null,
      fullInfoWorkerDialog: false,
      fullInfoLiquid: null,
      fullInfoLiquidDialog: false,
    }
  },
  methods: {
    openEditing(expenseId) {
      return this.$router.push({ name: 'ExpensesEdit', params: { id: expenseId }})
    },
    moment(date){
      return moment(date)
    },
    setVerified(expense) {
      if (this.$store.getters.getUserEmployee != 999) return false;
      if (this.loadingVerified !== 0) return false;

      this.$emit('setLoadingVerified', expense.id)

      let nextVerified = 0
      if (expense.verified == 0 || expense.verified == 1) nextVerified = expense.verified + 1

      axios.put(process.env.VUE_APP_API_URL + `expenses/${expense.id}?access_token=${this.$store.getters.getToken}`, {
        verified: nextVerified
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        expense.verified = nextVerified
        eventBus.$emit('reloadUnchecked')
        this.$emit('setLoadingVerified', 0)
      }).catch(() => {
        eventBus.$emit('reloadUnchecked')
        this.$emit('setLoadingVerified', 0)
      })
    },
    openFullVehicleInfoDialog(vehicle) {
      this.fullInfoVehicle = vehicle
      this.fullInfoVehicleDialog = true
    },
    openFullInfoWorkerDialog(worker) {
      this.fullInfoWorker = worker
      this.fullInfoWorkerDialog = true
    },
    openFullInfoLiquidDialog(liquid) {
      this.fullInfoLiquid = liquid
      this.fullInfoLiquidDialog = true
    }
  }
}
</script>
