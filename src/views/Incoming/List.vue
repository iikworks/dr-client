<template>
  <v-container>
    <div v-if="$store.getters.getUserEmployee == 999">
      <v-btn depressed block color="success" :to="{ name: 'IncomingCreate' }">
        <v-icon left dark>
          mdi-database-plus
        </v-icon>
        <b>Создать</b>
      </v-btn>
    </div>
    <v-autocomplete
      :disabled="loading"
      v-model="liquid_id"
      :items="liquids"
      required
      label="Фильтр по топливу"
      dense
      class="mt-3"
      hide-details="auto"
      outlined
      :append-icon="'mdi-reload'"
      @click:append="loadLiquids()"
    ></v-autocomplete>
    <v-btn
      class="mt-3 mb-1"
      block
      @click="showDateFilter = !showDateFilter"
      depressed
    >
      <v-icon left dark>
        mdi-calendar
      </v-icon>
      <b>Фильтр по дате</b>
    </v-btn>
    <transition name="slide-fade">
      <div v-if="showDateFilter">
        <v-date-picker
          v-model="filterDateRange"
          full-width
          range
          class="mt-3 mb-3"
        ></v-date-picker>
      </div>
    </transition>
    <transition name="slide-fade">
      <v-btn
        v-if="filterDateRange[0] && filterDateRange[1]"
        color="grey darken-1"
        block
        dark
        @click="resetDateRangeFilter"
        depressed
      >
        <v-icon left dark>
          mdi-close
        </v-icon>
        <b>Сбросить дату {{ filterDateRange[0] }} - {{ filterDateRange[1] }}</b>
      </v-btn>
    </transition>
    <transition name="slide-fade">
      <v-btn
        v-if="liquid_id || filterDateRange[0] && filterDateRange[1]"
        class="mt-1 mb-3"
        block
        small
        @click="resetAllFilters"
        depressed
      >
        <v-icon left dark>
          mdi-close
        </v-icon>
        <b>Сбросить все фильтры</b>
      </v-btn>
    </transition>
    <v-row>
      <v-col
        cols="12"
        md="4"
        class="pt-2 pb-0"
      >
        <v-checkbox
          v-model="unverified"
          :disabled="loading"
          style="margin-bottom:-15px;margin-top:-8px;"
          label="Показать неотмеченные"
        ></v-checkbox>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="pt-2 pb-0"
      >
        <v-checkbox
          v-model="archive"
          :disabled="loading"
          style="margin-bottom:-15px;margin-top:-8px;"
          label="Архив"
        ></v-checkbox>
      </v-col>
    </v-row>
    <transition name="slide-fade">
      <v-simple-table v-if="!loading && incoming_list.length > 0" style="white-space: nowrap;">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                Дата
              </th>
              <th></th>
              <th class="text-left">
                Кол-во
              </th>
              <th class="text-left">
                От кого
              </th>
            </tr>
          </thead>
          <tbody>
            <IncomingTableRow
              v-for="incoming in incoming_list"
              :key="incoming.id"
              :incoming="incoming"
              :loadingVerified="loadingVerified"
              @setLoadingVerified="loadingVerified = $event"
              :loadIncoming="loadIncoming"
            />
          </tbody>
        </template>
      </v-simple-table>
    </transition>
    <transition name="slide-fade">
      <div v-if="!loading && incoming_list.length < 1">
        <v-alert
          class="mt-3"
          type="error"
          style="border-radius:20px;"
        >
          <b>Нет данных.</b>
        </v-alert>
      </div>
    </transition>
    <transition name="slide-fade">
      <div v-if="paginateButtons.length > 0 && !loading">
        <div class="pl-4 pt-2 pb-2">
          Показано: <b>{{ currentButton.startIncoming }}-{{ currentButton.finishIncoming }}</b> из <b>{{ incomingCount }}</b>
          <span v-if="amountLiquid"><br>Общий приход: <b>{{ amount | formatNumber }}</b> <span class="grey--text">{{ amountLiquid.unit }}.</span></span>
        </div>
        <v-divider></v-divider>
        <div class="pt-2 text-center" v-if="!loading">
          <span
            v-for="button in paginateButtons"
            :key="button.pageNumber"
          >
            <v-btn
              small
              v-if="button.pageNumber == pagesCount && currentPage != pagesCount && currentPage != pagesCount - 1 && currentPage != pagesCount - 2"
              depressed
              class="ml-1"
              active-class="no-active"
              disabled
            >
              <b>...</b>
            </v-btn>
            <v-btn
              small
              v-if="isShowButton(button)"
              @click="switchPage(button.pageNumber)"
              depressed
              :disabled="currentPage == button.pageNumber"
              class="ml-1"
              active-class="no-active"
            >
              <b>{{ button.startIncoming }}-{{ button.finishIncoming }}</b>
            </v-btn>
            <v-btn
              small
              v-if="button.pageNumber == 1 && currentPage != 1 && currentPage != 2 && currentPage != 3"
              depressed
              class="ml-1"
              active-class="no-active"
              disabled
            >
              <b>...</b>
            </v-btn>
          </span>
        </div>
      </div>
    </transition>
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import IncomingTableRow from '@/components/Incoming/TableRow'

