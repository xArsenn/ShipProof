# ShipProof

> Your coding agent says it is done. Make it prove it.

ShipProof is a local, model-agnostic evidence layer for AI-generated code. It runs deterministic checks, records what actually happened, detects common verification loopholes, and produces a portable HTML/JSON proof report.

Works with changes created by Codex, Claude Code, Cursor, Cline, Copilot, humans, or any other tool. ShipProof makes no model calls, uploads no code, and has no runtime dependencies.

[中文说明](README.zh-CN.md)

## Why ShipProof?

An agent can claim “all tests pass” after running only one test, swallowing a failing exit code, changing expected snapshots, or editing source after the last green run. A green sentence is not evidence.

ShipProof checks the repository itself:

- Runs your real lint, typecheck, test, and build commands
- Preserves command output, exit codes, duration, and timeout evidence
- Detects `|| true` and similar failure-swallowing commands
- Detects source, test, or policy changes made during verification
- Highlights CI policy, fixtures, and snapshot changes
- Warns when source changes have no recognized test change
- Produces self-contained HTML and machine-readable JSON reports
- Fails CI when required checks or integrity rules fail

## Quick start

```bash
npx shipproof init
npx shipproof verify
```

ShipProof auto-detects common npm, Python, Rust, and Go projects. Review `.shipproof.json`, then commit it so every agent and contributor is checked against the same contract.

The result is written to:

- `shipproof-report.html` — portable evidence report for humans
- `shipproof-report.json` — structured evidence for CI and other tools

## Configuration

```json
{
  "version": 1,
  "base": "HEAD",
  "commands": [
    { "name": "lint", "run": "npm run lint", "required": true },
    { "name": "test", "run": "npm test", "required": true, "timeoutSeconds": 600 },
    { "name": "build", "run": "npm run build", "required": true }
  ],
  "protectedPaths": [".github/workflows/**", ".shipproof.json"],
  "testPaths": ["**/*.test.*", "tests/**"],
  "sourcePaths": ["src/**", "packages/**"]
}
```

Commands are executed locally with the current user's permissions. Review configuration changes before running ShipProof on an untrusted repository.

## GitHub Actions

After a stable release exists, pin ShipProof to a commit SHA:

```yaml
permissions:
  contents: read

steps:
  - uses: actions/checkout@v5
    with:
      fetch-depth: 0
  - uses: xArsenn/shipproof@COMMIT_SHA
    with:
      base: origin/${{ github.base_ref }}
```

The action writes a job summary and stores `shipproof-report.html` and `shipproof-report.json` in the workspace. Upload them with `actions/upload-artifact` if you want to retain the evidence.

## Verdicts

- `VERIFIED` — all required deterministic checks passed, with no integrity warnings.
- `REVIEW` — checks passed, but ShipProof found evidence that deserves human review.
- `FAILED` — a required check failed, timed out, hid its exit status, or code changed during verification.

ShipProof provides evidence, not a mathematical guarantee that software is correct.

## Roadmap

- Baseline-pinned verification that agents cannot modify
- Mutation testing adapters for proving test strength
- Agent transcript claim checking
- SARIF and GitHub Checks annotations
- Signed evidence bundles and reproducible containers
- Team policy dashboard and self-hosted enterprise control plane

## Development

```bash
npm install
npm test
node dist/cli.js verify --config examples/shipproof.json
```

Node.js 20 or newer is required. ShipProof is licensed under MIT.
