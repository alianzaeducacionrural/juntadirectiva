# Actividad de Conjunto: Punto 3 de la agenda
### Documento de planificación — Comité de Cafeteros de Caldas / Área de Educación

> Nombre creativo de la actividad: **pendiente** — lo propondrá Claude Code una vez tenga las 3 preguntas de reflexión, para que el nombre sea coherente con su contenido (ver sección 13).

---

## 1. Resumen del proyecto

Aplicación web de una sola sesión (no permanente) para una actividad de conjunto dirigida a **18 profesionales del equipo**, facilitada en vivo por la Junta Directiva. Al iniciar el punto 3 de la agenda, cada profesional escanea un QR y responde 3 preguntas de reflexión desde su celular. Inmediatamente después, el facilitador va revelando manualmente, uno por uno, la línea de tiempo de cada persona en una pantalla proyectada, combinando fotos con las respuestas recién guardadas.

El nombre de cada profesional permanece oculto hasta la foto "Actual", generando un efecto de descubrimiento dentro del grupo.

---

## 2. Objetivo de la actividad

Propiciar un espacio de reconocimiento colectivo de la trayectoria profesional de cada integrante del equipo, integrando memoria (Inicio), evolución (Medio), presente (Actual) y proyección (Final), a través de una dinámica participativa y visual.

---

## 3. Participantes y roles

| Rol | Descripción |
|---|---|
| **Profesional (18)** | Responde el formulario una única vez desde su celular, al arrancar el punto 3. No vuelve a interactuar con la app. |
| **Facilitador (Junta Directiva)** | Controla manualmente la presentación proyectada durante la sesión (como un mando de diapositivas). |
| **Audiencia (los mismos 18)** | Observa la presentación proyectada, sin dispositivo en mano. |

---

## 4. Flujo funcional

### 4.1 Fase de respuesta (participantes) — *al iniciar el punto 3*

1. Se proyecta **un único código QR** (mismo para los 18) como apertura del punto 3.
2. Al escanear, cada persona llega a un formulario web con:
   - Selector desplegable con los 18 nombres.
   - 3 preguntas de reflexión (**las mismas para todos** — pendientes de definir, ver sección 13).
3. Al enviar, la respuesta se guarda en Google Sheets.
4. La persona cierra la pestaña. No hay más interacción de su parte.

> Nota: no hay actualización en tiempo real hacia ninguna pantalla — el formulario solo escribe datos, no los muestra.

### 4.2 Fase de presentación (facilitador) — *inmediatamente después*

1. El facilitador abre la vista de presentación en un computador conectado al proyector.
2. Tiene un panel de control (no visible para la audiencia o en una segunda pantalla) donde **selecciona a la siguiente persona** a mostrar.
3. Avanza manualmente por 4 etapas, en este orden, por cada persona:

| Etapa | Qué se muestra | ¿Nombre visible? |
|---|---|---|
| 1. Inicio | Imagen `Inicio` + texto del documento | ❌ Oculto |
| 2. Medio | Imagen `Medio` + Respuesta 1 | ❌ Oculto |
| 3. Actual | Imagen `Actual` + Respuesta 2 | ✅ **Se revela aquí** |
| 4. Final | Imagen `Final` + Respuesta 3 | ✅ Visible |

4. Al terminar con una persona, el facilitador vuelve al panel de control y selecciona a la siguiente, repitiendo el ciclo 18 veces.

---

## 5. Reglas de negocio clave

- Las 3 preguntas son **iguales para todos los profesionales**.
- El nombre **no debe renderizarse en el DOM** durante las etapas Inicio y Medio (no solo ocultarse visualmente vía CSS), para evitar que se vea por error al proyectar o al inspeccionar la pantalla.
- El facilitador debe poder **retroceder** una etapa por si se equivoca al avanzar.
- Si una persona no alcanzó a responder el formulario a tiempo, la presentación debe manejar ese caso sin romperse (mostrar un placeholder tipo "Respuesta pendiente").

---

## 6. Modelo de datos

### 6.1 Google Sheet — hoja `Respuestas`

