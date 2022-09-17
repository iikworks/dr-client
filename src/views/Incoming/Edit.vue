<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-form v-model="valid">
          <v-autocomplete
            :disabled="isLoading"
            v-model="liquid_id"
            :items="liquids"
            required
            label="Топливо"
            outlined
            dense
            :error="'liquid_id' in errors"
            :error-messages="errors.liquid_id"
            hide-details="auto"
            :append-icon="'mdi-reload'"
            @click:append="loadLiquids()"
          ></v-autocomplete>
          <v-text-field
            number
            :disabled="isLoading"
            v-model="amount"
            label="Количество"
            required
            outlined
            class="mt-3"
            dense
            autocomplete="off"
            :suffix="(selectedLiquid != null) ? selectedLiquid.unit + '.' : ''"
            :error="'amount' in errors"
            :error-messages="errors.amount"
            hide-details="auto"
          ></v-text-field>
          <v-text-field
            number
            :disabled="isLoading"
            v-model="number"
            label="Номер документа (может быть пустым)"
            autocomplete="off"
            outlined
            dense
            class="mt-3"
            :error="'number' in errors"
            :error-messages="errors.number"
            hide-details="auto"
          ></v-text-field>
          <v-text-field
            :disabled="isLoading"
            v-model="from_who"
            label="От кого"
            required
            outlined
            dense
            class="mt-3"
            :error="'from_who' in errors"
            :error-messages="errors.from_who"
            hide-details="auto"
          ></v-text-field>
          <v-btn
              class="mt-3 mb-3"
              block
              @click="showDate = !showDate"
              depressed
          >
            <v-icon left>
              mdi-calendar
            </v-icon>
            <b>Дата</b>
          </v-btn>
          <transition name="slide-fade">
            <v-date-picker
                v-model="date"
                v-if="showDate"
                full-width
                class="mt-3"
            ></v-date-picker>
          </transition>
          <transition name="slide-fade">
            <v-time-picker
                v-model="time"
                v-if="showDate"
                format="24hr"
                full-width
                class="mt-3"
            ></v-time-picker>
          </transition>
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
          <v-btn
            :disabled="isLoading"
            color="error"
            block
            text
            class="mt-1"
            depressed
            :dark="!isLoading"
            @click="openDeleteDialog(incoming)"
          >
            <v-icon left dark>
              mdi-delete
            </v-icon>
            <b>Удалить</b>
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <IncomingDeleteDialog
      :dialogActive="deleteDialog"
      :incoming="incomingToBeRemoved"
      @closeDialog="deleteDialog = false"
      @successfulDeleting="successfulDeleting"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import moment from 'moment'
import IncomingDeleteDialog from '@/components/Incoming/DeleteDialog'

export default {
  name: 'IncomingEdit',
  components: {
    IncomingDeleteDialog
  },
  computed: {
    liquids: function() {
      return this.liquidsToList(this.$store.getters.getLiquids)
    }
  },
  data() {
    return {
      valid: false,
      isLoading: false,
      liquid_id: 0,
      selectedLiquid: null,
      amount: 0.00,
      number: '',
      showDate: false,
      from_who: '',
      date: '',
      time: '',
      incoming: null,
      errors: {},
      deleteDialog: false,
      incomingToBeRemoved: {}
    }
  },
  mounted() {
    this.loadIncoming(this.$route.params.id)
  },
  methods: {
    loadIncoming(incomingId) {
      this.isLoading = true
      axios.get(process.env.VUE_APP_API_URL + `incoming/${incomingId}?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.incoming = response.data

        this.liquid_id = this.incoming.liquid.id
        this.changeSelectedLiquid()
        this.amount = this.incoming.amount
        if(this.incoming.number) this.number = this.incoming.number
        this.from_who = this.incoming.from_who
        this.date = moment(this.incoming.date).format('YYYY-MM-DD')
        this.time = moment(this.incoming.date).format('HH:mm')

        this.isLoading = false
      })
    },
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {
        date: `${this.date}T${this.time}`
      }
      if (this.amount != this.incoming.amount) data['amount'] = this.amount
      if (this.liquid_id != this.incoming.liquid.id) data['liquid_id'] = this.liquid_id
      if (this.number != this.incoming.number) data['number'] = this.number
      if (this.from_who != this.incoming.from_who) data['from_who'] = this.from_who

      axios.put(process.env.VUE_APP_API_URL + `incoming/${this.incoming.id}?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.loadLiquids()
        let message = `Приход <b>${response.data.amount} ${response.data.liquid.unit}. от ${response.data.from_who}</b> успешно сохранен.`
        eventBus.$emit('message', 'success', message)

        this.incoming = response.data

        this.liquid_id = this.incoming.liquid.id
        this.amount = this.incoming.amount
        if(this.incoming.number) this.number = this.incoming.number
        this.from_who = this.incoming.from_who
        this.date = moment(this.incoming.date).format('YYYY-MM-DD')
        this.time = moment(this.incoming.date).format('HH:mm')

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
    openDeleteDialog(incoming) {
      this.incomingToBeRemoved = incoming
      this.deleteDialog = true
    },
    successfulDeleting() {
      this.incomingToBeRemoved = {}
      this.deleteDialog = false
      this.loadLiquids(true)

      return this.$router.go(-1)
    },
    changeSelectedLiquid() {
      for (const liquid of this.liquids) {
        if (this.liquid_id == liquid.value) this.selectedLiquid = liquid
      }
    }
  },
  watch: {
    liquid_id() {
      this.changeSelectedLiquid()
    },
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>