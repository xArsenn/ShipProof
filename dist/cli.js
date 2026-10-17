#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeConfig } from './config.js';
import { findRepositoryRoot } from './git.js';
import { verify } from './verify.js';
const packagePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
const version = JSON.parse(readFileSync(packagePath, 'utf8')).version;
function value(args, name) {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
}
function help() {
    console.log(`ShipProof ${version} — make AI-generated code prove itself

Usage:
  shipproof init [--force]
  shipproof verify [--base <ref>] [--config <path>] [--html <path>] [--json <path>] [--no-run]

Exit codes:
  0  verified
  1  verification failed
  2  invalid usage or configuration`);
}
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (!command || ['help', '--help', '-h'].includes(command))
        return help();
    if (['--version', '-v'].includes(command))
        return console.log(version);
    if (command === 'init') {
        const root = findRepositoryRoot();
        const target = initializeConfig(root, args.includes('--force'));
        console.log(`Created ${relative(root, target)} with auto-detected checks.`);
        return;
    }
    if (command !== 'verify')
        throw new Error(`Unknown command: ${command}`);
    const report = await verify({ version, base: value(args, '--base'), configPath: value(args, '--config'), htmlPath: value(args, '--html'), jsonPath: value(args, '--json'), run: !args.includes('--no-run') });
    const icon = report.verdict === 'VERIFIED' ? '✓' : report.verdict === 'REVIEW' ? '!' : '✗';
    console.log(`${icon} ${report.verdict} — ${report.summary.commandsPassed}/${report.summary.commandsTotal} checks passed, ${report.summary.errors} errors, ${report.summary.warnings} warnings`);
    console.log('  Reports: shipproof-report.html · shipproof-report.json');
    for (const finding of report.findings)
        console.log(`  [${finding.severity.toUpperCase()}] ${finding.title}`);
    if (report.verdict === 'FAILED')
        process.exitCode = 1;
}
main().catch((error) => { console.error(`ShipProof: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 2; });
//# sourceMappingURL=cli.js.map