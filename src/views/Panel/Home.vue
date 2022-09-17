<template>
  <v-container>
    <v-btn
      depressed
      block
      :to="{ name: 'PanelInvites' }"
    >
      <v-icon
        left
        dark
      >
        mdi-barcode
      </v-icon>
      <b>Коды приглашения</b>
    </v-btn>
    <v-btn
      depressed
      class="mt-2"
      block
      :to="{ name: 'PanelHomeStatsList' }"
    >
      <v-icon
        left
        dark
      >
        mdi-home
      </v-icon>
      <b>Настройки главной страницы</b>
    </v-btn>
  </v-container>
</template>

<script>
import {eventBus} from '@/main'

export default {
  name: 'PanelHome',
  data() {
    return {
      
    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Панель управления')
  },
  methods: {
    
  },
}
</script>
