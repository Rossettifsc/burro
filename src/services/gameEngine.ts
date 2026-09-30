import type { Card, GameState, Player, PlayerId } from '../types/game';

const VALUES = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const BURRO = 'BURRO';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const value of VALUES) {
    for (let copy = 0; copy < 4; copy++) {
      deck.push({ id: `${value}-${copy}-${crypto.randomUUID()}`, value });
    }
  }
  return deck;
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createGame(host: Player): GameState {
  return {
    id: crypto.randomUUID(),
    status: 'waiting',
    hostId: host.id,
    players: [host],
    order: [host.id],
    hands: {},
    currentPlayerIndex: 0,
    round: 0,
  };
}

export function addPlayer(state: GameState, player: Player): GameState {
  if (state.status !== 'waiting') throw new Error('A partida já começou.');
  if (state.players.some((p) => p.id === player.id)) return state;
  if (state.players.length >= 6) throw new Error('A partida já atingiu o limite de 6 jogadores.');
  return {
    ...state,
    players: [...state.players, player],
    order: [...state.order, player.id],
  };
}

export function removePlayer(state: GameState, playerId: PlayerId): GameState {
  if (state.status !== 'waiting') throw new Error('Não é possível sair após o início.');
  return {
    ...state,
    players: state.players.filter((p) => p.id !== playerId),
    order: state.order.filter((id) => id !== playerId),
  };
}

export function startGame(state: GameState): GameState {
  if (state.players.length < 2) throw new Error('É necessário ter pelo menos 2 jogadores.');
  const deck = shuffle(createDeck());
  const hands: Record<PlayerId, Card[]> = {};
  state.order.forEach((id) => {
    hands[id] = deck.splice(0, 4);
  });
  return {
    ...state,
    status: 'playing',
    hands,
    currentPlayerIndex: 0,
    round: 1,
    startedAt: new Date().toISOString(),
  };
}

export function nextPlayerId(state: GameState, playerId: PlayerId): PlayerId {
  const index = state.order.indexOf(playerId);
  if (index < 0) throw new Error('Jogador não encontrado na ordem da partida.');
  return state.order[(index + 1) % state.order.length];
}

export function playCard(state: GameState, playerId: PlayerId, cardId: string): GameState {
  if (state.status !== 'playing') throw new Error('A partida não está em andamento.');
  const currentId = state.order[state.currentPlayerIndex];
  if (currentId !== playerId) throw new Error('Ainda não é a sua vez.');

  const nextId = nextPlayerId(state, playerId);
  const hand = state.hands[playerId] ?? [];
  const card = hand.find((item) => item.id === cardId);
  if (!card) throw new Error('Carta inválida ou não encontrada na sua mão.');

  const newHands = {
    ...state.hands,
    [playerId]: hand.filter((item) => item.id !== cardId),
    [nextId]: [...(state.hands[nextId] ?? []), card],
  };

  const nextIndex = (state.currentPlayerIndex + 1) % state.order.length;
  const nextState = {
    ...state,
    hands: newHands,
    currentPlayerIndex: nextIndex,
    round: state.round + 1,
  };

  return checkCompletion(nextState, nextId);
}

export function checkCompletion(state: GameState, playerId: PlayerId): GameState {
  const hand = state.hands[playerId] ?? [];
  const grouped = hand.reduce<Record<string, number>>((acc, card) => {
    acc[card.value] = (acc[card.value] ?? 0) + 1;
    return acc;
  }, {});
  const completed = Object.values(grouped).some((count) => count >= 4);
  if (!completed) return state;

  const winnerId = playerId;
  const penalizedId = state.order.find((id) => id !== winnerId);
  return {
    ...state,
    status: 'finished',
    endedAt: new Date().toISOString(),
    winnerId,
    penalizedId,
    endReason: 'Jogador formou quatro cartas do mesmo valor.',
  };
}

export function addBurroLetter(player: Player): Player {
  const nextLetter = BURRO[player.burroLetters.length];
  if (!nextLetter || player.burroLetters.includes(nextLetter)) return player;
  return { ...player, burroLetters: player.burroLetters + nextLetter };
}

export function isBurroComplete(player: Player): boolean {
  return player.burroLetters === BURRO;
}

export function validateMessage(message: unknown): boolean {
  if (!message || typeof message !== 'object') return false;
  const item = message as Record<string, unknown>;
  return typeof item.type === 'string'
    && typeof item.gameId === 'string'
    && typeof item.senderId === 'string'
    && typeof item.timestamp === 'number'
    && 'payload' in item;
}