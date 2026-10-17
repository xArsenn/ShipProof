import type { CommandEvidence, VerificationCommand } from './types.js';
export declare function runCommand(root: string, item: VerificationCommand, maxOutputKB?: number): Promise<CommandEvidence>;
