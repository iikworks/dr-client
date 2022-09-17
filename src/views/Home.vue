<template>
  <v-container>
    <h1 class="display-2 text-center mt-3 mb-6">
      Сегодня <b>{{ moment().format('DD.MM.YYYY') }}</b>
    </h1>
    <v-divider class="mt-5 mb-4"></v-divider>
    <div>
      <transition name="slide-fade">
        <div class="mb-2" style="opacity: 0.9">
          <v-row>
            <v-col
              v-for="average in averages" :key="average.id"
              cols="12"
              md="3"
              class="pt-0 pb-0"
            >
              <v-card class="blue darken-4 mt-1" elevation="0" :to="{ name: 'Stats', params: { id: average.liquid.id } }">
                <v-list-item>
                  <v-list-item-content>
                    <v-icon
                      large
                      style="position: absolute;margin-left: -30px;"
                      color="blue lighten-3"
                    >
                      mdi-chart-areaspline
                    </v-icon>
                    <v-list-item-title class="blue--text text--lighten-4 text-center" style="margin-bottom: -5px;"><b>{{ average.average_expense | formatNumber }}</b> {{ average.liquid.unit }}.</v-list-item-title>
                    <v-list-item-subtitle class="text-center white--text">{{ average.title }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
            <v-col
              cols="12"
              md="3"
              class="pt-0 pb-0"
              v-if="!loading && unchecked.expenses && unchecked.expenses"
            >
              <v-card :to="{ name: 'Expenses', query: { unverified: true } }" class="red darken-4 mt-1" elevation="0" v-if="unchecked.expenses.count > 0">
                <v-list-item>
                  <v-list-item-content>
                    <v-icon
                      large
                      style="position: absolute;margin-left: -30px;"
                      color="red lighten-3"
                    >
                      mdi-database-export
                    </v-icon>
                    <v-list-item-title class="red--text text--lighten-4 text-center" style="margin-bottom: -5px;"><b>{{ unchecked.expenses.count }}</b></v-list-item-title>
                    <v-list-item-subtitle class="text-center white--text">Непроверенные расходы</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
            <v-col
              cols="12"
              md="3"
              class="pt-0 pb-0"
              v-if="!loading && unchecked.expenses && unchecked.incoming"
            >
              <v-card :to="{ name: 'Incoming', query: { unverified: true } }" class="red darken-4 mt-1" elevation="0" two-line v-if="unchecked.incoming.count > 0">
                <v-list-item>
                  <v-list-item-content>
                    <v-icon
                      large
                      style="position: absolute;margin-left: -30px;"
                      color="red lighten-3"
                    >
                      mdi-database-import
                    </v-icon>
                    <v-list-item-title class="red--text text--lighten-4 text-center" style="margin-bottom: -5px;"><b>{{ unchecked.incoming.count }}</b></v-list-item-title>
                    <v-list-item-subtitle class="text-center white--text">Непроверенные приходы</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </transition>
    </div>
    <div>
      <transition name="slide-fade">
        <div v-if="!loading">
          <v-card class="mx-auto mt-1" elevation="0" two-line v-for="homestat in homestats" :key="homestat.id">
            <v-list-item v-if="homestat.place === 1">
              <v-list-item-content>
                <v-list-item-title :class="{
                  'grey--text text--darken-2': !$store.getters.getDarkTheme,
                  'grey--text text--lighten-1': $store.getters.getDarkTheme
                }">{{ homestat.title }}</v-list-item-title>
                <v-list-item-subtitle><b :class="{
                  'black--text': !$store.getters.getDarkTheme,
                  'white--text': $store.getters.getDarkTheme
                }">{{ homestat.liquid.balance | formatNumber }}</b> {{ homestat.liquid.unit }}.</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </div>
      </transition>
    </div>
    <v-divider class="mt-5"></v-divider>
    <transition name="slide-fade">
      <div v-if="!loading">
        <div v-for="homestat in homestats" :key="homestat.id">
          <div v-if="homestat.expenses || homestat.incoming" class="ma-5 text-center">
            <h1 class="display-1 pb-0"><b>{{ homestat.title }}</b></h1>
            {{ homestat.type_display }} / <b>{{ moment().format('DD.MM.YYYY') }}</b>
          </div>
          <v-simple-table v-if="homestat.expenses" style="white-space: nowrap;">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    Время
                  </th>
                  <th class="text-left"></th>
                  <th class="text-left">
                    Кол-во
                  </th>
                  <th class="text-left">
                    Кому
                  </th>
                  <th class="text-left">
                    Назначение
                  </th>
                </tr>
              </thead>
              <tbody>
                <ExpenseTableRow
                    v-for="expense in homestat.expenses.expenses"
                    :key="expense.id"
                    :expense="expense"
                    :isHome="true"
                    :loadingVerified="loadingVerified"
                    @setLoadingVerified="loadingVerified = $event"
                />
                <tr>
                  <td></td>
                  <td style="margin:0px;padding:0px;"><u>Всего:</u></td>
                  <td><u><b>{{ homestat.expenses.amount | formatNumber }}</b> {{ homestat.liquid.unit }}.</u></td>
                  <td><u>Всего заправок:</u></td>
                  <td><u><b>{{ homestat.expenses.count }}</b></u></td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <v-simple-table v-if="homestat.incoming" style="white-space: nowrap;">
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-left">
                  Время
                </th>
                <th class="text-left"></th>
                <th class="text-left">
                  Кол-во
                </th>
                <th class="text-left">
                  От кого
                </th>
                <th class="text-left">

                </th>
              </tr>
              </thead>
              <tbody>
              <IncomingTableRow
                  v-for="incoming in homestat.incoming.incoming"
                  :key="incoming.id"
                  :incoming="incoming"
                  :isHome="true"
                  :loadingVerified="loadingVerified"
                  @setLoadingVerified="loadingVerified = $event"
              />
              <tr>
                <td></td>
                <td style="margin:0px;padding:0px;"><u>Всего:</u></td>
                <td><u><b>{{ homestat.incoming.amount | formatNumber }}</b> {{ homestat.liquid.unit }}.</u></td>
                <td><u>Всего приходов:</u></td>
                <td><u><b>{{ homestat.incoming.count }}</b></u></td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </div>
    </transition>
  </v-container>
