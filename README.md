# Contigo - Landing Page

Landing Page y flujo inicial de **Contigo**, una aplicación que orienta paso a paso a adultos mayores, jóvenes sin experiencia y personas con baja alfabetización digital para realizar trámites y pagos digitales. Contigo solo orienta: no ejecuta pagos.

## Tecnologías

- HTML5
- CSS3
- JavaScript (sin frameworks ni librerías)

## Flujo incluido

1. **Landing page** (`index.html`): Inicio con login, Trámites, Comentarios y Ayuda. Es responsive, con menú hamburguesa en pantallas pequeñas.
2. **Registro** (`register.html`): nombre, edad y celular (US-01), más correo y contraseña para el login de la landing. Incluye registro por voz (US-02).
3. **Verificación por código** (`verify.html`): código simulado de 6 dígitos que vence en 5 minutos, con 3 intentos y opción de reenvío (US-03).
4. **Bienvenida** (`welcome.html`): mensaje de bienvenida con el resumen de la cuenta.
5. **Iniciar sesión**: con correo y contraseña desde la landing, o con celular y código (`phone-login.html`).
6. **Inicio de la app** (`home.html`): menú con íconos (US-06), búsqueda (US-07) y trámites frecuentes (US-09).
7. **Mis trámites** (`procedures.html`): búsqueda, filtro por categoría (US-10) y lista de comprobantes (US-30).
8. **Detalle del trámite** (`procedure.html`): requisitos antes de empezar (US-08) y tiempo estimado (US-27).
9. **Guía paso a paso** (`guide.html`): una instrucción por pantalla (US-11), apoyo visual (US-13), retroceder (US-14), modo práctica (US-15), progreso (US-26), verificación de datos (US-28) y comprobante (US-30).
10. **Perfil** (`profile.html`): editar datos con opción de cancelar (US-05).

## Estructura

```
index.html          Landing page + iniciar sesión
register.html       Registro (US-01 y US-02)
phone-login.html    Ingresar con celular (US-03)
verify.html         Escribir el código de 6 dígitos (US-03)
welcome.html        Cuenta creada
home.html           Inicio de la app (US-06, US-07, US-09)
procedures.html     Mis trámites (US-10, US-30)
procedure.html      Detalle y requisitos del trámite (US-08, US-27)
guide.html          Guía paso a paso (US-11, US-13, US-14, US-15, US-26, US-28, US-30)
profile.html        Editar perfil (US-05)
assets/
  images/           Logo, ilustraciones e íconos exportados de Figma
  styles/
    main.css        Variables de la guía de estilos y componentes compartidos
    landing.css     Estilos de la landing
    auth.css        Registro, código y bienvenida
    home.css        Inicio de la app
    procedures.css  Trámites, guía, comprobantes y perfil
  scripts/
    main.js         Menú hamburguesa, mensajes flotantes y año del pie
    storage.js      "Base de datos" simulada con localStorage
    forms.js        Mostrar errores y validar datos
    landing.js      Login y formulario de contacto
    register.js     Registro escrito y por voz
    phone-login.js  Ingreso con celular
    verify.js       Código de verificación
    welcome.js      Pantalla de bienvenida
    home.js         Buscador y trámites frecuentes
    icons.js        Íconos SVG reutilizables
    procedures-data.js  Trámites, requisitos, pasos y campos de datos
    procedure-card.js   Tarjeta de trámite
    procedures.js   Lista, búsqueda, filtro y comprobantes
    procedure.js    Requisitos y botones de inicio
    guide.js        Guía paso a paso, práctica y comprobante
    receipts.js     Texto, descarga y envío del comprobante
    profile.js      Editar perfil
```

## Cómo ejecutarlo

Abre `index.html` en Chrome o Edge. Recomendamos usar la extensión **Live Server** de Visual Studio Code, para que todas las páginas compartan los datos guardados.

## Importante: es una simulación

No hay backend. Los usuarios y la sesión se guardan en el navegador con `localStorage` y `sessionStorage`, y el "SMS" con el código se muestra en la misma pantalla. Las contraseñas se guardan sin cifrar, así que **no uses datos reales**. Para empezar de cero, borra los datos del sitio desde las herramientas del navegador (F12 → Application → Storage → Clear site data).

## Convenciones

- Nombres de archivos, clases, IDs, variables, ramas y commits en inglés. El contenido visible en español.
- Ramas según GitFlow y commits con Conventional Commits.

## Repositorio relacionado

- Acceptance Tests: https://github.com/MauricioAlonso28/Contigo-Acceptance-Tests

## Sprint 2

Funciones nuevas (todas simuladas en el navegador, sin backend):

- **Escanear recibo** (`scan.html`): lectura simulada del recibo (US-16), corrección de datos (US-17), aviso de foto borrosa u oscura (US-18) y fotos de ejemplo para practicar.
- **Mis pagos** (`calendar.html`): fecha de vencimiento (US-36), recordatorios (US-37), calendario en lista y por mes (US-38) y estado del recibo (US-33).
- **Guía paso a paso**: audio (US-12), ayuda contextual (TSK-22), glosario (US-23), monto inusual (US-24), cierre con pasos pendientes (US-29), campos con error (US-32), ayuda proactiva (US-34) y continuar después (US-48).
- **Asistente** flotante en las páginas de la app (US-21).

Archivos nuevos: `assets/styles/sprint2.css` y los scripts `ui-helpers.js`, `bills.js`, `guide-history.js`, `assistant-data.js`, `assistant.js`, `glossary.js`, `guide-audio.js`, `guide-extras.js`, `reminders.js`, `receipt-image.js`, `scan.js`, `calendar.js` y `app-extras.js`.

El código del Sprint 1 no se modificó. `guide-extras.js` amplía la guía envolviendo las funciones globales de `guide.js` (se carga después de él), y `app-extras.js` agrega el enlace «Pagos» y las secciones nuevas en tiempo de ejecución. Los avisos del sistema necesitan abrir el sitio con Live Server o desde GitHub Pages (no con `file://`).
