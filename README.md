# Aprendiendo con Sentido

Plataforma de Matemáticas y Física para colegios de desempeño académico
superior. El docente elige área y tema (texto libre); la IA genera una ruta
pedagógica de nivel alto: 2 preguntas de predicción, 2 escenarios de
exploración, una explicación formal (fórmulas en LaTeX, gráfica cuando aplica,
analogía con la vida cotidiana del estudiante) y 5 ejercicios que escalan en
la taxonomía de Bloom, los últimos de transferencia a otro contexto. Todo el
contenido dinámico usa una cascada cache → IA (Gemini) → contenido local.

## Stack

- **Frontend:** Vite + React 18 + TypeScript + Tailwind + Framer Motion + React Query + Zustand.
- **Backend:** funciones serverless de Vercel en `api/` (Node.js), sin servidor propio que mantener.
- **IA:** Google Gemini (`@google/genai`), solo desde el backend — la API key nunca llega al navegador.

## Cómo funciona el contenido (cascada)

Cada pieza de contenido dinámico sigue el mismo patrón en 3 niveles:

1. **Cache** (IndexedDB, 30 días) — evita repetir llamadas a la IA para el mismo tema.
2. **API propia** (`api/*`, que a su vez llama a Gemini) — si `GEMINI_API_KEY` no está configurada, responde 503.
3. **Contenido local** (`src/data/*`) — siempre disponible, así el backend nunca sea un punto único de falla.

Esto aplica a: preguntas de predicción, escenarios de exploración,
formalización (resumen, fórmulas, analogía y gráfica) y ejercicios generados.

## Desarrollo local

```bash
npm install
npm run dev
```

Con `npm run dev` (Vite solo) las rutas `/api/*` no existen todavía, así que
todo el contenido dinámico cae a su versión local — es normal y esperado, no
un error. Para probar el backend real en local:

```bash
npm install -g vercel   # una vez
vercel dev
```

Copia `.env.example` a `.env` y completa `GEMINI_API_KEY` si quieres probar la
generación real con IA en local.

## Variables de entorno

Ver `.env.example` para la lista completa y comentada. Las importantes:

| Variable | Dónde se usa | Notas |
|---|---|---|
| `GEMINI_API_KEY` | Solo servidor (`api/`) | **Nunca** le pongas prefijo `VITE_` — se filtraría al navegador. |
| `GEMINI_MODEL` | Solo servidor | Por defecto `gemini-3.6-flash` (nivel gratuito). |
| `VITE_ENABLE_LOCAL_FALLBACK` | Frontend | Déjalo en `true`; es la razón por la que la app nunca se rompe sin backend. |

## Desplegar en Vercel

1. Importa el repo de GitHub en [vercel.com/new](https://vercel.com/new) — Vercel detecta Vite automáticamente (build `npm run build`, output `dist/`) y las funciones en `api/`.
2. En **Project Settings → Environment Variables**, agrega `GEMINI_API_KEY` (y opcionalmente `GEMINI_MODEL`).
3. Deploy. No hace falta configurar nada más: frontend y backend quedan en el mismo dominio.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Typecheck + build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Solo TypeScript, sin build |
| `npm run preview` | Sirve el build de producción localmente |
