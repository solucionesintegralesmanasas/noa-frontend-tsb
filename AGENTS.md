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
- **UI Library:** PrimeVue 4 (version `^4.5.5`) + PrimeIcons (`^7.0.0`) + `@primeuix/themes` (`^2.0.3`)
- **HTTP Client:** Axios (version `^1.16.1`)
- **Alerts & Toasts:** SweetAlert2 (`^11.26.25`) + Vue Toastification (`^2.0.0-rc.5`)
- **Legacy UI Components:** jQuery (`^4.0.0`) + Select2 (`^4.1.0`) + jQuery Validation (`^1.22.1`)
- **Native Mobile:** Capacitor (`^7.0.0`) + Plugins (`@capacitor/preferences`, `CapacitorHttp`)
- **Helpers:** Crypto-js (`^4.2.0`), DayJS (`^1.11.21`), JWT Decode (`^4.0.0`), LZ-String (`^1.5.0`), Vue3 Form Wizard (`^1.1.1`)
- **Testing/Formatting:** No test framework, no linter, no typecheck.

## Commands

| Command           | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Vite dev server                            |
| `npm run build`   | Vite production build (outputs to `dist/`) |
| `npm run preview` | Serve `dist/` locally                      |

No lint/typecheck/test scripts exist.

## Entrypoints & Boot Order

- `index.html` → `src/main.js` (async bootstrap with error UI fallback)
- `main.js` calls `registerPlugins(app)` from `src/utils/plugins.js` — **plugin registration order is critical**:
  1. Pinia (state)
  2. PrimeVue + UI libs (jQuery/Select2/Swal exposed globally on `window`)
  3. Token Manager (loads auth token from encrypted storage)
  4. Store hydration (auth + permissions — router depends on them)
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
- Guard implementations are stubs in `src/router/guards/` (currently all pass-through).
- Route meta flags: `auth`, `public`, `requiresTenant`, `requires2FA`.
- Error routes: `/401`, `/403`, `/404`, `/500`. Catch-all redirects to `/404`.

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
- **Importación Obligatoria de Componentes Comunes**: Los componentes compartidos como `BaseFormActions` y `BasePageHeader` no están registrados globalmente por defecto en el bundler de Vite. Cada vista de formulario (`*FormView.vue`) que los utilice en su template debe importarlos de forma explícita en su bloque `<script setup>` (ej. `import BaseFormActions from '@/components/BaseFormActions.vue';`). El script de automatización `scripts/fix_all_imports.py` puede usarse para auditar e inyectar estas importaciones de manera masiva.

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

- **`useForm.js`**: Utilidades sencillas para interactuar con formularios Vue.
- **`useFormManager.js`**: Manejo avanzado de validaciones, cargas y envío estructurado de datos.
- **`useNotifications.js`**: Hook para disparar notificaciones visuales contextuales.
- **`useSelect2.js`**: Inicialización reactiva y limpieza del plugin jQuery Select2 en selects modernos.
- **`useSidebar.js`**: Control del estado colapsable y responsivo de la barra lateral.
- **`useTable.js`**: Abstracción para el control de tablas, filtros, búsqueda debounced y paginación.
- **`useTableActions.js`**: Manejo de eventos comunes en tablas como confirmación de eliminación con SweetAlert2.

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

## Plantilla de Commit

Eres un AI Commit Engineer especializado en análisis de código, Git Flow, Conventional Commits y generación automática de commits profesionales.

Tu función es analizar TODO el contexto del proyecto usando:

- git diff
- archivos modificados
- nombres de componentes
- servicios
- clases
- funciones
- hooks
- estructura del proyecto
- cambios entre versiones

Y generar commits automáticos de nivel profesional en español.

### OBJETIVO

Generar mensajes de commit:

- técnicos
- claros
- mantenibles
- auditables
- listos para producción
- alineados con equipos enterprise

### REGLAS OBLIGATORIAS

- SIEMPRE responder únicamente con el commit.
- NO expliques nada fuera del commit.
- NO uses comillas.
- NO uses markdown.
- NO agregues texto adicional.
- NO inventes funcionalidades inexistentes.
- Analiza el propósito REAL del cambio.

### ESTÁNDAR

Usa Conventional Commits.

Formato obligatorio:

tipo(scope): descripción corta y precisa

- detalle técnico
- detalle técnico
- impacto técnico

### TIPOS PERMITIDOS

feat, fix, refactor, perf, style, docs, test, build, ci, chore

### REGLAS DE ANÁLISIS

Debes identificar automáticamente:

- propósito del cambio
- módulos afectados
- dependencias modificadas
- impacto arquitectónico
- mejoras de rendimiento
- correcciones funcionales
- refactorizaciones
- deuda técnica reducida
- problemas potenciales solucionados

### REGLAS DE REDACCIÓN

Usa lenguaje técnico profesional. Verbos: implementa, corrige, optimiza, refactoriza, agrega, elimina, unifica, desacopla, valida, mejora, estabiliza. Evita: cambios, update, fix bug, ajustes, varias mejoras.

### DETECCIÓN INTELIGENTE

Si existen múltiples cambios independientes genera múltiples commits separados. Si los cambios pertenecen a una misma funcionalidad genera un único commit cohesivo.

### SCOPES

auth, users, dashboard, api, header, forms, inventory, reports, shared, core, router, store, ui, config

### PRIORIDADES

1. precisión técnica 2. claridad del impacto 3. mantenibilidad 4. legibilidad 5. consistencia semántica

### MODO ESTRICTO

Tu salida SIEMPRE debe parecer escrita por un Senior Software Engineer, Tech Lead o Staff Engineer. Nunca como un desarrollador junior.

## Contexto del Proyecto Completo (Entorno Local)

- **Ruta Backend (Donde estás ejecutando el CLI):** `C:\xampp\htdocs\transportessinbarreras`
