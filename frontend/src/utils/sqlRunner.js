// In-browser SQLite query runner backed by sql.js (loaded from CDN).
// Zero npm install — pulls sql-wasm.js and the accompanying .wasm on first use.

const SQLJS_VERSION = '1.10.3';
const CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQLJS_VERSION}`;

let sqlPromise = null;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

export const getSql = () => {
  if (sqlPromise) return sqlPromise;
  sqlPromise = (async () => {
    await loadScript(`${CDN_BASE}/sql-wasm.js`);
    // window.initSqlJs is exposed by the loaded script
    const SQL = await window.initSqlJs({ locateFile: (file) => `${CDN_BASE}/${file}` });
    return SQL;
  })();
  return sqlPromise;
};

// Run `query` against a fresh DB seeded by `setupSql`.
// Returns { results: [{columns, values}], lastResult: {columns, values} | null, error: null }
// Or { error: 'message' } on failure.
export const runQuery = async (setupSql, query) => {
  try {
    const SQL = await getSql();
    const db = new SQL.Database();
    try {
      db.exec(setupSql);
      const results = db.exec(query);
      const lastResult = results.length ? results[results.length - 1] : null;
      return { results, lastResult, error: null };
    } finally {
      db.close();
    }
  } catch (e) {
    return { error: e.message || String(e) };
  }
};

// Compare two result objects {columns, values}. Returns { equal: bool, reason: string }.
// If orderMatters is false, rows are compared as multisets (sorted via stable JSON key).
export const compareResults = (studentResult, expectedResult, orderMatters = false) => {
  if (!expectedResult) {
    return { equal: false, reason: 'Expected a result set but the solution produced none.' };
  }
  if (!studentResult) {
    return { equal: false, reason: 'Your query returned no result set. Did you forget a SELECT?' };
  }

  // Column comparison — order-sensitive (SQL projects columns in declared order)
  if (studentResult.columns.length !== expectedResult.columns.length) {
    return {
      equal: false,
      reason: `Column count mismatch — expected ${expectedResult.columns.length}, got ${studentResult.columns.length}.`
    };
  }

  // Row comparison
  const sVals = studentResult.values.map((r) => r.map(normalizeCell));
  const eVals = expectedResult.values.map((r) => r.map(normalizeCell));

  if (sVals.length !== eVals.length) {
    return {
      equal: false,
      reason: `Row count mismatch — expected ${eVals.length}, got ${sVals.length}.`
    };
  }

  if (orderMatters) {
    for (let i = 0; i < sVals.length; i++) {
      if (!rowsEqual(sVals[i], eVals[i])) {
        return { equal: false, reason: `Row ${i + 1} differs. The problem requires a specific order.` };
      }
    }
  } else {
    const sKeys = sVals.map(JSON.stringify).sort();
    const eKeys = eVals.map(JSON.stringify).sort();
    for (let i = 0; i < sKeys.length; i++) {
      if (sKeys[i] !== eKeys[i]) {
        return { equal: false, reason: 'Rows do not match the expected set.' };
      }
    }
  }

  return { equal: true, reason: '' };
};

const normalizeCell = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  return String(v);
};

const rowsEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};
