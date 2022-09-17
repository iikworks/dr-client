<template>
  <v-container>
    <div v-if="$store.getters.getUserEmployee == 999" class="mb-2">
      <v-btn depressed block color="green accent-4" :to="{ name: 'NewsCreate' }">
        <v-icon left dark>
          mdi-database-plus
        </v-icon>
        <b>Создать</b>
      </v-btn>
    </div>
    <v-expansion-panels v-if="!loading && postsCount > 0">
      <v-expansion-panel
        v-for="post in posts"
        :key="post.id"
      >
        <v-expansion-panel-header class="text-md-h5">
          {{ post.title }}<span class="ml-1 grey--text">от {{ moment(post.created_at).format('DD.MM.YYYY') }}</span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <div v-html="post.text"></div>
          <div class="mt-5" v-if="$store.getters.getUserEmployee == 999">
            <router-link style="text-decoration: none;" :to="{ name: 'NewsEdit', params: { id: post.id } }" class="orange--text">Редактировать</router-link>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
import axios from 'axios'
import moment from "moment"
import {eventBus} from '@/main'

export default {
  name: 'Posts',
  data() {
    return {
      posts: [],
      postsCount: 0,
      loading: false,
      perPage: 25,
      currentPage: 1,
      pagesCount: 1,
      paginateButtons: [],
      currentButton: {},
    }
  },
  created() {

  },
  mounted() {
    eventBus.$emit('setTitle', 'Новости')

    this.loadPosts()
  },
  methods: {
    loadPosts() {
      this.loading = true
      this.vehicles = []
      
      let url = `${process.env.VUE_APP_API_URL}posts/?order_column=id&order_type=desc`

      let offset = this.perPage * this.currentPage - this.perPage
      if (!offset) offset = 0
      url = url + `&offset=${offset}&limit=${this.perPage}`

      axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.posts = response.data.posts
        this.postsCount = response.data.count

        this.countPages()
        this.loading = false
      })
    },
    countPages() {
      let pages = Math.ceil(this.postsCount / this.perPage)

      let buttons = []

      for(var i = 0; i < pages; i++) {
        let finishPost = this.perPage * i + this.perPage
        if (finishPost > this.postsCount) finishPost = this.postsCount

        let button = {
          'pageNumber': i + 1,
          'startPost': this.perPage * i + 1,
          'finishPost': finishPost
        }
        buttons.push(button)

        if (this.currentPage == i + 1) this.currentButton = button
      }


      this.paginateButtons = buttons
      this.pagesCount = pages
    },
    switchPage(page) {
      this.$router.push({ query: { ...this.$route.query, page: page } })
    },
    moment(date){
      return moment(date)
    },
  },
  watch: {
    $route() {
      if (this.$route.query.page) this.currentPage = parseInt(this.$route.query.page)
      this.loadPosts()

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
