# De la Raíz a la Huella

App de una sola sesión para la actividad de conjunto (punto 3 de la agenda). Ver
`../plan_actividad_evaluando_trayectoria.md` para la especificación funcional completa.

La presentación (`/#/presentacion`) es una sola ventana, sin panel de facilitador aparte,
que recorre en orden:

1. **Bienvenida** — "Bienvenidos equipo al mejor microcentro".
2. **Agenda** — los 4 puntos del encuentro (Oración, Reflexión, el nombre de esta actividad, Evaluación).
3. **Evidencias de aprendizaje** — generadas a partir del diseño completo de la actividad.
4. **Oración** (punto 1 de la agenda) — texto real, extraído de `../Oración.docx`.
5. **Reflexión** (punto 2) — reproduce `public/Reflexión.mp4` con controles nativos del navegador.
6. **Código QR** — recién antes de empezar con las fotos, apunta al formulario para que los profesionales respondan desde su celular.
7. Los 4 momentos de cada profesional (punto 3, en el orden en que enviaron su respuesta).
8. **Evaluación** (punto 4) — indicadores de participación y profundidad de las reflexiones.

Los 4 momentos están definidos en [`src/data/momentos.js`](src/data/momentos.js): Mis raíces
(ya resuelto por el texto de los `.docx`), Mis decisiones, Mi propósito, Mi legado (estos 3 se
preguntan en el formulario) — cada uno se muestra como un título grande, con la pregunta y la
respuesta juntas, sin emojis.

## Pendientes antes de usar esto en la sesión real

1. **Revisa el texto de "Evidencias de aprendizaje"** en [`src/data/agenda.js`](src/data/agenda.js) (`EVIDENCIAS_APRENDIZAJE`) — lo redacté a partir del diseño de la actividad completa, pero no lo definiste tú directamente; ajústalo si no refleja lo que realmente quieres documentar.
2. **La dinámica de Evaluación (punto 4)** — el plan la deja sin definir (sección 14). Por ahora esa pantalla muestra los indicadores de participación y profundidad de reflexión calculados automáticamente; si defines una dinámica distinta, esa pantalla es la que hay que rediseñar.
3. **Materiales** — las 17 carpetas de `../Public/Profesionales` ya tienen sus 4 fotos (Inicio/Medio/Actual/Final) y su texto de bio, incluyendo a Alexander de Jesús Ossa Calvo (su bio no vino en `.docx` sino en un `bio.txt` — `extraer-textos.js` acepta ambos). Solo queda un detalle:
   - **Yeison Suárez Suárez**: su `.docx` existe pero está vacío (sin texto) — `textoInicio` queda en blanco, mostrará "Respuesta pendiente" en el momento 1. Necesita que le pases su bio (puede ser otro `bio.txt` en su carpeta, igual que Alexander).
   - El plan menciona 18 profesionales; solo hay 17 carpetas en total — falta una persona por agregar por completo si existe.

   La app no se rompe por esto: donde falta una foto muestra "Foto pendiente", y donde falta una respuesta del formulario (o texto del bio) muestra "Respuesta pendiente".

## Preparar datos (Fase 1)

Los bios `.docx` y fotos crudas viven en `../Public/Profesionales/<Nombre Completo>/`. Este comando los lee, extrae el texto de cada `.docx`, copia y normaliza las fotos, y genera `public/profesionales/profesionales.json`:

```bash
npm run preparar-datos
```

Se puede volver a correr cuando lleguen materiales nuevos o corregidos — sobreescribe lo generado.

## Backend (Fase 2 — Google Apps Script + Sheets)

1. Abre la hoja de Google Sheets donde se guardarán las respuestas.
2. Extensiones → Apps Script. Pega el contenido de [`apps-script/Code.gs`](apps-script/Code.gs).
3. Implementar → Nueva implementación → tipo "Aplicación web". Ejecutar como "Yo", acceso "Cualquier usuario". Copia la URL `.../exec` que te da.
4. La hoja `Respuestas` se crea sola la primera vez que alguien envía el formulario (o la primera vez que se abre la presentación).
5. Si alguien reenvía el formulario, **se sobreescribe su fila anterior conservando el Timestamp original** (se decidió así porque era un pendiente abierto del plan, sección 6.1 — el orden de la presentación depende de ese Timestamp, así que corregir una respuesta no debe hacer que la persona "salte" en la fila).

## Configurar el frontend

```bash
cp .env.example .env
# edita .env y pon la URL del paso anterior en VITE_APPS_SCRIPT_URL
npm install
npm run dev
```

Rutas de la app (usa `HashRouter`, por eso el `#`):

| Ruta | Para quién | Qué es |
|---|---|---|
| `/#/` | Los 18 profesionales | Formulario de 3 preguntas — mismo estilo visual que la presentación |
| `/#/presentacion` | Proyector | La presentación completa — también es donde el facilitador controla el avance |

Los profesionales no necesitan la URL de memoria: la presentación misma muestra un código QR
(pantalla "Escanea para responder", justo antes de empezar con las fotos) que apunta a `/#/` —
el QR se genera en el navegador con la URL real donde esté corriendo esa instancia (`window.location`),
así que no depende de que sepamos de antemano el dominio final de GitHub Pages.

**No hay panel de facilitador separado.** El propio facilitador controla `/#/presentacion` con
flecha derecha / espacio / clic para avanzar, y flecha izquierda para retroceder — todo desde
la misma ventana que ve la audiencia (útil con una sola pantalla; si hay proyector como
pantalla extendida, el facilitador puede pararse frente a esa ventana y controlarla con el
teclado igual). El orden de las personas **no lo elige el facilitador**: se calcula solo, según
el Timestamp de cuando cada quien envió su formulario. Quien todavía no ha respondido cuando se
abre la presentación queda al final de la fila (en el orden del `profesionales.json`), para que
nadie quede fuera.

## Desplegar a GitHub Pages

```bash
npm run deploy
```

Esto hace `build` y publica `dist/` en la rama `gh-pages` (usa el paquete `gh-pages`). `vite.config.js` usa `base: './'` (rutas relativas) para no depender del nombre del repo.

## Ensayo antes de la sesión real

Antes del día de la actividad: probar con 2-3 nombres de la lista, confirmar que el nombre no aparece en el DOM en "Inicio"/"Medio" (inspeccionar con las herramientas de desarrollador, no solo mirar la pantalla), y ensayar el flujo completo de teclado (avanzar/retroceder) proyectando en la pantalla real que se va a usar.
