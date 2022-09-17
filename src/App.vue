<template>
  <v-app style="font-family: 'Inter', sans-serif;">
    <AppDrawer />
    <v-app-bar flat app>
      <v-app-bar-nav-icon @click.stop="toggleDrawer"></v-app-bar-nav-icon>
      <v-toolbar-title v-html="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-on:click="toggleDarkTheme">
          <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
      <v-btn v-if="!user" icon :to="{ name: 'Login' }">
        <v-icon>mdi-login</v-icon>
      </v-btn>
      <v-btn v-if="user" icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <transition name="fade" mode="out-in">
        <router-view class="pt-4"/>
      </transition>
    </v-main>
    <v-bottom-navigation fixed>
      <v-btn v-if="$store.getters.getUserEmployee == 999" @click="addExpense">
        <span><b>Добавить расход</b></span>

        <v-icon>mdi-database-plus</v-icon>
      </v-btn>
      <v-btn @click="goBack">
        <span><b>Назад</b></span>

        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <v-footer padless style="margin-bottom: 50px;">
      <v-col
        class="text-center"
        cols="12"
      >
        &copy; 2020-2021 — <strong>DR</strong> 0.5
        <br>
        Разработка и поддержка: <b><router-link style="text-decoration:none;" :to="{ name: 'UsersView', params: { id: 1 } }" class="blue--text">Игорь Карплюк</router-link></b>
      </v-col>
    </v-footer>
    <v-snackbar v-model="snackbar.active" :color="snackbar.color">
      <span v-html="snackbar.text"></span>

      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar.active = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import {eventBus} from './main'
import AppDrawer from './components/AppDrawer'

export default {
  name: 'App',
  components: {
    AppDrawer,
  },
  data() {
    return {
      title: 'DR',
      snackbar: {
        active: false,
        text: '',
        color: 'error'
      },
      loading: false
    }
  },
  computed: {
    user: function() {
      return this.$store.getters.getUser
    }
  },
  mounted() {
    if (this.$store.getters.getToken != null) this.loadUser()
    this.$vuetify.theme.dark = this.$store.getters.getDarkTheme

    this.loadLiquids(true);
    this.loadWorkers(true);
    this.loadVehicles(true);
    this.loadUsing();
  },
  created() {
    eventBus.$on('login', () => {
      this.loadUser()
    })
    eventBus.$on('message', (color, text) => {
      this.snackbar = {
        active: true,
        text: text,
        color: color
      }
    })
    eventBus.$on('setTitle', (title) => {
      this.title = title
    })
    eventBus.$on('setLoading', (loading) => {
      this.loading = loading
    })
  },
  methods: {
    loadUser() {
      axios.get(`${process.env.VUE_APP_API_URL}auth/me?access_token=${this.$store.getters.getToken}`, {
          email: this.email,
          password: this.password,
        }, {
          headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.$store.commit('SET_USER', response.data)
      })
    },
    logout() {
      axios.get(`${process.env.VUE_APP_API_URL}auth/logout?access_token=${this.$store.getters.getToken}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(() => {
        this.$store.commit('SET_TOKEN', null)
        this.$store.commit('SET_USER', null)
      })
    },
    toggleDrawer() {
      this.$store.commit('SET_APP_DRAWER', !this.$store.getters.getAppDrawer)
    },
    toggleDarkTheme() {
      this.$store.commit('SET_DARK_THEME', !this.$store.getters.getDarkTheme)
      this.$vuetify.theme.dark = this.$store.getters.getDarkTheme
    },
    moment() {
      return moment()
    },
    goBack() {
      return this.$router.go(-1)
    },
    addExpense() {
      return this.$router.push({ name: 'ExpensesCreate' })
    }
  }
};
</script>

<style>
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateX(2em);
}
.fade-enter-active, .fade-leave-active {
  transition: all .3s ease;
}
</style>