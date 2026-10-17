import type { CommandEvidence, Finding, ShipProofConfig } from './types.js';
export declare function matchPattern(file: string, pattern: string): boolean;
export declare function analyze(config: ShipProofConfig, files: string[], commands: CommandEvidence[], mutated: string[]): Finding[];
