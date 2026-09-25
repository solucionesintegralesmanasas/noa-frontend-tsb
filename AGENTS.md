# AGENTS.md — Noa App

## Solo Español
- **name**: solo-espanol
- **description**: IDIOMA: Activa SOLO cuando detectes que el usuario se comunica en español. TODAS las respuestas, explicaciones, análisis, sugerencias y comentarios en código deben estar estrictamente en ESPAÑOL. Prohíbe terminantemente el uso de inglés u otros idiomas en la comunicación humana.

## Stack

- **Core:** Vue 3 (`<script setup>` SFCs, version `^3.5.34`)
- **Build Tool:** Vite 8 (version `^8.0.12`)
- **State Management:** Pinia 3 (version `^3.0.4`)
- **Routing:** Vue Router 4 (version `^4.6.4`)
- **Internationalization (i18n):** vue-i18n 11 (version `^11.4.4`)
- **UI Library:** PrimeVue 4 (`^4.5.5`) + `@primeuix/themes` (`^2.0.3`) con preset Aura. Sin registro global desde 2026-09-23 (ARQ-013): cada vista importa localmente lo que usa.
- **HTTP Client:** Axios (version `^1.16.1`)
- **Alerts & Toasts:** SweetAlert2 (`^11.26.25`) con `import()` diferido vía `utils/toast.js` + Vue Toastification (`^2.0.0-rc.5`)
- **Iconografía:** FontAwesome Pro (CSS + webfonts). `primeicons` eliminado 2026-09-15.
- **Native Mobile:** Capacitor (`^7.0.0`) + Plugins (`@capacitor/preferences`, `CapacitorHttp`)
- **Mobile CI/CD (Appflow):** `@ionic/cli` (`^7.2.1`) para builds nativos en la nube de Ionic Appflow. Repo Appflow: `noa-os` (remote `noa-os`). Guía completa en `APPFLOW.md`.
- **Helpers:** DayJS (`^1.11.21`)
- **Testing/Formatting:** ESLint flat (`npm run lint`, en verde) + `vue-tsc` con `checkJs` (`npm run typecheck`; fase 2, baseline con errores pendientes de tipar). Scripts informativos `test:a11y` / `test:perf` (ver Comandos).

> **Eliminados 2026-09-15:** jQuery, Select2, `primeicons`, `signature_pad`. No reintroducir.

## Commands

| Command           | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Vite dev server                                     |
| `npm run build`   | Vite production build (outputs to `dist/`)          |
| `npm run preview` | Serve `dist/` localmente (usar para medir prod)     |
| `npm run test`    | `test:a11y` + `test:perf` + `lint` + `test:unit` — lint y unit bloquean, el resto informa |
| `npm run test:a11y` | Conteo de antipatrones a11y en `src/`             |
| `npm run test:perf` | Presupuesto de peso de `dist/` y chequeos HTML (`--strict` con `test:perf:strict` para validar) |
| `npm run test:unit` | Vitest (node): garantías del canal realtime (`src/hooks/__tests__/`) |
| `npm run lint`    | ESLint (flat config, 0 errores en línea base 2026-09-23) |
| `npm run typecheck` | `vue-tsc --noEmit` (fase 2: baseline ~1740 errores, no bloquea `test`) |
| `npm run cap:sync` | `npm run build && npx cap sync` (copia `dist/` a ios/)android/) |
| `npm run cap:assets` | Regenera iconos/splash nativos desde `assets/` (`@capacitor/assets`) |
| `npm run cap:add:android` / `cap:add:ios` | Agrega la plataforma nativa a Capacitor |
| `npm run cap:open:android` / `cap:open:ios` | Abre Android Studio / Xcode |
| `ionic build` / `ionic cap sync` | Builds vía Ionic CLI (mismas operaciones que `build`/`cap:sync`) |

