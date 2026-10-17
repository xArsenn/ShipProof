import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
export const DEFAULT_CONFIG_NAME = '.shipproof.json';
export function detectCommands(root) {
    const commands = [];
    const packagePath = join(root, 'package.json');
    if (existsSync(packagePath)) {
        try {
            const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
            for (const name of ['lint', 'typecheck', 'test', 'build']) {
                if (pkg.scripts?.[name])
                    commands.push({ name, run: `npm run ${name}`, required: true, timeoutSeconds: 600 });
            }
        }
        catch { }
    }
    if (!commands.length && existsSync(join(root, 'pyproject.toml')))
        commands.push({ name: 'test', run: 'python -m pytest', required: true, timeoutSeconds: 600 });
    if (!commands.length && existsSync(join(root, 'Cargo.toml')))
        commands.push({ name: 'test', run: 'cargo test', required: true, timeoutSeconds: 900 });
    if (!commands.length && existsSync(join(root, 'go.mod')))
        commands.push({ name: 'test', run: 'go test ./...', required: true, timeoutSeconds: 600 });
    return commands;
}
export function defaultConfig(root) {
    return {
        version: 1,
        base: 'HEAD',
        commands: detectCommands(root),
        protectedPaths: ['.github/workflows/**', '.shipproof.json', 'shipproof.json'],
        testPaths: ['**/*.test.*', '**/*.spec.*', 'test/**', 'tests/**', '__tests__/**'],
        sourcePaths: ['src/**', 'app/**', 'lib/**', 'packages/**', 'cmd/**', 'internal/**'],
        failOnWarnings: false,
        maxOutputKB: 96
    };
}
export function loadConfig(root, requested) {
    const configPath = requested ? join(root, requested) : join(root, DEFAULT_CONFIG_NAME);
    if (!existsSync(configPath))
        return { config: defaultConfig(root), path: null };
    const parsed = JSON.parse(readFileSync(configPath, 'utf8'));
    if (parsed.version !== 1 || !Array.isArray(parsed.commands))
        throw new Error(`Invalid ShipProof configuration: ${configPath}`);
    return { config: { ...defaultConfig(root), ...parsed }, path: configPath };
}
export function initializeConfig(root, force = false) {
    const target = join(root, DEFAULT_CONFIG_NAME);
    if (existsSync(target) && !force)
        throw new Error(`${DEFAULT_CONFIG_NAME} already exists. Use --force to replace it.`);
    writeFileSync(target, `${JSON.stringify(defaultConfig(root), null, 2)}\n`, 'utf8');
    return target;
}
//# sourceMappingURL=config.js.map