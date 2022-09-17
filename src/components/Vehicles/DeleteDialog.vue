<template>
  <v-dialog
    v-model="dialogActive"
    persistent
    max-width="600"
  >
    <v-card>
      <v-card-title class="headline">
        {{ vehicle.title }}
      </v-card-title>
      <v-card-text>
        Вы действительно хотите удалить технику <b>&laquo;<span v-if="vehicle.brand">{{ vehicle.brand }}</span> {{ vehicle.model }}&raquo;</b> <b>{{ vehicle.government_number | displayGonvNumber }}</b> (ID: <b>{{ vehicle.id }}</b>)?
        <br><br>
        Кол-во использований: <b>{{ vehicle.used }}</b>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-1"
          text
          depressed
          @click="closeDialog"
        >
          <v-icon left dark>
            mdi-close
          </v-icon>
          <b>Закрыть</b>
        </v-btn>
        <v-btn
          color="red darken-1"
          text
          depressed
          @click="confirmDeleting"
          :loading="isLoading"
        >
          <v-icon left dark>
            mdi-delete
          </v-icon>
          <b>Удалить</b>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios'
import {eventBus} from '../../main'

export default {
  name: 'VehiclesDeleteDialog',
  props: {
    vehicle: Object,
    dialogActive: Boolean
  },
  data () {
    return {
      isLoading: false
    }
  },
  methods: {
    confirmDeleting() {
      this.isLoading = true

      axios.delete(process.env.VUE_APP_API_URL + `vehicles/${this.vehicle.id}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        let message = `Техника <b>`
        if(this.vehicle.brand) message += `${this.vehicle.brand} `
        message += `${this.vehicle.model}</b> успешно удалена.`
        eventBus.$emit('message', 'error', message)

        this.isLoading = false
        this.$emit('successfulDeleting')
      }).catch(() => {
        this.snackbar = {
          active: true,
          text: 'Произошла какая-то ошибка. Попробуйте позже.'
        }

        this.isLoading = false
      })
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
  },
  watch: {
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>
