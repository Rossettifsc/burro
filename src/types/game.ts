export type PlayerId = string;
export type CardValue = string;

export interface Card {
  id: string;
  value: CardValue;
}

export interface Player {
  id: PlayerId;
  name: string;
  isHost: boolean;
  connected: boolean;
  burroLetters: string;
}

export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled' | 'interrupted';

export interface GameState {
  id: string;
  status: GameStatus;
  hostId: PlayerId;
  players: Player[];
  order: PlayerId[];
  hands: Record<PlayerId, Card[]>;
  currentPlayerIndex: number;
  round: number;
  startedAt?: string;
  endedAt?: string;
  winnerId?: PlayerId;
  penalizedId?: PlayerId;
  endReason?: string;
}

export interface GameHistory {
  id: string;
  status: GameStatus;
  startedAt?: string;
  endedAt?: string;
  players: Player[];
  order: PlayerId[];
  winnerId?: PlayerId;
  penalizedId?: PlayerId;
  localPlayerId: PlayerId;
  rounds: number;
  endReason?: string;
}

export type BluetoothMessageType =
  | 'SOLICITACAO_ENTRADA'
  | 'JOGADOR_ENTROU'
  | 'JOGADOR_RECUSADO'
  | 'PARTIDA_INICIADA'
  | 'JOGADA'
  | 'TROCA_REALIZADA'
  | 'JOGADOR_COMPLETOU'
  | 'PARTIDA_FINALIZADA'
  | 'JOGADOR_DESCONECTADO'
  | 'RECONEXAO';

export interface BluetoothMessage<T = unknown> {
  type: BluetoothMessageType;
  gameId: string;
  senderId: PlayerId;
  timestamp: number;
  payload: T;
}

export interface PlayPayload {
  cardId: string;
  fromPlayerId: PlayerId;
  toPlayerId: PlayerId;
}