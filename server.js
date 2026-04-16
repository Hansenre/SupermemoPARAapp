const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || '127.0.0.1';

const BASE_DIR = __dirname;
const APP_HOME = process.env.SMP_APP_HOME || BASE_DIR;
const PUBLIC_DIR = process.env.SMP_PUBLIC_DIR || path.join(APP_HOME, 'public');
const DATA_DIR = process.env.SMP_DATA_DIR || path.join(APP_HOME, 'data');
const DB_PATH = process.env.SMP_DB_PATH || path.join(DATA_DIR, 'app.db');
const BACKUP_DIR = process.env.SMP_BACKUP_DIR || path.join(DATA_DIR, 'backups');
const VAULT_DIR = process.env.SMP_VAULT_DIR || path.join(APP_HOME, 'KnowledgeOSVault');
const PARA_MAP = {
  inbox: 'Inbox',
  projects: 'Projects',
  areas: 'Areas',
  resources: 'Resources',
  archives: 'Archives'
};
const REVIEW_INTERVALS = [3, 10, 30, 60];

ensureDirs();
const db = new Database(DB_PATH);
initDb();

app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use('/vault', express.static(VAULT_DIR));

app.get('/view', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'viewer.html'));
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { target } = resolveParaTargetFolder(req.body.paraCategory, req.body.folderName);
      cb(null, target);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    try {
      const { target } = resolveParaTargetFolder(req.body.paraCategory, req.body.folderName);
      const originalExt = path.extname(file.originalname) || '';
      const suggested = sanitizeFileName(req.body.fileName || '');
      const fallbackStem = sanitizeFileName(path.parse(file.originalname).name || 'resumo');
      const finalStem = suggested || fallbackStem;
      const desiredName = `${finalStem}${originalExt}`;
      cb(null, createUniqueFileName(target, desiredName));
    } catch (err) {
      cb(err);
    }
  }
});
const upload = multer({ storage });
const uploadPara = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const { target } = resolveParaTargetFolder(req.body.category, req.body.currentPath);
        cb(null, target);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      try {
        const { target } = resolveParaTargetFolder(req.body.category, req.body.currentPath);
        const originalExt = path.extname(file.originalname) || '';
        const requestedStem = sanitizeFileName(req.body.fileName || '');
        const fallbackStem = sanitizeFileName(path.parse(file.originalname).name || 'arquivo');
        const stem = requestedStem || fallbackStem;
        const desiredName = `${stem}${originalExt}`;
        const overwrite = String(req.body.overwrite || '').toLowerCase() === 'true';
        const finalName = overwrite ? desiredName : createUniqueFileName(target, desiredName);
        cb(null, finalName);
      } catch (err) {
        cb(err);
      }
    }
  })
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/backup/list', (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json([]);
    }

    const entries = fs.readdirSync(BACKUP_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('backup_'))
      .map((d) => {
        const dir = path.join(BACKUP_DIR, d.name);
        const exportPath = path.join(dir, 'export.json');
        const dbCopyPath = path.join(dir, 'app.db');
        const stat = fs.statSync(dir);
        return {
          id: d.name,
          createdAt: stat.mtime.toISOString(),
          hasExport: fs.existsSync(exportPath),
          hasDbCopy: fs.existsSync(dbCopyPath)
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao listar backups.' });
  }
});

