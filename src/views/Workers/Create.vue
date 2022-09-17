<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-form v-model="valid">
          <v-text-field
              :disabled="isLoading"
              v-model="last_name"
              label="Фамилия"
              autocomplete="off"
              required
              dense
              outlined
              class="mt-3"
              :error="'last_name' in errors"
              :error-messages="errors.last_name"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              :disabled="isLoading"
              v-model="first_name"
              label="Имя"
              autocomplete="off"
              required
              dense
              outlined
              class="mt-3"
              :error="'first_name' in errors"
              :error-messages="errors.first_name"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              :disabled="isLoading"
              v-model="patronymic"
              label="Отчество (может быть пустым)"
              autocomplete="off"
              required
              dense
              outlined
              class="mt-3"
              :error="'patronymic' in errors"
              :error-messages="errors.patronymic"
              hide-details="auto"
            ></v-text-field>
            <v-checkbox
              v-model="show_full_name"
              class="mt-3"
              label="Показывать полное имя"
            ></v-checkbox>
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
import {eventBus} from '@/main'

export default {
  name: 'WorkersCreate',
  data() {
    return {
      valid: false,
      isLoading: false,
      first_name: '',
      last_name: '',
      patronymic: '',
      show_full_name: false,
      errors: {}
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Создание работника')
  },
  methods: {
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {
        first_name: this.first_name,
        last_name: this.last_name,
        show_full_name: this.show_full_name,
      }

      if (this.patronymic != '') data['patronymic'] = this.patronymic

      axios.post(process.env.VUE_APP_API_URL + `workers/?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let message = `Работник <b>${response.data.first_name} ${response.data.last_name}</b> успешно создан.`
        eventBus.$emit('message', 'success', message)

        this.loadWorkers(true)
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