const fs = require('node:fs/promises');
const path = require('node:path');
const initSqlJs = require('sql.js');

function validateSnapshot(state) {
  if (!state || state.version !== 1 || !Array.isArray(state.words) || !Array.isArray(state.attempts) || !Array.isArray(state.mistakes) || !state.schedules || !state.settings) throw new Error('Неподдерживаемый формат данных.');
  const text = value => typeof value === 'string';
  const validDate = value => text(value) && Number.isFinite(Date.parse(value));
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const settings = state.settings;
  const invalid = () => { throw new Error('Данные повреждены. Существующая база данных не изменена.'); };
  if (!['light', 'dark'].includes(settings.theme) || typeof settings.strict !== 'boolean' || !levels.includes(settings.level) || !Number.isInteger(settings.sessionSize) || settings.sessionSize < 1 || settings.sessionSize > 100 || !Number.isInteger(settings.dailyGoal) || settings.dailyGoal < 1 || settings.dailyGoal > 1000) invalid();
  if (!state.schedules || Array.isArray(state.schedules) || typeof state.schedules !== 'object') invalid();
  const ids = new Set();
  for (const word of state.words) {
    if (!word || !['id', 'german', 'russian', 'example', 'exampleTranslation', 'topic', 'set'].every(key => text(word[key])) || !word.id || ids.has(word.id) || !word.german.trim() || !word.russian.trim() || !levels.includes(word.level) || (word.article !== undefined && !['der', 'die', 'das'].includes(word.article)) || (word.plural !== undefined && !text(word.plural)) || (word.custom !== undefined && typeof word.custom !== 'boolean')) invalid();
    ids.add(word.id);
  }
  ids.clear();
  for (const attempt of state.attempts) {
    if (!attempt || !['id', 'itemId', 'mode', 'topic', 'userAnswer', 'expected', 'explanation'].every(key => text(attempt[key])) || !attempt.id || ids.has(attempt.id) || !['word', 'grammar'].includes(attempt.kind) || typeof attempt.correct !== 'boolean' || !validDate(attempt.at) || (attempt.rating !== undefined && !['again', 'hard', 'good', 'easy'].includes(attempt.rating))) invalid();
    ids.add(attempt.id);
  }
  ids.clear();
  for (const mistake of state.mistakes) {
    if (!mistake || !['id', 'attemptId', 'itemId', 'topic', 'userAnswer', 'expected', 'explanation'].every(key => text(mistake[key])) || !mistake.id || ids.has(mistake.id) || !['word', 'grammar'].includes(mistake.kind) || typeof mistake.resolved !== 'boolean' || !validDate(mistake.at)) invalid();
    ids.add(mistake.id);
  }
  for (const [key, schedule] of Object.entries(state.schedules)) if (!schedule || schedule.itemId !== key || !Number.isInteger(schedule.repetitions) || schedule.repetitions < 0 || !Number.isFinite(schedule.interval) || schedule.interval < 0 || !Number.isFinite(schedule.ease) || schedule.ease < 1.3 || !validDate(schedule.due)) invalid();
  if (JSON.stringify(state).length > 20 * 1024 * 1024) throw new Error('Размер данных превышает допустимый предел.');
}

async function createDatabase(filename) {
  const SQL = await initSqlJs({ locateFile: file => path.join(path.dirname(require.resolve('sql.js')), file) });
  let database;
  try { database = new SQL.Database(await fs.readFile(filename)); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error(`Не удалось открыть базу данных: ${error.message}`); database = new SQL.Database(); }
  try { database.run('CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id=1), version INTEGER NOT NULL, payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, item_id TEXT NOT NULL, kind TEXT NOT NULL, correct INTEGER NOT NULL, at TEXT NOT NULL, payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS reviews (attempt_id TEXT PRIMARY KEY, item_id TEXT NOT NULL, rating TEXT NOT NULL, at TEXT NOT NULL, payload TEXT NOT NULL)'); }
  catch (error) { database.close(); throw new Error(`Не удалось открыть базу данных: ${error.message}`); }
  let queue = Promise.resolve();
  return {
    async load() {
      await queue;
      const result = database.exec('SELECT payload FROM app_state WHERE id=1');
      if (!result.length) return null;
      const state = JSON.parse(result[0].values[0][0]); validateSnapshot(state); return state;
    },
    save(state) {
      const job = queue.then(async () => {
        validateSnapshot(state);
        const candidate = new SQL.Database(database.export());
        const temporary = filename + '.tmp';
        try {
          candidate.run('BEGIN TRANSACTION');
          candidate.run('INSERT INTO app_state(id, version, payload) VALUES(1, 1, ?) ON CONFLICT(id) DO UPDATE SET version=excluded.version, payload=excluded.payload', [JSON.stringify(state)]);
          const attemptStatement = candidate.prepare('INSERT OR IGNORE INTO attempts(id,item_id,kind,correct,at,payload) VALUES(?,?,?,?,?,?)');
          const reviewStatement = candidate.prepare('INSERT OR IGNORE INTO reviews(attempt_id,item_id,rating,at,payload) VALUES(?,?,?,?,?)');
          try { for (const attempt of state.attempts) { attemptStatement.run([attempt.id, attempt.itemId, attempt.kind, Number(attempt.correct), attempt.at, JSON.stringify(attempt)]); if (attempt.rating) reviewStatement.run([attempt.id, attempt.itemId, attempt.rating, attempt.at, JSON.stringify(attempt)]); } }
          finally { attemptStatement.free(); reviewStatement.free(); }
          candidate.run('COMMIT');
          await fs.mkdir(path.dirname(filename), { recursive: true });
          const file = await fs.open(temporary, 'w');
          try { await file.writeFile(candidate.export()); await file.sync(); } finally { await file.close(); }
          await fs.rename(temporary, filename);
          database.close(); database = candidate;
        } catch (error) { candidate.close(); await fs.rm(temporary, { force: true }).catch(() => {}); throw new Error(`Не удалось сохранить данные: ${error.message}`); }
      });
      queue = job.catch(() => {}); return job;
    },
    async close() { await queue; database.close(); },
  };
}
module.exports = { createDatabase };
