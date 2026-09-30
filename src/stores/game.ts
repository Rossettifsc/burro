import { computed, ref } from 'vue';
import { addPlayer, createGame, playCard, startGame } from '../services/gameEngine';
import type { GameState, Player } from '../types/game';
import { saveHistory } from '../services/history';

const state = ref<GameState | null>(null);
const localPlayer = ref<Player | null>(null);
const errorMessage = ref('');

export function useGameStore() {
  const isHost = computed(() => Boolean(localPlayer.value?.isHost));
  const currentPlayerId = computed(() => state.value?.order[state.value.currentPlayerIndex]);
  const isMyTurn = computed(() => currentPlayerId.value === localPlayer.value?.id);
  const myHand = computed(() => state.value?.hands[localPlayer.value?.id ?? ''] ?? []);

  function createRoom(name: string) {
    const player: Player = {
      id: crypto.randomUUID(), name, isHost: true, connected: true, burroLetters: '',
    };
    localPlayer.value = player;
    state.value = createGame(player);
  }

  function joinRoom(name: string) {
    if (!state.value) throw new Error('Nenhuma sala encontrada.');
    const player: Player = {
      id: crypto.randomUUID(), name, isHost: false, connected: true, burroLetters: '',
    };
    localPlayer.value = player;
    state.value = addPlayer(state.value, player);
  }

  function start() {
    if (!state.value) return;
    try {
      state.value = startGame(state.value);
      errorMessage.value = '';
    } catch (error) {
      errorMessage.value = (error as Error).message;
    }
  }

  async function selectAndPlay(cardId: string) {
    if (!state.value || !localPlayer.value) return;
    try {
      state.value = playCard(state.value, localPlayer.value.id, cardId);
      errorMessage.value = '';
      if (state.value.status === 'finished') await finishAndSave();
    } catch (error) {
      errorMessage.value = (error as Error).message;
    }
  }

  async function finishAndSave() {
    if (!state.value || !localPlayer.value) return;
    await saveHistory({
      id: state.value.id,
      status: state.value.status,
      startedAt: state.value.startedAt,
      endedAt: state.value.endedAt,
      players: state.value.players,
      order: state.value.order,
      winnerId: state.value.winnerId,
      penalizedId: state.value.penalizedId,
      localPlayerId: localPlayer.value.id,
      rounds: state.value.round,
      endReason: state.value.endReason,
    });
  }

  function clearError() { errorMessage.value = ''; }

  return {
    state, localPlayer, errorMessage, isHost, currentPlayerId, isMyTurn, myHand,
    createRoom, joinRoom, start, selectAndPlay, finishAndSave, clearError,
  };
}