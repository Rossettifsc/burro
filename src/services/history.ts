import { Preferences } from '@capacitor/preferences';
import type { GameHistory } from '../types/game';

const KEY = 'burro-game-history';

export async function getHistory(): Promise<GameHistory[]> {
  const { value } = await Preferences.get({ key: KEY });
  if (!value) return [];
  try {
    return JSON.parse(value) as GameHistory[];
  } catch {
    return [];
  }
}

export async function saveHistory(item: GameHistory): Promise<void> {
  const history = await getHistory();
  const next = [item, ...history.filter((entry) => entry.id !== item.id)];
  await Preferences.set({ key: KEY, value: JSON.stringify(next) });
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const history = await getHistory();
  await Preferences.set({
    key: KEY,
    value: JSON.stringify(history.filter((item) => item.id !== id)),
  });
}

export async function clearHistory(): Promise<void> {
  await Preferences.remove({ key: KEY });
}