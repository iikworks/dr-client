<template>
  <v-container>
    <div v-if="$store.getters.getUserEmployee == 999" class="mb-3">
      <v-btn depressed block color="success" :to="{ name: 'LiquidsCreate' }">
        <v-icon left dark>
          mdi-database-plus
        </v-icon>
        <b>Создать</b>
      </v-btn>
    </div>
    <transition name="slide-fade">
      <v-simple-table v-if="liquids.length > 0" style="white-space: nowrap;">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                ID
              </th>
              <th class="text-left">
                Наименование
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="liquid in liquids"
              :key="liquid.id"
            >
              <td @click="openEditing(liquid.id)" style="cursor: pointer;"><b>{{ liquid.id }}</b></td>
              <td @click="openFullInfo(liquid)" style="cursor: pointer;">
                <span class="grey--text">{{ liquid.prefix }}</span> <b>{{ liquid.title }}</b>
                <br>
                {{ liquid.balance | formatNumber }} <span class="grey--text">{{ liquid.unit }}.</span>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </transition>
    <transition name="slide-fade">
      <div v-if="paginateButtons.length > 0">
        <v-divider></v-divider>
        <div class="pl-4 pt-2 pb-2">
          Показано: <b>{{ currentButton.startLiquid }}-{{ currentButton.finishLiquid }}</b> из <b>{{ liquidsCount }}</b>
        </div>
        <v-divider></v-divider>
        <div class="pt-2 text-center">
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
              <b>{{ button.startLiquid }}-{{ button.finishLiquid }}</b>
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
    <LiquidsInfoDialog
      v-if="fullInfo"
      :dialog="fullInfoDialog"
      :liquid="fullInfo"
      @closeDialog="fullInfoDialog = false"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import LiquidsInfoDialog from '@/components/Liquids/InfoDialog'

export default {
  name: 'Liquids',
  components: {
    LiquidsInfoDialog
  },
  data() {
    return {
      liquids: [],
      liquidsCount: 0,
      perPage: 25,
      loading: false,
      fullInfo: null,
      fullInfoDialog: false,
      currentPage: 1,
      pagesCount: 1,
      editLiquidId: 0,
      paginateButtons: [],
      currentButton: {},
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Топливо')
    this.loadLiquids()

    if(this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)
  },
  methods: {
    loadLiquids() {
      this.liquids = []
      this.loading = true

      let url = `${process.env.VUE_APP_API_URL}liquids/?order_column=balance&order_type=desc`

      let offset = this.perPage * this.currentPage - this.perPage
      if (!offset) offset = 0
      url = url + `&offset=${offset}&limit=${this.perPage}`

      axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.liquids = response.data.liquids
        this.liquidsCount = response.data.count

        this.countPages()
        this.loading = false
      })
    },
    countPages() {
      let pages = Math.ceil(this.liquidsCount / this.perPage)

      let buttons = []

      for(var i = 0; i < pages; i++) {
        let finishLiquid = this.perPage * i + this.perPage
        if (finishLiquid > this.liquidsCount) finishLiquid = this.liquidsCount

        let button = {
          'pageNumber': i + 1,
          'startLiquid': this.perPage * i + 1,
          'finishLiquid': finishLiquid
        }
        buttons.push(button)

        if (this.currentPage == i + 1) this.currentButton = button
      }


      this.paginateButtons = buttons
      this.pagesCount = pages
    },
    openEditing(liquidId) {
      this.$router.push({ name: 'LiquidsEdit', params: { id: liquidId }})
    },
    openFullInfo(liquid) {
      this.fullInfo = liquid
      this.fullInfoDialog = true
    },
    isShowButton(button) {
      if (button.pageNumber + 1 == this.currentPage || button.pageNumber == this.currentPage || button.pageNumber - 1 == this.currentPage) return true
      if (button.pageNumber == this.pagesCount) return true
      if (button.pageNumber == 1 && this.currentPage != 1 && this.currentPage != 2) return true
      return false
    },
    switchPage(page) {
      this.$router.push({ query: { ...this.$route.query, page: page } })
    }
  },
  watch: {
    $route() {
      if (this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)
      this.loadLiquids()

      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    },
    loading(val) {
      eventBus.$emit('setLoading', val)
    },
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
