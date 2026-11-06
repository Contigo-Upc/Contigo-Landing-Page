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
6. **Inicio de la app** (`home.html`): adaptación a web de la pantalla móvil US-06.

## Estructura

```
index.html          Landing page + iniciar sesión
register.html       Registro (US-01 y US-02)
phone-login.html    Ingresar con celular (US-03)
verify.html         Escribir el código de 6 dígitos (US-03)
welcome.html        Cuenta creada
home.html           Inicio de la app (US-06)
assets/
  images/           Logo, ilustraciones e íconos exportados de Figma
  styles/
    main.css        Variables de la guía de estilos y componentes compartidos
    landing.css     Estilos de la landing
    auth.css        Registro, código y bienvenida
    home.css        Inicio de la app
  scripts/
    main.js         Menú hamburguesa, mensajes flotantes y año del pie
    storage.js      "Base de datos" simulada con localStorage
    forms.js        Mostrar errores y validar datos
    landing.js      Login y formulario de contacto
    register.js     Registro escrito y por voz
    phone-login.js  Ingreso con celular
    verify.js       Código de verificación
    welcome.js      Pantalla de bienvenida
    home.js         Buscador y cerrar sesión
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