app.post('/api/backup/create', (req, res) => {
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup_${stamp}`;
    const dir = path.join(BACKUP_DIR, backupId);
    fs.mkdirSync(dir, { recursive: true });

    const exportData = buildLogicalExport();
    fs.writeFileSync(path.join(dir, 'export.json'), JSON.stringify(exportData, null, 2), 'utf8');
    fs.copyFileSync(DB_PATH, path.join(dir, 'app.db'));

    res.status(201).json({ ok: true, id: backupId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao criar backup.' });
  }
});

app.post('/api/backup/restore', (req, res) => {
  try {
    const id = String(req.body.id || '').trim();
    if (!id || !id.startsWith('backup_')) {
      return res.status(400).json({ error: 'Backup invalido.' });
    }

    const dir = path.join(BACKUP_DIR, id);
    const exportPath = path.join(dir, 'export.json');
    if (!fs.existsSync(exportPath)) {
      return res.status(404).json({ error: 'Arquivo export.json nao encontrado no backup.' });
    }

    const raw = fs.readFileSync(exportPath, 'utf8');
    const payload = JSON.parse(raw);
    restoreLogicalExport(payload);

    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao restaurar backup.' });
  }
});

app.get('/api/vault/read', (req, res) => {
  try {
    const relativePath = String(req.query.path || '').trim();
    if (!relativePath) {
      return res.status(400).json({ error: 'Caminho obrigatorio.' });
    }

    const absolutePath = resolveInsideBase(VAULT_DIR, relativePath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo nao encontrado.' });
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const textLikeExt = new Set(['.md', '.txt', '.json', '.log', '.csv']);
    if (!textLikeExt.has(ext)) {
      return res.status(400).json({ error: 'Visualizador suporta apenas arquivos de texto.' });
    }

    const content = fs.readFileSync(absolutePath, 'utf8');
    res.json({
      name: path.basename(absolutePath),
      ext,
      relativePath: toUnixPath(path.relative(VAULT_DIR, absolutePath)),
      content
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao ler arquivo.' });
  }
});

app.get('/api/dashboard', (req, res) => {
  const today = startOfDayISO(new Date());

  const dueToday = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
  `).get(today).total;

  const active = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status = 'active'
  `).get().total;

  const byPara = db.prepare(`
    SELECT para_category AS paraCategory, COUNT(*) AS total
    FROM summaries
    WHERE status = 'active'
    GROUP BY para_category
  `).all();

  const weeklyGoal = computeWeeklyGoal(new Date());
  const openIllusions = db.prepare(`
    SELECT COUNT(*) AS total
    FROM metacog_alerts
    WHERE resolved_at IS NULL
  `).get().total;

  res.json({ dueToday, active, byPara, weeklyGoal, openIllusions });
});

app.get('/api/weekly-goal', (req, res) => {
  const weeklyGoal = computeWeeklyGoal(new Date());
  res.json(weeklyGoal);
});

app.get('/api/weekly-goal/details', (req, res) => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weeklyGoal = computeWeeklyGoal(now);
  const dailyPlan = [];

  for (let i = 0; i < 7; i += 1) {
    const dayStart = addDays(weekStart, i);
    const dayEnd = addDays(dayStart, 1);
    const dueCount = db.prepare(`
      SELECT COUNT(*) AS total
      FROM summaries
      WHERE status = 'active' AND next_review_at >= ? AND next_review_at < ?
    `).get(dayStart.toISOString(), dayEnd.toISOString()).total;

    dailyPlan.push({
      date: dayStart.toISOString(),
      target: weeklyGoal.dailyTarget,
      dueCount
    });
  }

  const focusCategories = db.prepare(`
    SELECT para_category AS paraCategory, COUNT(*) AS total
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
    GROUP BY para_category
    ORDER BY total DESC
    LIMIT 3
  `).all(addDays(now, 7).toISOString());

  const todayFocusItems = db.prepare(`
    SELECT id, title, para_category AS paraCategory, next_review_at AS nextReviewAt
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
    ORDER BY next_review_at ASC
    LIMIT 12
  `).all(startOfDayISO(now));

  res.json({
    weeklyGoal,
    dailyPlan,
    focusCategories,
    todayFocusItems
  });
});

app.get('/api/weekly-goal/day-details', (req, res) => {
  try {
    const dateRaw = String(req.query.date || '').trim();
    if (!dateRaw) {
      return res.status(400).json({ error: 'Data obrigatoria (YYYY-MM-DD).' });
    }

    const dayStart = new Date(`${dateRaw}T00:00:00`);
    if (Number.isNaN(dayStart.getTime())) {
      return res.status(400).json({ error: 'Data invalida.' });
    }
    const dayEnd = addDays(dayStart, 1);

    const rows = db.prepare(`
      SELECT s.id, s.title, s.para_category AS paraCategory, s.next_review_at AS nextReviewAt,
             (SELECT COUNT(*) FROM flashcards f WHERE f.summary_id = s.id) AS flashcardsCount
      FROM summaries s
      WHERE s.status = 'active' AND s.next_review_at >= ? AND s.next_review_at < ?
      ORDER BY s.next_review_at ASC
    `).all(dayStart.toISOString(), dayEnd.toISOString());

    res.json({
      date: dateRaw,
      items: rows
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao carregar detalhes do dia.' });
  }
});

app.get('/api/metacog/alerts', (req, res) => {
  const rows = db.prepare(`
    SELECT id, summary_id AS summaryId, review_id AS reviewId, title, message, created_at AS createdAt
    FROM metacog_alerts
    WHERE resolved_at IS NULL
    ORDER BY created_at DESC
    LIMIT 15
  `).all();
  res.json(rows);
});

app.post('/api/metacog/alerts/:id/resolve', (req, res) => {
  const id = Number(req.params.id);
  db.prepare(`
    UPDATE metacog_alerts
    SET resolved_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), id);
  res.json({ ok: true });
});

app.get('/api/review-queue', (req, res) => {
  const today = startOfDayISO(new Date());
  const rows = db.prepare(`
    SELECT id, title, para_category AS paraCategory, file_path AS filePath, current_step AS currentStep, next_review_at AS nextReviewAt,
           loci_palace AS lociPalace, loci_room AS lociRoom, loci_hook AS lociHook
    FROM summaries
    WHERE status = 'active' AND next_review_at <= ?
    ORDER BY next_review_at ASC
  `).all(today);

  res.json(rows);
});

