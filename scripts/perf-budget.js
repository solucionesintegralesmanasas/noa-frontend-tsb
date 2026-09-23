// scripts/perf-budget.js — Presupuesto de peso y HTML.
// - Informa: npm run test:perf (siempre exit 0; requiere build previo).
// - Valida: node scripts/perf-budget.js --strict (exit 1 si hay incumplimientos).
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const OUT_DIR = join(ROOT, 'docs', 'metrics');
const DIST = join(ROOT, 'dist', 'assets');

// Umbrales de aviso (kB). Solo informan, no fallan.
const BUDGETS = { totalJS: 1800, inicialJS: 1150, totalCSS: 1200, vendorPrimevue: 900, vendorUI: 200, indexJS: 150 };
// Presupuesto por chunk de ruta (vista): solo informa.
const BUDGET_RUTA_KB = 150;

// Carga inicial = entry + modulepreload declarados en dist/index.html.
// Todo lo demás en dist/assets es diferido (lazy routes, chunks bajo demanda).
let inicialSet = new Set();
const distHtml = join(ROOT, 'dist', 'index.html');
if (existsSync(distHtml)) {
  const built = readFileSync(distHtml, 'utf8');
  for (const m of built.matchAll(/(?:modulepreload[^>]*href|script[^>]*src)="([^"]+)"/g)) {
    const f = m[1].split('/').pop();
    if (f) inicialSet.add(f);
  }
}

const chunks = [];
let totalJS = 0;
let inicialJS = 0;
let diferidoJS = 0;
let totalCSS = 0;
let distOk = true;
if (existsSync(DIST)) {
  for (const f of readdirSync(DIST)) {
    const st = statSync(join(DIST, f));
    const kb = Math.round((st.size / 1024) * 10) / 10;
    if (f.endsWith('.js')) {
      totalJS += kb;
      const esInicial = inicialSet.has(f);
      if (esInicial) inicialJS += kb; else diferidoJS += kb;
      chunks.push({ archivo: f, kb, tipo: esInicial ? 'js-inicial' : 'js-diferido' });
    }
    else if (f.endsWith('.css')) { totalCSS += kb; chunks.push({ archivo: f, kb, tipo: 'css' }); }
  }
  chunks.sort((a, b) => b.kb - a.kb);
} else {
  distOk = false;
}

const pick = (frag) => chunks.find((c) => c.archivo.includes(frag))?.kb ?? null;
const metrics = {
  totalJS: Math.round(totalJS * 10) / 10,
  inicialJS: Math.round(inicialJS * 10) / 10,
  diferidoJS: Math.round(diferidoJS * 10) / 10,
  totalCSS: Math.round(totalCSS * 10) / 10,
  vendorPrimevue: pick('vendor-primevue'),
  vendorUI: pick('vendor-ui'),
  vendorFeedback: pick('vendor-feedback'),
  vendorHttp: pick('vendor-http'),
  vendorVue: pick('vendor-vue'),
  indexJS: pick('/index-') ?? chunks.find((c) => c.tipo.startsWith('js') && c.archivo.startsWith('index-'))?.kb ?? null,
  numChunksJS: chunks.filter((c) => c.tipo.startsWith('js')).length,
  numChunksInicial: chunks.filter((c) => c.tipo === 'js-inicial').length,
  numChunksDiferidos: chunks.filter((c) => c.tipo === 'js-diferido').length,
  numChunksCSS: chunks.filter((c) => c.tipo === 'css').length,
};

// Presupuesto por ruta: chunks de vistas (carga diferida típica) con su peso.
// Sirve para detectar qué ruta pesa más antes de optimizarla.
const rutas = chunks
  .filter((c) => c.tipo.startsWith('js') && /view|page/i.test(c.archivo))
  .sort((a, b) => b.kb - a.kb)
  .slice(0, 15)
  .map((c) => ({ archivo: c.archivo, kb: c.kb, inicial: c.tipo === 'js-inicial' }));

// index.html: scripts sin defer, hojas de fonts, CSS muerto
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const classicScripts = [...html.matchAll(/<script\s+src="([^"]+)"([^>]*)>/g)];
const sinDefer = classicScripts.filter((m) => !/defer|async/.test(m[2])).map((m) => m[1]);
const fontSheets = (html.match(/fonts\.googleapis\.com\/css2/g) || []).length;
const deadCss = (html.match(/jquery\.toast/i) || []).length;

const checks = { scriptsSinDefer: sinDefer, hojasGoogleFonts: fontSheets, cssMuertoJqueryToast: deadCss };

const stamp = new Date().toISOString().slice(0, 10);
const report = { fecha: stamp, dist: distOk, metricas: metrics, rutas, html: checks, topChunks: chunks.slice(0, 10) };
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, `perf-${stamp}.json`), JSON.stringify(report, null, 2));

// Uso: npm run test:perf (informa, exit 0) o node scripts/perf-budget.js --strict
// (valida: exit 1 si algún presupuesto se excede; para CI).
const STRICT = process.argv.includes('--strict');
const incumplimientos = [];
const exigir = (condicion, detalle) => { if (!condicion) incumplimientos.push(detalle); };

console.log('\n Presupuesto de rendimiento');
if (!distOk) console.log(' (sin dist/: ejecuta npm run build primero)');
for (const [k, v] of Object.entries(metrics)) {
  if (v === null || v === undefined) continue;
  if (k.startsWith('num')) {
    console.log(` ${k.padEnd(16)} ${String(v).padStart(8)}     (conteo)`);
    continue;
  }
  const b = BUDGETS[k];
  const excede = b !== undefined && v > b;
  if (b !== undefined) exigir(!excede, `${k}: ${v} kB > presupuesto ${b} kB`);
  const flag = b !== undefined ? (excede ? '⚠️ sobre presupuesto' : '✅') : '';
  console.log(` ${k.padEnd(16)} ${String(v).padStart(8)} kB  ${flag}`);
}
console.log(` hojasGoogleFonts: ${fontSheets} (objetivo ≤1)  ${fontSheets <= 1 ? '✅' : '⚠️'}`);
exigir(fontSheets <= 1, `hojasGoogleFonts: ${fontSheets} > 1`);
console.log(` scriptsSinDefer: ${sinDefer.length}  ${sinDefer.length === 0 ? '✅' : '⚠️ ' + sinDefer.join(', ')}`);
exigir(sinDefer.length === 0, `scriptsSinDefer: ${sinDefer.join(', ')}`);
console.log(` cssMuertoJqueryToast: ${deadCss}  ${deadCss === 0 ? '✅' : '⚠️'}`);
exigir(deadCss === 0, 'cssMuertoJqueryToast presente');
console.log(`\n Rutas más pesadas (presupuesto ${BUDGET_RUTA_KB} kB por vista):`);
for (const r of rutas) {
  const excede = r.kb > BUDGET_RUTA_KB;
  exigir(!excede, `ruta ${r.archivo}: ${r.kb} kB > presupuesto ${BUDGET_RUTA_KB} kB`);
  const flag = excede ? '⚠️ sobre presupuesto' : '✅';
  const tag = r.inicial ? '(inicial)' : '(diferido)';
  console.log(` ${r.archivo.padEnd(48)} ${String(r.kb).padStart(8)} kB  ${tag} ${flag}`);
}
console.log(`\n Reporte: docs/metrics/perf-${stamp}.json`);
if (STRICT && incumplimientos.length) {
  console.log(`\n⛔ --strict: ${incumplimientos.length} incumplimiento(s):`);
  for (const d of incumplimientos) console.log(`  - ${d}`);
  process.exit(1);
}
process.exit(0);