export default {
  name: 'IncomingList',
  components: {
    IncomingTableRow
  },
  computed: {
    liquids: function() {
      return this.liquidsToList(this.$store.getters.getLiquids, true)
    }
  },
  data() {
    return {
      incoming_list: [],
      incomingCount: 0,
      perPage: 50,
      editDialog: false,
      currentPage: this.$route.query.page || 1,
      pagesCount: 1,
      liquid_id: this.$route.query.liquid_id,
      amount: 0,
      unverified: false,
      archive: false,
      amountLiquid: null,
      showDateFilter: false,
      loading: false,
      loadingVerified: 0,
      filterDateRange: [
        this.$route.query.s_date,
        this.$route.query.e_date,
      ],
      paginateButtons: [],
      currentButton: {},
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Приходы')
    this.loadIncoming()

    if(this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)
  },
  methods: {
    loadIncoming() {
      this.loading = true
      this.incoming_list = []

      let url = `${process.env.VUE_APP_API_URL}incoming/?order_column=date&order_type=desc`

      let offset = this.perPage * this.currentPage - this.perPage
      if (!offset) offset = 0
      url = url + `&offset=${offset}&limit=${this.perPage}`

      if (this.liquid_id && this.liquid_id != 0) {
        url = url + `&liquid_id=${parseInt(this.liquid_id)}`
      }
      if (
        this.$route.query.s_date && this.$route.query.s_date != ''
        && this.$route.query.e_date && this.$route.query.e_date != ''
      ) {
        url = url + `&s_date=${this.$route.query.s_date}`
        url = url + `&e_date=${this.$route.query.e_date}`
        this.filterDateRange = [
          this.$route.query.s_date,
          this.$route.query.e_date
        ]
      }
      if (this.$route.query.unverified && this.$route.query.unverified != false) {
        url = url + `&unverified=true`
        this.unverified = this.$route.query.unverified
      }
      if (this.$route.query.archive && this.$route.query.archive != false) {
        url = url + `&archive=true`
        this.archive = this.$route.query.archive
      }

      axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.incoming_list = response.data.incoming
        this.incomingCount = response.data.count
        if(response.data.amount) this.amount = response.data.amount
        else this.amount = 0
        if(response.data.liquid) this.amountLiquid = response.data.liquid
        else this.amountLiquid = null

        if(this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)

        this.countPages()

        this.loading = false
      })
    },
    countPages() {
      let pages = Math.ceil(this.incomingCount / this.perPage)

      let buttons = []

      for(var i = 0; i < pages; i++) {
        let finishIncoming = this.perPage * i + this.perPage
        if (finishIncoming > this.incomingCount) finishIncoming = this.incomingCount

        let button = {
          'pageNumber': i + 1,
          'startIncoming': this.perPage * i + 1,
          'finishIncoming': finishIncoming
        }
        buttons.push(button)

        if (this.currentPage == i + 1) this.currentButton = button
      }


      this.paginateButtons = buttons
      this.pagesCount = pages
    },
    resetDateRangeFilter() {
      let query = Object.assign({}, this.$route.query)
      if (query.s_date) delete query.s_date
      if (query.e_date) delete query.e_date
      this.filterDateRange = [
        undefined,
        undefined
      ]
      this.$router.replace({ query })

      this.showDateFilter = false
    },
    resetAllFilters() {
      let query = Object.assign({}, this.$route.query)
      if (query.liquid_id) delete query.liquid_id
      this.liquid_id = undefined
      if (query.s_date) delete query.s_date
      if (query.e_date) delete query.e_date
      this.filterDateRange = [
        undefined,
        undefined
      ]
      this.$router.replace({ query })

      this.showDateFilter = false

      this.currentPage = 1
    },
    isShowButton(button) {
      if (button.pageNumber + 1 == this.currentPage || button.pageNumber == this.currentPage || button.pageNumber - 1 == this.currentPage) return true
      if (button.pageNumber == this.pagesCount) return true
      if (button.pageNumber == 1 && this.currentPage != 1 && this.currentPage != 2) return true
      return false
    },
    switchPage(page) {
      this.$router.push({ query: { ...this.$route.query, page: page } })
    },
  },
  watch: {
    $route() {
      if (this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)

      if(this.$route.query.s_date) {
        if(this.$route.query.e_date){
          this.loadIncoming()
          window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
          })
        }
      }
      else {
        this.loadIncoming()
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      }
    },
    liquid_id(val) {
      if(this.$route.query.liquid_id != val) this.$router.push({ query: { ...this.$route.query, liquid_id: val } })
      this.currentPage = 1
    },
    filterDateRange(val) {
      if(this.$route.query.s_date != val[0] || this.$route.query.e_date != val[1]){
        let query = Object.assign({}, this.$route.query)
        if (query.date) delete query.date
        this.filterDate = undefined
        query.s_date = val[0]
        query.e_date = val[1]
        this.$router.push({ query })
      }

      if (val.length >= 2) {
        this.showDateFilter = false
        this.currentPage = 1
      }
    },
    currentPage(val) {
      if(this.$route.query.page != val) this.$router.push({ query: { ...this.$route.query, page: val } })
    },
    loading(val) {
      eventBus.$emit('setLoading', val)
    },
    unverified(val) {
      if(val == false) {
        let query = Object.assign({}, this.$route.query)
        if (query.unverified) delete query.unverified
        this.unverified = undefined
        return this.$router.replace({ query })
      }
      if(this.$route.query.unverified != val) this.$router.push({ query: { ...this.$route.query, unverified: true } })
      this.currentPage = 1
    },
    archive(val) {
      if(val == false) {
        let query = Object.assign({}, this.$route.query)
        if (query.archive) delete query.archive
        this.archive = undefined
        return this.$router.replace({ query })
      }
      if(this.$route.query.archive != val) this.$router.push({ query: { ...this.$route.query, archive: true } })
      this.currentPage = 1
    }
  }
}
</script>

<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