</template>

<script>
import {eventBus} from '@/main'
import axios from 'axios'
import moment from 'moment'
import ExpenseTableRow from '@/components/Expenses/TableRow'
import IncomingTableRow from '@/components/Incoming/TableRow'

export default {
  name: 'Home',
  components: {
    ExpenseTableRow,
    IncomingTableRow
  },
  data() {
    return {
      homestats: {},
      loading: false,
      loadingVerified: 0,
      averages: [],
      unchecked: {}
    }
  },
  created() {
    eventBus.$on('reloadUnchecked', () => {
      this.loadUnchecked()
    })
  },
  mounted() {
    eventBus.$emit('setTitle', 'Главная')

    this.loadHomeStats()
    this.loadUnchecked()
  },
  methods: {
    loadHomeStats() {
      this.loading = true
      this.homestats = {}
      this.averages = []

      axios.get(`${process.env.VUE_APP_API_URL}homestats/`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.homestats = response.data.homestats

        for(let homestat of this.homestats) {
          if (homestat.place == 3) this.averages.push(homestat)
        }

        this.loading = false
      }).catch((e) => {
        console.log(e)
        this.loading = false
        eventBus.$emit('message', 'error', '<b>Ошибка загрузки. Попробуйте снова.</b>')
      })
    },
    loadUnchecked() {
      axios.get(`${process.env.VUE_APP_API_URL}homestats/unchecked`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.unchecked = response.data

        this.loading = false
      }).catch(() => {
        this.loading = false
        eventBus.$emit('message', 'error', '<b>Ошибка загрузки. Попробуйте снова.</b>')
      })
    },
    setVerifiedExpense(expense) {
      if (this.$store.getters.getUserEmployee != 999) return false;
      if (this.loadingVerified !== 0) return false;

      this.loadingVerified = expense.id

      let nextVerified = 0
      if (expense.verified == 0 || expense.verified == 1) nextVerified = expense.verified + 1

      axios.put(process.env.VUE_APP_API_URL + `expenses/${expense.id}?access_token=${this.$store.getters.getToken}`, {
        verified: nextVerified
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        expense.verified = nextVerified
        this.loadingVerified = 0
      }).catch(() => {
        this.loadingVerified = 0
      })
    },
    moment(date = null) {
      if (date) return moment(date)
      return moment()
    },
    setVerifiedIncoming(incoming) {
      if (this.$store.getters.getUserEmployee != 999) return false;
      if (this.loadingVerified !== 0) return false;

      this.loadingVerified = incoming.id

      let nextVerified = 0
      if (incoming.verified == 0 || incoming.verified == 1) nextVerified = incoming.verified + 1

      axios.put(process.env.VUE_APP_API_URL + `incoming/${incoming.id}?access_token=${this.$store.getters.getToken}`, {
        verified: nextVerified
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        incoming.verified = nextVerified
        this.loadingVerified = 0
      }).catch(() => {
        this.loadingVerified = 0
      })
    }
  },
  watch: {
    loading(val) {
      eventBus.$emit('setLoading', val)
    }
  }
}
</script>