| Columna | Tipo | Ejemplo |
|---|---|---|
| Timestamp | datetime | 2026-07-10 08:15:00 |
| Nombre | texto | "María Fernanda Ríos" |
| Respuesta1 | texto libre | ... |
| Respuesta2 | texto libre | ... |
| Respuesta3 | texto libre | ... |

Cada nombre debería tener **una sola fila** (si alguien reenvía el formulario, decidir si se sobreescribe o se ignora — decisión de Fase 2 con Claude Code).

### 6.2 Datos estáticos por profesional

Como los `.doc` no se pueden leer directamente desde el navegador, se preprocesan **una sola vez** a un archivo `profesionales.json`:

```json
[
  {
    "nombre": "María Fernanda Ríos",
    "textoInicio": "Texto extraído del .doc de Inicio...",
    "carpeta": "maria-fernanda-rios"
  }
]
```

> ⚠️ Nota técnica: si los archivos son `.doc` (formato binario antiguo, no `.docx`), la extracción automática de texto es más difícil. Si es posible, re-guardarlos como `.docx` o `.txt` antes de entregarlos — facilita mucho el script de preparación de datos.

---

## 7. Estructura de carpetas del proyecto

> **Nota técnica:** los archivos que se sirven como recursos estáticos (imágenes) deben vivir dentro de la carpeta `public/` para que Vite los incluya en el build y sean accesibles por URL. Si se ponen literalmente en la raíz del repo (fuera de `public/`), no se empaquetan ni se sirven en producción.

```
proyecto-trayectoria/
├── public/
│   └── profesionales/
│       ├── maria-fernanda-rios/
│       │   ├── Inicio.jpg
│       │   ├── Medio.jpg
│       │   ├── Actual.jpg
│       │   └── Final.jpg
│       ├── ... (18 carpetas en total)
│       └── profesionales.json      ← generado a partir de los .doc
├── src/
│   ├── components/
│   │   ├── Formulario.jsx
│   │   ├── Presentacion.jsx
│   │   └── PanelControl.jsx
│   ├── data/
│   │   └── preguntas.js            ← pendiente, se completa en Claude Code
│   ├── services/
│   │   └── sheetsApi.js
│   ├── App.jsx
│   └── main.jsx
├── scripts/
│   └── extraer-textos.js          ← script de preparación (Fase 1)
├── apps-script/
│   └── Code.gs                    ← Web App de Google Apps Script
├── index.html
└── vite.config.js
```

---

## 8. Arquitectura técnica

- **Frontend:** React + Vite, desplegado en GitHub Pages.
- **Backend/API:** Google Apps Script (Web App) con dos rutas funcionales:
  - `doPost`: recibe y guarda una respuesta del formulario.
  - `doGet`: entrega todas las respuestas guardadas (la presentación las carga una vez, al arrancar).
- **Base de datos:** Google Sheets (hoja `Respuestas`).
- **Datos estáticos:** `profesionales.json` + imágenes en `public/profesionales/`.

No se requiere tiempo real (WebSockets / Firebase) porque el formulario y la presentación están desacoplados: se responde primero, se presenta después, dentro del mismo bloque de agenda pero sin sincronización en vivo.

---

## 9. Componentes principales de la aplicación

| Componente | Función |
|---|---|
| `Formulario.jsx` | Selector de nombre + 3 preguntas + envío a Apps Script |
| `PanelControl.jsx` | Vista privada del facilitador: selecciona persona, botones Anterior/Siguiente etapa |
| `Presentacion.jsx` | Vista proyectada: renderiza imagen + texto/respuesta según etapa activa; controla si el nombre se muestra |
| `sheetsApi.js` | Wrapper de fetch hacia el Web App de Apps Script (POST y GET) |

---

## 10. Contrato de API (Google Apps Script)

**POST** `/exec` (guardar respuesta)
```json
// Request
{ "nombre": "María Fernanda Ríos", "respuesta1": "...", "respuesta2": "...", "respuesta3": "..." }

// Response
{ "status": "ok" }
```

**GET** `/exec` (obtener todas las respuestas, usado por la presentación)
```json
// Response
[
  { "nombre": "María Fernanda Ríos", "respuesta1": "...", "respuesta2": "...", "respuesta3": "..." }
]
```

---

