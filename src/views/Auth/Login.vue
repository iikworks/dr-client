<template>
  <v-row justify="center" align="center" class="pa-4">
    <v-col cols="12" md="4">
      <h1 class="display-3" align="center">Вход</h1>
      <div v-if="isLoading">
        <br>
        <v-progress-linear
          indeterminate
          color="primary"
        ></v-progress-linear>
      </div>
      <br>
      <v-form v-model="valid">
        <v-text-field
          :disabled="isLoading"
          v-model="email"
          label="Адрес электронной почты"
          required
          :error="'email' in errors"
          :error-messages="errors.email"
          hide-details="auto"
        ></v-text-field>
        <v-text-field
          :disabled="isLoading"
          v-model="password"
          label="Пароль"
          :type="showPassword ? 'text' : 'password'"
          required
          @click:append="showPassword = !showPassword"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :error="'password' in errors"
          :error-messages="errors.password"
          hide-details="auto"
        ></v-text-field>
        <v-btn
          :disabled="isLoading"
          color="primary"
          class="mr-4 mt-3"
          block
          :dark="!isLoading"
          @click="validate"
        >
          <v-icon left dark>
            mdi-login
          </v-icon>
          Войти
        </v-btn>
      </v-form>
      <v-btn text small block :to="{ name: 'Register' }" color="primary">Зарегистрироваться</v-btn>
    </v-col>
  </v-row>
</template>

<script>
import axios from 'axios'
import {eventBus} from '../../main'

export default {
  name: 'Login',
  data() {
    return {
      valid: false,
      isLoading: false,
      email: '',
      password: '',
      showPassword: false,
      errors: {}
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Вход')
  },
  methods: {
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      axios.post(process.env.VUE_APP_API_URL + 'auth/login', {
          email: this.email,
          password: this.password,
        }, {
          headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.$store.commit('SET_TOKEN', response.data.token)

        eventBus.$emit('login')
        this.isLoading = false
        return this.$router.push({ name: 'Home' })
      }).catch(error => {
        if(error.response.status == 401){
          eventBus.$emit('message', 'error', `Неверный адрес электронной почты или пароль.`)

          this.isLoading = false
        } else if (error.response.status == 422) {
          this.errors = error.response.data.errors.json
          this.isLoading = false
        } else {
          eventBus.$emit('message', 'error', `Произошла какая-то ошибка. Попробуйте позже.`)

          this.isLoading = false
        }
      })
    },
  },
  isLoading(val) {
    eventBus.$emit('setLoading', val)
  }
}
</script>
