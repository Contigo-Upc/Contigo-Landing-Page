# Changelog

## [2.0.0] - 2026-11-09

### Agregado (Sprint 2)
- Audio de la instrucción de cada paso de la guía, con pausa y continuar (US-12).
- Escaneo de recibo con lectura simulada, aviso de datos no leídos y opción de cancelar (US-16).
- Revisión y corrección de los datos leídos antes de guardar (US-17).
- Aviso de foto borrosa o con poca luz, con opción de volver a tomarla (US-18).
- Asistente por texto con respuestas simuladas en memoria y derivación a soporte humano (US-21).
- Ayuda contextual en cada paso de la guía (TSK-22).
- Significado de términos técnicos al tocarlos, con "Explicar más" (US-23).
- Alerta de monto inusual respecto al habitual (US-24).
- Pasos pendientes y verificación en la plataforma oficial al cerrar la guía (US-29).
- Resaltado de campos con error, resumen y desplazamiento automático (US-32).
- Estado del recibo (pendiente, en proceso, pagado) y aviso de pago duplicado (US-33).
- Ayuda proactiva del asistente tras 3 errores seguidos (US-34).
- Registro automático o manual de la fecha de vencimiento (US-36).
- Recordatorios 2 días antes y el día del vencimiento, desactivables por pago (US-37).
- Calendario de pagos en vista de lista y mensual, con filtro por mes (US-38).
- Continuar un trámite pendiente desde el último paso guardado (US-48).

### Notas
- El código del Sprint 1 no se modificó: solo se agregaron etiquetas `<link>` y `<script>` al final de `home.html`, `procedures.html`, `procedure.html`, `profile.html` y `guide.html`.

### Corregido
- `storage.js` quedó con `updateUser` duplicada tras un merge y ninguna página podía iniciar sesión; se restauró.
- Se recuperó la guía de contribución (`CONTRIBUTING.md`), que se había borrado por error.

## [1.1.0] - 2026-11-09

### Agregado
- Catálogo de trámites por categoría con buscador (`procedures.html`).
- Detalle de cada trámite con requisitos, tiempo estimado y opción de practicar o hacerlo de verdad (`procedure.html`).
- Guía paso a paso con formulario, revisión de datos y comprobante para descargar o compartir (`guide.html`).
- Trámites frecuentes en el Inicio.
- Edición del perfil del usuario (`profile.html`).

## [1.0.1] - 2026-11-05

### Agregado
- Guía de contribución (`CONTRIBUTING.md`): cómo usar el proyecto y cómo trabajar con ramas, commits y Pull Requests.

## [1.0.0] - 2026-11-05

### Agregado
- Guía de estilos en CSS: colores, tipografía Poppins, espaciado, botones, campos, tarjetas y alertas.
- Landing page responsive con menú hamburguesa: Inicio, Trámites, Comentarios y Ayuda.
- Inicio de sesión con correo y contraseña, y formulario de contacto simulado.
- Registro de usuario con nombre, edad y celular (US-01) y registro por voz (US-02).
- Verificación por código de 6 dígitos con tiempo límite, intentos y reenvío (US-03).
- Pantalla de bienvenida al crear la cuenta.
- Ingreso con celular y código.
- Inicio de la app adaptado de la pantalla móvil US-06, con buscador de trámites.
- Almacenamiento simulado con localStorage (sin backend).

## [0.1.0] - 2026-11-02

### Agregado
- Estructura básica del Landing Page.
