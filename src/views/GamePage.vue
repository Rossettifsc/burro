<template>
  <ion-page>
    <ion-header><ion-toolbar color="primary"><ion-title>Partida</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <ion-card color="light">
        <ion-card-header><ion-card-title>{{ turnMessage }}</ion-card-title></ion-card-header>
        <ion-card-content>Rodada {{ state?.round ?? 0 }} · Bluetooth conectado</ion-card-content>
      </ion-card>

      <ion-text v-if="errorMessage" color="danger"><p>{{ errorMessage }}</p></ion-text>

      <h2>Suas cartas</h2>
      <div class="cards">
        <ion-button
          v-for="card in myHand"
          :key="card.id"
          class="card-button"
          :disabled="!isMyTurn || state?.status !== 'playing'"
          @click="play(card.id)"
        >
          {{ card.value }}
        </ion-button>
      </div>

      <ion-card v-if="state?.status === 'finished'" color="success">
        <ion-card-header><ion-card-title>Partida encerrada</ion-card-title></ion-card-header>
        <ion-card-content>O vencedor foi {{ winnerName }}.</ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonButton } from '@ionic/vue';
import { useGameStore } from '../stores/game';
const router = useRouter();
const { state, localPlayer, myHand, isMyTurn, errorMessage, selectAndPlay } = useGameStore();
const turnMessage = computed(() => isMyTurn.value ? 'É a sua vez' : 'Aguarde o próximo jogador');
const winnerName = computed(() => state.value?.players.find((p) => p.id === state.value?.winnerId)?.name ?? 'desconhecido');
async function play(cardId: string) { await selectAndPlay(cardId); if (state.value?.status === 'finished') router.push('/historico'); }
</script>

<style scoped>
.cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.card-button { height: 110px; font-size: 28px; --border-radius: 14px; }
</style>