<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Sala de espera</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-chip color="success">
        <ion-label>Bluetooth disponível</ion-label>
      </ion-chip>

      <h2>Sala de espera</h2>

      <p>
        Compartilhe esta sala com os outros jogadores através do Bluetooth.
      </p>

      <ion-card v-if="state">
        <ion-card-header>
          <ion-card-title>Partida criada</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          Código da partida:

          <strong>
            {{ state.id.substring(0, 8).toUpperCase() }}
          </strong>
        </ion-card-content>
      </ion-card>

      <ion-button
        expand="block"
        color="secondary"
        :disabled="bluetoothStarted"
        @click="startBluetoothRoom"
      >
        {{
          bluetoothStarted
            ? 'Sala anunciada via Bluetooth'
            : 'Anunciar sala via Bluetooth'
        }}
      </ion-button>

      <ion-text v-if="bluetoothError" color="danger">
        <p>{{ bluetoothError }}</p>
      </ion-text>

      <h2>
        Jogadores
        ({{ state?.players.length ?? 0 }}/6)
      </h2>

      <ion-list>
        <ion-item
          v-for="player in state?.players"
          :key="player.id"
        >
          <ion-label>
            <h3>{{ player.name }}</h3>

            <p v-if="player.isHost">
              Anfitrião
            </p>

            <p v-else>
              Jogador
            </p>
          </ion-label>

          <ion-badge
            slot="end"
            :color="player.connected ? 'success' : 'danger'"
          >
            {{ player.connected ? 'Conectado' : 'Desconectado' }}
          </ion-badge>
        </ion-item>
      </ion-list>

      <ion-text color="medium">
        <p>
          A partida precisa de pelo menos 2 jogadores.
        </p>
      </ion-text>

      <ion-button
        expand="block"
        :disabled="
          !isHost ||
          (state?.players.length ?? 0) < 2 ||
          !bluetoothStarted
        "
        @click="startGame"
      >
        Iniciar partida
      </ion-button>

      <ion-button
        expand="block"
        fill="clear"
        color="danger"
        @click="leaveRoom"
      >
        Sair da sala
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonChip,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonText,
  IonList,
  IonItem,
  IonBadge,
} from '@ionic/vue';

import { useGameStore } from '../stores/game';
import { startHostAdvertising } from '../services/bluetooth';

const router = useRouter();

const {
  state,
  isHost,
  start,
} = useGameStore();

const bluetoothStarted = ref(false);
const bluetoothError = ref('');

async function startBluetoothRoom() {
  try {
    bluetoothError.value = '';

    if (!state.value) {
      bluetoothError.value =
        'A partida ainda não foi criada.';

      return;
    }

    await startHostAdvertising(
      `BURRO-${state.value.id.substring(0, 5)}`,
    );

    bluetoothStarted.value = true;
  } catch (error) {
    console.error(error);

    bluetoothError.value =
      error instanceof Error
        ? error.message
        : 'Não foi possível anunciar a sala via Bluetooth.';
  }
}

function startGame() {
  start();

  router.push('/jogo');
}

function leaveRoom() {
  router.push('/');
}
</script>