CI (`.github/workflows/ci.yml`): `lint` + `test:a11y` + `build` + `test:unit` en push/PR a `feature`/`develop`/`main`.
CI/CD nativo (`.github/workflows/appflow.yml`): builds en Appflow — Android debug por push a `main`/`develop`; iOS+Android release por tag `v*`. Requiere secrets `APPFLOW_TOKEN`, `APPFLOW_APP_ID`, `APPFLOW_ANDROID_CERT`, `APPFLOW_IOS_CERT`.

> **Para Lighthouse:** medir contra `npm run preview` o el Apache de producción, **nunca** contra `localhost:5173` (dev sirve módulos sin minificar y distorsiona el puntaje).

## Entrypoints & Boot Order

- `index.html` → `src/main.js` (async bootstrap with error UI fallback)
- `main.js` calls `registerPlugins(app)` from `src/utils/plugins.js` — **plugin registration order is critical**:
  1. Pinia (state)
  2. PrimeVue (componentes globales; el CSS de SweetAlert2 se importa en `main.js`)
  3. Token Manager (loads auth token from encrypted storage)
  4. Store hydration (auth + permissions — router depends on them; timeout 1s)
  5. Router + i18n
  6. Global error handlers

## Path Aliases (vite.config.js)

`@` → `src/`, `@store`, `@router`, `@utils`, `@services`, `@components`, `@features`, `@pages`, `@assets`

## Auth & Security

- **Laravel Sanctum** PAT-based auth. Token stored encrypted (AES-GCM, WebCrypto API + PBKDF2) in `secureStorage` (`@capacitor/preferences`).
- Login flow: `authService.login()` → returns `{ user, token }` → stores in Pinia + Token Manager.
- 401 responses trigger `auth:unauthorized` custom event, token wipe, and redirect to `/login`.
- Encryption key comes from `VITE_ENCRYPTION_KEY` var.
- Logger masks sensitive fields (`token`, `password`, `secret`, `authorization`, `otp`).
- **Autenticación 2FA & Perfil**: El módulo de seguridad expone flujos interactivos para activar/desactivar 2FA mediante códigos TOTP QR dinámicos procedentes del backend laravel. El panel de configuración e historial de sesión reside unificado dentro de `UserProfileView.vue` bajo la ruta `/profile?tab=security`.
- **Resolución Reactiva de Iniciales**: El Navbar e interfaces resuelven dinámicamente las iniciales y roles del usuario cruzando reactivamente `userStore` y `permissionsStore` para evitar parpadeos o placeholders de carga genéricos.

## Router & Guards

- `src/router/index.js` with guards in sequential order: `authGuard → twoFAGuard → tenantGuard → permissionsGuard`. Utiliza `createWebHashHistory()` para garantizar la compatibilidad híbrida sin pantalla en blanco en Capacitor.
- Guards reales en `src/router/guards/*.js` (`auth.js`, `2fa.js`, `permissions.js`). `tenantGuard` es un pass-through pendiente de implementar.
- Route meta flags: `auth`, `public`, `requiresTenant`, `requires2FA`.
- Error routes: `/401`, `/403`, `/404`, `/500`. Catch-all redirects to `/404`.
- `permissionsStore.hasRole()` normaliza separadores: `super-admin` = `super_admin` = `SUPERADMIN`. Usar `hasRole('superadmin')` / `hasRole('administrador')`.

## Dynamic Layout Resolution

- **App.vue Layout Manager**: Layouts are resolved reactively inside `src/App.vue` based on the active route's `to.meta.layout` attribute.
- Routes matching `meta: { layout: 'dashboard' }` are automatically rendered wrapped within `src/components/DashboardLayout.vue`.
- Public/Authentication/Error routes with flat structures are rendered directly without extra boilerplate.

## API Layer

- Axios client in `src/services/api/client.js` — singleton with tenant-aware instances.
- Interceptors (`src/services/api/interceptors.js`) auto-inject Bearer token, log requests, handle 401.
- `BaseService` (`src/services/api/base.service.js`) wraps CRUD + RBAC permission checks.

