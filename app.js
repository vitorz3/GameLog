import { games, statusLabels } from './catalog.js';
import { loadEntries, saveEntries } from './storage.js';

const byId = (id) => document.getElementById(id);
const gameById = new Map(games.map((game) => [game.id, game]));
const entries = loadEntries();
const dialog = byId('game-dialog');
const confirmDialog = byId('confirm-dialog');
const form = byId('entry-form');
let selectedGameId = null;
let focusOrigin = null;
let pendingDeleteId = null;
let toastTimer;

function node(tag, className, content) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (content !== undefined) item.textContent = content;
  return item;
}

function coverFor(game, compact = false) {
  const cover = node('div', `cover cover--photo cover--${game.art}${compact ? ' cover--compact' : ''}`);
  cover.style.setProperty('--cover-base', game.colors[0]);
  cover.style.setProperty('--cover-accent', game.colors[1]);
  cover.setAttribute('aria-hidden', 'true');
  const image = node('img', 'cover-image');
  image.src = game.image;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.remove();
    cover.append(node('strong', 'cover-title', game.title));
  });
  cover.append(image);
  cover.append(node('span', 'cover-code', `GL / ${String(games.indexOf(game) + 1).padStart(2, '0')}`));
  cover.append(node('span', 'cover-shape'));
  return cover;
}

function normalizeSearch(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function renderCatalog() {
  if (!byId('catalog-grid')) return;
  const query = normalizeSearch(byId('game-search').value.trim());
  const genre = byId('genre-filter').value;
  const filtered = games.filter((game) => normalizeSearch(game.title).includes(query) && (!genre || game.genre === genre));
  const grid = byId('catalog-grid');
  grid.replaceChildren();

  for (const game of filtered) {
    const card = node('article', 'game-card');
    const button = node('button', 'game-card-button');
    button.type = 'button';
    button.dataset.openGame = game.id;
    button.dataset.openSource = 'catalog';
    button.setAttribute('aria-label', `Abrir detalhes de ${game.title}`);
    card.append(coverFor(game));

    const info = node('div', 'game-card-info');
    const top = node('div', 'game-card-top');
    top.append(node('span', 'game-genre', game.genre));
    top.append(node('span', 'game-arrow', '↗'));
    info.append(top, node('h3', 'game-card-title', game.title));
    const entry = entries[game.id];
    info.append(node('p', 'game-card-meta', game.platforms));
    if (entry) info.append(node('span', `mini-status mini-status--${entry.status || 'none'}`, entry.status ? statusLabels[entry.status] : 'No diário'));
    card.append(info, button);
    grid.append(card);
  }

  byId('catalog-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}`;
  byId('catalog-empty').hidden = filtered.length !== 0;
}

function ratingText(rating) {
  return rating === null ? 'Sem nota' : `${rating.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} / 5`;
}

function renderDiary() {
  if (!byId('diary-list')) return;
  const allEntries = games.filter((game) => entries[game.id]).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  const statusFilter = byId('diary-filter').value;
  const filtered = allEntries.filter((game) => !statusFilter || (statusFilter === 'none' ? !entries[game.id].status : entries[game.id].status === statusFilter));
  const list = byId('diary-list');
  list.replaceChildren();

  for (const game of filtered) {
    const entry = entries[game.id];
    const row = node('article', 'diary-item');
    row.append(coverFor(game, true));
    const body = node('div', 'diary-item-body');
    const details = node('div', 'diary-item-details');
    details.append(node('span', 'diary-item-genre', game.genre), node('h3', 'diary-item-title', game.title));
    const facts = node('div', 'diary-item-facts');
    facts.append(node('span', `status-pill status-pill--${entry.status || 'none'}`, entry.status ? statusLabels[entry.status] : 'Sem status'));
    facts.append(node('span', 'rating-pill', `★ ${ratingText(entry.rating)}`));
    details.append(facts);
    body.append(details);
    const review = node('p', `diary-review${entry.review ? '' : ' diary-review--empty'}`, entry.review || 'Nenhuma resenha escrita.');
    body.append(review);
    const actions = node('div', 'diary-item-actions');
    const edit = node('button', 'edit-button', 'Editar registro ↗');
    edit.type = 'button';
    edit.dataset.openGame = game.id;
    edit.dataset.openSource = 'diary';
    edit.setAttribute('aria-label', `Editar registro de ${game.title}`);
    const remove = node('button', 'remove-button', 'Excluir');
    remove.type = 'button';
    remove.dataset.deleteGame = game.id;
    remove.setAttribute('aria-label', `Excluir registro de ${game.title}`);
    actions.append(edit, remove);
    body.append(actions);
    row.append(body);
    list.append(row);
  }

  const empty = byId('diary-empty');
  empty.hidden = filtered.length !== 0;
  if (allEntries.length === 0) {
    byId('diary-empty-title').textContent = 'Seu diário está esperando';
    byId('diary-empty-description').textContent = 'Escolha um jogo no catálogo para registrar seu primeiro capítulo.';
    byId('diary-empty-link').hidden = false;
  } else if (filtered.length === 0) {
    byId('diary-empty-title').textContent = 'Nenhum registro neste filtro';
    byId('diary-empty-description').textContent = 'Escolha outro status para ver seus jogos registrados.';
    byId('diary-empty-link').hidden = true;
  }

  byId('diary-heading-count').textContent = `(${allEntries.length})`;
}

function renderNavCount() {
  const count = Object.keys(entries).length;
  const navCount = byId('nav-diary-count');
  navCount.textContent = count;
  navCount.setAttribute('aria-label', `${count} ${count === 1 ? 'jogo registrado' : 'jogos registrados'}`);
}

function renderStats() {
  if (!byId('stat-average')) return;
  const values = Object.values(entries);
  byId('stat-want').textContent = values.filter((entry) => entry.status === 'want').length;
  byId('stat-playing').textContent = values.filter((entry) => entry.status === 'playing').length;
  byId('stat-finished').textContent = values.filter((entry) => entry.status === 'finished').length;
  const ratings = values.map((entry) => entry.rating).filter((rating) => rating !== null);
  byId('stat-average').textContent = ratings.length
    ? `${(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} / 5`
    : '—';
  byId('average-caption').textContent = ratings.length
    ? `${ratings.length} ${ratings.length === 1 ? 'nota atribuída' : 'notas atribuídas'}`
    : 'Nenhuma nota ainda';
}

function renderAll() {
  renderCatalog();
  renderDiary();
  renderStats();
  renderNavCount();
}

function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('toast--visible'), 4500);
}

