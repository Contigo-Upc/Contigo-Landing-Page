# Cómo contribuir: Contigo - Landing Page

Esta guía explica cómo usar el proyecto y cómo trabajar en él con Git y GitHub.

## 1. Qué tenemos

| Qué | Link |
|---|---|
| Repositorio del Landing Page | https://github.com/Contigo-Upc/Contigo-Landing-Page |
| Repositorio de los Acceptance Tests | https://github.com/Contigo-Upc/Contigo-Acceptance-Tests |
| Landing Page publicado | https://contigo-upc.github.io/Contigo-Landing-Page/ |

El Landing Page está hecho con HTML, CSS y JavaScript, sin librerías.

## 2. Lo que necesitas

- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/)
- La extensión **Live Server** de VS Code
- Tu cuenta de GitHub (ya tienes acceso al repositorio)

## 3. Cómo usar el proyecto

### Descargar y abrir

```bash
git clone https://github.com/Contigo-Upc/Contigo-Landing-Page.git
cd Contigo-Landing-Page
code .
```

En VS Code, haz clic derecho sobre `index.html` → **Open with Live Server**.

### Probar el flujo

1. En la landing, toca **Registrarse** y completa el formulario.
2. El código de 6 dígitos aparece en la misma pantalla, en un recuadro azul (es un SMS simulado). Escríbelo y toca **Verificar**.
3. Verás la bienvenida y luego el **Inicio** de la app.
4. Para volver a entrar: usa tu correo y contraseña en la landing, o **Ingresa con un código** con tu celular.

### Importante: es una simulación

- No hay servidor. Los usuarios se guardan en tu navegador (`localStorage`).
- No uses datos reales.
- Para empezar de cero: `F12` → **Application** → **Storage** → **Clear site data**.

### Páginas del proyecto

| Archivo | Qué es |
|---|---|
| `index.html` | Landing page con inicio de sesión |
| `register.html` | Registro (US-01 y US-02) |
| `verify.html` | Código de verificación (US-03) |
| `welcome.html` | Bienvenida al crear la cuenta |
| `phone-login.html` | Ingreso con celular |
| `home.html` | Inicio de la app (US-06) |

Los estilos están en `assets/styles/`, los scripts en `assets/scripts/` y las imágenes en `assets/images/`.

## 4. Cómo trabajamos: ramas

Usamos **GitFlow**. Estas son las ramas:

| Rama | Para qué sirve | ¿Se puede trabajar directo ahí? |
|---|---|---|
| `main` | La versión publicada | **No** |
| `develop` | Junta el trabajo terminado de todos | **No** |
| `feature/...` | Tu tarea | **Sí**, una rama por tarea |
| `release/...` | Preparar una versión nueva | Solo los admins |
| `hotfix/...` | Arreglar un error urgente en `main` | Solo los admins |

**Reglas:**
- Nunca hagas commit directo en `main` ni en `develop`.
- Nunca borres una rama, ni siquiera después de fusionarla.

## 5. Cómo hacer tu tarea, paso a paso

### 1. Actualiza `develop`

```bash
git checkout develop
git pull
```

### 2. Crea tu rama

```bash
git checkout -b feature/nombre-de-tu-tarea
```

El nombre va en **inglés**, en minúsculas y con guiones. Ejemplos: `feature/contact-form-fix`, `feature/footer-links`.

### 3. Haz tus cambios y guárdalos (commit)

Agrega **solo los archivos que cambiaste**, no todo con `git add .`:

```bash
git add index.html assets/styles/landing.css
git commit -m "fix: align login buttons on mobile"
```

Puedes hacer varios commits en tu rama, uno por cada cambio.

### 4. Sube tu rama

```bash
git push -u origin feature/nombre-de-tu-tarea
```

### 5. Abre un Pull Request (PR)

1. Entra al repositorio en GitHub. Aparecerá un botón **Compare & pull request**.
2. Revisa que diga **base: `develop`** ← **compare: tu rama**. Nunca hacia `main`.
3. **Título:** igual que tu commit principal.
4. **Descripción:** qué cambiaste y cómo probarlo.
5. Toca **Create pull request**.

### 6. Revisión y merge

- Un admin revisa tu PR: **MauricioAlonso28**, **GFabi12** o **ccjemayorga-lang**.
- Si todo está bien, lo fusiona con **Create a merge commit**.
- **No** toques **Delete branch** después del merge.

## 6. Cómo escribir los commits

Formato: `tipo: qué hiciste`, en **inglés** y en minúsculas.

| Tipo | Cuándo usarlo | Ejemplo |
|---|---|---|
| `feat` | Agregas algo nuevo | `feat: add testimonials section` |
| `fix` | Corriges un error | `fix: show error when phone is empty` |
| `docs` | Cambias documentación | `docs: update readme links` |
| `style` | Cambias formato, sin cambiar lo que hace | `style: adjust spacing in footer` |
| `refactor` | Ordenas código sin cambiar lo que hace | `refactor: split form validation` |

## 7. Reglas del código

- Los nombres de archivos, clases, IDs, variables, ramas y commits van en **inglés**.
- Todo lo que ve el usuario va en **español**.
- Usa los colores y tamaños de `assets/styles/main.css` (por ejemplo `var(--color-primary)`). No escribas colores sueltos.
- Respeta la guía de estilos: campos de 48 px de alto, radio de 12 px y botones con estados hover, activo y deshabilitado.

## 8. Si algo sale mal

| Problema | Qué hacer |
|---|---|
| `git push` dice que no tienes permiso | Avisa a Mauricio para revisar tu acceso |
| Tu PR dice que hay **conflictos** | En tu rama ejecuta `git pull origin develop`, arregla los archivos marcados, haz commit y vuelve a hacer push |
| Hiciste commit en `develop` por error | No hagas push. Avisa en el grupo antes de hacer cualquier cosa |
| No ves tus cambios en la página publicada | Es normal: la página publicada solo cambia cuando un admin hace un release a `main` |

## 9. Resumen rápido

```bash
git checkout develop
git pull
git checkout -b feature/mi-tarea
git add archivo1 archivo2
git commit -m "feat: describe what you did"
git push -u origin feature/mi-tarea
```

Luego abre el PR hacia `develop` en GitHub y espera la revisión de un admin.
