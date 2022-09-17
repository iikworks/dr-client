<template>
	<v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline pl-10">
          <span class="mr-1" v-if="vehicle.brand">{{ vehicle.brand }}</span> <b>{{ vehicle.model }}</b>
        </v-card-title>
        <v-card-text>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ vehicle.type_display }}</b></v-list-item-title>
              <v-list-item-subtitle>Тип</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line v-if="vehicle.brand">
            <v-list-item-content>
              <v-list-item-title><b>{{ vehicle.brand }}</b></v-list-item-title>
              <v-list-item-subtitle>Марка</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ vehicle.model }}</b></v-list-item-title>
              <v-list-item-subtitle>Модель</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line v-if="vehicle.government_number">
            <v-list-item-content>
              <v-list-item-title>
								<b v-if="vehicle.type == 'car'">
                  {{ vehicle.government_number | displayGonvNumberNormal }}
									<span v-if="vehicle.government_number_letters">{{ vehicle.government_number_letters }}-{{ vehicle.government_number_region }}</span>
								</b>
                <b v-else>
                  <span v-if="vehicle.government_number_letters">{{ vehicle.government_number_letters }}-{{ vehicle.government_number_region }}</span>
                  {{ vehicle.government_number | displayGonvNumberNormal }}
                </b>
              </v-list-item-title>
              <v-list-item-subtitle>Государственный номер</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line v-if="vehicle.year_of_ussue">
            <v-list-item-content>
              <v-list-item-title><b>{{ vehicle.year_of_ussue }}</b></v-list-item-title>
              <v-list-item-subtitle>Год выпуска</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line v-if="vehicle.worker">
            <v-list-item-content>
              <v-list-item-title>
                <b>{{ vehicle.worker.last_name }} {{ vehicle.worker.first_name }} {{ vehicle.worker.patronymic }}</b>
              </v-list-item-title>
              <v-list-item-subtitle v-if="vehicle.type == 'car'">Водитель</v-list-item-subtitle>
							<v-list-item-subtitle v-else>Механизатор</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
					<v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b>{{ vehicle.used }}</b></v-list-item-title>
              <v-list-item-subtitle>Количество использований</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
					<v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title><b><router-link style="text-decoration: none;" class="blue--text" :to="{ name: 'UsersView', params: { id: vehicle.user.id } }">{{ vehicle.user.first_name }} {{ vehicle.user.last_name }}</router-link></b></v-list-item-title>
              <v-list-item-subtitle>Создано модератором</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="orange darken-1"
            text
            :to="{ name: 'VehiclesEdit', params: { id: vehicle.id } }"
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
	name: 'VehiclesInfoDialog',
	props: {
		vehicle: Object,
		dialog: Boolean
	},
	methods: {
		closeDialog() {
			this.$emit('closeDialog')
		}
	}
}
</script>