app.get('/api/summaries', (req, res) => {
  const rows = db.prepare(`
    SELECT id, title, para_category AS paraCategory, file_path AS filePath, created_at AS createdAt, release_at AS releaseAt, current_step AS currentStep, next_review_at AS nextReviewAt, status,
           loci_palace AS lociPalace, loci_room AS lociRoom, loci_hook AS lociHook
    FROM summaries
    ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

app.get('/api/summaries/:id/flashcards', (req, res) => {
  const id = Number(req.params.id);
  const cards = db.prepare(`
    SELECT id, prompt, answer
    FROM flashcards
    WHERE summary_id = ?
    ORDER BY id ASC
  `).all(id);
  res.json(cards);
});

app.get('/api/summaries/:id/quick', (req, res) => {
  const id = Number(req.params.id);
  const summary = db.prepare(`
    SELECT id, title, para_category AS paraCategory, file_path AS filePath, created_at AS createdAt, release_at AS releaseAt, next_review_at AS nextReviewAt, status,
           loci_palace AS lociPalace, loci_room AS lociRoom, loci_hook AS lociHook
    FROM summaries
    WHERE id = ?
  `).get(id);

  if (!summary) {
    return res.status(404).json({ error: 'Resumo nao encontrado.' });
  }

  const flashcards = db.prepare(`
    SELECT id, prompt, answer
    FROM flashcards
    WHERE summary_id = ?
    ORDER BY id ASC
  `).all(id);
  const flashcardsCount = flashcards.length;

  let preview = '';
  let previewType = 'text';
  let fileSize = null;
  let fileUpdatedAt = null;
  let editableText = false;

  if (summary.filePath && fs.existsSync(summary.filePath)) {
    const stat = fs.statSync(summary.filePath);
    fileSize = stat.size;
    fileUpdatedAt = stat.mtime.toISOString();

    const ext = path.extname(summary.filePath).toLowerCase();
    if (['.md', '.txt'].includes(ext)) {
      const content = fs.readFileSync(summary.filePath, 'utf8');
      preview = content.slice(0, 1200);
      previewType = 'text';
      editableText = true;
    } else if (ext === '.pdf') {
      preview = 'Arquivo PDF detectado. Use "Abrir" para visualizar o conteudo completo.';
      previewType = 'pdf';
    } else {
      preview = `Arquivo ${ext || 'sem extensao'} detectado. Use "Abrir" para visualizar o conteudo completo.`;
      previewType = 'binary';
    }
  } else {
    preview = 'Arquivo nao localizado no caminho salvo.';
    previewType = 'missing';
  }

  res.json({
    ...summary,
    flashcardsCount,
    flashcards,
    preview,
    previewType,
    editableText,
    fileSize,
    fileUpdatedAt
  });
});

app.put('/api/summaries/:id/memory', (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = db.prepare('SELECT id FROM summaries WHERE id = ?').get(id);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    const lociPalace = String(req.body.lociPalace || '').trim().slice(0, 160);
    const lociRoom = String(req.body.lociRoom || '').trim().slice(0, 160);
    const lociHook = String(req.body.lociHook || '').trim().slice(0, 500);
    const flashcardsRaw = req.body.flashcardsRaw;
    const cards = parseFlashcards(flashcardsRaw);

    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE summaries
        SET loci_palace = ?, loci_room = ?, loci_hook = ?
        WHERE id = ?
      `).run(lociPalace || null, lociRoom || null, lociHook || null, id);

      db.prepare('DELETE FROM flashcards WHERE summary_id = ?').run(id);
      const insert = db.prepare(`
        INSERT INTO flashcards (summary_id, prompt, answer, created_at)
        VALUES (?, ?, ?, ?)
      `);
      const now = new Date().toISOString();
      for (const card of cards) {
        insert.run(id, card.prompt, card.answer, now);
      }
    });
    tx();

    res.json({ ok: true, flashcardsCount: cards.length });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao salvar dados de memoria.' });
  }
});

app.put('/api/summaries/:id/text', (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = db.prepare('SELECT id, file_path AS filePath FROM summaries WHERE id = ?').get(id);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    const filePath = String(summary.filePath || '');
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo do resumo nao encontrado.' });
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!['.md', '.txt'].includes(ext)) {
      return res.status(400).json({ error: 'Edicao de texto disponivel apenas para arquivos .md/.txt.' });
    }

    const content = String(req.body.content || '');
    fs.writeFileSync(filePath, content, 'utf8');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao salvar texto do resumo.' });
  }
});

app.put('/api/summaries/:id/schedule', (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = db.prepare('SELECT id FROM summaries WHERE id = ?').get(id);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    const postponeDaysRaw = req.body.postponeDays;
    const nextReviewDateRaw = String(req.body.nextReviewDate || '').trim();
    let nextReviewAt = null;

    if (Number.isFinite(Number(postponeDaysRaw))) {
      const days = Math.max(0, Math.min(365, Number(postponeDaysRaw)));
      const current = db.prepare('SELECT next_review_at AS nextReviewAt FROM summaries WHERE id = ?').get(id);
      const base = current?.nextReviewAt ? new Date(current.nextReviewAt) : new Date();
      nextReviewAt = startOfDayISO(addDays(base, days));
    }

    if (nextReviewDateRaw) {
      const parsed = parseDateOnly(nextReviewDateRaw);
      if (!parsed) {
        return res.status(400).json({ error: 'Data de proxima revisao invalida.' });
      }
      nextReviewAt = startOfDayISO(parsed);
    }

    if (!nextReviewAt) {
      return res.status(400).json({ error: 'Informe postponeDays ou nextReviewDate.' });
    }

    db.prepare(`
      UPDATE summaries
      SET next_review_at = ?
      WHERE id = ?
    `).run(nextReviewAt, id);

    res.json({ ok: true, nextReviewAt });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao atualizar agenda.' });
  }
});

