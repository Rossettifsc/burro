<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>Identificação</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Seu nome</ion-label>
        <ion-input v-model="name" :maxlength="20" placeholder="Digite seu nome" />
      </ion-item>
      <ion-button expand="block" :disabled="!name.trim()" @click="create">Criar partida</ion-button>
      <ion-button expand="block" fill="outline" :disabled="!name.trim()" @click="join">Procurar via Bluetooth</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue';
import { useGameStore } from '../stores/game';
import { requestBluetoothPermissions } from '../services/bluetooth';
const router = useRouter();
const store = useGameStore();
const name = ref('');
function create() { store.createRoom(name.value.trim()); router.push('/sala'); }
async function join() {
  await requestBluetoothPermissions();
  // Substitua por scanNearbyDevices() e pelo fluxo de solicitação/aceite.
  try { store.joinRoom(name.value.trim()); router.push('/sala'); }
  catch { router.push('/sala'); }
}
</script>