## Multi-tenant

- `apiClient.forTenant(tenantId)` creates a dedicated Axios instance with `X-Tenant-ID` header.
- Tenant ID stored in `auth.currentTenant.id` Pinia state.

## i18n

- Locale files at `src/assets/locales/{es,en}.json` loaded via `import.meta.glob`.
- Default locale: `en`. Supported: `es`, `en`. Fallback chain: requested → `en` → error.

## Env

- `.env` (development), `.env.production` — both committed. Only `VITE_*` vars exposed.
- `VITE_API_BASE_URL`, `VITE_AUTH_TOKEN_KEY`, `VITE_ENCRYPTION_KEY`, `VITE_FEATURE_*` flags.

## Key Conventions & Architecture

- **Feature-Driven Design**: Modulares encapsulados en `src/features/{feature}/`. Cada _feature_ debe contener sus propias rutas (`routes.js`), vistas (`views/`), stores (`store/`) y servicios (`services/`). El router principal importa las rutas modulares de cada _feature_.
- **Separación de Lógica y UI (Hooks)**: La lógica compleja, manejo de estado local y llamadas recurrentes se extraen a `src/hooks/` (ej: `useTable.js`, `useFormManager.js`, `useSidebar.js`). Los archivos `.vue` deben mantenerse lo más "limpios" posibles, dedicados primariamente al HTML/UI.
- **Layouts Centralizados**: Los componentes de estructura principal (Navbar, Sidebar, Footer) deben residir estrictamente en `src/components/layout/` y conectarse a la lógica a través de hooks.
- **Store & Plugins (Encrypted Persistence)**:
  - Módulos globales de estado en `src/store/modules/`.
  - Los plugins de persistencia en `src/store/plugins/persistence.js` sincronizan reactivamente el estado de los stores (`auth`, `permissions`, `ui`, `user`) de forma encriptada (AES-GCM) utilizando `secureStorage` respaldado nativamente por `@capacitor/preferences`.
  - El estado `isHydrated` se resuelve asíncronamente en pocos milisegundos tras leer la base de almacenamiento seguro, eliminando bloqueos de 2 segundos durante el bootstrap de la app.
- **APIs & Seguridad**: Servicios API en `src/services/api/`, servicios de seguridad en `src/services/security/`.
- **Manejo de Errores**: Manejo a través de `handleGlobalError()` que despacha eventos personalizados `app:toast`.
- **Monitoreo**: El monitoreo de conectividad se suscribe a los eventos `online`/`offline` nativos y al endpoint `/health`.
- **Media Utility**: `src/utils/media.js` provee la función robusta `getMediaUrl(path, fallback)` para reconstruir de forma absoluta y limpia las rutas de imágenes y archivos cargados en el storage del Backend.
- **Notifications System**: `src/features/notifications/store/notifications.store.js` provee un estado centralizado para alertas tempranas de documentos vehiculares vencidos (SOAT, Tecnicomecánica, Licencias) manteniendo la UI reactiva y dinámica.
- **Importación Obligatoria de Componentes Comunes**: Los componentes compartidos como `BaseFormActions` y `BasePageHeader` no están registrados globalmente. Cada vista que los use debe importarlos explícitamente en `<script setup>` (ej. `import BaseFormActions from '@/components/BaseFormActions.vue';`).

## Accesibilidad y Formularios (obligatorio)

Reglas cerradas en las fases 1-3 (2026-09-15). Verificables con `npm run test:a11y` (objetivo: no aumentar los conteos).

