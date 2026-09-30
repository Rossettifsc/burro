<template>
  <ion-page>
    <ion-header><ion-toolbar color="primary"><ion-title>Burro</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding home">
      <h1>Jogo de Cartas Burro</h1>
      <p>Jogue offline com seus amigos usando Bluetooth.</p>
      <ion-button expand="block" @click="router.push('/jogador')">Nova partida</ion-button>
      <ion-button expand="block" fill="outline" @click="router.push('/historico')">Histórico</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
const router = useRouter();
</script>