<template>
  <v-dialog
    v-model="dialogActive"
    persistent
    max-width="600"
  >
    <v-card v-if="expense">
      <v-card-title class="headline" v-if="expense.liquid">
        {{ expense.amount | formatNumber }} {{ expense.liquid.unit }}.
      </v-card-title>
      <v-card-text v-if="expense.liquid">
        Вы действительно хотите удалить расход &laquo;{{ expense.amount | formatNumber }} {{ expense.liquid.unit }}.&raquo; (ID: <b>{{ expense.id }}</b>)?
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
          @click="confirmDeleting"
          depressed
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
  name: 'ExpenseDeleteDialog',
  props: {
    expense: Object,
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

      axios.delete(process.env.VUE_APP_API_URL + `expenses/${this.expense.id}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        let message = `Расход <b>${this.displayExpense(this.expense)}</b> успешно удален.`
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
    }
  }
}
</script>