- **Formularios nuevos:** usar `useAccessibleForm.js` (o `useFormManager.js`, su envoltura compatible).
- **Asociación label/control:** `label for` ↔ `id` del control. En `PrimeSelect` usar `:input-id` con el mismo valor del `for`.
- **ARIA por campo:** `:aria-invalid="!!validationErrors['<campo>']"` y `:aria-describedby` condicional al `id` de error.
- **IDs:** control `f-<campo>` (puntos → guiones); error `f-<campo>-error` con `role="alert"`.
- **Foco al primer error:** `.focus()` real (no solo `scrollIntoView`). Selector: `'[aria-invalid="true"], .is-invalid'`.
- **Aislados:** `type="hidden"` no lleva etiqueta ni `id`. `readonly`/`disabled` de cálculo llevan `aria-readonly`/`aria-hidden` según corresponda.
- **Validación:** vacíos con `isEmpty` (equivalente a `!v` + `trim()` para strings); nunca `!value` directo en strings.
- **Iconos decorativos:** `aria-hidden="true"`. Botones icon-only: `aria-label` en español.
- **Prohibido:** `role="button"` en `router-link`, `<a>` sin `href`, `href="#"`, `javascript:void(0)`, `aria-label` en inglés, `console.*` directo (usar `logger`), imports directos de `sweetalert2` (usar `utils/toast.js`).

## Estado del Proyecto y Medición (2026-09-15)

- **Fases 1-3 cerradas:** a11y estructural global, 25 formularios migrados, dashboard con accesibilidad 100.
- **Rendimiento P0-P2 cerrado:** primeicons eliminado, SweetAlert2 diferido, FontAwesome JS eliminado (−1.2 MB), jQuery/Select2 eliminados y 22 vistas migradas a `PrimeSelect` (−148 kB, −2.703 líneas).
- **Métricas:** `totalJS` 2565 kB · `totalCSS` 241 kB. Reportes en `docs/metrics/a11y-*.json`, `perf-*.json` y `lighthouse.md` (manual).
- **Plan de rendimiento pendiente:** `Documentos\plan-mejora-rendimiento-noa.md` — bloqueado hasta poder medir en producción.
- **No eliminar `lodash.min.js`:** `public/assets/js/theme.js` usa `window._` 11 veces.
- **Deuda conocida:** `vendor-primevue` ~806 kB, `theme.min.css` 892 kB sin purga, `bootstrap.min.js` global (Modal/Tooltip), Leaflet por CDN, `tenantGuard` sin implementar.

## Módulos y Features del Sistema (`src/features/`)

Listado de submódulos de negocio disponibles y activos en la aplicación:

- **`affiliateAdminCharges`**: Gestión de cobros de afiliación y cuotas de administración mensual de vehículos.
- **`auth`**: Autenticación, inicio de sesión y gestión de credenciales.
- **`bankDetails`**: Configuración de cuentas y detalles bancarios de los actores.
- **`branches`**: Gestión de sucursales u oficinas de las empresas transportadoras.
- **`businessCollaborationAgreements`**: Convenios de colaboración empresarial y contratos entre entidades.
- **`companies`**: Configuración de empresas operadoras (multi-tenant context).
- **`conveyorCapacity`**: Capacidad transportadora y control de cupos de la flota.
- **`dashboard`**: Panel principal y widgets de resumen operativo y alertas.
- **`economicactivity`**: Gestión de actividades económicas homologadas por la DIAN.
- **`enablingResolutions`**: Resoluciones de habilitación emitidas por el Ministerio de Transporte.
- **`experiences`**: Experiencia acumulada y contratos previos.
- **`financialStatements`**: Registro de estados financieros y solvencia de la organización.
- **`fuec`**: Gestión completa de Planillas de Viaje FUEC (Formato Único de Extracto del Contrato).
- **`maintenance`**: Historial e inspecciones de mantenimiento mecánico preventivo/correctivo.
- **`notifications`**: Panel de notificaciones internas y alertas tempranas de vencimientos.
- **`operationCards`**: Tarjetas de operación de los vehículos de la flota.
- **`rupRecords`**: Registro Único de Proponentes (RUP).
- **`taxDeclarations`**: Declaraciones tributarias e impuestos de las empresas.
- **`taxInformation`**: Rut y perfiles tributarios.
- **`thirdParties`**: Gestión de terceros (conductores, propietarios, clientes, contratistas).
- **`vehicleDocuments`**: Control de documentos vehiculares (SOAT, Tecnicomecánica, Pólizas).
- **`vehicleInspections`**: Bitácora de inspecciones preoperacionales diarias de vehículos.
- **`vehicles`**: Registro principal del parque automotor (placas, marcas, modelos, etc.).

