const state = {
  queue: [],
  popupItem: null
};

const queueEl = document.getElementById('queue');
const libraryEl = document.getElementById('library');
const dueTodayEl = document.getElementById('dueToday');
const activeTotalEl = document.getElementById('activeTotal');
const paraBreakdownEl = document.getElementById('paraBreakdown');
const modalEl = document.getElementById('reviewModal');
const modalTitleEl = document.getElementById('modalTitle');
const modalMetaEl = document.getElementById('modalMeta');
const modalOpenFileEl = document.getElementById('modalOpenFile');

init();

async function init() {
  document.getElementById('summaryForm').addEventListener('submit', createSummary);
  modalEl.addEventListener('click', onModalClick);

  await refreshAll();

  setInterval(async () => {
    await refreshQueue();
    openPopupIfNeeded();
  }, 30000);
}

async function refreshAll() {
  await Promise.all([refreshDashboard(), refreshQueue(), refreshLibrary()]);
  openPopupIfNeeded();
}

async function refreshDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();

  dueTodayEl.textContent = data.dueToday;
  activeTotalEl.textContent = data.active;

  const line = (data.byPara || [])
    .map((x) => `${x.paraCategory}: ${x.total}`)
    .join(' | ');

  paraBreakdownEl.textContent = line || 'Sem resumos ainda.';
}

async function refreshQueue() {
  const res = await fetch('/api/review-queue');
  state.queue = await res.json();
  renderQueue();
}

async function refreshLibrary() {
  const res = await fetch('/api/summaries');
  const data = await res.json();

  if (!data.length) {
    libraryEl.innerHTML = '<p class="muted">Nenhum resumo cadastrado.</p>';
    return;
  }

  libraryEl.innerHTML = data.map((item) => {
    const fileHref = toPublicFileUrl(item.filePath);
    return `
      <article class="item">
        <strong>${escapeHtml(item.title)}</strong>
        <small>PARA: ${item.paraCategory} | Proxima: ${formatDate(item.nextReviewAt)} | Status: ${item.status}</small>
        <a href="${fileHref}" target="_blank" rel="noreferrer">Abrir arquivo</a>
        ${item.status === 'active' ? `<button onclick="archiveSummary(${item.id})">Arquivar</button>` : ''}
      </article>
    `;
  }).join('');
}

function renderQueue() {
  if (!state.queue.length) {
    queueEl.innerHTML = '<p class="muted">Sem revisoes pendentes hoje.</p>';
    return;
  }

  queueEl.innerHTML = state.queue.map((item) => `
    <article class="item">
      <strong>${escapeHtml(item.title)}</strong>
      <small>PARA: ${item.paraCategory} | Etapa: ${item.currentStep + 1}/4 | Venceu em ${formatDate(item.nextReviewAt)}</small>
      <button onclick="openManualPopup(${item.id})">Revisar agora</button>
    </article>
  `).join('');
}

function openPopupIfNeeded() {
  if (state.popupItem) {
    return;
  }

  const due = state.queue[0];
  if (!due) {
    return;
  }

  showPopup(due);
}

function showPopup(item) {
  state.popupItem = item;
  modalTitleEl.textContent = item.title;
  modalMetaEl.textContent = `PARA: ${item.paraCategory} | Etapa: ${item.currentStep + 1}/4`;
  modalOpenFileEl.href = toPublicFileUrl(item.filePath);
  modalEl.classList.remove('hidden');
}

async function createSummary(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const title = String(formData.get('title') || '').trim();
  const summaryText = String(formData.get('summaryText') || '').trim();
  const file = formData.get('summaryFile');

  if (!title) {
    alert('Titulo obrigatorio.');
    return;
  }

  if (!summaryText && (!file || !file.size)) {
    alert('Envie um arquivo ou cole o resumo.');
    return;
  }

  const res = await fetch('/api/summaries', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Falha ao criar resumo.');
    return;
  }

  event.target.reset();
  await refreshAll();
}

async function onModalClick(event) {
  const btn = event.target.closest('button[data-grade]');
  if (!btn || !state.popupItem) {
    return;
  }

  const grade = btn.dataset.grade;

  const res = await fetch(`/api/summaries/${state.popupItem.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade })
  });

  if (!res.ok) {
    alert('Falha ao registrar revisao.');
    return;
  }

  closeModal();
  await refreshAll();
}

async function archiveSummary(id) {
  const res = await fetch(`/api/summaries/${id}/archive`, { method: 'POST' });
  if (!res.ok) {
    alert('Falha ao arquivar.');
    return;
  }

  await refreshAll();
}

function closeModal() {
  state.popupItem = null;
  modalEl.classList.add('hidden');
}

function openManualPopup(id) {
  const item = state.queue.find((x) => x.id === id);
  if (item) {
    showPopup(item);
  }
}

function toPublicFileUrl(fullPath) {
  const normalized = fullPath.replaceAll('\\\\', '/').replaceAll('\\', '/');
  const marker = '/KnowledgeOSVault/';
  const idx = normalized.indexOf(marker);

  if (idx === -1) {
    return '#';
  }

  const relative = normalized.slice(idx + marker.length);
  return `/vault/${relative}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

window.archiveSummary = archiveSummary;
window.openManualPopup = openManualPopup;