## 11. Indicadores sugeridos

1. **Indicador de participación:** `(N.º de profesionales que respondieron el formulario / 18) × 100`. Mide cobertura real de la actividad.
2. **Indicador de completitud de reflexión:** proporción de respuestas que superan cierta extensión mínima frente al total de respuestas recibidas — como proxy de profundidad de la reflexión.

Si el punto 4 (Evaluación) de la agenda contempla algún indicador cualitativo adicional, se integra cuando retomes ese punto.

---

## 12. Roadmap de implementación

**Fase 1 — Preparación de datos**
Script para extraer nombre + texto de cada `.doc` → `profesionales.json`. Organizar las 18 carpetas de imágenes en `public/profesionales/`.

**Fase 2 — Backend (Apps Script + Sheets)**
Crear la hoja `Respuestas`. Implementar `doPost` y `doGet` en `Code.gs`. Desplegar como Web App.

**Fase 3 — Formulario**
Construir `Formulario.jsx`: selector de nombre, 3 preguntas, validación básica, conexión al `doPost`.

**Fase 4 — Presentación + Panel de control**
Construir `PanelControl.jsx` y `Presentacion.jsx`. Lógica de las 4 etapas por persona y la regla de nombre oculto hasta "Actual".

**Fase 5 — Pruebas y despliegue**
Probar con 2-3 profesionales de prueba. Desplegar en GitHub Pages. Ensayo completo con el facilitador antes de la sesión real.

---

## 13. Pendientes que se resuelven directamente en Claude Code

- **Las 3 preguntas de reflexión** — Alejo las define directamente en Claude Code.
- **Nombre creativo de la actividad** — Claude Code debe proponerlo una vez reciba las 3 preguntas, buscando coherencia temática con ellas (no un nombre genérico).
- **Imágenes y archivos `.doc`/`.docx`** de cada una de las 18 personas.

## 14. Pendientes fuera de este documento (agenda general)

- Punto 2 — Reflexión: falta el enlace del video.
- Punto 4 — Evaluación: falta definir la dinámica.

---

## 15. Prompt de traspaso para Claude Code

```
Necesito que construyas una aplicación web para una actividad de conjunto (punto 3 de una agenda institucional), dirigida a un equipo de 18 profesionales. Aún no tiene nombre definitivo.

STACK: React + Vite, Google Apps Script como backend, Google Sheets como base de datos, despliegue en GitHub Pages.

CONTEXTO Y LÓGICA COMPLETA: toda la especificación funcional, el modelo de datos, el contrato de API, la estructura de carpetas y el roadmap de fases están en el documento adjunto "plan_actividad_evaluando_trayectoria.md". Léelo completo antes de empezar y sigue esa estructura de carpetas tal cual está definida ahí (especialmente la ubicación de imágenes dentro de public/profesionales/, no en la raíz, por la restricción de Vite explicada en la sección 7).

Te voy a pasar directamente:
- Las 3 preguntas de reflexión que van a responder los 18 profesionales.
- Las imágenes y archivos de texto de cada persona.

Con las 3 preguntas, quiero que me propongas un nombre creativo para la actividad, coherente con el contenido y el tono de esas preguntas (no algo genérico) — antes de seguir con el desarrollo.

Trabajemos fase por fase, en este orden:
1. Preparación de datos (script para extraer texto de los .doc a profesionales.json)
2. Backend en Apps Script (Code.gs con doPost y doGet)
3. Formulario (Formulario.jsx)
4. Panel de control + Presentación (PanelControl.jsx y Presentacion.jsx)
5. Pruebas y despliegue

Reglas de negocio no negociables:
- El nombre de la persona NO debe aparecer en el DOM durante las etapas "Inicio" y "Medio" — solo debe renderizarse a partir de la etapa "Actual".
- Las 3 preguntas son las mismas para los 18 profesionales.
- El facilitador controla el avance manualmente (no hay tiempo real ni auto-avance).
- Debe existir un botón para retroceder una etapa por si el facilitador se equivoca.

Antes de escribir código, confírmame que entendiste la estructura completa del documento. Luego te paso las 3 preguntas para que me propongas el nombre, y después seguimos con la Fase 1.
```
