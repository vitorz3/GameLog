import { games, statusLabels } from './catalog.js';
import { loadEntries, saveEntries } from './storage.js';

// busca um elemento da pagina pelo id.
function byId(id) {
  return document.getElementById(id);
}

// encontra um jogo do catalogo pelo id.
function findGame(id) {
  for (const game of games) {
    if (game.id === id) return game;
  }
  return null;
}

// carrega os registros uma vez e guarda o jogo aberto no momento.
const entries = loadEntries();
const dialog = byId('game-dialog');
const confirmDialog = byId('confirm-dialog');
const form = byId('entry-form');
let selectedGameId = null;
let focusOrigin = null;
let pendingDeleteId = null;
let toastTimer;

// cria elementos com texto simples, sem transformar a resenha em html.
function node(tag, className, content) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (content !== undefined) item.textContent = content;
  return item;
}

// monta a capa do jogo nos cards e na janela de detalhes.
function coverFor(game, compact = false) {
  let coverClass = `cover cover--photo cover--${game.art}`;
  if (compact) coverClass += ' cover--compact';
  const cover = node('div', coverClass);
  cover.style.setProperty('--cover-base', game.colors[0]);
  cover.style.setProperty('--cover-accent', game.colors[1]);
  cover.setAttribute('aria-hidden', 'true');
  const image = node('img', 'cover-image');
  image.src = game.image;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', function () {
    image.remove();
    cover.append(node('strong', 'cover-title', game.title));
  });
  cover.append(image);
  const number = games.indexOf(game) + 1;
  const code = number < 10 ? `0${number}` : String(number);
  cover.append(node('span', 'cover-code', `GL / ${code}`));
  cover.append(node('span', 'cover-shape'));
  return cover;
}

// remove acentos e diferenca entre maiusculas e minusculas na busca.
function normalizeSearch(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

// filtra os jogos e recria os cards do catalogo.
function renderCatalog() {
  if (!byId('catalog-grid')) return;
  const query = normalizeSearch(byId('game-search').value.trim());
  const genre = byId('genre-filter').value;
  const filtered = [];

  for (const game of games) {
    const titleMatches = normalizeSearch(game.title).includes(query);
    const genreMatches = genre === '' || game.genre === genre;
    if (titleMatches && genreMatches) filtered.push(game);
  }

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
    if (entry) {
      const statusClass = entry.status || 'none';
      const statusText = entry.status ? statusLabels[entry.status] : 'No diário';
      info.append(node('span', `mini-status mini-status--${statusClass}`, statusText));
    }
    card.append(info, button);
    grid.append(card);
  }

  byId('catalog-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}`;
  byId('catalog-empty').hidden = filtered.length !== 0;
}

// transforma uma nota em texto para o diario.
function ratingText(rating) {
  if (rating === null) return 'Sem nota';
  return `${rating.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} / 5`;
}

// mostra somente os jogos que o usuario registrou no diario.
function renderDiary() {
  if (!byId('diary-list')) return;
  const allEntries = [];
  for (const game of games) {
    if (entries[game.id]) allEntries.push(game);
  }
  allEntries.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  const statusFilter = byId('diary-filter').value;
  const filtered = [];
  for (const game of allEntries) {
    const status = entries[game.id].status;
    if (!statusFilter || statusFilter === status || (statusFilter === 'none' && !status)) {
      filtered.push(game);
    }
  }

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
    const statusClass = entry.status || 'none';
    const statusText = entry.status ? statusLabels[entry.status] : 'Sem status';
    facts.append(node('span', `status-pill status-pill--${statusClass}`, statusText));
    facts.append(node('span', 'rating-pill', `★ ${ratingText(entry.rating)}`));
    details.append(facts);
    body.append(details);
    const reviewClass = entry.review ? 'diary-review' : 'diary-review diary-review--empty';
    const reviewText = entry.review || 'Nenhuma resenha escrita.';
    const review = node('p', reviewClass, reviewText);
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

// atualiza o numero de registros no menu.
function renderNavCount() {
  const count = Object.keys(entries).length;
  const navCount = byId('nav-diary-count');
  navCount.textContent = count;
  navCount.setAttribute('aria-label', `${count} ${count === 1 ? 'jogo registrado' : 'jogos registrados'}`);
}

// conta os status e calcula a media das notas existentes.
function renderStats() {
  if (!byId('stat-average')) return;
  let wantCount = 0;
  let playingCount = 0;
  let finishedCount = 0;
  let ratingCount = 0;
  let ratingSum = 0;

  for (const game of games) {
    const entry = entries[game.id];
    if (!entry) continue;

    if (entry.status === 'want') wantCount++;
    if (entry.status === 'playing') playingCount++;
    if (entry.status === 'finished') finishedCount++;
    if (entry.rating !== null) {
      ratingCount++;
      ratingSum += entry.rating;
    }
  }

  byId('stat-want').textContent = wantCount;
  byId('stat-playing').textContent = playingCount;
  byId('stat-finished').textContent = finishedCount;

  if (ratingCount === 0) {
    byId('stat-average').textContent = '—';
    byId('average-caption').textContent = 'Nenhuma nota ainda';
  } else {
    const average = ratingSum / ratingCount;
    byId('stat-average').textContent = `${average.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} / 5`;
    byId('average-caption').textContent = `${ratingCount} ${ratingCount === 1 ? 'nota atribuída' : 'notas atribuídas'}`;
  }
}

// redesenha as partes da pagina depois de salvar ou excluir.
function renderAll() {
  renderCatalog();
  renderDiary();
  renderStats();
  renderNavCount();
}

// mostra uma mensagem curta depois de salvar ou excluir.
function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('toast--visible'), 4500);
}

