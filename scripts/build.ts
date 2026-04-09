import { spawnSync } from 'node:child_process'

const start = Date.now()

const result = spawnSync(
  'pnpm run-s commitlog && pnpm run-p lint type-check && pnpm run build-only',
  { stdio: 'inherit', shell: true },
)

const elapsed = ((Date.now() - start) / 1000).toFixed(2)

if (result.status === 0) {
  console.log(`\n\x1b[32m✓\x1b[0m \x1b[1mbuild\x1b[0m (完整构建) 耗时 \x1b[36m${elapsed}s\x1b[0m`)
} else {
  console.error(`\n\x1b[31m✗\x1b[0m 构建失败，耗时 \x1b[33m${elapsed}s\x1b[0m`)
  process.exit(result.status ?? 1)
}