app.get('/api/para/browse', (req, res) => {
  try {
    const para = normalizePara(req.query.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const subpath = String(req.query.subpath || '');
    const targetDir = resolveInsideBase(baseDir, subpath);

    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({ error: 'Pasta nao encontrada.' });
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true })
      .map((entry) => {
        const absolutePath = path.join(targetDir, entry.name);
        const relativePath = toUnixPath(path.relative(baseDir, absolutePath));
        const ext = path.extname(entry.name).toLowerCase();
        const editable = entry.isFile() && ['.md', '.txt'].includes(ext);

        return {
          name: entry.name,
          type: entry.isDirectory() ? 'dir' : 'file',
          relativePath,
          editable
        };
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'dir' ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'pt-BR');
      });

    res.json({
      category: para,
      categoryFolder: PARA_MAP[para],
      currentPath: toUnixPath(path.relative(baseDir, targetDir)),
      entries
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao listar pasta PARA.' });
  }
});

app.get('/api/para/folders', (req, res) => {
  try {
    const para = normalizePara(req.query.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const requestedDepth = Number(req.query.maxDepth);
    const maxDepth = Number.isFinite(requestedDepth)
      ? clamp(Math.floor(requestedDepth), 1, 10)
      : 6;

    const folders = listFoldersRecursive(baseDir, maxDepth);
    res.json({ category: para, folders });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao listar pastas salvas.' });
  }
});

app.get('/api/para/file', (req, res) => {
  try {
    const para = normalizePara(req.query.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const filePath = String(req.query.filePath || '');
    const absolutePath = resolveInsideBase(baseDir, filePath);

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo nao encontrado.' });
    }

    const ext = path.extname(absolutePath).toLowerCase();
    if (!['.md', '.txt'].includes(ext)) {
      return res.status(400).json({ error: 'Edicao disponivel apenas para .md e .txt.' });
    }

    const content = fs.readFileSync(absolutePath, 'utf8');
    res.json({
      category: para,
      filePath: toUnixPath(path.relative(baseDir, absolutePath)),
      content
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao abrir arquivo.' });
  }
});

app.post('/api/para/folder', (req, res) => {
  try {
    const para = normalizePara(req.body.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const currentPath = String(req.body.currentPath || '');
    const folderName = sanitizeFileName(req.body.folderName || '');

    if (!folderName) {
      return res.status(400).json({ error: 'Nome da pasta obrigatorio.' });
    }

    const parentDir = resolveInsideBase(baseDir, currentPath);
    const targetDir = path.join(parentDir, folderName);

    if (!isInsideBase(baseDir, targetDir)) {
      return res.status(400).json({ error: 'Caminho invalido.' });
    }

    fs.mkdirSync(targetDir, { recursive: true });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao criar pasta.' });
  }
});

app.post('/api/para/upload', uploadPara.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo obrigatorio.' });
    }
    res.status(201).json({ ok: true, filePath: req.file.path });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha no upload do arquivo.' });
  }
});

app.put('/api/para/file', (req, res) => {
  try {
    const para = normalizePara(req.body.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const filePath = String(req.body.filePath || '');
    const content = String(req.body.content || '');
    const absolutePath = resolveInsideBase(baseDir, filePath);

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo nao encontrado.' });
    }

    const ext = path.extname(absolutePath).toLowerCase();
    if (!['.md', '.txt'].includes(ext)) {
      return res.status(400).json({ error: 'Edicao disponivel apenas para .md e .txt.' });
    }

    fs.writeFileSync(absolutePath, content, 'utf8');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao salvar arquivo.' });
  }
});

app.delete('/api/para/file', (req, res) => {
  try {
    const para = normalizePara(req.body.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const filePath = String(req.body.filePath || '');
    const absolutePath = resolveInsideBase(baseDir, filePath);

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      return res.status(404).json({ error: 'Arquivo nao encontrado.' });
    }

    fs.unlinkSync(absolutePath);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao excluir arquivo.' });
  }
});

app.delete('/api/para/folder', (req, res) => {
  try {
    const para = normalizePara(req.body.category || 'resources');
    const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
    const folderPath = String(req.body.folderPath || '');

    if (!folderPath) {
      return res.status(400).json({ error: 'Pasta invalida.' });
    }

    const absolutePath = resolveInsideBase(baseDir, folderPath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
      return res.status(404).json({ error: 'Pasta nao encontrada.' });
    }

    const items = fs.readdirSync(absolutePath);
    if (items.length > 0) {
      return res.status(400).json({ error: 'Pasta nao esta vazia.' });
    }

    fs.rmdirSync(absolutePath);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao excluir pasta.' });
  }
});

app.post('/api/summaries', upload.single('summaryFile'), (req, res) => {
  try {
    const title = (req.body.title || '').trim();
    const para = normalizePara(req.body.paraCategory || 'resources');
    const folderName = (req.body.folderName || '').trim();
    const fileNameInput = (req.body.fileName || '').trim();
    const summaryText = (req.body.summaryText || '').trim();
    const lociPalace = String(req.body.lociPalace || '').trim().slice(0, 160);
    const lociRoom = String(req.body.lociRoom || '').trim().slice(0, 160);
    const lociHook = String(req.body.lociHook || '').trim().slice(0, 500);
    const flashcardsRaw = req.body.flashcardsRaw;
    const launchDateRaw = String(req.body.launchDate || '').trim();

    if (!title) {
      return res.status(400).json({ error: 'Titulo obrigatorio.' });
    }

    let filePath = null;

    if (req.file) {
      filePath = req.file.path;
    } else if (summaryText) {
      const { target } = resolveParaTargetFolder(para, folderName);
      const stem = sanitizeFileName(fileNameInput || title);
      const finalFileName = createUniqueFileName(target, `${stem}.md`);
      const fullPath = path.join(target, finalFileName);
      const content = buildSummaryTemplate(title, summaryText);
      fs.writeFileSync(fullPath, content, 'utf8');
      filePath = fullPath;
    } else {
      return res.status(400).json({ error: 'Envie um arquivo ou texto do resumo.' });
    }

    const created = new Date();
    const launchDate = launchDateRaw ? parseDateOnly(launchDateRaw) : null;
    if (launchDateRaw && !launchDate) {
      return res.status(400).json({ error: 'Data de lancamento invalida.' });
    }

    const baseForSchedule = launchDate || created;
    const nextReview = addDays(baseForSchedule, REVIEW_INTERVALS[0]);

    const result = db.prepare(`
      INSERT INTO summaries (title, para_category, file_path, created_at, release_at, current_step, next_review_at, status, loci_palace, loci_room, loci_hook)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    `).run(
      title,
      para,
      filePath,
      created.toISOString(),
      launchDate ? startOfDayISO(launchDate) : startOfDayISO(created),
      0,
      startOfDayISO(nextReview),
      lociPalace || null,
      lociRoom || null,
      lociHook || null
    );

    const summaryId = Number(result.lastInsertRowid);
    const flashcards = parseFlashcards(flashcardsRaw);
    const insertCard = db.prepare(`
      INSERT INTO flashcards (summary_id, prompt, answer, created_at)
      VALUES (?, ?, ?, ?)
    `);

    for (const card of flashcards) {
      insertCard.run(summaryId, card.prompt, card.answer, created.toISOString());
    }

    res.status(201).json({ id: result.lastInsertRowid, flashcardsCount: flashcards.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar resumo.' });
  }
});

app.post('/api/summaries/:id/review', (req, res) => {
  const id = Number(req.params.id);
  const grade = (req.body.grade || '').trim();
  const confidence = Number.isFinite(Number(req.body.confidence)) ? Number(req.body.confidence) : null;
  const recallNote = String(req.body.recallNote || '').slice(0, 4000);
  const recallSeconds = Number.isFinite(Number(req.body.recallSeconds)) ? Number(req.body.recallSeconds) : null;

  if (!['good', 'partial', 'forgot'].includes(grade)) {
    return res.status(400).json({ error: 'Grade invalida.' });
  }

  const item = db.prepare('SELECT * FROM summaries WHERE id = ?').get(id);
  if (!item) {
    return res.status(404).json({ error: 'Resumo nao encontrado.' });
  }

  if (item.status !== 'active') {
    return res.status(400).json({ error: 'Resumo arquivado.' });
  }

  const now = new Date();
  const adaptive = calculateAdaptiveSchedule(item, grade, confidence, now);
  const newStep = adaptive.newStep;
  const nextDate = adaptive.nextDate;
  const adaptiveDays = adaptive.intervalDays;
  const illusionDetected = isIllusionOfCompetence(grade, confidence);

  const nextReviewAt = startOfDayISO(nextDate);

  db.prepare(`
    UPDATE summaries
    SET current_step = ?, next_review_at = ?, last_grade = ?
    WHERE id = ?
  `).run(newStep, nextReviewAt, grade, id);

  db.prepare(`
    INSERT INTO reviews (summary_id, reviewed_at, grade, resulting_step, next_review_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, now.toISOString(), grade, newStep, nextReviewAt);

  const reviewId = db.prepare('SELECT last_insert_rowid() AS id').get().id;
  db.prepare(`
    UPDATE reviews
    SET confidence = ?, recall_note = ?, recall_seconds = ?, adaptive_days = ?, is_illusion = ?
    WHERE id = ?
  `).run(confidence, recallNote || null, recallSeconds, adaptiveDays, illusionDetected ? 1 : 0, reviewId);

  if (illusionDetected) {
    const message = 'Confianca alta com erro detectada. Faça 1 ciclo extra de recall ativo antes da proxima revisao.';
    db.prepare(`
      INSERT INTO metacog_alerts (summary_id, review_id, title, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, reviewId, 'Possivel ilusao de competencia', message, now.toISOString());
  }

  res.json({
    ok: true,
    nextReviewAt,
    currentStep: newStep,
    adaptiveDays,
    illusionDetected
  });
});

app.post('/api/summaries/:id/archive', (req, res) => {
  const id = Number(req.params.id);
  const item = db.prepare('SELECT * FROM summaries WHERE id = ?').get(id);

  if (!item) {
    return res.status(404).json({ error: 'Resumo nao encontrado.' });
  }

  if (item.status === 'archived') {
    return res.json({ ok: true });
  }

  const targetDir = path.join(VAULT_DIR, PARA_MAP.archives);
  const fileName = path.basename(item.file_path);
  const target = path.join(targetDir, fileName);

  if (fs.existsSync(item.file_path) && item.file_path !== target) {
    fs.renameSync(item.file_path, target);
  }

  db.prepare(`
    UPDATE summaries
    SET status = 'archived', para_category = 'archives', file_path = ?
    WHERE id = ?
  `).run(target, id);

  res.json({ ok: true });
});

app.delete('/api/summaries/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const summary = db.prepare('SELECT * FROM summaries WHERE id = ?').get(id);
    if (!summary) {
      return res.status(404).json({ error: 'Resumo nao encontrado.' });
    }

    const removeFile = String(req.query.removeFile || '').toLowerCase() === 'true';

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM flashcards WHERE summary_id = ?').run(id);
      db.prepare('DELETE FROM metacog_alerts WHERE summary_id = ?').run(id);
      db.prepare('DELETE FROM reviews WHERE summary_id = ?').run(id);
      db.prepare('DELETE FROM summaries WHERE id = ?').run(id);
    });
    tx();

    if (removeFile && summary.file_path && fs.existsSync(summary.file_path)) {
      fs.unlinkSync(summary.file_path);
    }

    res.json({ ok: true, removedFile: removeFile });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Falha ao excluir resumo.' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`SuperMemo PARA app rodando em http://${HOST}:${PORT}`);
});

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }

  for (const folder of Object.values(PARA_MAP)) {
    const folderPath = path.join(VAULT_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }
}

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      para_category TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      release_at TEXT,
      current_step INTEGER NOT NULL DEFAULT 0,
      next_review_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      last_grade TEXT,
      loci_palace TEXT,
      loci_room TEXT,
      loci_hook TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary_id INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      grade TEXT NOT NULL,
      resulting_step INTEGER NOT NULL,
      next_review_at TEXT NOT NULL,
      confidence INTEGER,
      recall_note TEXT,
      recall_seconds INTEGER,
      adaptive_days INTEGER,
      is_illusion INTEGER DEFAULT 0,
      FOREIGN KEY(summary_id) REFERENCES summaries(id)
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary_id INTEGER NOT NULL,
      prompt TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(summary_id) REFERENCES summaries(id)
    );

    CREATE TABLE IF NOT EXISTS metacog_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary_id INTEGER NOT NULL,
      review_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );
  `);

  ensureColumn('reviews', 'confidence', 'INTEGER');
  ensureColumn('reviews', 'recall_note', 'TEXT');
  ensureColumn('reviews', 'recall_seconds', 'INTEGER');
  ensureColumn('reviews', 'adaptive_days', 'INTEGER');
  ensureColumn('reviews', 'is_illusion', 'INTEGER DEFAULT 0');
  ensureColumn('summaries', 'loci_palace', 'TEXT');
  ensureColumn('summaries', 'loci_room', 'TEXT');
  ensureColumn('summaries', 'loci_hook', 'TEXT');
  ensureColumn('summaries', 'release_at', 'TEXT');
}

function normalizePara(value) {
  const normalized = String(value).trim().toLowerCase();
  return PARA_MAP[normalized] ? normalized : 'resources';
}

function sanitizeFileName(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'resumo';
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDayISO(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function buildSummaryTemplate(title, body) {
  return `# ${title}\n\n## Contexto\n${body}\n\n## 5 bullets-chave\n- \n- \n- \n- \n- \n\n## Exemplo pratico\n- \n\n## 3 perguntas de recall\n1. \n2. \n3. \n\n## Proxima acao\n- `;
}

