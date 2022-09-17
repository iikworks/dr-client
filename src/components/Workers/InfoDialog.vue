<template>
	<v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline pl-10">
          <b class="mr-1">{{ worker.last_name }}</b> {{ worker.first_name }}
        </v-card-title>
        <v-card-text>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ worker.last_name }}</b></v-list-item-title>
              <v-list-item-subtitle>Фамилия</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ worker.first_name }}</b></v-list-item-title>
              <v-list-item-subtitle>Имя</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line v-if="worker.patronymic">
            <v-list-item-content>
              <v-list-item-title><b>{{ worker.patronymic }}</b></v-list-item-title>
              <v-list-item-subtitle>Отчество</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
					<v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ worker.used }}</b></v-list-item-title>
              <v-list-item-subtitle>Количество использований</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
					<v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b><router-link style="text-decoration: none;" class="blue--text" :to="{ name: 'UsersView', params: { id: worker.user.id } }">{{ worker.user.first_name }} {{ worker.user.last_name }}</router-link></b></v-list-item-title>
              <v-list-item-subtitle>Создано модератором</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="orange darken-1"
            text
            :to="{ name: 'WorkersEdit', params: { id: worker.id } }"
          >
            <b>Редактировать</b>
          </v-btn>
          <v-btn
            color="grey darken-1"
            text
            @click="closeDialog"
          >
            <b>Закрыть</b>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
	name: 'WorkersInfoDialog',
	props: {
		worker: Object,
		dialog: Boolean
	},
	methods: {
		closeDialog() {
			this.$emit('closeDialog')
		}
	}
}
</script>
