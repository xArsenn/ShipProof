import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verify } from './verify.js';
const packagePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
const version = JSON.parse(readFileSync(packagePath, 'utf8')).version;
verify({ version, base: process.env.INPUT_BASE || undefined, configPath: process.env.INPUT_CONFIG || undefined })
    .then((report) => {
    console.log(`ShipProof verdict: ${report.verdict}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
        const summary = `## ShipProof: ${report.verdict}\n\n- ${report.summary.commandsPassed}/${report.summary.commandsTotal} checks passed\n- ${report.summary.errors} errors\n- ${report.summary.warnings} warnings\n- ${report.summary.changedFiles} changed files\n`;
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    }
    if (report.verdict === 'FAILED')
        process.exitCode = 1;
})
    .catch((error) => { console.error(error); process.exitCode = 2; });
//# sourceMappingURL=action.js.map