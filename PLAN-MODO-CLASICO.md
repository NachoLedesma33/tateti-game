# Plan: Modo Clásico (Movimiento de Fichas) + Auto-Draw Detection

## Resumen

Agregar un segundo modo de juego llamado **"CLÁSICO"** donde los jugadores comienzan con N fichas en el tablero (N = tamaño del tablero) y las mueven por click-to-move en vez de colocar nuevas cada turno. El modo actual pasa a llamarse **"ESTÁNDAR"**. Además, implementar **auto-draw detection** y cambiar el tablero 5×5 por **6×6** (alinear 6).

---

## Tableros

| Board | Win condition | Fichas/jugador | Celdas vacías al inicio | Diagonales principales |
|---|---|---|---|---|
| 3×3 | alinear 3 | 3 | 3 | `[0,4,8]`, `[2,4,6]` |
| 4×4 | alinear 4 | 4 | 8 | `[0,5,10,15]`, `[3,6,9,12]` |
| 6×6 | alinear 6 | 6 | 24 | `[0,7,14,21,28,35]`, `[5,10,15,20,25,30]` |

---

## 1. Nombres de los Modos

| Selector | Opciones |
|---|---|
| GAME MODE | ESTÁNDAR · CLÁSICO |
| PLAY MODE | PvP · VS AI |
| DIFFICULTY | EASY · MED · HARD (solo si VS AI) |
| BOARD | 3×3 · 4×4 · 6×6 |

---

## 2. Modo Clásico — Lógica del Juego

### 2.1 Dos fases

#### Fase 1: Colocación (Placement Phase)
- Cada jugador tiene un **pool** de fichas por colocar (= `size` fichas).
- Se colocan una por turno haciendo click en una celda vacía.
- **Se verifica victoria durante esta fase** (Opción A — fiel al tatetí clásico).
- Cuando ambos pool = 0, comienza la fase de movimiento.

#### Fase 2: Movimiento (Movement Phase)
- Click-to-move (no drag & drop):
  1. Click en ficha propia → se ilumina (selectedPiece).
  2. Click en celda válida destino → se ejecuta el movimiento.
  3. Click en otra ficha propia → cambia selección.
  4. Click en celda inválida / fuera → deselect.

### 2.2 Reglas de movimiento

- Solo se mueven fichas propias.
- Solo a celdas **vacías**.
- No se "comen" fichas del oponente.
- Se verifica victoria después de cada movimiento.

### 2.3 Adyacencia (regla especial diagonal)

**Regla general**: ortogonal = diferencia de 1 en fila O columna, nunca ambas.

**Excepción diagonal**: las celdas que pertenecen a las **diagonales principales** del tablero pueden mover diagonalmente (a otras celdas diagonales adyacentes).

```javascript
// Diagonales principales del tablero
const DIAGONALS = {
  3: [[0,4,8], [2,4,6]],
  4: [[0,5,10,15], [3,6,9,12]],
  6: [[0,7,14,21,28,35], [5,10,15,20,25,30]],
}

function isOnDiagonal(index, size) {
  const diags = DIAGONALS[size]
  return diags.some(d => d.includes(index))
}

function isAdjacent(from, to, size) {
  const r1 = Math.floor(from / size), c1 = from % size
  const r2 = Math.floor(to / size), c2 = to % size
  const dr = Math.abs(r1 - r2), dc = Math.abs(c1 - c2)

  // Ortogonal
  if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) return true

  // Diagonal (solo si ambas celdas están en la misma diagonal principal)
  if (dr === 1 && dc === 1) {
    const onDiag = DIAGONALS[size]
    return onDiag.some(d => d.includes(from) && d.includes(to))
  }

  return false
}
```

