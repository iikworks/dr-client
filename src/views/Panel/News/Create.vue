<template>
  <div>
    Create
  </div>
</template>

<script>
import {eventBus} from '@/main'

export default {
  name: 'PanelNewsCreate',
  data() {
    return {

    }
  },
  mounted() {
    eventBus.$emit('setTitle', 'Добавление новости')
  },
  methods: {
    
  }
}
</script>
