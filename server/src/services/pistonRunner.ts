import { SupportedLanguage, ExecutionResult } from '../types';

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Piston API response types
interface PistonRunResult {
  stdout: string;
  stderr: string;
  code: number;
  output: string;
}

interface PistonResponse {
  compile?: PistonRunResult;
  run?: PistonRunResult;
}

// Map our language names to Piston's language names and versions
const PISTON_LANGUAGE_MAP: Record<SupportedLanguage, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
};

export async function executeWithPiston(
  code: string,
  language: SupportedLanguage,
  input?: string
): Promise<ExecutionResult> {
  const startTime = Date.now();

  const pistonConfig = PISTON_LANGUAGE_MAP[language];
  if (!pistonConfig) {
    return {
      success: false,
      output: '',
      error: `Language ${language} is not supported by the fallback executor`,
      executionTime: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonConfig.language,
        version: pistonConfig.version,
        files: [
          {
            name: getFileName(language),
            content: code,
          },
        ],
        stdin: input || '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 10000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        output: '',
        error: `Execution service error: ${response.status} - ${errorText}`,
        executionTime: Date.now() - startTime,
      };
    }

    const result = (await response.json()) as PistonResponse;
    const executionTime = Date.now() - startTime;

    // Check for compile errors
    if (result.compile && result.compile.code !== 0) {
      return {
        success: false,
        output: result.compile.output || '',
        error: result.compile.stderr || result.compile.output || 'Compilation failed',
        executionTime,
      };
    }

    // Check run result
    const runResult = result.run;
    if (!runResult) {
      return {
        success: false,
        output: '',
        error: 'No execution result returned',
        executionTime,
      };
    }

    const stdout = runResult.stdout || '';
    const stderr = runResult.stderr || '';

    return {
      success: runResult.code === 0,
      output: stdout,
      error: stderr || undefined,
      executionTime,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      output: '',
      error: `Failed to execute code: ${errorMessage}`,
      executionTime: Date.now() - startTime,
    };
  }
}

function getFileName(language: SupportedLanguage): string {
  const extensions: Record<SupportedLanguage, string> = {
    javascript: 'index.js',
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
  };
  return extensions[language] || 'main.txt';
}

export async function checkPistonHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${PISTON_API}/runtimes`);
    return response.ok;
  } catch {
    return false;
  }
}
