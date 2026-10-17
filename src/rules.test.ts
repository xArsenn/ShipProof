import test from 'node:test'
import assert from 'node:assert/strict'
import { analyze, matchPattern } from './rules.js'
import type { ShipProofConfig } from './types.js'

const config: ShipProofConfig = { version: 1, commands: [], protectedPaths: ['.github/workflows/**'], testPaths: ['**/*.test.*', 'tests/**'], sourcePaths: ['src/**'] }

test('glob matching understands stars and double stars', () => {
  assert.equal(matchPattern('src/core/check.ts', 'src/**'), true)
  assert.equal(matchPattern('src/check.test.ts', '**/*.test.*'), true)
  assert.equal(matchPattern('README.md', 'src/**'), false)
})

test('flags missing checks and source changes without tests', () => {
  const findings = analyze(config, ['src/index.ts'], [], [])
  assert.ok(findings.some((item) => item.code === 'NO_COMMANDS'))
  assert.ok(findings.some((item) => item.code === 'NO_TEST_CHANGE'))
})

test('flags verification commands that hide failures', () => {
  const findings = analyze({ ...config, commands: [{ name: 'test', run: 'npm test || true' }] }, [], [{ name: 'test', command: 'npm test || true', required: true, exitCode: 0, durationMs: 1, timedOut: false, output: '', skippedSignals: 0 }], [])
  assert.ok(findings.some((item) => item.code === 'SWALLOWED_EXIT'))
})
