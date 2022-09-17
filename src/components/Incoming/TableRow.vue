<template>
  <tr>
    <td @click="openEditing(incoming.id)" style="cursor: pointer;">
      <span v-if="!isHome">
        <b>{{ moment(incoming.date).format('DD.MM.YYYY') }}</b>
        <br>
      </span>
      <span :class="{ 'grey--text': !isHome }">{{ moment(incoming.date).format('HH:mm') }}</span>
    </td>
    <td style="margin:0px;padding:0px;">
      <v-tooltip bottom v-if="incoming.verified === 0">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            @click="setVerified(incoming)"
            class="red--text text--lighten-1"
            style="cursor: pointer;"
            v-bind="attrs"
            v-on="on"
          >
            mdi-close
          </v-icon>
        </template>
        <span>Не проверен</span>
      </v-tooltip>
      <v-tooltip bottom v-if="incoming.verified === 1">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            @click="setVerified(incoming)"
            class="yellow--text text--lighten-1"
            style="cursor: pointer;"
            v-bind="attrs"
            v-on="on"
          >
            mdi-check
          </v-icon>
        </template>
        <span>Сверен с документацией</span>
      </v-tooltip>
      <v-tooltip bottom v-if="incoming.verified === 2">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            @click="setVerified(incoming)"
            class="green--text text--lighten-1"
            style="cursor: pointer;"
            v-bind="attrs"
            v-on="on"
          >
            mdi-check-all
          </v-icon>
        </template>
        <span>Включен в сводку</span>
      </v-tooltip>
    </td>
    <td @click="setVerified(incoming)" style="cursor: pointer;">
      <b>{{ incoming.amount | formatNumber }}</b> <span class="grey--text">{{ incoming.liquid.unit }}.</span>
      <span v-if="!isHome" class="grey--text text--lighten-1">
        <br>
        {{ incoming.liquid.prefix }} <b>{{ incoming.liquid.title }}</b>
      </span>
    </td>
    <td>
      <b>{{ incoming.from_who }}</b>
      <span v-if="!isHome">
        <br>
        <span class="grey--text" v-if="incoming.number">№ {{ incoming.number }}</span>
      </span>
    </td>
  </tr>
</template>

<script>
import moment from "moment";
import axios from "axios";
import {eventBus} from '@/main'

export default {
  name: 'IncomingTableRow',
  props: {
    incoming: Object,
    loadingVerified: Number,
    isHome: {
      type: Boolean,
      default: false
    },
    loadIncoming: {
      type: Function,
      default: () => {}
    }
  },
  methods: {
    openEditing(incomingId) {
      return this.$router.push({ name: 'IncomingEdit', params: { id: incomingId } })
    },
    moment(date){
      return moment(date)
    },
    setVerified(incoming) {
      if (this.$store.getters.getUserEmployee != 999) return false;
      if (this.loadingVerified !== 0) return false;

      this.$emit('setLoadingVerified', incoming.id)

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
        eventBus.$emit('reloadUnchecked')
        this.$emit('setLoadingVerified', 0)
      }).catch(() => {
        eventBus.$emit('reloadUnchecked')
        this.$emit('setLoadingVerified', 0)
      })
    },
  }
}
</script>