function parseFlashcards(raw) {
  const source = Array.isArray(raw) ? raw.join('\n') : String(raw || '');
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const cards = [];

  for (const line of lines) {
    const parsed = splitFlashcardLine(line);
    if (!parsed) continue;
    const { prompt, answer } = parsed;
    if (!prompt || !answer) {
      continue;
    }
    cards.push({
      prompt: prompt.slice(0, 500),
      answer: answer.slice(0, 1000)
    });
  }

  return cards.slice(0, 50);
}

function splitFlashcardLine(line) {
  const separators = ['::', '=>', '->', ':'];
  for (const sep of separators) {
    const idx = line.indexOf(sep);
    if (idx <= 0) continue;
    const prompt = line.slice(0, idx).trim();
    const answer = line.slice(idx + sep.length).trim();
    if (!prompt || !answer) continue;
    return { prompt, answer };
  }
  return null;
}

function resolveParaTargetFolder(category, folderName) {
  const para = normalizePara(category);
  const baseDir = path.join(VAULT_DIR, PARA_MAP[para]);
  const safeSubFolder = sanitizeFolderPath(folderName);
  const target = safeSubFolder ? path.join(baseDir, safeSubFolder) : baseDir;

  if (!isInsideBase(baseDir, target)) {
    throw new Error('Subpasta invalida.');
  }

  fs.mkdirSync(target, { recursive: true });
  return { para, target, safeSubFolder };
}

