export type VerificationCommand = {
  name: string
  run: string
  required?: boolean
  timeoutSeconds?: number
}

export type ShipProofConfig = {
  version: 1
  base?: string
  commands: VerificationCommand[]
  protectedPaths?: string[]
  testPaths?: string[]
  sourcePaths?: string[]
  failOnWarnings?: boolean
  maxOutputKB?: number
}

export type CommandEvidence = {
  name: string
  command: string
  required: boolean
  exitCode: number | null
  durationMs: number
  timedOut: boolean
  output: string
  skippedSignals: number
}

export type Finding = {
  severity: 'error' | 'warning' | 'info'
  code: string
  title: string
  detail: string
  files?: string[]
}

export type ProofReport = {
  schemaVersion: 1
  tool: { name: 'ShipProof'; version: string }
  createdAt: string
  repository: { root: string; head: string; branch: string; base: string; dirty: boolean }
  verdict: 'VERIFIED' | 'REVIEW' | 'FAILED'
  summary: { errors: number; warnings: number; commandsPassed: number; commandsTotal: number; changedFiles: number }
  changedFiles: string[]
  findings: Finding[]
  commands: CommandEvidence[]
  integrity: { before: string; after: string; changedDuringVerification: string[] }
}
