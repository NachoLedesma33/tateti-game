import { test, expect } from '@playwright/test'

const CELLS = { 3: 1.6, 4: 1.25, 6: 0.85 }
const SHOT_DIR = 'screenshots'

function projectPoint(w, h, wx, wy, wz) {
  const ex = 8
  const ey = 7
  const ez = 10
  let fx = ex - 0
  let fy = ey - 0.5
  let fz = ez - 0
  const fl = Math.hypot(fx, fy, fz)
  fx /= fl
  fy /= fl
  fz /= fl

  let rx = fz
  let ry = 0
  let rz = -fx
  const rl = Math.hypot(rx, ry, rz)
  rx /= rl
  ry /= rl
  rz /= rl

  const ux = fy * rz - fz * ry
  const uy = fz * rx - fx * rz
  const uz = fx * ry - fy * rx

  const dx = wx - ex
  const dy = wy - ey
  const dz = wz - ez

  const vx = dx * rx + dy * ry + dz * rz
  const vy = dx * ux + dy * uy + dz * uz
  const vz = dx * fx + dy * fy + dz * fz

  const tanF = Math.tan((45 * Math.PI) / 180 / 2)
  const xndc = vx / vz / (tanF * (w / h))
  const yndc = vy / vz / tanF
  return [((xndc + 1) / 2) * w, ((1 - yndc) / 2) * h]
}

function cellCenters(size) {
  const cell = CELLS[size]
  const half = (size * cell) / 2
  const out = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      out.push({
        idx: r * size + c,
        x: -half + c * cell + cell / 2,
        z: -half + r * cell + cell / 2,
      })
    }
  }
  return out
}

async function placeCell(page, size, idx) {
  const box = await page.locator('canvas').first().boundingBox()
  const cell = cellCenters(size).find((c) => c.idx === idx)
  const [px, py] = projectPoint(box.width, box.height, cell.x, 0.48, cell.z)
  await page.mouse.click(box.x + px, box.y + py)
}

async function rotateView(page) {
  const box = await page.locator('canvas').first().boundingBox()
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.mouse.move(cx + 300, cy + 30)
  await page.mouse.down()
  await page.mouse.move(cx - 300, cy + 100, { steps: 24 })
  await page.mouse.up()
  await page.waitForTimeout(700)
}

async function shot(page, name) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png` })
}

async function openApp(page) {
  await page.goto('/?nofx')
  await page.locator('canvas').first().waitFor()
  await page.waitForTimeout(1200)
}

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test('1 - tablero inicial 3x3', async ({ page }) => {
  await expect(page.getByText('TURN: X')).toBeVisible()
  await rotateView(page)
  await shot(page, '1-inicio-3x3')
})

test('2 - partida a mitad 3x3', async ({ page }) => {
  for (const i of [0, 4, 1, 8, 5, 2, 7]) {
    await placeCell(page, 3, i)
    await page.waitForTimeout(160)
  }
  await rotateView(page)
  await shot(page, '2-midgame-3x3')
})

test('3 - vs IA dificil', async ({ page }) => {
  await page.getByRole('button', { name: 'VS AI', exact: true }).click()
  await page.getByRole('button', { name: 'HARD', exact: true }).click()
  await placeCell(page, 3, 0)
  await page.waitForTimeout(1100)
  await placeCell(page, 3, 4)
  await page.waitForTimeout(1100)
  await placeCell(page, 3, 8)
  await page.waitForTimeout(1100)
  await rotateView(page)
  await shot(page, '3-vs-ia-dificil')
})

test('4 - tablero 4x4', async ({ page }) => {
  await page.getByRole('button', { name: '4x4', exact: true }).click()
  for (const i of [0, 1, 6, 2, 11]) {
    await placeCell(page, 4, i)
    await page.waitForTimeout(160)
  }
  await rotateView(page)
  await shot(page, '4-tablero-4x4')
})

test('5 - tablero 6x6', async ({ page }) => {
  await page.getByRole('button', { name: '6x6', exact: true }).click()
  for (const i of [0, 1, 2, 3, 6, 7, 8]) {
    await placeCell(page, 6, i)
    await page.waitForTimeout(160)
  }
  await rotateView(page)
  await shot(page, '5-tablero-6x6')
})

test('6 - cartel PLAYER X WINS', async ({ page }) => {
  for (const i of [0, 4, 1, 5, 2]) {
    await placeCell(page, 3, i)
    await page.waitForTimeout(200)
  }
  await expect(page.getByText('PLAYER X WINS')).toBeVisible()
  await page.waitForTimeout(600)
  await rotateView(page)
  await shot(page, '6-victoria-x')
})

test('7 - cartel GAME OVER (gana la IA)', async ({ page }) => {
  await page.getByRole('button', { name: 'VS AI', exact: true }).click()
  await page.getByRole('button', { name: 'HARD', exact: true }).click()

  const orders = [
    [1, 3, 7, 8, 5, 0, 6, 2],
    [5, 7, 1, 0, 2, 3, 6, 8],
    [7, 3, 1, 8, 0, 2, 5, 6],
  ]

  for (const order of orders) {
    const gameOver = page.getByText('GAME OVER')
    const draw = page.getByText('DRAW')
    const xWins = page.getByText('PLAYER X WINS')
    for (const i of order) {
      if (await gameOver.isVisible().catch(() => false)) break
      await placeCell(page, 3, i)
      await page.waitForTimeout(1000)
      if (
        (await gameOver.isVisible().catch(() => false)) ||
        (await draw.isVisible().catch(() => false)) ||
        (await xWins.isVisible().catch(() => false))
      ) {
        break
      }
    }
    if (await gameOver.isVisible().catch(() => false)) break
    await page.getByRole('button', { name: 'PLAY AGAIN', exact: true }).click()
    await page.waitForTimeout(400)
  }

  await expect(page.getByText('GAME OVER')).toBeVisible()
  await page.waitForTimeout(600)
  await rotateView(page)
  await shot(page, '7-game-over-ia')
})