function sanitizeFolderPath(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const parts = raw
    .split(/[\\/]+/)
    .map((part) => sanitizeFileName(part))
    .filter(Boolean);

  return parts.join(path.sep);
}

function createUniqueFileName(folderPath, requestedName) {
  const parsed = path.parse(requestedName);
  const baseName = sanitizeFileName(parsed.name || 'resumo');
  const ext = sanitizeExtension(parsed.ext);
  let candidate = `${baseName}${ext}`;
  let count = 1;

  while (fs.existsSync(path.join(folderPath, candidate))) {
    candidate = `${baseName}_${count}${ext}`;
    count += 1;
  }

  return candidate;
}

function sanitizeExtension(ext) {
  const cleaned = String(ext || '').replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
  if (!cleaned.startsWith('.')) {
    return cleaned ? `.${cleaned}` : '';
  }
  return cleaned;
}

function resolveInsideBase(baseDir, relativePath) {
  const sanitizedRelative = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const target = path.resolve(baseDir, sanitizedRelative);
  if (!isInsideBase(baseDir, target)) {
    throw new Error('Caminho invalido.');
  }
  return target;
}

function isInsideBase(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(`${resolvedBase}${path.sep}`);
}

function toUnixPath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function parseDateOnly(value) {
  const clean = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return null;
  }
  const d = new Date(`${clean}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function listFoldersRecursive(baseDir, maxDepth) {
  const results = [];

  function walk(currentDir, depth) {
    if (depth > maxDepth) {
      return;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = toUnixPath(path.relative(baseDir, absolutePath));
      results.push({
        name: entry.name,
        relativePath
      });

      walk(absolutePath, depth + 1);
    }
  }

  walk(baseDir, 1);
  results.sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'pt-BR'));
  return results;
}

function isIllusionOfCompetence(grade, confidence) {
  return Number.isFinite(confidence) && confidence >= 75 && grade !== 'good';
}

function calculateAdaptiveSchedule(item, grade, confidence, now) {
  const metrics = getSummaryMemoryMetrics(item.id);
  let newStep = item.current_step;
  let intervalDays = REVIEW_INTERVALS[Math.max(0, Math.min(item.current_step, REVIEW_INTERVALS.length - 1))];

  if (grade === 'good') {
    newStep = Math.min(item.current_step + 1, REVIEW_INTERVALS.length - 1);
    const base = REVIEW_INTERVALS[newStep];
    const performanceFactor = clamp(0.75 + (metrics.avgScore * 0.7), 0.75, 1.45);
    const calibrationPenalty = metrics.overconfidenceRate > 0.34 ? 0.12 : 0;
    const confidenceBoost = (Number.isFinite(confidence) && confidence >= 80 && metrics.overconfidenceRate < 0.25) ? 0.08 : 0;
    intervalDays = Math.round(clamp(base * (performanceFactor - calibrationPenalty + confidenceBoost), 2, 180));
  } else if (grade === 'partial') {
    newStep = Math.max(item.current_step - 1, 0);
    const base = REVIEW_INTERVALS[newStep];
    intervalDays = Math.round(clamp(base * 0.45, 1, 45));
    if (Number.isFinite(confidence) && confidence >= 75) {
      intervalDays = Math.max(1, intervalDays - 1);
    }
  } else {
    newStep = 0;
    intervalDays = (Number.isFinite(confidence) && confidence >= 80) ? 1 : 3;
  }

  return {
    newStep,
    intervalDays,
    nextDate: addDays(now, intervalDays)
  };
}

function getSummaryMemoryMetrics(summaryId) {
  const rows = db.prepare(`
    SELECT grade, confidence
    FROM reviews
    WHERE summary_id = ?
    ORDER BY reviewed_at DESC
    LIMIT 12
  `).all(summaryId);

  if (!rows.length) {
    return { avgScore: 0.65, overconfidenceRate: 0 };
  }

  let scoreSum = 0;
  let overconfidenceCount = 0;

  for (const row of rows) {
    scoreSum += gradeToScore(row.grade);
    if (Number.isFinite(row.confidence) && Number(row.confidence) >= 75 && row.grade !== 'good') {
      overconfidenceCount += 1;
    }
  }

  return {
    avgScore: scoreSum / rows.length,
    overconfidenceRate: overconfidenceCount / rows.length
  };
}

function gradeToScore(grade) {
  if (grade === 'good') return 1;
  if (grade === 'partial') return 0.55;
  return 0;
}

function computeWeeklyGoal(referenceDate) {
  const now = new Date(referenceDate);
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const next7 = addDays(now, 7).toISOString();
  const todayStart = startOfDayISO(now);

  const active = db.prepare(`SELECT COUNT(*) AS total FROM summaries WHERE status='active'`).get().total;
  const dueToday = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status='active' AND next_review_at <= ?
  `).get(todayStart).total;
  const dueNext7 = db.prepare(`
    SELECT COUNT(*) AS total
    FROM summaries
    WHERE status='active' AND next_review_at <= ?
  `).get(next7).total;

  const reviewedThisWeek = db.prepare(`
    SELECT COUNT(*) AS total
    FROM reviews
    WHERE reviewed_at >= ? AND reviewed_at < ?
  `).get(weekStart.toISOString(), weekEnd.toISOString()).total;

  const recentRows = db.prepare(`
    SELECT grade, recall_seconds AS recallSeconds
    FROM reviews
    WHERE reviewed_at >= ?
  `).all(addDays(now, -30).toISOString());

  const totalRecent = recentRows.length;
  const errorCount = recentRows.filter((row) => row.grade !== 'good').length;
  const errorRate = totalRecent > 0 ? errorCount / totalRecent : 0.25;

  const recallValues = recentRows.map((row) => Number(row.recallSeconds)).filter((v) => Number.isFinite(v) && v > 0);
  const avgRecallSeconds = recallValues.length
    ? recallValues.reduce((acc, v) => acc + v, 0) / recallValues.length
    : 45;

  const rawGoal = Math.round((dueNext7 * (1 + errorRate * 0.35)) + (active * 0.15) + (dueToday * 0.4));
  const targetReviews = Math.round(clamp(rawGoal, 12, 320));
  const dailyTarget = Math.max(1, Math.ceil(targetReviews / 7));
  const weekProgress = Math.min(1, reviewedThisWeek / targetReviews);
  const weekdayIndex = ((now.getDay() + 6) % 7) + 1;
  const expectedByToday = Math.ceil((targetReviews / 7) * weekdayIndex);
  const onTrack = reviewedThisWeek >= expectedByToday;

  return {
    targetReviews,
    reviewedThisWeek,
    dailyTarget,
    weekProgress,
    onTrack,
    cognitiveLoad: classifyCognitiveLoad(avgRecallSeconds, errorRate),
    avgRecallSeconds: Math.round(avgRecallSeconds),
    errorRate: Number(errorRate.toFixed(2))
  };
}

