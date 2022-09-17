<template>
  <v-container>
    <div>
      <v-btn
        depressed
        block
        small
        class="mb-2"
        :to="{ name: 'PanelHome' }"
      >
        <v-icon
          left
          dark
        >
          mdi-keyboard-return
        </v-icon>
        <b>Панель управления</b>
      </v-btn>
    </div>
    <div>
      <v-btn class="mb-2" depressed block color="success" :to="{ name: 'PanelHomeStatsCreate' }">
        <v-icon left dark>
          mdi-database-plus
        </v-icon>
        <b>Создать</b>
      </v-btn>
    </div>
    <transition name="slide-fade">
      <v-simple-table v-if="!loading">
        <template v-slot:default>
          <thead>
          <tr>
            <th class="text-left">
              Место
            </th>
            <th class="text-left">
              Позиция
            </th>
            <th class="text-left">
              Тип
            </th>
            <th class="text-left">
              Топливо
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="homestat in homestats"
            :key="homestat.id"
          >
            <td @click="openEditing(homestat.id)" v-if="homestat.place === 1" :style="$store.getters.getUserEmployee === 999 ? 'cursor: pointer;' : ''">Остатки</td>
            <td @click="openEditing(homestat.id)" v-if="homestat.place === 2" :style="$store.getters.getUserEmployee === 999 ? 'cursor: pointer;' : ''">Список расходов/приходов</td>
            <td @click="openEditing(homestat.id)" v-if="homestat.place === 3" :style="$store.getters.getUserEmployee === 999 ? 'cursor: pointer;' : ''">Средний расход</td>
            <td><b>{{ homestat.position }}</b></td>
            <td v-if="homestat.type === 'exp'">Расход</td>
            <td v-if="homestat.type === 'inc'">Приход</td>
            <td>{{ homestat.liquid.prefix }}<b> {{ homestat.liquid.title }}</b></td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>
    </transition>
  </v-container>
</template>

<script>
import {eventBus} from '@/main'
import axios from 'axios'

export default {
  name: 'HomeStatsList',
  data() {
    return {
      homestats: {},
      loading: false
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Настройки домашней страницы')

    this.loadHomeStats()
  },
  methods: {
    loadHomeStats() {
      this.loading = true
      this.homestats = {}

      axios.get(`${process.env.VUE_APP_API_URL}homestats/`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.homestats = response.data.homestats

        this.loading = false
      }).catch(() => {
        this.loading = false
        eventBus.$emit('message', 'error', '<b>Ошибка загрузки. Попробуйте снова.</b>')
      })
    },
    openEditing(homestatId) {
      return this.$router.push({ name: 'PanelHomeStatsEdit', params: { id: homestatId } })
    }
  },
  watch: {
    loading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>