### Ejemplo 3×3
```
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
```
| Celda | Movimientos válidos |
|---|---|
| 1 (diag) | → 2 (der), → 4 (aba), → 5 (diag) |
| 2 (no diag) | → 1 (izq), → 3 (der), → 5 (aba) |
| 3 (diag) | → 2 (izq), → 6 (aba), → 5 (diag) |
| 4 (no diag) | → 1 (arr), → 5 (der), → 7 (aba) |
| 5 (ambas) | → 2,4,6,8 (ort) + → 1,3,7,9 (diag) |
| 6 (no diag) | → 3 (arr), → 5 (izq), → 9 (aba) |
| 7 (diag) | → 4 (arr), → 8 (der), → 5 (diag) |
| 8 (no diag) | → 7 (izq), → 5 (arr), → 9 (der) |
| 9 (diag) | → 8 (izq), → 6 (arr), → 5 (diag) |

---

## 3. Auto-Draw Detection

### 3.1 Concepto
Cuando quedan celdas vacías pero **ningún jugador puede formar una línea ganadora**, se rellenan automáticamente y se declara empate.

### 3.2 Algoritmo
```javascript
export function canAnyoneWin(board, size) {
  const lines = getWinningLines(size)
  const win = BOARD_CONFIGS[size].win
  for (const line of lines) {
    let xCount = 0, oCount = 0, emptyCount = 0
    for (const i of line) {
      if (board[i] === 'X') xCount++
      else if (board[i] === 'O') oCount++
      else emptyCount++
    }
    if (oCount === 0 && xCount + emptyCount >= win) return true
    if (xCount === 0 && oCount + emptyCount >= win) return true
  }
  return false
}
```

### 3.3 Cuándo verificar
- **Ambos modos**: después de cada turno, tras `checkWinner()` y antes de `isBoardFull()`.

### 3.4 Comportamiento visual
1. Celdas vacías se rellenan alternando X/O con animación secuencial (150ms/celda).
2. Banner de empate (`WinBanner` con `kind='draw'`).
3. Sonido de empate.

---

## 4. Estado en `App.jsx`

```javascript
const [gameMode, setGameMode] = useState('standard')   // 'standard' | 'classic'
const [phase, setPhase] = useState('placement')         // 'placement' | 'movement'
const [pool, setPool] = useState({ X: 0, O: 0 })       // fichas restantes por colocar
const [selectedPiece, setSelectedPiece] = useState(null) // índice seleccionado
const [placed, setPlaced] = useState({ X: 0, O: 0 })   // fichas colocadas
```

### resetGameClassic
```javascript
function resetGameClassic(nextSize = size) {
  setSize(nextSize)
  setBoard(createEmptyBoard(nextSize))
  setCurrentPlayer('X')
  setWinner(null)
  setWinningLine(null)
  setDraw(false)
  setGameMode('classic')
  setPhase('placement')
  setPool({ X: nextSize, O: nextSize })
  setPlaced({ X: 0, O: 0 })
  setSelectedPiece(null)
}
```

---

## 5. HUD (ArcadeHUD.jsx)

### 5.1 Selector de Game Mode
```jsx
<Segmented
  label="Game Mode"
  options={[
    { value: 'standard', label: 'ESTÁNDAR' },
    { value: 'classic', label: 'CLÁSICO' },
  ]}
  value={gameMode}
  onChange={onGameMode}
/>
```

### 5.2 Indicador de fase (solo en clásico)
```jsx
{gameMode === 'classic' && (
  <p className="font-pixel text-[8px] text-purple-300/60">
    {phase === 'placement'
      ? `PLACE PIECE (${pool[currentPlayer]} LEFT)`
      : 'MOVE YOUR PIECE'}
  </p>
)}
```

### 5.3 Pool display
```
X: ●●●○○  (3 de 5 colocadas)
O: ●●○○○  (2 de 5 colocadas)
```

### 5.4 Indicador de ficha seleccionada
En fase de movimiento:
- Ficha seleccionada brilla más intensamente.
- Celdas válidas destino se iluminan en verde.

---

## 6. Board3D.jsx

