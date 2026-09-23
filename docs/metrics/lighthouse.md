# Lighthouse manual — NOA Transportes

Medición oficial de rendimiento frontend. Es la única herramienta de medición
vigente tras retirar la Fase 0 (2026-09-22): complementa `test:perf` (pesos del
bundle) y `test:a11y` (antipatrones estáticos) con medición real en navegador.

## Reglas (obligatorias para que las cifras sean comparables)

1. Medir siempre contra **producción**:
   `https://apptransportessinbarreras.transportessinbarreras.com`.
   Nunca contra `localhost:5173` (modo dev, sin minificar).
2. Chrome **incógnito, sin extensiones**. No interactuar con la página
   durante la corrida; esperar a que termine el informe.
3. DevTools → pestaña **Lighthouse** → categorías **Performance + Accessibility**.
4. Modo **Navigation**, dispositivo **Desktop**.
5. **3 corridas por página** y anotar la **mediana** (Lighthouse varía ±5 puntos).
6. Páginas autenticadas: iniciar sesión primero en la misma ventana incógnita
   y luego navegar a cada URL. No cerrar la ventana entre corridas.
7. Anotar fecha, hora y si era hora pico (las páginas con datos dependen
   de la API real y su latencia afecta al LCP).

## Páginas de la baseline

El router usa hash (`createWebHashHistory`): las URLs llevan `#/`.

| # | Página | URL producción | Por qué se mide |
|---|---|---|---|
| 1 | Login | `/#/` (vista inicial = login) o `/#/login` | Entrada pública, sin llamadas a la API |
| 2 | Dashboard | `/#/dashboard` | La más pesada: gráficos + varias llamadas API |
| 3 | Mapa en vivo | `/#/rastreo/mapa-en-vivo` | Leaflet por CDN + refresco de ubicaciones |
| 4 | Historial conductor | `/#/rastreo/historial/:uuid` (abrir uno real desde Rastreo y copiar la URL) | `DriverHistoryView.vue` carga `html2canvas` (194,9 kB en el bundle inicial) |
| 5 | Geocercas | `/#/rastreo/geocercas` | Listado con mapa |

## Umbrales objetivo (post-optimización)

| Métrica | Objetivo desktop |
|---|---|
| Performance | ≥ 85 |
| Accessibility | 100 |
| LCP | ≤ 2,5 s |
| TBT | ≤ 300 ms |
| CLS | ≤ 0,1 |

La baseline solo registra el punto de partida; no tiene que cumplirlos.

## Resultados

### Históricos (modo dev contra localhost — no comparables con producción)

| Fecha | Fase | Página | Performance | Accessibility | Notas |
|---|---|---|---|---|---|
| 2026-09-15 | base (fases 1-3) | login | 57 | 100 | navigation desktop, incógnito |
| 2026-09-15 | base (fases 1-3) | dashboard | 55 | 94 | navigation desktop, incógnito; a11y pendiente: button-name, contraste |
| 2026-09-16 | lote L dashboard | dashboard | 55 | 100 | navigation desktop; heading-order, button-name y contraste corregidos |

### Baseline producción (2026-09-23, 09:47–10:07 hora local UTC-5)

Medianas de 3 corridas por página, navigation desktop, incógnito, Lighthouse 13.4.1.
Reportes fuente: carpeta `Lighthouse_23_09_2026` (15 JSON).

| Fecha/hora | Página | Perf (mediana 3x) | A11y | LCP | TBT | CLS | Hora pico | Notas |
|---|---|---|---|---|---|---|---|---|
| 2026-09-23 09:47 | Login | 81 | 96 | 2,2 s | 0 ms | 0,000 | mañana local | Sin autenticar |
| 2026-09-23 09:50 | Dashboard | 67 | 100 | 3,7 s | 0 ms | 0,016 | mañana local | Autenticado |
| 2026-09-23 09:55 | Mapa en vivo | 65 | 100 | 3,8 s | 0 ms | 0,001 | mañana local | Autenticado |
| 2026-09-23 10:00 | Historial conductor | 62 | 91 | 3,9 s | 0 ms | 0,002 | mañana local | URL: `/#/rastreo/historial/29548f69-5078-440a-a7e3-b9072be80f98` |
| 2026-09-23 10:04 | Geocercas | 69 | 96 | 2,8 s | 0 ms | 0,018 | mañana local | Autenticado |

Ninguna página cumple aún el objetivo (Perf ≥ 85); accesibilidad al 100 solo en
dashboard y mapa en vivo.

### Diagnóstico de la baseline (corrida mediana por página)

| Página | Peso total | Peticiones | JS sin usar | Respuesta servidor | Lectura |
|---|---|---|---|---|---|
| Login | 792 kB | 50 | ~150 ms | ~300 ms | La más liviana; base de comparación |
| Dashboard | 1519 kB | 99 | ~20 ms | ~250 ms | LCP 3,7 s con TBT 0: el costo es red/datos, no bloqueo JS |
| Mapa en vivo | 1839 kB | 104 | ~120 ms | ~435 ms | La más pesada en bytes (tiles + vendor) |
| Historial | 1682 kB | 111 | ~300 ms | ~680 ms | Peor Perf (62) y más peticiones; coherente con `html2canvas` en el bundle inicial (ARQ-014) |
| Geocercas | 980 kB | 64 | ~80 ms | ~2310 ms | Respuesta del servidor > 2 s: revisar ese endpoint en backend |

TBT = 0 ms en las 5 páginas: el hilo principal no se bloquea; el problema es
volumen de bytes + latencia de red/API, no JS pesado en ejecución.

## Reportes automáticos

- `a11y-YYYY-MM-DD.json`: conteo de antipatrones (`npm run test:a11y`).
- `perf-YYYY-MM-DD.json`: pesos de `dist/` + chequeos de `index.html` (`npm run test:perf`).
