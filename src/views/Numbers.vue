<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="12"
        class="pl-5 pr-5"
      >
        <v-text-field
          :disabled="loading"
          v-model="newNumberTitle"
          label="Наименование"
          required
          dense
          outlined
          autocomplete="off"
          hide-details="auto"
        ></v-text-field>
        <v-btn
          :disabled="loading"
          color="success"
          class="mt-2"
          block
          depressed
          :dark="!loading"
          @click="validateAdd"
        >
          <v-icon left dark>
            mdi-database-plus
          </v-icon>
          <b>Добавить</b>
        </v-btn>
        <v-divider class="mt-3"></v-divider>
      </v-col>
    </v-row>
    <v-row class="pl-4 pr-4" v-if="cardnumbers.length > 0">
      <v-col
        cols="12"
        md="3"
        v-for="number in cardnumbers"
        :key="number.id"
        class="pt-0 mt-2 pb-0 pl-1 pr-1"
      >
        <v-card class="mx-auto" flat>
          <v-card-text>
            <div class="text-center" @click="openEditing(number)">{{ number.title }}</div>
            <div v-if="editOpened == number.id">
              <v-text-field
                class="mt-2"
                :disabled="loading"
                v-model="editingTitle"
                label="Наименование"
                required
                dense
                outlined
                autocomplete="off"
                hide-details="auto"
              ></v-text-field>
              <v-text-field
                number
                class="mt-2"
                :disabled="loading"
                v-model="editingCount"
                label="Номер"
                required
                dense
                outlined
                autocomplete="off"
                hide-details="auto"
              ></v-text-field>
              <v-btn
                depressed
                block
                @click="validateEditing(number)"
                color="green"
                class="mt-2"
              >
                <b>Сохранить</b>
              </v-btn>
              <v-btn
                depressed
                block
                @click="deleteNumber(number)"
                color="red"
                class="mt-2"
              >
                <b>Удалить</b>
              </v-btn>
            </div>
          </v-card-text>
          <v-card-actions class="mt-0 pt-0">
            <v-btn
              text
              depressed
              style="width: 32%"
              @click="decrement(number)"
              color="red"
            >
              <b>-</b>
            </v-btn>
            <v-btn
              depressed
              style="width: 31%"
            >
              <b>{{ number.number }}</b>
            </v-btn>
            <v-btn
              text
              depressed
              @click="increment(number)"
              style="width: 32%"
              color="green"
            >
              <b>+</b>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="deleteDialog"
      persistent
      max-width="600"
    >
      <v-card v-if="deletingNumber">
        <v-card-title class="headline">
          Удаление номера документа
        </v-card-title>
        <v-card-text>
          Вы действительно хотите удалить номер документа &laquo;{{ deletingNumber.title }}&raquo; (ID: <b>{{ deletingNumber.id }}</b>)?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            depressed
            @click="closeDeleteDialog"
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
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'

export default {
  name: 'Numbers',
  data() {
    return {
      newNumberTitle: '',
      loading: false,
      cardnumbers: [],
      editingTitle: '',
      editingCount: 0,
      editOpened: 0,
      deleteDialog: false,
      deletingNumber: null,
    }
  },
  created() {

  },
  mounted() {
    eventBus.$emit('setTitle', 'Номера последних документов')

    this.loadNumbers()
  },
  methods: {
    loadNumbers() {
      this.loading = true
      this.cardnumbers = []

      axios.get(process.env.VUE_APP_API_URL + `cardnumbers/?access_token=${this.$store.getters.getToken}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.cardnumbers = response.data.cardnumbers

        this.loading = false
      })

    },
    validateAdd(e) {
      e.preventDefault()

      this.loading = true

      axios.post(process.env.VUE_APP_API_URL + `cardnumbers/?access_token=${this.$store.getters.getToken}`, {
        title: this.newNumberTitle
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let message = `Номер документа добавлен.`
        eventBus.$emit('message', 'success', message)

        this.cardnumbers.unshift(response.data)
        this.newNumberTitle = ''
        this.loading = false
      }).catch(error => {
        if (error.response.status == 422) {
          this.errors = error.response.data.errors.json
          this.loading = false
        } else {
          this.snackbar = {
            active: true,
            text: 'Произошла какая-то ошибка. Попробуйте позже.'
          }

          this.loading = false
        }
      })
    },
    increment(number) {
      axios.put(process.env.VUE_APP_API_URL + `cardnumbers/${number.id}?access_token=${this.$store.getters.getToken}`, {
        number: number.number + 1
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        number.number = response.data.number
      })
    },
    decrement(number) {
      axios.put(process.env.VUE_APP_API_URL + `cardnumbers/${number.id}?access_token=${this.$store.getters.getToken}`, {
        number: number.number - 1
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        number.number = response.data.number
      })
    },
    openEditing(number) {
      if(this.editOpened == number.id) return this.editOpened = 0

      this.editOpened = number.id
      this.editingTitle = number.title
      this.editingCount = number.number
    },
    validateEditing(number) {
      axios.put(process.env.VUE_APP_API_URL + `cardnumbers/${number.id}?access_token=${this.$store.getters.getToken}`, {
        title: this.editingTitle,
        number: this.editingCount
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        number.number = response.data.number
        number.title = response.data.title

        this.editOpened = 0
      })
    },
    deleteNumber(number) {
      this.deletingNumber = number
      this.deleteDialog = true
    },
    closeDeleteDialog() {
      this.deleteDialog = false
      this.deletingNumber = null
    },
    confirmDeleting() {
      axios.delete(process.env.VUE_APP_API_URL + `cardnumbers/${this.deletingNumber.id}?access_token=${this.$store.getters.getToken}`, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        this.loadNumbers()

        this.deleteDialog = false
        this.deletingNumber = null

        this.editOpened = 0
      })
    }
  },
}
</script>
