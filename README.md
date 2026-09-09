# 🦅 NextFUEC App

NextFUEC es una plataforma robusta de **Gestión Avanzada de Transporte** (FUEC). Diseñada bajo una arquitectura empresarial escalable ("Feature-Driven") que garantiza un mantenimiento sencillo, alta seguridad y un rendimiento excepcional.

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando las últimas y más eficientes herramientas del ecosistema frontend:

- **Core:** Vue 3 (Composition API / `<script setup>`)
- **Build Tool:** Vite 8 (Ultra rápido)
- **Estado Global:** Pinia 3
- **Enrutamiento:** Vue Router 4 (con Guards de seguridad avanzados)
- **Diseño y UI:** Plantilla *Falcon Admin* + Bootstrap 5 + PrimeVue 4
- **Conectividad:** Axios (con interceptores para manejo de tokens)
- **Seguridad:** Encriptación de variables locales (AES-GCM, WebCrypto API)

---

## 🏗️ Arquitectura del Proyecto

El proyecto se aleja de las estructuras tradicionales de Vue para adoptar un modelo **"Enterprise-Ready"**:

1. **Feature-Driven Design (`src/features/`):** 
   La aplicación está dividida por módulos (Ej: `auth`, `vehiculos`, `facturacion`). Cada módulo es independiente y contiene sus propias rutas, vistas y lógica.
2. **Lógica separada en Hooks (`src/hooks/`):** 
   Toda la lógica de negocio (formularios, tablas, notificaciones, menús) se extrae a *Composables* (`useTable.js`, `useFormManager.js`). Los archivos `.vue` son exclusivamente para la interfaz gráfica (HTML/CSS).
3. **Layouts Globales (`src/components/layout/`):** 
   Componentes estructurales como `Navbar.vue` y `Sidebar.vue` residen aquí y se comunican con los Hooks para mantener el código visual limpio.
4. **Router Seguro:**
   Múltiples capas de seguridad (`authGuard` -> `twoFAGuard` -> `tenantGuard` -> `permissionsGuard`) bloquean el acceso no autorizado de forma secuencial.

---

## 🚀 Comandos Rápidos

Para empezar a trabajar con el proyecto, utiliza los siguientes comandos en tu terminal:

### Instalar dependencias
```bash
npm install
```

### Iniciar servidor de desarrollo
Levanta un servidor local con recarga rápida (HMR).
```bash
npm run dev
```

### Compilar para producción
Genera la carpeta `dist/` con el código optimizado, minificado y dividido en *chunks*.
```bash
npm run build
```

### Previsualizar el Build
Permite probar la carpeta `dist/` localmente antes de subirla a producción.
```bash
npm run preview
```

---

## 🔒 Variables de Entorno
El proyecto utiliza archivos `.env` para la configuración. Las variables públicas deben empezar con `VITE_`.
Ejemplo:
- `VITE_API_BASE_URL`: URL del backend.
- `VITE_ENCRYPTION_KEY`: Llave de encriptación para el almacenamiento local.

*(Asegúrate de revisar el archivo `AGENTS.md` para conocer las reglas completas de contribución y convenciones de código).*
