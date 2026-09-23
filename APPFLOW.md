# Appflow (Ionic) — Configuración Profesional

**Autor:** Darwin Montes
**Stack:** Vue 3 · Vite · Capacitor 8 · Ionic Appflow
**Repo de destino:** `https://github.com/solucionesintegralesmanasas/noa-os.git` (remote `noa-os`)

---

## 1. Qué ya está configurado en el repo

| Artefacto | Descripción |
|---|---|
| `capactor.config.json` | `appId`, `appName`, `webDir: dist`, `server.androidScheme: https`, `CapacitorHttp` habilitado |
| `ionic.config.json` | Identifica la app (`type: vue`) ante el Ionic CLI; pegar aquí el `app_id` de Appflow |
| `package.json` | `@ionic/cli` + scripts `ionic:*`, `cap:*` (build, sync, add, assets, open) |
| `android/` + `ios/` | Plataformas nativas commiteadas (requisito para builds nativos en la nube). Los `build/`, `public/` y keystores quedan fuera por `.gitignore` |
| `.github/workflows/appflow.yml` | Dispara builds en Appflow desde GitHub Actions (Android debug por push; iOS/Android release por tag `v*`) |
| `.env.production.example` | Plantilla trackeada con las variables `VITE_*` que el build de producción necesita |
| `.gitignore` | `android/` e `ios/` ya NO se ignoran; `.appflow.yaml`, keystores (`*.jks`) y `.env.*` sí |

> **El build nativo de Appflow corre:** `npm ci` → `npm run build` (Vite) → `npx cap sync` → compilación nativa (gradle / xcodebuild). Las variables `VITE_*` deben existir en el **Environment** de Appflow (no se leen del repo porque `.env.production` está ignorado).

---

## 2. Requisitos previos