## Hooks Composables (`src/hooks/`)

Abstracciones de lógica reutilizable para mantener los componentes `.vue` dedicados a la interfaz:

- **`useAccessibleForm.js`**: Composable estándar para formularios accesibles (trim, reglas `required/minLength/maxLength/email/pattern`, mensajes con etiqueta, `validateAndFocus`, `fieldAria`/`errorId`, `submit` anti-doble-envío). **Usar en formularios nuevos.**
- **`useFormManager.js`**: Envoltura compatible sobre `useAccessibleForm` (misma firma histórica). `useForm.js` fue eliminado.
- **`useNotifications.js`**: Hook para disparar notificaciones visuales contextuales.
- **`useSidebar.js`**: Control del estado colapsable y responsivo de la barra lateral.
- **`useTable.js`**: Abstracción para el control de tablas, filtros, búsqueda debounced y paginación.
- **`useTableActions.js`**: Manejo de eventos comunes en tablas como confirmación de eliminación con SweetAlert2.
- Otros: `useDocumentWizard.js`, `useChatPolling.js`, `useGeolocation.js`, `useNitLookup.js`, `useNoAutocomplete.js`.

## Utilidades del Sistema (`src/utils/`)

Funciones auxiliares y configuraciones globales:

- **`connectivity.js`**: Monitorea conectividad `online`/`offline` nativa y realiza health checks al backend.
- **`date.js`**: Helpers para manipulación y visualización consistente de fechas.
- **`env.js`**: Carga y validación segura de variables de entorno con prefijo `VITE_`.
- **`error-handler.js`**: Capturador global de errores de Vue y errores de promesas rechazadas.
- **`i18n.js`**: Configuración y carga asíncrona de lenguajes (`es`, `en`).
- **`logger.js`**: Logging en consola con enmascaramiento automático de información confidencial.
- **`mask.js`**: Utilidades de máscara para inputs (teléfonos, identificación, placas).
- **`media.js`**: `getMediaUrl` para construir URLs absolutas a recursos del servidor.
- **`plugins.js`**: Orquestador principal de inicialización y registro de plugins con logs de rendimiento.
- **`security.js`**: Helpers de cifrado local para la persistencia en `secureStorage`.

## Estado Global y Plugins (`src/store/`)

Estructura de la persistencia de datos y estado global con Pinia:

- **Módulos (`modules/`)**:
  - `auth.js`: Estado de la sesión actual de usuario y token persistente.
  - `config.js`: Configuraciones generales de la app e interfaz de usuario.
  - `permissions.js`: Control de permisos (RBAC) heredados del backend.
  - `user.js`: Información de perfil del usuario logueado.
- **Plugins (`plugins/`)**:
  - `encryption.js`: Abstracción de cifrado para datos del store.
  - `logger.js`: Logger del ciclo de vida de acciones en Pinia.
  - `persistence.js`: Sincronización encriptada reactiva con `secureStorage`.

## Credenciales de inicio de sesión

- Email: `mdarwin1992@gmail.com`
- Password: `123456789`

## Commits

- Una sola línea, en español, formato `tipo(scope): descripción directa`.
- Sin cuerpo ni bullets, salvo que el cambio lo exija para entenderse.
- Tipos: feat, fix, refactor, perf, style, docs, test, build, ci, chore.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