### 6.1 Nuevas props
`selectedPiece`, `validMoves`, `gameMode`, `phase`

### 6.2 Highlight selección
- Ficha seleccionada: `emissiveIntensity` elevado + ligera elevación en Y.
- Celdas válidas destino: `CellPlate` con color verde en vez de púrpura.

### 6.3 Click-to-move en cell click
```javascript
if (gameMode === 'classic' && phase === 'movement') {
  if (selectedPiece === null) {
    if (board[index] === currentPlayer) {
      setSelectedPiece(index)
    }
  } else {
    if (board[index] === null && isAdjacent(selectedPiece, index, size)) {
      movePiece(selectedPiece, index)
      setSelectedPiece(null)
    } else if (board[index] === currentPlayer) {
      setSelectedPiece(index)
    } else {
      setSelectedPiece(null)
    }
  }
}
```

---

## 7. AI en Modo Clásico (ai.js)

### 7.1 Fase de colocación
Usa `getAIMove()` actual (minimax con celdas vacías). Sin cambios.

### 7.2 Fase de movimiento
Nueva función `getAIMoveClassic()`:

```javascript
function getValidMoves(board, size, player) {
  const moves = []
  board.forEach((cell, index) => {
    if (cell === player) {
      const r = Math.floor(index / size), c = index % size
      // Ortogonal
      const candidates = []
      if (r > 0) candidates.push(index - size)
      if (r < size - 1) candidates.push(index + size)
      if (c > 0) candidates.push(index - 1)
      if (c < size - 1) candidates.push(index + 1)
      // Diagonal (solo si ambas en diagonal principal)
      if (r > 0 && c > 0 && isAdjacent(index, index - size - 1, size))
        candidates.push(index - size - 1)
      if (r > 0 && c < size - 1 && isAdjacent(index, index - size + 1, size))
        candidates.push(index - size + 1)
      if (r < size - 1 && c > 0 && isAdjacent(index, index + size - 1, size))
        candidates.push(index + size - 1)
      if (r < size - 1 && c < size - 1 && isAdjacent(index, index + size + 1, size))
        candidates.push(index + size + 1)

      for (const dest of candidates) {
        if (board[dest] === null) moves.push({ from: index, to: dest })
      }
    }
  })
  return moves
}
```

### 7.3 Minimax adaptado
```javascript
function minimaxClassic(board, size, depth, alpha, beta, maximizing, aiPlayer, human, maxDepth) {
  const result = checkWinner(board, size)
  if (result.winner === aiPlayer) return 1000000 - depth
  if (result.winner === human) return -1000000 + depth
  if (isBoardFull(board)) return 0
  if (!canAnyoneWin(board, size)) return 0

  const player = maximizing ? aiPlayer : human
  const moves = getValidMoves(board, size, player)
  if (moves.length === 0) return 0

  if (depth >= maxDepth) return evaluate(board, size, aiPlayer)

  if (maximizing) {
    let best = -Infinity
    for (const { from, to } of moves) {
      const copy = [...board]
      copy[to] = copy[from]
      copy[from] = null
      best = Math.max(best, minimaxClassic(copy, size, depth + 1, alpha, beta, false, aiPlayer, human, maxDepth))
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  }

  let best = Infinity
  for (const { from, to } of moves) {
    const copy = [...board]
    copy[to] = copy[from]
    copy[from] = null
    best = Math.min(best, minimaxClassic(copy, size, depth + 1, alpha, beta, true, aiPlayer, human, maxDepth))
    beta = Math.min(beta, best)
    if (beta <= alpha) break
  }
  return best
}
```

### 7.4 Profundidad clásico

| Board | Profundidad clásico |
|---|---|
| 3×3 | Infinity (resoluble completo) |
| 4×4 | 5 |
| 6×6 | 3 |

