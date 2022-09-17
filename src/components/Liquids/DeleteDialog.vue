<template>
  <v-dialog
    v-model="dialogActive"
    persistent
    max-width="600"
  >
    <v-card>
      <v-card-title class="headline">
        {{ liquid.prefix }} {{ liquid.title }}
      </v-card-title>
      <v-card-text>
        Вы действительно хотите удалить ГСМ &laquo;{{ liquid.prefix }} <b>{{ liquid.title }}</b>&raquo; (ID: <b>{{ liquid.id }}</b>)?
        <br><br>
        Баланс: <b>{{ liquid.balance | formatNumber }} {{ liquid.unit }}.</b>
        <br>
        Кол-во использований: <b>{{ liquid.used }}</b>
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
  name: 'LiquidDeleteDialog',
  props: {
    liquid: Object,
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

      axios.delete(process.env.VUE_APP_API_URL + `liquids/${this.liquid.id}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        let message = `<b>${this.liquid.title}</b> успешно удалено.`
        if (this.liquid.prefix) message = `${this.liquid.prefix} ` + message
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
