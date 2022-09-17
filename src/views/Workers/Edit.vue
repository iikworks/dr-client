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
              class="mt-3"
              dense
              outlined
              :error="'last_name' in errors"
              :error-messages="errors.last_name"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              :disabled="isLoading"
              v-model="first_name"
              label="Имя"
              autocomplete="off"
              class="mt-3"
              dense
              outlined
              :error="'first_name' in errors"
              :error-messages="errors.first_name"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              :disabled="isLoading"
              v-model="patronymic"
              label="Отчество (может быть пустым)"
              autocomplete="off"
              class="mt-3"
              dense
              outlined
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
              class="mt-3"
            depressed
            :dark="!isLoading"
            @click="validate"
        >
            <v-icon left dark>
            mdi-database-plus
            </v-icon>
            <b>Сохранить</b>
        </v-btn>
        <v-btn
            :disabled="isLoading"
            color="error"
            block
            text
            class="mt-1"
            depressed
            :dark="!isLoading"
            @click="openDeleteDialog(worker)"
        >
            <v-icon left dark>
            mdi-delete
            </v-icon>
            <b>Удалить</b>
        </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <WorkersDeleteDialog
      :dialogActive="deleteDialog"
      :worker="workerToBeRemoved"
      @closeDialog="deleteDialog = false"
      @successfulDeleting="successfulDeleting"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import WorkersDeleteDialog from '@/components/Workers/DeleteDialog'

export default {
  name: 'WorkersEdit',
  components: {
    WorkersDeleteDialog
  },
  computed: {
    workers: function() {
      return this.workersToList(this.$store.getters.getWorkers)
    }
  },
  data() {
    return {
      valid: false,
      isLoading: false,
      prefix: '',
      first_name: '',
      last_name: '',
      patronymic: '',
      show_full_name: false,
      worker: {},
      errors: {},
      deleteDialog: false,
      workerToBeRemoved: {}
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Редактирование работника')

    this.loadWorker(this.$route.params.id)
  },
  methods: {
    loadWorker(workerId) {
      this.isLoading = true
      axios.get(process.env.VUE_APP_API_URL + `workers/${workerId}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.worker = response.data

        this.first_name = this.worker.first_name
        this.last_name = this.worker.last_name
        this.patronymic = this.worker.patronymic
        this.show_full_name = this.worker.show_full_name

        this.isLoading = false
      })
    },
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {}
      if (this.first_name != this.worker.first_name) data['first_name'] = this.first_name
      if (this.last_name != this.worker.last_name) data['last_name'] = this.last_name
      if (this.patronymic != this.worker.patronymic) data['patronymic'] = this.patronymic
      if (this.show_full_name != this.worker.show_full_name) data['show_full_name'] = this.show_full_name

      axios.put(process.env.VUE_APP_API_URL + `workers/${this.worker.id}?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let message = `Работник <b>${response.data.first_name} ${response.data.last_name}</b> успешно сохранен.`
        eventBus.$emit('message', 'success', message)

        this.worker = response.data

        this.first_name = this.worker.first_name
        this.last_name = this.worker.last_name
        this.patronymic = this.worker.patronymic
        this.show_full_name = this.worker.show_full_name

        this.loadWorkers(true)
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
    openDeleteDialog(worker) {
      this.workerToBeRemoved = worker
      this.deleteDialog = true
    },
    successfulDeleting() {
      this.workerToBeRemoved = {}
      this.deleteDialog = false

      this.$router.go(-1)
    }
  },
  watch: {
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>