- Cuenta en [ionic.io](https://ionic.io) con plan Appflow activo (al menos *Live Updates* o *Native Builds*).
- Repositorio `noa-os` conectado a GitHub y **acceso del bot de Appflow** a él.
- Para release: certificados iOS (Apple) y keystore Android (`android/app/noa-release-key.jks` existe localmente como referencia local de firma).

---

## 3. Flujo de configuración en el dashboard

### 3.1 Agregar la app y conectar el repo

1. `Appflow → Add an App → Connect to GitHub`.
2. Selecciona el repo `solucionesintegralesmanasas/noa-os` (rama `main`).
3. Appflow detecta Capacitor automáticamente.
4. Copia el **App ID** (ej: `a1b2c3d4`) y pégalo en `ionic.config.json` → `id`.

### 3.2 Crear el Environment `Production` (obligatorio)

En `Build → Environments → New Environment` crea uno llamado **Production** con las variables de `.env.production.example`:

- `VITE_APP_NAME`, `VITE_APP_VERSION`, `VITE_INITIAL_VIEW`
- `VITE_API_PROXY_TARGET`, `VITE_API_BASE_URL`, `VITE_API_NATIVE_URL`, `VITE_API_TIMEOUT`
- `VITE_AUTH_TOKEN_KEY`, `VITE_AUTH_REFRESH_TOKEN_KEY`, `VITE_AUTH_TOKEN_EXPIRY`
- `VITE_ENCRYPTION_KEY` → agregarla como **Secret** (valor real, nunca commiteado)
- `VITE_FRONTEND_URL`, `VITE_I18N_*`, `VITE_DEFAULT_THEME`, `VITE_FEATURE_*`, `VITE_USE_MOCK_DATA`
- Opcional: `OVERRIDE_NODE_VERSION=22`, `IOS_SCHEME=<Scheme>`, `ANDROID_BUILD_TYPE=release`

Cada variable `VITE_*` de entorno es expuesta por Vite vía `import.meta.env` durante `npm run build`.

### 3.3 Subir credenciales de firma

- **Android (release/Play):** `Package → Credentials → Add Android Credentials → Production` y sube el keystore (se genera con `keytool`). El `build.gradle` ya referencia `noa-release-key.jks` como archivo local de firma; no subas el `.jks` al repo (está en `.gitignore`).
- **iOS (Ad Hoc / App Store):** sube certificado `.p12` + provisioning profile en `Package → Credentials`.

### 3.4 Primer build

En `Package → Builds → New Build`:
- **Android:** `platform: Android`, `build-type: debug` (no requiere firma) o `release` (requiere keystore).
- **iOS:** `platform: iOS`, `build-type: simulator` (sin firma) o `app-store`/`ad-hoc` (requiere certificado).
- `environment: Production` y `native-config`: (opcional, p. ej. cambiar URL/iconos por entorno).

---

## 4. Extras con Native Configurations (opcional)

`Package → Native Configurations` permite sobreescribir valores nativos por entorno sin tocar el repo, por ejemplo:

| Archivo nativo | Propiedad | Uso |
|---|---|---|
| `Info.plist` (iOS) | `CFBundleDisplayName` | Nombre visible de la app |
| `strings.xml` (Android) | `app_name` | Nombre visible de la app |
| `AndroidManifest.xml` | `usesCleartextTraffic` | Sólo para APIs HTTP (no recomendado) |

> Aplica solo a builds que eligen esa native config —el repo sigue siendo la fuente de verdad.

---

## 5. Integración con GitHub Actions (`appflow.yml`)

El workflow ya incluido:

- **push a `main`/`develop`** → build **Android debug** (valida la pipeline en la nube, sin firmas).
- **tag `v*`** → build **Android release (AAB)** + **iOS App Store (IPA)**.

Agrega estos secrets en `Settings → Secrets and variables → Actions` del repo nuevo:

| Secret | Valor |
|---|---|
| `APPFLOW_TOKEN` | Personal Access Token de Appflow (`Settings → Personal Access Tokens`) |
| `APPFLOW_APP_ID` | App ID de la app en Appflow |
| `APPFLOW_ANDROID_CERT` | Nombre del keystore cargado en Appflow (ej: `NOA Production`) |
| `APPFLOW_IOS_CERT` | Nombre del certificado iOS en Appflow |

Los pasos están condicionados: si no hay token, el job se salta (sirve como guarda en el repo nuevo).

---

## 6. Live Updates (opcional, requiere plan)

Para mandar actualizaciones de web al dispositivo sin pasar por la tienda:

```bash
npm install @ionic/deploy
```

- Configurar en `capacitor.config.json` la sección `plugins.Deploy` (o usar el popup de `ionic deploy configure`).
- Requiere el **App ID** de Appflow, canales (`Production`, `Staging`) y plan con Live Updates.
- Se dispara desde el dashboard en `Live Update → Build a New Update`, o desde `appflow.yml` añadiendo `platform: Web`.

---

## 7. Comandos útiles (local)

```bash
npm run build            # build web (Vite) → dist/
npm run cap:sync         # build + npx cap sync (copia dist/ a ios/ y android/)
npm run cap:sync:ios     # solo iOS
npm run cap:sync:android # solo Android
npm run cap:assets       # genera iconos/splash desde assets/icon.png y assets/splash.png
npm run cap:open:ios     # abre Xcode
npm run cap:open:android # abre Android Studio
ionic build              # build vía Ionic CLI (equivale a npm run build)
ionic cap sync           # sync vía Ionic CLI
```

---

## 8. Notas y advertencias

- **No subir secretos:** `.env.production`, `*.jks`, `.appflow.yaml` están en `.gitignore`. Todo lo sensible va en Environments (Secrets) o Credentials de Appflow.
- **coherencia de `appId`:** todo el stack usa un único ID, `com.transportessinbarreras.noa` (`capacitor.config.json`, Android `namespace`/`applicationId`, iOS `PRODUCT_BUNDLE_IDENTIFIER`). No cambiar sólo en un lado.
- **Firma Android (release):** el `build.gradle` ya NO contiene contraseñas ni rutas de keystore hardcodeadas. La firma se lee de `android/keystore.properties` (gitignored) si existe, o la inyecta Appflow en `Package → Credentials`. Para compilado local release, crea `android/keystore.properties` con `storeFile`, `storePassword`, `keyAlias`, `keyPassword`.
- **Tenants/API:** la app usa `VITE_API_NATIVE_URL` en nativo (CapacitorHttp). Revisa que el Environment de producción apunte al mismo host que el backend de producción.
- **Node:** si Appflow usa una versión de Node distinta a la local (v26), fija `OVERRIDE_NODE_VERSION=22` (o la que valide `npm run typecheck`/`build`) en el Environment.
- **Medición:** mide rendimiento contra `npm run preview` o Apache, nunca contra el dev server.

---

## 9. Glosario de archivos

```
.
├── capacitor.config.json        # Config de Capacitor (appId, webDir, androidScheme)
├── ionic.config.json            # Config del Ionic CLI + App ID de Appflow
├── .env.production.example      # Plantilla de variables VITE_* para el Environment
├── .github/workflows/
│   ├── ci.yml                   # Lint + a11y + build + unit (feature/develop/main)
│   ├── deploy.yml               # Deploy FTP del web build (hosting compartido)
│   └── appflow.yml              # Builds nativos Appflow (debug push / release tag)
├── android/                     # Proyecto Android (commiteado, build/ ignorado)
└── ios/                         # Proyecto iOS (commiteado, build/Pods ignorado)
```