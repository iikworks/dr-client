<template>
  <v-container>
    В разработке...
  </v-container>
</template>

<script>
import {eventBus} from '@/main'

export default {
  name: 'Stats',
  data() {
    return {

    }
  },
  created() {

  },
  mounted() {
    eventBus.$emit('setTitle', 'Статистика')
  },
  methods: {
    
  },
}
</script>
