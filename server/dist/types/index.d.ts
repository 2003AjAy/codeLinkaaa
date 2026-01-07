export type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java';
export interface ExecutionRequest {
    code: string;
    language: SupportedLanguage;
    input?: string;
}
export interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
    executionTime: number;
}
export interface LanguageConfig {
    image: string;
    fileName: string;
    compileCmd?: string;
    runCmd: string;
    timeout: number;
}
export declare const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig>;
//# sourceMappingURL=index.d.ts.map