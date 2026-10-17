import type { ShipProofConfig, VerificationCommand } from './types.js';
export declare const DEFAULT_CONFIG_NAME = ".shipproof.json";
export declare function detectCommands(root: string): VerificationCommand[];
export declare function defaultConfig(root: string): ShipProofConfig;
export declare function loadConfig(root: string, requested?: string): {
    config: ShipProofConfig;
    path: string | null;
};
export declare function initializeConfig(root: string, force?: boolean): string;
