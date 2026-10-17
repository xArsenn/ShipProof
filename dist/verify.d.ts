import type { ProofReport } from './types.js';
export type VerifyOptions = {
    root?: string;
    configPath?: string;
    base?: string;
    htmlPath?: string;
    jsonPath?: string;
    run?: boolean;
    version: string;
};
export declare function verify(options: VerifyOptions): Promise<ProofReport>;
