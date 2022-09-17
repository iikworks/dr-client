<template>
  <v-navigation-drawer
    absolute
    app
    fixed
    permanent
    stateless
    v-if="!drawer"
    style="height: 100vh;"
  >
    <v-list dense nav class="py-0">
      <v-list-item two-line :class="drawer && 'px-0'" v-if="user" class="mb-0">
        <v-list-item-avatar>
          <img src="@/assets/img/noavatar.png">
        </v-list-item-avatar>

        <v-list-item-content :to="{ name: 'UsersView', params: { id: user.id } }">
          <v-list-item-title><router-link style="text-decoration: none;" class="blue--text" :to="{ name: 'UsersView', params: { id: user.id } }">{{ user.first_name }} {{ user.last_name }}</router-link></v-list-item-title>
          <v-list-item-subtitle>ID: {{ user.id }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <div v-if="user && $store.getters.getUserEmployee == 999" class="mt-0" @click="closeDrawer">
        <v-btn depressed block dark color="green" small class="mb-1" :to="{ name: 'PanelHome' }">
          <b>Панель управления</b>
        </v-btn>
      </div>

      <v-divider v-if="user"></v-divider>

      <div class="mt-1"></div>

      <v-list-item link :to="{ name: 'Home' }" @click="closeDrawer">
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Главная</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link :to="{ name: 'News' }" @click="closeDrawer">
        <v-list-item-icon>
          <v-icon>mdi-newspaper</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Новости</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-if="user && $store.getters.getUserEmployee == 999" link :to="{ name: 'Numbers' }" @click="closeDrawer">
        <v-list-item-icon>
          <v-icon>mdi-counter</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Номера документов</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link :to="{ name: 'Liquids' }" @click="closeDrawer">
        <v-list-item-icon>
          <v-icon>mdi-fuel</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Топливо</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link :to="{ name: 'Expenses' }" @click="closeDrawer">
        <v-list-item-icon>
          <v-icon>mdi-database-export</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Расходы</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link :to="{ name: 'Incoming' }" @click="closeDrawer">
        <v-list-item-icon>
          <v-icon>mdi-database-import</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Приходы</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link :to="{ name: 'Vehicles' }" @click="closeDrawer">
        <v-list-item-icon>
          <v-icon>mdi-car-multiple</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Техника</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link :to="{ name: 'Workers' }" @click="closeDrawer">
        <v-list-item-icon>
          <v-icon>mdi-account-group</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>Работники</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import {eventBus} from '../main';
import axios from 'axios'

export default {
  name: 'AppDrawer',
  data: () => ({

  }),
  computed: {
    user: function() {
      return this.$store.getters.getUser
    },
    drawer: function() {
      return this.$store.getters.getAppDrawer
    }
  },
  created() {
    eventBus.$on('login', () => {
      this.loadUser()
    })
  },
  mounted() {
    if (this.$store.getters.getToken != null) this.loadUser()
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
    closeDrawer() {
      this.$store.commit('SET_APP_DRAWER', true)
    }
  },
}
</script>
