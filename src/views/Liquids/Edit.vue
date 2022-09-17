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
            @click="openDeleteDialog(liquid)"
        >
            <v-icon left dark>
            mdi-delete
            </v-icon>
            <b>Удалить</b>
        </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <LiquidsDeleteDialog
      :dialogActive="deleteDialog"
      :liquid="liquidToBeRemoved"
      @closeDialog="deleteDialog = false"
      @successfulDeleting="successfulDeleting"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import LiquidsDeleteDialog from '@/components/Liquids/DeleteDialog'

export default {
  name: 'WorkersEdit',
  components: {
    LiquidsDeleteDialog
  },
  data() {
    return {
      valid: false,
      prefix: '',
      isLoading: false,
      title: '',
      balance: 0.00,
      unit: 'л',
      errors: {},
      liquid: {},
      deleteDialog: false,
      liquidToBeRemoved: {}
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Редактирование ГСМ')

    this.loadLiquid(this.$route.params.id)
  },
  methods: {
    loadLiquid(liquidId) {
      this.isLoading = true
      axios.get(process.env.VUE_APP_API_URL + `liquids/${liquidId}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.liquid = response.data

        this.prefix = this.liquid.prefix
        this.title = this.liquid.title
        this.balance = this.liquid.balance
        this.unit = this.liquid.unit

        this.isLoading = false
      })
    },
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {}
      if (this.prefix != this.liquid.prefix) data['prefix'] = this.prefix
      if (this.title != this.liquid.title) data['title'] = this.title
      if (this.balance != this.liquid.balance) data['balance'] = this.balance
      if (this.unit != this.liquid.unit) data['unit'] = this.unit

      axios.put(process.env.VUE_APP_API_URL + `liquids/${this.liquid.id}?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let message = `<b>${response.data.title}</b> успешно сохранено.`
        if (response.data.prefix) message = `${response.data.prefix} ` + message
        eventBus.$emit('message', 'success', message)

        this.liquid = response.data

        this.prefix = this.liquid.prefix
        this.title = this.liquid.title
        this.balance = this.liquid.balance
        this.unit = this.liquid.unit

        this.loadLiquids(true)
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
    openDeleteDialog(liquid) {
      this.liquidToBeRemoved = liquid
      this.deleteDialog = true
    },
    successfulDeleting() {
      this.liquidToBeRemoved = {}
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