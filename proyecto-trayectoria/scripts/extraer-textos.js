// Fase 1 — Preparación de datos.
// Lee las carpetas crudas en `../Public/Profesionales` (bios en .docx + fotos por etapa),
// extrae el texto de cada .docx y copia las imágenes normalizadas a
// public/profesionales/<carpeta>/, generando public/profesionales/profesionales.json.
//
// Uso: npm run preparar-datos

import { readdir, mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ_PROYECTO = path.resolve(__dirname, '..');
const CARPETA_CRUDA = path.resolve(RAIZ_PROYECTO, '..', 'Public', 'Profesionales');
const CARPETA_DESTINO = path.join(RAIZ_PROYECTO, 'public', 'profesionales');

// Nombre de archivo (sin extensión, en minúsculas) -> nombre de etapa estándar.
// "media" cubre la variante mal escrita que aparece en varias carpetas crudas.
const ETAPAS = {
  inicio: 'Inicio',
  medio: 'Medio',
  media: 'Medio',
  actual: 'Actual',
  final: 'Final',
};

const EXTENSIONES_IMAGEN = new Set(['.jpg', '.jpeg', '.png']);

function slugify(nombre) {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function extraerTextoDocx(rutaDocx) {
  const { value } = await mammoth.extractRawText({ path: rutaDocx });
  return value.replace(/\s+/g, ' ').trim();
}

function normalizarPalabra(palabra) {
  return palabra
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function distanciaLevenshtein(a, b) {
  const filas = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) filas[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      filas[i][j] = Math.min(filas[i - 1][j] + 1, filas[i][j - 1] + 1, filas[i - 1][j - 1] + costo);
    }
  }
  return filas[a.length][b.length];
}

// true si "palabra" parece ser el mismo nombre que alguno de los tokens del
// nombre de carpeta, tolerando errores de tipeo/transliteración entre el
// .docx y el nombre de la carpeta (ej. "Heli" vs "Hely").
function pareceNombre(palabra, tokensNombre) {
  if (palabra.length < 3) return false;
  for (const token of tokensNombre) {
    const distanciaMaxima = token.length <= 4 ? 1 : 2;
    if (distanciaLevenshtein(palabra, token) <= distanciaMaxima) return true;
  }
  return false;
}

// Los bios en .docx suelen empezar repitiendo el nombre de la persona
// (ej. "Carolina Gallego Desde pequeña soñé..."). Como el texto de "Inicio"
// se muestra en pantalla ANTES de que el nombre deba revelarse (sección 5
// del plan), hay que quitar ese prefijo o el nombre se ve igual, aunque
// nunca se renderice como <h2> aparte.
function quitarNombreInicial(texto, nombreCarpeta) {
  const tokensNombre = new Set(nombreCarpeta.split(/\s+/).map(normalizarPalabra));
  const palabras = texto.split(' ');
  const TOPE_SEGURIDAD = 4;
  let i = 0;
  while (i < palabras.length && i < TOPE_SEGURIDAD && pareceNombre(normalizarPalabra(palabras[i]), tokensNombre)) {
    i++;
  }
  return palabras.slice(i).join(' ');
}

async function procesarPersona(nombreCarpeta) {
  const rutaOrigen = path.join(CARPETA_CRUDA, nombreCarpeta);
  const archivos = await readdir(rutaOrigen);

  const archivoDocx = archivos.find((f) => f.toLowerCase().endsWith('.docx'));
  // Si no hay .docx (ej. Alexander), un .txt sirve igual como fuente del bio.
  const archivoTxt = archivos.find((f) => f.toLowerCase().endsWith('.txt'));
  const carpeta = slugify(nombreCarpeta);
  const rutaDestino = path.join(CARPETA_DESTINO, carpeta);
  await mkdir(rutaDestino, { recursive: true });

  let textoInicio = '';
  if (archivoDocx) {
    const textoCrudo = await extraerTextoDocx(path.join(rutaOrigen, archivoDocx));
    textoInicio = quitarNombreInicial(textoCrudo, nombreCarpeta);
  } else if (archivoTxt) {
    const textoCrudo = (await readFile(path.join(rutaOrigen, archivoTxt), 'utf-8')).replace(/\s+/g, ' ').trim();
    textoInicio = quitarNombreInicial(textoCrudo, nombreCarpeta);
  } else {
    console.warn(`  ⚠ ${nombreCarpeta}: no tiene archivo .docx ni .txt, textoInicio quedará vacío.`);
  }

  const etapasEncontradas = {};
  for (const archivo of archivos) {
    const ext = path.extname(archivo).toLowerCase();
    if (!EXTENSIONES_IMAGEN.has(ext)) continue;
    const base = path.basename(archivo, ext).toLowerCase();
    const etapa = ETAPAS[base];
    if (!etapa) continue;
    await copyFile(path.join(rutaOrigen, archivo), path.join(rutaDestino, `${etapa}${ext}`));
    etapasEncontradas[etapa] = `${etapa}${ext}`;
  }

  for (const etapa of ['Inicio', 'Medio', 'Actual', 'Final']) {
    if (!etapasEncontradas[etapa]) {
      console.warn(`  ⚠ ${nombreCarpeta}: falta la imagen de la etapa "${etapa}".`);
    }
  }

  return {
    nombre: nombreCarpeta,
    textoInicio,
    carpeta,
    imagenes: etapasEncontradas,
  };
}

async function main() {
  await mkdir(CARPETA_DESTINO, { recursive: true });

  const entradas = await readdir(CARPETA_CRUDA, { withFileTypes: true });
  const carpetasPersonas = entradas.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  console.log(`Encontradas ${carpetasPersonas.length} carpetas en ${CARPETA_CRUDA}\n`);

  const profesionales = [];
  for (const nombreCarpeta of carpetasPersonas) {
    const rutaOrigen = path.join(CARPETA_CRUDA, nombreCarpeta);
    const contenido = await readdir(rutaOrigen).catch(() => []);
    if (contenido.length === 0) {
      console.warn(`⚠ ${nombreCarpeta}: carpeta vacía, sin foto ni texto todavía (se incluye igual).`);
    }
    console.log(`Procesando: ${nombreCarpeta}`);
    profesionales.push(await procesarPersona(nombreCarpeta));
  }

  const rutaJson = path.join(CARPETA_DESTINO, 'profesionales.json');
  await writeFile(rutaJson, JSON.stringify(profesionales, null, 2), 'utf-8');

  console.log(`\n✔ Generado ${rutaJson} con ${profesionales.length} profesionales.`);
  if (profesionales.length !== 18) {
    console.warn(
      `⚠ El plan espera 18 profesionales; se encontraron ${profesionales.length} carpetas con contenido. ` +
        'Revisa si faltan materiales por entregar (ver CLAUDE.md).'
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
