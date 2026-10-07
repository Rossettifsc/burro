<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>Identificação</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Seu nome</ion-label>
        <ion-input v-model="name" :maxlength="20" placeholder="Digite seu nome" />
      </ion-item>
      <ion-button expand="block" :disabled="!name.trim()" @click="create">Criar partida</ion-button>
      <ion-button expand="block" fill="outline" :disabled="!name.trim() || scanning" @click="searchRooms">
        {{ scanning ? 'Procurando partidas...' : 'Procurar via Bluetooth' }}
      </ion-button>
      <ion-text v-if="bluetoothError" color="danger"><p>{{ bluetoothError }}</p></ion-text>
      <ion-list v-if="rooms.length">
        <ion-item v-for="room in rooms" :key="room.deviceId" button @click="connect(room.deviceId)">
          <ion-label>{{ room.name || 'Partida Burro' }}</ion-label>
        </ion-item>
      </ion-list>
      <ion-text v-if="connectedRoom" color="success">
        <p>Conexão Bluetooth estabelecida. A entrada e a sincronização da partida ainda precisam ser implementadas.</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonText, IonList } from '@ionic/vue';
import { useGameStore } from '../stores/game';
import { connectToHost, scanForRooms, stopScanning, type NearbyBluetoothDevice } from '../services/bluetooth';
const router = useRouter();
const store = useGameStore();
const name = ref('');
function create() { store.createRoom(name.value.trim()); router.push('/sala'); }
const rooms = ref<NearbyBluetoothDevice[]>([]);
const scanning = ref(false);
const bluetoothError = ref('');
const connectedRoom = ref('');

async function searchRooms() {
  rooms.value = [];
  bluetoothError.value = '';
  connectedRoom.value = '';
  scanning.value = true;

  try {
    await scanForRooms((device) => {
      if (!rooms.value.some((room) => room.deviceId === device.deviceId)) {
        rooms.value.push(device);
      }
    });
  } catch (error) {
    bluetoothError.value = error instanceof Error ? error.message : 'Não foi possível procurar partidas via Bluetooth.';
  } finally {
    scanning.value = false;
  }
}

async function connect(deviceId: string) {
  bluetoothError.value = '';

  try {
    await stopScanning();
    await connectToHost(deviceId);
    connectedRoom.value = deviceId;
  } catch (error) {
    bluetoothError.value = error instanceof Error ? error.message : 'Não foi possível conectar à partida.';
  }
}
</script>