// mostra um erro de preenchimento e leva o foco ate ele.
function showError(message) {
  const error = byId('form-error');
  error.textContent = message;
  error.hidden = false;
  error.focus();
}

// esconde o erro quando o formulario pode ser usado de novo.
function hideError() {
  byId('form-error').hidden = true;
  byId('form-error').textContent = '';
}

// conta os caracteres digitados na resenha.
function updateCounter() {
  byId('review-counter').textContent = `${byId('entry-review').value.length} / 800`;
}

// abre os detalhes e preenche o formulario com o registro existente.
function openGame(id, source) {
  const game = findGame(id);
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

// pede confirmacao antes de apagar um registro.
function requestDelete(id) {
  if (!entries[id]) return;
  pendingDeleteId = id;
  byId('confirm-game-title').textContent = findGame(id).title;
  confirmDialog.showModal();
  byId('confirm-cancel').focus();
}

// apaga o registro, salva a mudanca e atualiza a tela.
function confirmDelete() {
  if (!pendingDeleteId) return;
  delete entries[pendingDeleteId];
  const persisted = saveEntries(entries);
  renderAll();
  const detailWasOpen = dialog.open;
  confirmDialog.close();
  if (detailWasOpen) dialog.close();
  else if (byId('diary-filter')) byId('diary-filter').focus();
  showToast(persisted ? 'Registro excluído do seu diário.' : 'Registro excluído nesta sessão, mas o navegador não permitiu salvar a alteração.');
}

// aceita nota inteira ou decimal com virgula ou ponto.
function parseRating(text) {
  if (!text) return null;
  if (!/^[1-5]([.,][0-9]{1,2})?$/.test(text)) return NaN;
  const value = Number(text.replace(',', '.'));
  return value >= 1 && value <= 5 ? value : NaN;
}

// valida o formulario e salva um registro para o jogo aberto.
function saveCurrentEntry(event) {
  event.preventDefault();
  if (!selectedGameId) return;
  hideError();
  const status = byId('entry-status').value;
  const ratingValue = byId('entry-rating').value.trim();
  const rating = parseRating(ratingValue);
  const review = byId('entry-review').value.trim();
  if (status && !Object.keys(statusLabels).includes(status)) return showError('Escolha um status válido.');
  if (Number.isNaN(rating)) {
    byId('entry-rating').setAttribute('aria-invalid', 'true');
    return showError('Digite uma nota entre 1 e 5, com até duas casas decimais. Exemplo: 4,5.');
  }
  if (review.length > 800) return showError('A resenha deve ter no máximo 800 caracteres.');
  if (!status && rating === null && !review) {
    if (entries[selectedGameId]) requestDelete(selectedGameId);
    else showError('Escolha um status, uma nota ou escreva uma resenha antes de salvar.');
    return;
  }

  entries[selectedGameId] = { status, rating, review };
  const persisted = saveEntries(entries);
  renderAll();
  dialog.close();
  showToast(persisted ? 'Registro salvo no seu diário.' : 'Registro atualizado nesta sessão, mas o navegador não permitiu salvar.');
}

// preenche a lista de generos usando os jogos do catalogo.
function populateGenres() {
  const genres = [];
  for (const game of games) {
    if (!genres.includes(game.genre)) genres.push(game.genre);
  }
  genres.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  for (const genre of genres) {
    const option = node('option', '', genre);
    option.value = genre;
    byId('genre-filter').append(option);
  }
}

// prepara a pagina assim que o modulo termina de carregar.
if (byId('genre-filter')) populateGenres();
renderAll();

// liga a busca e o filtro do catalogo aos campos da pagina.
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
const diaryFilter = byId('diary-filter');
if (diaryFilter) diaryFilter.addEventListener('change', renderDiary);

// identifica qual card ou botao de exclusao recebeu o clique.
document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-open-game]');
  if (opener) openGame(opener.dataset.openGame, opener.dataset.openSource);
  const deleteButton = event.target.closest('[data-delete-game]');
  if (deleteButton) requestDelete(deleteButton.dataset.deleteGame);
});

// fecha a janela de detalhes e devolve o foco ao botao usado antes.
byId('dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => {
  selectedGameId = null;
  if (focusOrigin) {
    const id = focusOrigin.id;
    const source = focusOrigin.source;
    let replacement = document.querySelector(`[data-open-game="${id}"][data-open-source="${source}"]`);
    if (!replacement) replacement = document.querySelector(`[data-open-game="${id}"]`);
    if (!replacement) replacement = document.querySelector('a[href*="catalogo"]');
    if (replacement) replacement.focus();
    focusOrigin = null;
  }
});

// liga os campos e botoes do formulario de registro.
byId('entry-review').addEventListener('input', updateCounter);
byId('entry-rating').addEventListener('input', () => byId('entry-rating').removeAttribute('aria-invalid'));
form.addEventListener('submit', saveCurrentEntry);
byId('delete-entry').addEventListener('click', () => {
  if (selectedGameId) requestDelete(selectedGameId);
});

// a segunda janela confirma ou cancela a exclusao do registro.
byId('confirm-cancel').addEventListener('click', () => confirmDialog.close());
byId('confirm-delete').addEventListener('click', confirmDelete);
confirmDialog.addEventListener('close', () => {
  let target;
  if (dialog.open) {
    target = byId('delete-entry');
  } else {
    target = document.querySelector(`[data-delete-game="${pendingDeleteId}"]`);
    if (!target) target = byId('diary-filter');
    if (!target) target = document.querySelector('a[href*="catalogo"]');
  }
  if (target) target.focus();
  pendingDeleteId = null;
});
