import { spawn } from 'node:child_process';
function shellFor(command) {
    if (process.platform === 'win32')
        return { file: process.env.ComSpec || 'cmd.exe', args: ['/d', '/s', '/c', command] };
    return { file: process.env.SHELL || '/bin/sh', args: ['-lc', command] };
}
export async function runCommand(root, item, maxOutputKB = 96) {
    const started = performance.now();
    const shell = shellFor(item.run);
    const chunks = [];
    const limit = Math.max(8, maxOutputKB) * 1024;
    let size = 0;
    let timedOut = false;
    return await new Promise((resolve) => {
        const child = spawn(shell.file, shell.args, { cwd: root, env: { ...process.env, CI: process.env.CI || '1', FORCE_COLOR: '0' }, windowsHide: true });
        const collect = (chunk) => {
            chunks.push(chunk);
            size += chunk.length;
            while (size > limit && chunks.length > 1)
                size -= chunks.shift().length;
        };
        child.stdout.on('data', collect);
        child.stderr.on('data', collect);
        const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, (item.timeoutSeconds || 600) * 1000);
        child.on('error', (error) => collect(Buffer.from(`\n${error.message}\n`)));
        child.on('close', (code) => {
            clearTimeout(timer);
            const output = Buffer.concat(chunks).toString('utf8').slice(-limit);
            const skippedSignals = (output.match(/\b(skip(?:ped)?|disabled|pending)\b/gi) || []).length;
            resolve({ name: item.name, command: item.run, required: item.required !== false, exitCode: code, durationMs: Math.round(performance.now() - started), timedOut, output, skippedSignals });
        });
    });
}
//# sourceMappingURL=runner.js.map