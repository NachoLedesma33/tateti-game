# Prompt de Desarrollo: Tateti Arcade 3D Multitablero

Actúa como un **Desarrollador Full Stack Senior** y **UX/UI Designer especializado en estilo Arcade Retro 3D**. Tu objetivo es guiarme paso a paso en la creación desde cero de una aplicación web de Tateti (Tres en Raya / Tic-Tac-Toe) avanzada, estilizada y completamente funcional.

Debes darme las instrucciones precisas paso a paso, incluyendo los comandos de terminal, el código completo de cada archivo (sin omitir nada ni usar comentarios tipo `// ... resto del código`), y las decisiones arquitectónicas.

---

## 🛠️ Especificaciones Técnicas y Stack

* **Framework de construcción:** Vite + React (o Vanilla JS con Three.js / React Three Fiber).
* **Control de Versiones:** Git (con commits frecuentes en cada hito finalizado).
* **Estilo Visual:** **Arcade 3D Retro / Cyberpunk Neo-Arcade**. Incorpora luces de neón, texturas de mueble arcade, sombras dynamic 3D, perspectiva cinemática y efectos retro (GLSL shaders de scanlines o glow opcionales).
* **Lógica de Juego:**
  * **Tableros Disponibles:**
    * 3x3 (Alinea 3)
    * 4x4 (Alinea 4)
    * 5x5 (Alinea 4 o 5)
  * **Modos de Juego:**
    * Jugador vs. Jugador (Local)
    * Jugador vs. IA
  * **Niveles de Dificultad para la IA:**
    * **Fácil:** Movimientos aleatorios con baja probabilidad de bloqueo.
    * **Medio:** Bloquea victorias inmediatas y busca ganar si tiene la oportunidad.
    * **Difícil (Imposible):** Algoritmo Minimax / Alfa-Beta Pruning adaptado según la dimensión del tablero.
* **Audio y FX:** Sonidos retro tipo 8-bit/synthwave para interacciones, colocar ficha y victoria/derrota.

---

## 🚀 Hoja de Ruta Paso a Paso

Sigue las etapas en orden estricto. Al finalizar cada paso, proporciona el comando exacto para realizar el `git commit` correspondiente con un mensaje descriptivo siguiendo el estándar *Conventional Commits*.

### Paso 1: Inicialización del Proyecto y Repositorio Git
1. Inicializa el proyecto con Vite (`npm create vite@latest`).
2. Configura e inicializa el repositorio local de **Git**.
3. Instala las dependencias necesarias: Three.js, React Three Fiber, Drei, Lucide React (o bibliotecas equivalentes para UI/3D) y TailwindCSS para la interfaz de usuario estilo arcade.
4. Crea el primer commit: `feat: initialize project with vite and install dependencies`.

### Paso 2: Configuración de la Escena 3D y Estética Arcade
1. Crea la escena básica 3D con cámara orbital restringida, luces de neón (púrpura, cian, rosa) y un entorno que simule una máquina máquina arcade o mesa iluminada.
2. Agrega efectos de post-procesamiento (Bloom/Glow, Scanlines retro).
3. Agrega sonido para el ambiente arcade.
4. Realiza el commit: `feat: setup 3d arcade scene and lighting`.

### Paso 3: Motor del Juego y Generación Dinámica de Tableros
1. Implementa la lógica para renderizar tableros dinámicos en 3D según la dimensión seleccionada (3x3, 4x4, 5x5).
2. Representa las casillas como celdas 3D interactivas que respondan al pasar el cursor (hover effect con luces neón).
3. Implementa las fichas 3D (ej. Esferas/Neon O para el 'O' y Estructuras Cruzadas Neon para las 'X').
4. Realiza el commit: `feat: implement dynamic 3d board rendering and mesh pieces`.

### Paso 4: Lógica de Condición de Victoria y Reglas
1. Diseña la función evaluadora para verificar líneas horizontales, verticales y diagonales dinámicamente según la regla de victoria del tamaño del tablero seleccionado (ej. 3 en racha para 3x3; 4 en racha para 4x4 y 5x5).
2. Resalta en 3D la línea o casillas ganadoras mediante una animación luminosa.
3. Realiza el commit: `feat: add game logic and win condition evaluator`.

### Paso 5: Inteligencia Artificial (Fácil, Media, Difícil)
1. Desarrolla el módulo de la IA.
2. Implementa **Fácil** (random selection).
3. Implementa **Medio** (heuristic/bloqueo directo).
4. Implementa **Difícil** (Minimax optimizado con limitación de profundidad para tableros grandes de 4x4 y 5x5 para garantizar rendimiento en tiempo real).
5. Realiza el commit: `feat: integrate ai bot with easy, medium, and hard difficulties`.

### Paso 6: UI Arcade Overlay y Menús de Selección
1. Diseña una interfaz 2D flotante/HUD estilo pantalla de arcade retro (con tipografía pixel art/neon).
2. Incluye selectores para:
   * Tamaño del tablero (3x3, 4x4, 5x5).
   * Modo de juego (PvP o PvE).
   * Dificultad de la IA.
3. Marcador de puntajes (X Wins, O Wins, Ties) y botón de Reiniciar / Insert Coin.
4. Realiza el commit: `feat: add arcade HUD, menus, and score tracking`.

### Paso 7: Efectos de Sonido, Pulido Visual y Optimizaciones
1. Integra efectos de audio Web Audio API o Howler.js para efectos de sonido retro al hacer clic, ganar o perder.
2. Ajusta las sombras, rendimiento de FPS y responsividad de la pantalla.
3. Realiza el commit: `feat: add audio fx, visual polish and performance fixes`.

### Paso 8: Instrucciones para Publicación en Repositorio Remoto (GitHub)
1. Muestra cómo crear el repositorio remoto en GitHub.
2. Proporciona los comandos para vincular el repositorio local y realizar el `git push -u origin main`.
3. Proporciona las instrucciones para desplegar la aplicación en Vercel o GitHub Pages.

---

**Empieza por el PASO 1.** Dame los comandos y código exactos para arrancar la estructura inicial.