export function matchPattern(file, pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const expression = escaped.replaceAll('**', '\u0000').replaceAll('*', '[^/]*').replaceAll('\u0000', '.*');
    return new RegExp(`^${expression}$`, 'i').test(file.replaceAll('\\', '/'));
}
function matchesAny(file, patterns = []) {
    return patterns.some((pattern) => matchPattern(file, pattern));
}
export function analyze(config, files, commands, mutated) {
    const findings = [];
    if (!commands.length)
        findings.push({ severity: 'error', code: 'NO_COMMANDS', title: 'No verification commands', detail: 'Configure at least one deterministic build, test, lint, or typecheck command.' });
    for (const command of commands) {
        if (/\|\|\s*(true|exit\s+0)|;\s*exit\s+0\b/i.test(command.command)) {
            findings.push({ severity: 'error', code: 'SWALLOWED_EXIT', title: 'Command can hide failures', detail: `${command.name} contains a construct that can turn a failing check into a successful exit.` });
        }
        if (command.timedOut)
            findings.push({ severity: 'error', code: 'TIMEOUT', title: 'Verification timed out', detail: `${command.name} exceeded its configured timeout.` });
        else if (command.required && command.exitCode !== 0)
            findings.push({ severity: 'error', code: 'COMMAND_FAILED', title: 'Required verification failed', detail: `${command.name} exited with code ${command.exitCode ?? 'unknown'}.` });
        else if (command.skippedSignals > 0)
            findings.push({ severity: 'warning', code: 'SKIPPED_TESTS', title: 'Skipped checks detected', detail: `${command.name} output contains ${command.skippedSignals} skipped/disabled signal(s). Review whether they weaken the proof.` });
    }
    const protectedFiles = files.filter((file) => matchesAny(file, config.protectedPaths));
    if (protectedFiles.length)
        findings.push({ severity: 'warning', code: 'PROTECTED_CHANGED', title: 'Verification policy changed', detail: 'Files controlling CI or ShipProof changed in the same patch. Review them against the base branch.', files: protectedFiles });
    const tests = files.filter((file) => matchesAny(file, config.testPaths));
    const sources = files.filter((file) => matchesAny(file, config.sourcePaths));
    if (sources.length && !tests.length)
        findings.push({ severity: 'warning', code: 'NO_TEST_CHANGE', title: 'Source changed without test changes', detail: 'The patch changes source code but adds or modifies no recognized test file.' });
    if (tests.some((file) => /(^|\/)(fixtures?|snapshots?|__snapshots__)(\/|$)/i.test(file)))
        findings.push({ severity: 'warning', code: 'EXPECTED_OUTPUT_CHANGED', title: 'Expected outputs changed', detail: 'Snapshots or fixtures changed. Confirm the new expected behavior is intentional.' });
    const importantMutations = mutated.filter((file) => matchesAny(file, [...(config.sourcePaths || []), ...(config.testPaths || []), ...(config.protectedPaths || [])]));
    if (importantMutations.length)
        findings.push({ severity: 'error', code: 'MUTATED_DURING_VERIFY', title: 'Code changed during verification', detail: 'Source, tests, or policy files changed while checks were running, so their results do not prove the final state.', files: importantMutations });
    if (!files.length)
        findings.push({ severity: 'info', code: 'NO_CHANGES', title: 'No changed files detected', detail: 'ShipProof verified the current repository, but there is no patch relative to the selected base.' });
    return findings;
}
//# sourceMappingURL=rules.js.map