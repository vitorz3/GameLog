import { games, statusLabels } from './catalog.js';

const STORAGE_KEY = 'gamelog.entries.v1';
const validIds = new Set(games.map((game) => game.id));

// Normaliza registros para que dados antigos, incompletos ou alterados não quebrem a página.
function normalizeEntries(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const cleaned = {};
  for (const [id, entry] of Object.entries(value)) {
    if (!validIds.has(id) || !entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const status = Object.hasOwn(statusLabels, entry.status) ? entry.status : '';
    const validRating = typeof entry.rating === 'number' && Number.isFinite(entry.rating)
      && entry.rating >= 1 && entry.rating <= 5
      && Math.abs(entry.rating * 100 - Math.round(entry.rating * 100)) < 1e-8;
    const rating = validRating ? entry.rating : null;
    const review = typeof entry.review === 'string' ? entry.review.trim().slice(0, 800) : '';
    if (status || rating !== null || review) cleaned[id] = { status, rating, review };
  }
  return cleaned;
}

export function loadEntries() {
  try {
    return normalizeEntries(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
  } catch {
    return {};
  }
}

export function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeEntries(entries)));
    return true;
  } catch {
    return false;
  }
}
