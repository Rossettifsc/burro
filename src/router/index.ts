import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../views/HomePage.vue';
import PlayerPage from '../views/PlayerPage.vue';
import LobbyPage from '../views/LobbyPage.vue';
import GamePage from '../views/GamePage.vue';
import HistoryPage from '../views/HistoryPage.vue';

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage },
    { path: '/jogador', component: PlayerPage },
    { path: '/sala', component: LobbyPage },
    { path: '/jogo', component: GamePage },
    { path: '/historico', component: HistoryPage },
  ],
});
