import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'

function git(root: string, args: string[], allowFailure = false): string {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (error) {
    if (allowFailure) return ''
    throw error
  }
}

export function findRepositoryRoot(start = process.cwd()): string {
  const root = git(start, ['rev-parse', '--show-toplevel'], true)
  if (!root) throw new Error('ShipProof must run inside a Git repository.')
  return resolve(root)
}

export function repositoryInfo(root: string) {
  return {
    head: git(root, ['rev-parse', 'HEAD'], true) || 'unborn',
    branch: git(root, ['branch', '--show-current'], true) || 'detached',
    dirty: Boolean(git(root, ['status', '--porcelain=v1'], true))
  }
}

function nulList(value: string): string[] {
  return value.split('\0').map((item) => item.trim()).filter(Boolean).map((item) => item.replaceAll('\\', '/'))
}

export function changedFiles(root: string, base: string): string[] {
  const diff = nulList(git(root, ['diff', '--name-only', '-z', base, '--'], true))
  const staged = nulList(git(root, ['diff', '--cached', '--name-only', '-z', '--'], true))
  const untracked = nulList(git(root, ['ls-files', '--others', '--exclude-standard', '-z'], true))
  return [...new Set([...diff, ...staged, ...untracked])].sort()
}

const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.shipproof', 'target', 'vendor'])

function walk(root: string, directory = root, result: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue
    const absolute = join(directory, entry)
    let stat
    try { stat = lstatSync(absolute) } catch { continue }
    if (stat.isSymbolicLink()) continue
    if (stat.isDirectory()) walk(root, absolute, result)
    else if (stat.isFile() && stat.size <= 10 * 1024 * 1024) result.push(relative(root, absolute).replaceAll('\\', '/'))
  }
  return result
}

export function snapshot(root: string): Map<string, string> {
  const hashes = new Map<string, string>()
  for (const file of walk(root)) {
    const absolute = join(root, file)
    if (!existsSync(absolute)) continue
    hashes.set(file, createHash('sha256').update(readFileSync(absolute)).digest('hex'))
  }
  return hashes
}

export function snapshotDigest(values: Map<string, string>): string {
  const hash = createHash('sha256')
  for (const [name, digest] of [...values.entries()].sort(([a], [b]) => a.localeCompare(b))) hash.update(`${name}\0${digest}\n`)
  return hash.digest('hex')
}

export function compareSnapshots(before: Map<string, string>, after: Map<string, string>): string[] {
  const names = new Set([...before.keys(), ...after.keys()])
  return [...names].filter((name) => before.get(name) !== after.get(name)).sort()
}

export function repositoryName(root: string): string { return basename(root) }
