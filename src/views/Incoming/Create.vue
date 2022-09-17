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
            <b>Создать</b>
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import {eventBus} from '@/main'

export default {
  name: 'IncomingCreate',
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
      amount: '',
      number: '',
      from_who: '',
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm'),
      showDate: false,
      errors: {}
    }
  },
  mounted() {
    if (this.$store.getters.getLiquids.length > 0) {
      this.liquid_id = this.$store.getters.getLiquids[0].id
    }

    eventBus.$emit('setTitle', 'Создание прихода')
  },
  methods: {
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {
        liquid_id: this.liquid_id,
        amount: this.amount,
        from_who: this.from_who,
        date: `${this.date}T${this.time}`
      }
      if (this.number != '') data['number'] = this.number

      axios.post(process.env.VUE_APP_API_URL + `incoming/?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.loadLiquids(true)
        let message = `Приход <b>${response.data.amount} ${response.data.liquid.unit}. от ${response.data.from_who}</b> успешно создан.`
        eventBus.$emit('message', 'success', message)

        return this.$router.go(-1)
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
    }
  },
  watch: {
    liquid_id() {
      for (const liquid of this.liquids) {
        if (this.liquid_id == liquid.value) this.selectedLiquid = liquid
      }
    },
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>