import { describe, expect, it } from 'vitest';
import { createGame, addPlayer, startGame, playCard } from './gameEngine';
import type { Player } from '../types/game';

const player = (name: string, isHost = false): Player => ({
  id: name, name, isHost, connected: true, burroLetters: '',
});

describe('Jogo Burro', () => {
  it('não inicia com apenas um jogador', () => {
    expect(() => startGame(createGame(player('Ana', true)))).toThrow();
  });

  it('distribui quatro cartas para cada jogador', () => {
    let game = createGame(player('Ana', true));
    game = addPlayer(game, player('Bia'));
    game = startGame(game);
    expect(game.hands.Ana).toHaveLength(4);
    expect(game.hands.Bia).toHaveLength(4);
  });

  it('bloqueia jogada fora do turno', () => {
    let game = createGame(player('Ana', true));
    game = addPlayer(game, player('Bia'));
    game = startGame(game);
    expect(() => playCard(game, 'Bia', game.hands.Bia[0].id)).toThrow('Ainda não é a sua vez.');
  });

  it('troca uma carta com o próximo jogador', () => {
    let game = createGame(player('Ana', true));
    game = addPlayer(game, player('Bia'));
    game = startGame(game);
    const card = game.hands.Ana[0];
    const next = playCard(game, 'Ana', card.id);
    expect(next.hands.Ana).toHaveLength(3);
    expect(next.hands.Bia).toHaveLength(5);
  });
});