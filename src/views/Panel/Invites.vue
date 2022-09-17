<template>
  <v-container>
    <v-btn
      depressed
      block
      small
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
    <v-btn
      depressed
      block
      color="success"
      class="mt-2"
      @click="createInvite"
      :disabled="loading"
    >
      <v-icon
        left
        dark
      >
        mdi-database-plus
      </v-icon>
      <b>Создать</b>
    </v-btn>
    <transition name="slide-fade">
      <v-simple-table class="mt-2" v-if="!loading && invites.length > 0" style="white-space: nowrap;">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                ID
              </th>
              <th class="text-left">
                Код
              </th>
              <th class="text-left"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="invite in invites"
              :key="invite.id"
            >
              <td><b>{{ invite.id }}</b></td>
              <td><b>{{ invite.code }}</b></td>
              <td>
                <b v-if="!invite.used" class="text--darken-2 red--text" @click="toggleUsed(invite)" style="cursor: pointer;">Не использован</b>
                <span v-if="invite.used && invite.used_at && invite.user">
                  <b class="text--darken-1 green--text">
                    Использован
                    <span class="text--lighten-1 green--text">{{ moment(invite.used_at).format('DD.MM.YYYY в HH:mm') }}</span>
                  </b>
                  <br>
                  <b class="text--darken-1 green--text">при создании аккаунта <a href="#" class="text--lighten-2 green--text">{{ invite.user.first_name }} {{ invite.user.last_name }}</a> (ID: {{ invite.user.id }})</b>
                </span>
                <span v-if="invite.used && !invite.user" @click="toggleUsed(invite)" style="cursor: pointer;">
                  <b class="text--darken-1 orange--text">Выключен</b>
                </span>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </transition>
    <transition name="slide-fade">
      <div v-if="!loading && invites.length < 1">
        <v-alert
          class="mt-3"
          border="left"
          type="error"
        >
          <b>Нет кодов.</b>
        </v-alert>
      </div>
    </transition>
  </v-container>
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import {eventBus} from '@/main'

export default {
  name: 'PanelInvites',
  data() {
    return {
      invites: [],
      loading: false,
      toggledInvite: 0
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Коды приглашения')

    this.loadInvites()
  },
  methods: {
    loadInvites() {
      this.loading = true

      axios.get(process.env.VUE_APP_API_URL + `invites/?access_token=${this.$store.getters.getToken}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
        this.invites = response.data.invites

        this.loading = false
      })
    },
    createInvite() {
      this.loading = true

      axios.post(process.env.VUE_APP_API_URL + `invites/?access_token=${this.$store.getters.getToken}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(response => {
        this.loadInvites()
        eventBus.$emit('message', 'success', `Код <b>${response.data.code}</b> успешно создан.`)
        this.loading = false
      }).catch(error => {
        if (error.response.status == 422) {
          this.errors = error.response.data.errors.json
          this.loading = false
        } else {
          this.snackbar = {
            active: true,
            text: 'Произошла какая-то ошибка. Попробуйте позже.'
          }

          this.loading = false
        }
      })
    },
    toggleUsed(invite) {
      if(this.toggledInvite != 0) return true;
      let initUsed = invite.used
      this.toggledInvite = invite.id

      axios.put(process.env.VUE_APP_API_URL + `invites/${invite.id}?access_token=${this.$store.getters.getToken}`, {
        used: !initUsed
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(() => {
        invite.used = !initUsed
        this.toggledInvite = 0
      })
    },
    moment(date){
      return moment(date)
    },
  },
  watch: {
    loading(val) {
      eventBus.$emit('setLoading', val)
    },
  }
}
</script>