function showError(message) {
  const error = byId('form-error');
  error.textContent = message;
  error.hidden = false;
  error.focus();
}

function hideError() {
  byId('form-error').hidden = true;
  byId('form-error').textContent = '';
}

function updateCounter() {
  byId('review-counter').textContent = `${byId('entry-review').value.length} / 800`;
}

function openGame(id, source) {
  const game = gameById.get(id);
  if (!game) return;
  selectedGameId = id;
  focusOrigin = { id, source };
  byId('dialog-cover-slot').replaceChildren(coverFor(game));
  byId('dialog-title').textContent = game.title;
  byId('dialog-meta').textContent = `${game.genre}  ·  ${game.platforms}`;
  byId('dialog-description').textContent = game.description;
  const entry = entries[id] || { status: '', rating: null, review: '' };
  byId('entry-status').value = entry.status;
  byId('entry-rating').value = entry.rating === null ? '' : entry.rating.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  byId('entry-rating').removeAttribute('aria-invalid');
  byId('entry-review').value = entry.review;
  byId('delete-entry').hidden = !entries[id];
  hideError();
  updateCounter();
  dialog.showModal();
  byId('dialog-close').focus();
}

function requestDelete(id) {
  if (!entries[id]) return;
  pendingDeleteId = id;
  byId('confirm-game-title').textContent = gameById.get(id).title;
  confirmDialog.showModal();
  byId('confirm-cancel').focus();
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  delete entries[pendingDeleteId];
  const persisted = saveEntries(entries);
  renderAll();
  const detailWasOpen = dialog.open;
  confirmDialog.close();
  if (detailWasOpen) dialog.close();
  else byId('diary-filter')?.focus();
  showToast(persisted ? 'Registro excluído do seu diário.' : 'Registro excluído nesta sessão, mas o navegador não permitiu salvar a alteração.');
}

