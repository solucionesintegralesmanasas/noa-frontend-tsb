# Lighthouse manual — NOA Transportes

Checklist para medir antes/después en Chrome (modo incógnito, sin extensiones).

## Pasos

1. `npm run dev` (frontend en `http://localhost:5173`, backend arriba).
2. DevTools → pestaña **Lighthouse** → categorías Performance + Accessibility.
3. Dispositivo **Desktop**. 1 corrida por página.
4. Páginas: `/` (login) y `/dashboard` (autenticado).
5. Anotar abajo y comparar entre fases.

## Resultados

| Fecha | Fase | Página | Performance | Accessibility | LCP | TBT | Notas |
|---|---|---|---|---|---|---|---|
| 2026-09-15 | base (fases 1+2) | login | | | | | |
| 2026-09-15 | base (fases 1+2) | dashboard | | | | | |

## Reportes automáticos

- `a11y-YYYY-MM-DD.json`: conteo de antipatrones (`npm run test:a11y`).
- `perf-YYYY-MM-DD.json`: pesos de `dist/` + chequeos de `index.html` (`npm run test:perf`).
