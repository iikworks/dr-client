<template>
  <v-container>
    <v-btn depressed block dark :to="{ name: 'PanelHomeStatsList' }">
      <v-icon left dark>
        mdi-keyboard-return
      </v-icon>

      <b>Вернуться</b>
    </v-btn>
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-form v-model="valid">
          <v-autocomplete
            :disabled="isLoading"
            v-model="liquid_id"
            :items="liquids"
            required
            class="mt-3"
            label="Топливо"
            dense
            :error="'liquid_id' in errors"
            :error-messages="errors.liquid_id"
            hide-details="auto"
            outlined
            :append-icon="'mdi-reload'"
            @click:append="loadLiquids"
          ></v-autocomplete>
          <v-autocomplete
            :disabled="isLoading"
            v-model="place"
            :items="places"
            required
            class="mt-3"
            label="Место"
            dense
            :error="'place' in errors"
            :error-messages="errors.place"
            hide-details="auto"
            outlined
          ></v-autocomplete>
          <v-autocomplete
            :disabled="isLoading"
            v-model="type"
            :items="types"
            required
            class="mt-3"
            label="Тип (для списка расходов/приходов)"
            dense
            :error="'type' in errors"
            :error-messages="errors.type"
            hide-details="auto"
            outlined
          ></v-autocomplete>
          <v-text-field
            number
            :disabled="isLoading"
            v-model="position"
            label="Позиция"
            required
            dense
            autocomplete="off"
            class="mt-3"
            :error="'position' in errors"
            :error-messages="errors.position"
            hide-details="auto"
            outlined
          ></v-text-field>
          <v-text-field
            :disabled="isLoading"
            v-model="title"
            label="Наименование"
            autocomplete="off"
            required
            dense
            class="mt-3 mb-3"
            :error="'title' in errors"
            :error-messages="errors.title"
            hide-details="auto"
            outlined
          ></v-text-field>
          <v-btn
            :disabled="isLoading"
            color="success"
            class="mr-4"
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
  name: 'HomeStatsCreate',
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
      title: '',
      place: 0,
      places: [
        {
          value: 1,
          text: 'Остатки'
        }, {
          value: 2,
          text: 'Список расходов/приходов'
        }, {
          value: 3,
          text: 'Средний расход'
        }
      ],
      position: 1,
      type: 0,
      types: [
      {
        value: 'exp',
        text: 'Расход'
      }, {
        value: 'inc',
        text: 'Приход'
      }
    ],
      errors: {}
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Создание позиции')
  },
  methods: {
    validate(e) {
      e.preventDefault()

      this.errors = {}
      this.isLoading = true

      let data = {
        liquid_id: this.liquid_id,
        title: this.title,
        place: this.place,
        position: this.position,
        type: this.type,
      }

      axios.post(process.env.VUE_APP_API_URL + `homestats/?access_token=${this.$store.getters.getToken}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        let message = `Запись <b>${response.data.title}</b> успешно создана.`
        eventBus.$emit('message', 'success', message)

        return this.$router.push({ name: 'PanelHomeStatsList' })
      }).catch(error => {
        if (error.response.status == 422) {
          this.errors = error.response.data.errors.json
          this.isLoading = false
        } else {
          this.snackbar = {
            active: true,
            text: 'Произошла какая-то ошибка. Попробуйте позже.'
          }

          this.isLoading = false
        }
      })
    },
  },
  watch: {
    isLoading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>