function classifyCognitiveLoad(avgRecallSeconds, errorRate) {
  if (avgRecallSeconds >= 80 || errorRate >= 0.45) return 'alta';
  if (avgRecallSeconds >= 50 || errorRate >= 0.25) return 'media';
  return 'baixa';
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function ensureColumn(tableName, columnName, columnType) {
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = cols.some((col) => col.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
  }
}

function buildLogicalExport() {
  return {
    exportedAt: new Date().toISOString(),
    summaries: db.prepare('SELECT * FROM summaries ORDER BY id ASC').all(),
    reviews: db.prepare('SELECT * FROM reviews ORDER BY id ASC').all(),
    flashcards: db.prepare('SELECT * FROM flashcards ORDER BY id ASC').all(),
    metacogAlerts: db.prepare('SELECT * FROM metacog_alerts ORDER BY id ASC').all()
  };
}

function restoreLogicalExport(payload) {
  const summaries = Array.isArray(payload?.summaries) ? payload.summaries : [];
  const reviews = Array.isArray(payload?.reviews) ? payload.reviews : [];
  const flashcards = Array.isArray(payload?.flashcards) ? payload.flashcards : [];
  const metacogAlerts = Array.isArray(payload?.metacogAlerts) ? payload.metacogAlerts : [];

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM metacog_alerts').run();
    db.prepare('DELETE FROM flashcards').run();
    db.prepare('DELETE FROM reviews').run();
    db.prepare('DELETE FROM summaries').run();

    const insertSummary = db.prepare(`
      INSERT INTO summaries (
        id, title, para_category, file_path, created_at, release_at, current_step,
        next_review_at, status, last_grade, loci_palace, loci_room, loci_hook
      ) VALUES (
        @id, @title, @para_category, @file_path, @created_at, @release_at, @current_step,
        @next_review_at, @status, @last_grade, @loci_palace, @loci_room, @loci_hook
      )
    `);
    for (const row of summaries) {
      insertSummary.run(row);
    }

    const insertReview = db.prepare(`
      INSERT INTO reviews (
        id, summary_id, reviewed_at, grade, resulting_step, next_review_at,
        confidence, recall_note, recall_seconds, adaptive_days, is_illusion
      ) VALUES (
        @id, @summary_id, @reviewed_at, @grade, @resulting_step, @next_review_at,
        @confidence, @recall_note, @recall_seconds, @adaptive_days, @is_illusion
      )
    `);
    for (const row of reviews) {
      insertReview.run(row);
    }

    const insertFlashcard = db.prepare(`
      INSERT INTO flashcards (id, summary_id, prompt, answer, created_at)
      VALUES (@id, @summary_id, @prompt, @answer, @created_at)
    `);
    for (const row of flashcards) {
      insertFlashcard.run(row);
    }

    const insertAlert = db.prepare(`
      INSERT INTO metacog_alerts (id, summary_id, review_id, title, message, created_at, resolved_at)
      VALUES (@id, @summary_id, @review_id, @title, @message, @created_at, @resolved_at)
    `);
    for (const row of metacogAlerts) {
      insertAlert.run(row);
    }
  });

  tx();
}
