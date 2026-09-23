# Deploy Automático — Vue 3 + GitHub Actions + FTP

**Autor:** Darwin Montes  
**Stack:** Vue 3 · Vite · Hosting compartido

> **Nota:** Este workflow despliega el **web build** por FTP al hosting. Para builds **nativos iOS/Android** (y Live Updates) el despliegue profesional se hace con **Ionic Appflow** — ver [`APPFLOW.md`](./APPFLOW.md) y `.github/workflows/appflow.yml`. El repo Appflow de destino es `noa-os` (remote `git remote add noa-os https://github.com/solucionesintegralesmanasas/noa-os.git`).

---

## 1. Agregar credenciales en GitHub

Ve a tu repositorio:

```
Settings → Secrets and variables → Actions → New repository secret
```

Agrega estos 3 secrets:

| Nombre | Valor |
|---|---|
| `FTP_SERVER` | `ftp.tudominio.com` |
| `FTP_USER` | `tu_usuario_ftp` |
| `FTP_PASSWORD` | `tu_contraseña_ftp` |

---

## 2. Crear el archivo del workflow

En la raíz de tu proyecto crea la carpeta y el archivo:

```
.github/
└── workflows/
    └── deploy.yml
```

Contenido del archivo:

```yaml
name: Build & Deploy

on:
  push:
    branches: ['**']   # todas las ramas
  create:
    tags:
      - 'v*'           # cualquier tag tipo v1.0.0

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /public_html/   # ← ajusta si tu ruta es diferente
```

> **Nota:** Si tu proyecto no está en la raíz del repo, ajusta `local-dir` y `server-dir` según corresponda.

---

## Versionamiento con tags

Usá tags para marcar versiones estables de tu proyecto:

```bash
# Crear un tag
git tag v1.0.0

# Subir el tag a GitHub (esto también dispara el deploy)
git push origin v1.0.0
```

### Convención recomendada

```
v1.0.0  → versión mayor (cambios grandes / breaking)
v1.1.0  → versión menor (nuevas funcionalidades)
v1.1.1  → parche (corrección de bugs)
```

### Ver todos tus tags

```bash
git tag
```

### Eliminar un tag (si te equivocaste)

```bash
# Local
git tag -d v1.0.0

# En GitHub
git push origin --delete v1.0.0
```

---

## 3. Subir el workflow a GitHub

```bash
git add .github/
git commit -m "ci: add deploy workflow"
git push
```

---

## 4. Verificar el deploy

Ve a tu repo en GitHub → pestaña **Actions**.  
Verás el workflow corriendo. Si todo está verde, el deploy fue exitoso.

---

## Flujo de trabajo a partir de ahora

```
Hacer cambios → git push → GitHub hace el build → sube automático al servidor
```

Sin builds manuales, sin subir archivos por FTP a mano.

---

## Notas importantes

- **No subas el `dist/` manualmente** después de configurar esto — GitHub Actions es el único que debe desplegar.
- Verifica que `dist/` esté en tu `.gitignore`.
- Si usás FTPS en vez de FTP, agrega `protocol: ftps` en el paso de deploy.
- El workflow se activa con push a **cualquier rama** y con cualquier **tag `v*`**.
- Si querés limitarlo solo a algunas ramas, cambiá `'**'` por `[main, develop]` por ejemplo.
