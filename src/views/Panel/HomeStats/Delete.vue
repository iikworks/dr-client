<template>
  <v-dialog
    v-model="dialogActive"
    persistent
    max-width="600"
  >
    <v-card>
      <v-card-title class="headline">
        {{ homestat.title }}
      </v-card-title>
      <v-card-text>
        Вы действительно хотите удалить запись &laquo;{{ homestat.title }}&raquo; (ID: <b>{{ homestat.id }}</b>)?
        <br>
        Место: <b v-if="homestat.place === 1">Остатки</b><b v-if="homestat.place === 2">Список расходов/приходов</b>
        <br>
        Позиция: <b>{{ homestat.position }}</b>
        <br>
        Жидкость: <span>{{ homestat.liquid.prefix }}</span> <b>{{ homestat.liquid.title }}</b>
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
import {eventBus} from '@/main'

export default {
  name: 'HomeStatDelete',
  props: {
    homestat: Object,
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

      axios.delete(process.env.VUE_APP_API_URL + `homestats/${this.homestat.id}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        let message = `Запись <b>${this.homestat.title}</b> успешно удалена.`
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
