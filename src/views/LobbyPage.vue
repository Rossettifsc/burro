<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>Sala de espera</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <ion-chip color="success"><ion-label>Bluetooth pronto</ion-label></ion-chip>
      <h2>Jogadores ({{ state?.players.length ?? 0 }}/6)</h2>
      <ion-list>
        <ion-item v-for="player in state?.players" :key="player.id">
          <ion-label>{{ player.name }} <small v-if="player.isHost">(anfitrião)</small></ion-label>
          <ion-badge :color="player.connected ? 'success' : 'danger'">{{ player.connected ? 'conectado' : 'offline' }}</ion-badge>
        </ion-item>
      </ion-list>
      <ion-text color="medium"><p>São necessários pelo menos 2 jogadores.</p></ion-text>
      <ion-button expand="block" :disabled="!isHost || (state?.players.length ?? 0) < 2" @click="start">Iniciar partida</ion-button>
      <ion-button expand="block" fill="clear" @click="router.push('/')">Sair</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonChip, IonLabel, IonList, IonItem, IonBadge, IonText, IonButton } from '@ionic/vue';
import { useGameStore } from '../stores/game';
const router = useRouter();
const { state, isHost, start } = useGameStore();
function startGame() { start(); router.push('/jogo'); }
</script>