<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>Histórico</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <ion-button v-if="history.length" fill="outline" color="danger" expand="block" @click="clearAll">Limpar histórico</ion-button>
      <ion-list v-if="history.length">
        <ion-item v-for="item in history" :key="item.id">
          <ion-label>
            <h2>{{ formatDate(item.endedAt ?? item.startedAt) }}</h2>
            <p>{{ item.players.length }} jogadores · {{ item.rounds }} rodadas</p>
            <p>Vencedor: {{ playerName(item.winnerId, item) }}</p>
            <p>Status: {{ item.status }}</p>
          </ion-label>
          <ion-button slot="end" color="danger" fill="clear" @click="remove(item.id)">Excluir</ion-button>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium"><p>Nenhuma partida salva.</p></ion-text>
      <ion-button expand="block" fill="clear" @click="router.push('/')">Voltar</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonText, alertController } from '@ionic/vue';
import { clearHistory, deleteHistoryItem, getHistory } from '../services/history';
import type { GameHistory } from '../types/game';
const router = useRouter();
const history = ref<GameHistory[]>([]);
onMounted(async () => { history.value = await getHistory(); });
function formatDate(value?: string) { return value ? new Date(value).toLocaleString('pt-BR') : 'Sem data'; }
function playerName(id: string | undefined, item: GameHistory) { return item.players.find((p) => p.id === id)?.name ?? 'não informado'; }
async function remove(id: string) {
  const alert = await alertController.create({ header: 'Excluir partida?', message: 'Essa ação não pode ser desfeita.', buttons: [
    { text: 'Cancelar', role: 'cancel' }, { text: 'Excluir', role: 'destructive', handler: async () => { await deleteHistoryItem(id); history.value = await getHistory(); } },
  ] });
  await alert.present();
}
async function clearAll() {
  const alert = await alertController.create({ header: 'Limpar histórico?', message: 'Todas as partidas serão removidas.', buttons: [
    { text: 'Cancelar', role: 'cancel' }, { text: 'Limpar', role: 'destructive', handler: async () => { await clearHistory(); history.value = []; } },
  ] });
  await alert.present();
}
</script>