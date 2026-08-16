# Tests E2E y capturas (Playwright)

Los tests E2E automatizan el juego real en un navegador **Chromium** (headless), interactúan con el tablero 3D clicando las celdas y toman las capturas de pantalla de la galería del [README](./README.md).

## ¿Qué hacen?

| # | Test | Captura |
|---|------|---------|
| 1 | Carga el tablero inicial 3x3 | `1-inicio-3x3.png` |
| 2 | Partida PvP a mitad de juego (7 fichas) | `2-midgame-3x3.png` |
| 3 | VS IA en dificultad **Difícil** | `3-vs-ia-dificil.png` |
| 4 | Tablero 4x4 con fichas | `4-tablero-4x4.png` |
| 5 | Tablero 5x5 con fichas | `5-tablero-5x5.png` |
| 6 | Juega una línea y verifica el cartel `PLAYER X WINS` | `6-victoria-x.png` |
| 7 | VS IA Difícil jugando mal hasta que la IA gana → `GAME OVER` | `7-game-over-ia.png` |

Las capturas se guardan en `screenshots/` y se regeneran en cada corrida.

## ¿Cómo hace clic sobre las celdas 3D?

Los clics del ratón (API de Playwright) no saben dónde está cada celda del tablero 3D. Por eso `tests/e2e/game.spec.js` calcula la **proyección cámara → píxel**:

1. Con la cámara de la escena (posición `(8,7,10)`, target `(0,0.5,0)`, FOV 45°) construye las bases `forward/right/up`.
2. Proyecta el centro de cada celda (coordenadas del mundo 3D) a coordenadas de pantalla (NDC → píxeles CSS).
3. Emite un clic real en esas coordenadas sobre el `<canvas>`.

La cámara no se mueve durante los clics (se rota **después**, con un drag tipo OrbitControls, para conseguir la perspectiva 3/4 de las capturas).

## Correr los tests

```bash
npm install                    # si no lo hiciste
npx playwright install chromium # la primera vez
npm run test:e2e
```

Detalles de la config (`playwright.config.js`):

- **Servidor:** corre `npm run preview` (build de producción) en el puerto `4173`. Requiere `npm run build` previo si cambió el código.
- **Viewport:** 1152×720.
- **`?nofx`:** la app soporta el query param `nofx` que desactiva postprocessing y sombras. En headless (WebGL por software / SwiftShader) renderizar Bloom + ChromaticAberration por frame es muy lento; sin FX los tests corren ~5-10× más rápido.
- **Tiempos:** cada test tolera hasta 120s (el primer test compila shaders y es el más lento).
- **Mute de audio:** los tests no usan el toggle de sonido; los sonidos se emiten pero en headless no hay reproducción real.

## Artefactos

- `screenshots/` — capturas generadas (commiteadas para la galería del README).
- `test-results/` y `playwright-report/` — resultados/traces de fallos (gitignored).
