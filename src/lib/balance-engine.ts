/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// 化学方程式配平引擎 — 高斯消元法

export interface Compound {
  elements: Record<string, number>
  raw: string
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

function lcmOfArray(nums: number[]): number {
  let result = 1
  for (const n of nums) result = (result * n) / gcd(result, n)
  return result
}

/** 展开括号中的基团：Al2(SO4)3 → Al2S3O12 */
function expandGroups(raw: string): string {
  // 匹配 (元素组)后跟可选数字
  const re = /\(([^)]+)\)(\d*)/g
  return raw.replace(re, (_, inner: string, num: string) => {
    const multiplier = num ? parseInt(num, 10) : 1
    // 解析内部元素并乘以倍数
    const elemRe = /([A-Z][a-z]?)(\d*)/g
    let expanded = ''
    let m
    while ((m = elemRe.exec(inner)) !== null) {
      const count = m[2] ? parseInt(m[2], 10) : 1
      expanded += m[1] + (count * multiplier || '')
    }
    return expanded
  })
}

/** 解析单个化合物，如 "C2H5OH" → {C:2, H:6, O:1} */
export function parseCompound(raw: string): Compound | null {
  // 拒绝以数字开头的输入（用户可能误加了系数）
  if (/^\d/.test(raw)) return null

  // 展开括号基团：Al2(SO4)3 → Al2S3O12
  const expanded = expandGroups(raw)

  const elements: Record<string, number> = {}
  const re = /([A-Z][a-z]?)(\d*)/g
  let match
  while ((match = re.exec(expanded)) !== null) {
    const elem = match[1]
    const count = match[2] ? parseInt(match[2], 10) : 1
    elements[elem] = (elements[elem] || 0) + count
  }
  if (Object.keys(elements).length === 0) return null

  // 拒绝单原子双原子元素（如单独的 O、H、N 等）
  const DIATOMIC = ['H', 'N', 'O', 'F', 'Cl', 'Br', 'I']
  const keys = Object.keys(elements)
  if (keys.length === 1 && DIATOMIC.includes(keys[0]) && elements[keys[0]] === 1) return null

  return { elements, raw }
}

/** 解析方程式 → { reactants: Compound[], products: Compound[] } */
export function parseEquation(
  equation: string,
): { reactants: Compound[]; products: Compound[] } | null {
  const sides = equation.split(/=|->|→|⟶|-->/)
  if (sides.length !== 2) return null
  const reactants = sides[0]
    .split('+')
    .map((s) => parseCompound(s.trim()))
    .filter(Boolean) as Compound[]
  const products = sides[1]
    .split('+')
    .map((s) => parseCompound(s.trim()))
    .filter(Boolean) as Compound[]
  if (reactants.length === 0 || products.length === 0) return null
  return { reactants, products }
}

/** 高斯消元求解 */
function solveMatrix(matrix: number[][]): number[] | null {
  const rows = matrix.length
  const cols = matrix[0].length - 1

  for (let col = 0; col < Math.min(cols, rows); col++) {
    let pivotRow = -1
    for (let r = col; r < rows; r++) {
      if (matrix[r][col] !== 0) {
        pivotRow = r
        break
      }
    }
    if (pivotRow === -1) continue
    if (pivotRow !== col) [matrix[col], matrix[pivotRow]] = [matrix[pivotRow], matrix[col]]

    const pivot = matrix[col][col]
    for (let r = col + 1; r < rows; r++) {
      if (matrix[r][col] === 0) continue
      const factor = matrix[r][col] / pivot
      for (let c = col; c <= cols; c++) matrix[r][c] -= factor * matrix[col][c]
    }
  }

  const result = Array.from({ length: cols }, () => 0)
  const pivotCols: number[] = []
  for (let r = 0; r < Math.min(rows, cols); r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] !== 0) {
        pivotCols.push(c)
        break
      }
    }
  }

  const rank = new Set(pivotCols).size
  const freeVar = rank < cols ? cols - 1 : -1
  if (freeVar < 0) return null
  result[freeVar] = 1

  for (let r = Math.min(rows, cols) - 1; r >= 0; r--) {
    const pivotCol = pivotCols[r]
    if (pivotCol === undefined || pivotCol === freeVar) continue
    let sum = 0
    for (let c = pivotCol + 1; c < cols; c++) sum += matrix[r][c] * result[c]
    if (matrix[r][pivotCol] === 0) return null
    result[pivotCol] = -sum / matrix[r][pivotCol]
  }

  for (let r = 0; r < rows; r++) {
    let sum = 0
    for (let c = 0; c < cols; c++) sum += matrix[r][c] * result[c]
    if (Math.abs(sum) > 1e-9) return null
  }
  return result
}

/** 配平方程式，返回各化合物的系数 */
export function balanceEquation(reactants: Compound[], products: Compound[]): number[] | null {
  const allElements = new Set<string>()
  for (const c of reactants) for (const e of Object.keys(c.elements)) allElements.add(e)
  for (const c of products) for (const e of Object.keys(c.elements)) allElements.add(e)

  const elements = [...allElements]
  const numVars = reactants.length + products.length

  const matrix: number[][] = []
  for (const elem of elements) {
    const row = Array.from({ length: numVars + 1 }, () => 0)
    for (let i = 0; i < reactants.length; i++) row[i] = reactants[i].elements[elem] || 0
    for (let i = 0; i < products.length; i++)
      row[reactants.length + i] = -(products[i].elements[elem] || 0)
    matrix.push(row)
  }

  const solution = solveMatrix(matrix)
  if (!solution) return null

  const denominators: number[] = []
  for (const v of solution) {
    if (v === 0 || Number.isInteger(v)) continue
    for (let d = 1; d <= 100; d++) {
      if (Math.abs(Math.round(v * d) - v * d) < 1e-9) {
        denominators.push(d)
        break
      }
    }
  }
  const lcm = denominators.length > 0 ? lcmOfArray(denominators) : 1
  const intResult = solution.map((v) => Math.round(v * lcm))
  const gcdAll = intResult.reduce((g, v) => gcd(g, Math.abs(v)), 0)
  return intResult.map((v) => v / gcdAll)
}
