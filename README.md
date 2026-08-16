# Tateti Arcade 3D

Tres en Raya (Tic-Tac-Toe) arcade retro 3D, multitablero y con IA. Construido con Vite + React + React Three Fiber.

## Funcionalidades

- Tableros 3x3 (alinea 3), 4x4 y 5x5 (alinea 4)
- Modos PvP (local) y PvE (contra IA)
- IA con dificultades Fácil / Medio / Difícil (Minimax + alfa-beta, con límite de profundidad para tableros grandes)
- Escena 3D estilo arcade: luces de neón, bloom, scanlines, aberración cromática, vignette
- FX de audio retro sintetizados con Web Audio (colocar ficha, hover, victoria/derrota, moneda, ambiente)
- Marcador persistente (X / O / Empates) en localStorage
- Fichas 3D animadas con pop-in y línea ganadora luminosa
- Respeto de `prefers-reduced-motion`
- Code-splitting de la librería three (chunk separado)

## Stack

Vite 8 · React 19 · React Three Fiber · drei · postprocessing · TailwindCSS 4 · oxlint

## Scripts

```bash
npm install     # instalar dependencias
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run preview # previsualizar build
npm run lint    # oxlint
```

## Despliegue

### GitHub Pages

El repositorio incluye un workflow (`.github/workflows/deploy.yml`) que compila y publica en GitHub Pages en cada push a `main`.

1. En GitHub: **Settings → Pages → Source: "GitHub Actions"**.
2. Push a `main` (o dispara manualmente el workflow desde la pestaña Actions).
3. La app queda en `https://<usuario>.github.io/tateti-game/`.

### Vercel

1. Importa el repositorio en https://vercel.com/new.
2. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
3. Sin variable de entorno extra (base default `/`). Deploy automático en cada push.

> Nota: si el build necesita un base path distinto (subruta), usar `VITE_BASE_PATH=/tu/ruta/`.
