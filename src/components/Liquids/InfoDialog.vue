<template>
	<v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="500"
    >
      <v-card v-if="liquid">
				<v-card-title class="headline pl-10 justify-center" v-if="liquid.prefix">
					{{ liquid.prefix }} <b class="ml-1">{{ liquid.title }}</b>
				</v-card-title>
				<v-card-title class="headline pl-10 justify-center" v-else>
					<b>{{ liquid.title }}</b>
				</v-card-title>
        <v-card-text>
          <v-list-item two-line v-if="liquid.prefix">
            <v-list-item-content>
              <v-list-item-title><b>{{ liquid.prefix }}</b></v-list-item-title>
              <v-list-item-subtitle>Префикс</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ liquid.title }}</b></v-list-item-title>
              <v-list-item-subtitle>Наименование</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
					<v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ liquid.balance | formatNumber }}</b> {{ liquid.unit }}.</v-list-item-title>
              <v-list-item-subtitle>Баланс</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
					<v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ liquid.used }}</b></v-list-item-title>
              <v-list-item-subtitle>Количество использований</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
					<v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b><router-link style="text-decoration: none;" class="blue--text" :to="{ name: 'UsersView', params: { id: liquid.user.id } }">{{ liquid.user.first_name }} {{ liquid.user.last_name }}</router-link></b></v-list-item-title>
              <v-list-item-subtitle>Создано модератором</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="orange darken-1"
            text
            :to="{ name: 'LiquidsEdit', params: { id: liquid.id } }"
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
	name: 'LiquidsInfoDialog',
	props: {
		liquid: Object,
		dialog: Boolean
	},
	methods: {
		closeDialog() {
			this.$emit('closeDialog')
		}
	}
}
</script>
