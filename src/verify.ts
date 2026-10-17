import { resolve } from 'node:path'
import { loadConfig } from './config.js'
import { analyze } from './rules.js'
import { changedFiles, compareSnapshots, findRepositoryRoot, repositoryInfo, snapshot, snapshotDigest } from './git.js'
import { runCommand } from './runner.js'
import { writeHtml, writeJson } from './report.js'
import type { CommandEvidence, ProofReport } from './types.js'

export type VerifyOptions = { root?: string; configPath?: string; base?: string; htmlPath?: string; jsonPath?: string; run?: boolean; version: string }

export async function verify(options: VerifyOptions): Promise<ProofReport> {
  const root = findRepositoryRoot(options.root)
  const loaded = loadConfig(root, options.configPath)
  const config = loaded.config
  const base = options.base || process.env.SHIPPROOF_BASE || config.base || 'HEAD'
  const files = changedFiles(root, base)
  const before = snapshot(root)
  const commands: CommandEvidence[] = []

  if (options.run !== false) {
    for (const command of config.commands) commands.push(await runCommand(root, command, config.maxOutputKB))
  }

  const after = snapshot(root)
  const mutations = compareSnapshots(before, after)
  const findings = analyze(config, files, commands, mutations)
  const errors = findings.filter((item) => item.severity === 'error').length
  const warnings = findings.filter((item) => item.severity === 'warning').length
  const verdict = errors || (config.failOnWarnings && warnings) ? 'FAILED' : warnings ? 'REVIEW' : 'VERIFIED'
  const info = repositoryInfo(root)
  const report: ProofReport = {
    schemaVersion: 1,
    tool: { name: 'ShipProof', version: options.version },
    createdAt: new Date().toISOString(),
    repository: { root, ...info, base },
    verdict,
    summary: { errors, warnings, commandsPassed: commands.filter((item) => item.exitCode === 0 && !item.timedOut).length, commandsTotal: commands.length, changedFiles: files.length },
    changedFiles: files,
    findings,
    commands,
    integrity: { before: snapshotDigest(before), after: snapshotDigest(after), changedDuringVerification: mutations }
  }
  writeJson(report, resolve(root, options.jsonPath || 'shipproof-report.json'))
  writeHtml(report, resolve(root, options.htmlPath || 'shipproof-report.html'))
  return report
}
