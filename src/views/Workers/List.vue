<template>
  <v-container>
    <div v-if="$store.getters.getUserEmployee == 999" class="mb-3">
      <v-btn depressed block color="success" :to="{ name: 'WorkersCreate' }">
        <v-icon left dark>
          mdi-database-plus
        </v-icon>
        <b>Создать</b>
      </v-btn>
    </div>
    <transition name="slide-fade">
      <v-simple-table v-if="workers.length > 0" style="white-space: nowrap;">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                ID
              </th>
              <th class="text-left">
                Имя и фамилия
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="worker in workers"
              :key="worker.id"
            >
              <td @click="openEditing(worker.id)" style="cursor: pointer;"><b>{{ worker.id }}</b></td>
              <td @click="openFullInfoWorkerDialog(worker)" style="cursor: pointer;">
                <b>{{ worker.last_name }}</b> <b>{{ worker.first_name }}</b>
                <br>
                <span class="grey--text" v-if="worker.patronymic">{{ worker.patronymic }}</span>
                <b class="grey--text" v-else>—</b>
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
          Показано: <b>{{ currentButton.startWorker }}-{{ currentButton.finishWorker }}</b> из <b>{{ workersCount }}</b>
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
              <b>{{ button.startWorker }}-{{ button.finishWorker }}</b>
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
    <WorkersInfoDialog
      v-if="fullInfoWorker"
      :dialog="fullInfoWorkerDialog"
      :worker="fullInfoWorker"
      @closeDialog="fullInfoWorkerDialog = false"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'
import WorkersInfoDialog from '@/components/Workers/InfoDialog'

export default {
  name: 'Workers',
  components: {
    WorkersInfoDialog
  },
  data() {
    return {
      workers: [],
      workersCount: 0,
      perPage: 25,
      currentPage: 1,
      loading: false,
      pagesCount: 1,
      paginateButtons: [],
      currentButton: {},
      fullInfoWorkerDialog: false,
      fullInfoWorker: null,
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Работники')
    this.loadWorkers()
    if(this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)
  },
  methods: {
    loadWorkers() {
      this.workers = []
      this.loading = true

      let url = `${process.env.VUE_APP_API_URL}workers/?order_column=id&order_type=desc`

      let offset = this.perPage * this.currentPage - this.perPage
      if (!offset) offset = 0
      url = url + `&offset=${offset}&limit=${this.perPage}`

      axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.workers = response.data.workers
        this.workersCount = response.data.count

        this.countPages()
        this.loading = false
      })
    },
    countPages() {
      let pages = Math.ceil(this.workersCount / this.perPage)

      let buttons = []

      for(var i = 0; i < pages; i++) {
        let finishWorker = this.perPage * i + this.perPage
        if (finishWorker > this.workersCount) finishWorker = this.workersCount

        let button = {
          'pageNumber': i + 1,
          'startWorker': this.perPage * i + 1,
          'finishWorker': finishWorker
        }
        buttons.push(button)

        if (this.currentPage == i + 1) this.currentButton = button
      }


      this.paginateButtons = buttons
      this.pagesCount = pages
    },
    openEditing(workerId) {
      this.$router.push({ name: 'WorkersEdit', params: {id: workerId }})
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
    openFullInfoWorkerDialog(worker) {
      this.fullInfoWorker = worker
      this.fullInfoWorkerDialog = true
    }
  },
  watch: {
    $route() {
      if (this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)
      this.loadWorkers()

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
