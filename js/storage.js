import { games, statusLabels } from './catalog.js';

// esta chave identifica os registros salvos neste navegador.
const STORAGE_KEY = 'gamelog.entries.v1';

// aceita apenas notas de 1 a 5 com ate duas casas decimais.
function isValidRating(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return false;
  if (value < 1 || value > 5) return false;
  return Number(value.toFixed(2)) === value;
}

// limpa dados antigos ou alterados para que a pagina nao quebre.
function cleanEntries(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};

  const result = {};
  const validStatuses = Object.keys(statusLabels);

  // percorre o catalogo para aceitar somente ids de jogos conhecidos.
  for (const game of games) {
    const entry = data[game.id];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;

    const status = validStatuses.includes(entry.status) ? entry.status : '';
    const rating = isValidRating(entry.rating) ? entry.rating : null;
    const review = typeof entry.review === 'string' ? entry.review.trim().slice(0, 800) : '';

    if (status || rating !== null || review) {
      result[game.id] = { status, rating, review };
    }
  }

  return result;
}

// le os registros do navegador quando a pagina abre.
export function loadEntries() {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);
    return cleanEntries(JSON.parse(savedText || '{}'));
  } catch {
    return {};
  }
}

// salva os registros e avisa se o navegador permitiu a gravacao.
export function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanEntries(entries)));
    return true;
  } catch {
    return false;
  }
}
