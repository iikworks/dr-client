<template>
  <div class="mt-0 ml-3 mr-3">
    <v-card class="mx-auto" tile>
        <v-img height="200px" src="@/assets/img/usersbg.jpg"></v-img>
        <v-col>
          <v-avatar size="100" style="position:absolute; top: 130px">
            <v-img src="@/assets/img/noavatar.png"></v-img>
          </v-avatar>
        </v-col>
          <v-list-item color="rgba(0, 0, 0, .4)">
            <v-list-item-content>
              <v-list-item-title class="title">{{ user.first_name }} {{ user.last_name }}</v-list-item-title>
              <v-list-item-subtitle v-if="user.employee == 999">Разработчик</v-list-item-subtitle>
              <v-list-item-subtitle v-if="user.employee == 0">Пользователь</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios'
import {eventBus} from '@/main'

export default {
  name: 'UsersView',
  data() {
    return {
      user: null
    }
  },
  created() {

  },
  mounted() {
    eventBus.$emit('setTitle', 'Загрузка...')

    this.loadUser(this.$route.params.id)
  },
  methods: {
    loadUser(userId) {
      axios.get(process.env.VUE_APP_API_URL + `/users/${userId}`).then(response => {
        this.user = response.data

        eventBus.$emit('setTitle', `${this.user.first_name} ${this.user.last_name}`)
      }).catch(() => {
        this.$router.go(-1)
      })
    }
  },
}
</script>