### 7.5 Easy/Medium adaptados
- **Easy**: random de `getValidMoves()` con 20% bloqueo de movimiento ganador del oponente.
- **Medium**: busca movimiento ganador propio, luego bloquea, luego centro, luego random.

---

## 8. Archivos a Modificar

| Archivo | Cambios |
|---|---|
| `src/game/constants.js` | `BOARD_CONFIGS`: quitar 5, agregar 6 (`win:6, cell:0.85`). Agregar `DIAGONALS` por board size. |
| `src/game/logic.js` | Nuevas: `canAnyoneWin()`, `isAdjacent()`, `isOnDiagonal()`. |
| `src/game/ai.js` | Nuevas: `getValidMoves()`, `getAIMoveClassic()`, `minimaxClassic()`, `easyMoveClassic()`, `mediumMoveClassic()`. Adaptar `DEPTHS` (6:3). |
| `src/App.jsx` | Nuevos states (`gameMode`, `phase`, `pool`, `selectedPiece`, `placed`). `resetGameClassic()`. Lógica bifurcada en `applyMove()`. Auto-draw check. |
| `src/components/ArcadeHUD.jsx` | Segmented GAME MODE. Indicador fase/pool. Ocultar PvP/VS AI selector si no aplica. |
| `src/components/Board3D.jsx` | Highlight selección (glow + elevación). Highlight celdas válidas (verde). Props nuevas. |
| `src/components/WinBanner.jsx` | Posible animación especial para auto-fill. |

---

## 9. Flujo de Usuario

### Modo Clásico — PvP
```
1. Selecciona "CLÁSICO" → "PvP" → tamaño (3×3, 4×4, 6×6)
2. Fase colocación: X coloca, O coloca, alternando. Pool se reduce.
3. Verifica victoria en cada colocación.
4. Ambos pool = 0 → fase de movimiento.
5. Click-to-move: seleccionar ficha → celda válida.
6. Victoria o auto-draw.
```

### Modo Clásico — VS AI
```
1. Selecciona "CLÁSICO" → "VS AI" → dificultad → tamaño
2. Fase colocación: humano coloca, AI coloca.
3. Fase movimiento: humano mueve, AI mueve.
4. Victoria o auto-draw.
```

---

## 10. Orden de Implementación

1. **constants.js** — Cambiar BOARD_CONFIGS (quitar 5, agregar 6). Agregar DIAGONALS.
2. **logic.js** — `isOnDiagonal()`, `isAdjacent()`, `canAnyoneWin()`.
3. **Auto-draw en App.jsx** — Integrar en `applyMove()` estándar.
4. **Game mode state** — Nuevos states, `resetGameClassic()`.
5. **Fase de colocación** — Pool logic en `applyMove()` clásico.
6. **Fase de movimiento** — Click-to-move, `selectedPiece`, validación.
7. **Board3D highlights** — Selección, celdas válidas, props nuevas.
8. **HUD** — Segmented game mode, indicador fase/pool.
9. **AI clásico** — `getValidMoves()`, minimax adaptado, easy/medium/hard.
10. **Polish** — Animación auto-fill, sonidos, tests.

---

## 11. Orden de Commits

1. `feat: change board 5x5 to 6x6 and update constants`
2. `feat: add auto-draw detection`
3. `feat: add game mode state and classic mode selector`
4. `feat: implement classic mode placement phase`
5. `feat: implement classic mode movement phase with click-to-move`
6. `feat: adapt AI for classic mode movement phase`
7. `feat: visual polish for classic mode`

---

## 12. Consideraciones Técnicas

- **Click-to-click** es significativamente más simple que drag & drop en 3D con R3F.
- **Performance minimax clásico**: espacio de movimientos más pequeño → búsqueda más profunda posible.
- **Scores**: se mantienen iguales para ambos modos.
- **Compatibilidad**: modo estándar no cambia (excepto 6×6 reemplaza 5×5).
- **6×6 con win=6**: más difícil que 5×5, juego más largo y estratégico.
