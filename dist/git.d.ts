export declare function findRepositoryRoot(start?: string): string;
export declare function repositoryInfo(root: string): {
    head: string;
    branch: string;
    dirty: boolean;
};
export declare function changedFiles(root: string, base: string): string[];
export declare function snapshot(root: string): Map<string, string>;
export declare function snapshotDigest(values: Map<string, string>): string;
export declare function compareSnapshots(before: Map<string, string>, after: Map<string, string>): string[];
export declare function repositoryName(root: string): string;
