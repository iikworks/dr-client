<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-form v-model="valid">
          <v-text-field
              :disabled="isLoading"
              v-model="title"
              label="Заголовок"
              autocomplete="off"
              required
              dense
              outlined
              class="mt-3"
              :error="'title' in errors"
              :error-messages="errors.title"
              hide-details="auto"
            ></v-text-field>
            <v-textarea
            class="mt-2"
            v-model="text"
            label="Содержание"
            dense
            outlined
            ></v-textarea>
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
            <b>Сохранить</b>
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
  name: 'NewsEdit',
  data() {
    return {
      valid: false,
      isLoading: false,
      title: '',
      text: '',
      errors: {}
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Загрузка...')

    this.loadPost(this.$route.params.id)
  },
  methods: {
    loadPost(postId) {
      this.isLoading = true
      axios.get(process.env.VUE_APP_API_URL + `posts/${postId}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.post = response.data

        this.title = this.post.title
        this.text = this.post.text

        eventBus.$emit('setTitle', this.post.title)

        this.isLoading = false
      })
    },
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {
        title: this.title,
        text: this.text,
      }

      axios.put(process.env.VUE_APP_API_URL + `posts/${this.post.id}?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let message = `Новость <b>${response.data.title}</b> успешно сохранена.`
        eventBus.$emit('message', 'success', message)

        this.post = response.data

        this.title = this.post.title
        this.text = this.post.text
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