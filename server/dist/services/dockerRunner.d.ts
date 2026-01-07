import { SupportedLanguage, ExecutionResult } from '../types';
export declare function executeInDocker(code: string, language: SupportedLanguage, input?: string): Promise<ExecutionResult>;
export declare function checkDockerHealth(): Promise<boolean>;
//# sourceMappingURL=dockerRunner.d.ts.map