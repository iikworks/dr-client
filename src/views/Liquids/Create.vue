<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-form v-model="valid">
          <v-text-field
              :disabled="isLoading"
              v-model="prefix"
              label="Префикс (может быть пустым)"
              required
              dense
              outlined
              autocomplete="off"
              :error="'prefix' in errors"
              :error-messages="errors.prefix"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              :disabled="isLoading"
              v-model="title"
              autocomplete="off"
              label="Наименование"
              required
              dense
              outlined
              class="mt-3"
              :error="'title' in errors"
              :error-messages="errors.title"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              number
              :disabled="isLoading"
              v-model="balance"
              autocomplete="off"
              label="Баланс"
              required
              dense
              outlined
              class="mt-3"
              :suffix="unit + '.'"
              :error="'balance' in errors"
              :error-messages="errors.balance"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              :disabled="isLoading"
              v-model="unit"
              label="Единица измерения"
              autocomplete="off"
              required
              dense
              outlined
              class="mt-3"
              :error="'unit' in errors"
              :error-messages="errors.unit"
              hide-details="auto"
            ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
              :disabled="isLoading"
              color="success"
              class="mt-3"
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
import {eventBus} from '@/main'

export default {
  name: 'LiquidsCreate',
  data() {
    return {
      valid: false,
      prefix: '',
      isLoading: false,
      title: '',
      balance: 0.00,
      unit: 'л',
      errors: {}
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Создание ГСМ')
  },
  methods: {
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {
        title: this.title,
        balance: this.balance,
        unit: this.unit
      }
      if (this.prefix != '') data['prefix'] = this.prefix

      axios.post(process.env.VUE_APP_API_URL + `liquids/?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let message = `<b>${response.data.title}</b> успешно создано.`
        if (response.data.prefix) message = `${response.data.prefix} ` + message
        eventBus.$emit('message', 'success', message)
        this.loadLiquids(true)

        this.$router.go(-1)
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
  },
  watch: {
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>