function parseRating(text) {
  if (!text) return null;
  if (!/^[1-5](?:[.,]\d{1,2})?$/.test(text)) return NaN;
  const value = Number(text.replace(',', '.'));
  return value >= 1 && value <= 5 ? value : NaN;
}

function saveCurrentEntry(event) {
  event.preventDefault();
  if (!selectedGameId) return;
  hideError();
  const status = byId('entry-status').value;
  const ratingValue = byId('entry-rating').value.trim();
  const rating = parseRating(ratingValue);
  const review = byId('entry-review').value.trim();
  if (status && !Object.hasOwn(statusLabels, status)) return showError('Escolha um status válido.');
  if (Number.isNaN(rating)) {
    byId('entry-rating').setAttribute('aria-invalid', 'true');
    return showError('Digite uma nota entre 1 e 5, com até duas casas decimais. Exemplo: 4,5.');
  }
  if (review.length > 800) return showError('A resenha deve ter no máximo 800 caracteres.');
  if (!status && rating === null && !review) {
    if (entries[selectedGameId]) requestDelete(selectedGameId);
    else if (!entries[selectedGameId]) showError('Escolha um status, uma nota ou escreva uma resenha antes de salvar.');
    return;
  }

  entries[selectedGameId] = { status, rating, review };
  const persisted = saveEntries(entries);
  renderAll();
  dialog.close();
  showToast(persisted ? 'Registro salvo no seu diário.' : 'Registro atualizado nesta sessão, mas o navegador não permitiu salvar.');
}

function populateGenres() {
  const genres = [...new Set(games.map((game) => game.genre))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  for (const genre of genres) {
    const option = node('option', '', genre);
    option.value = genre;
    byId('genre-filter').append(option);
  }
}

if (byId('genre-filter')) populateGenres();
renderAll();

if (byId('catalog-search-form')) {
  byId('catalog-search-form').addEventListener('submit', (event) => event.preventDefault());
  byId('game-search').addEventListener('input', renderCatalog);
  byId('genre-filter').addEventListener('change', renderCatalog);
  byId('clear-search').addEventListener('click', () => {
    byId('game-search').value = '';
    byId('genre-filter').value = '';
    renderCatalog();
    byId('game-search').focus();
  });
}
byId('diary-filter')?.addEventListener('change', renderDiary);

document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-open-game]');
  if (opener) openGame(opener.dataset.openGame, opener.dataset.openSource);
  const deleteButton = event.target.closest('[data-delete-game]');
  if (deleteButton) requestDelete(deleteButton.dataset.deleteGame);
});

byId('dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => {
  selectedGameId = null;
  if (focusOrigin) {
    const { id, source } = focusOrigin;
    const replacement = document.querySelector(`[data-open-game="${id}"][data-open-source="${source}"]`)
      || document.querySelector(`[data-open-game="${id}"]`)
      || document.querySelector('a[href*="catalogo"]');
    replacement?.focus();
    focusOrigin = null;
  }
});
byId('entry-review').addEventListener('input', updateCounter);
byId('entry-rating').addEventListener('input', () => byId('entry-rating').removeAttribute('aria-invalid'));
form.addEventListener('submit', saveCurrentEntry);
byId('delete-entry').addEventListener('click', () => {
  if (selectedGameId) requestDelete(selectedGameId);
});
byId('confirm-cancel').addEventListener('click', () => confirmDialog.close());
byId('confirm-delete').addEventListener('click', confirmDelete);
confirmDialog.addEventListener('close', () => {
  if (dialog.open) byId('delete-entry').focus();
  else (document.querySelector(`[data-delete-game="${pendingDeleteId}"]`) || byId('diary-filter') || document.querySelector('a[href*="catalogo"]'))?.focus();
  pendingDeleteId = null;
});
