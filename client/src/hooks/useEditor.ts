import { useState, useCallback, useEffect } from 'react';
import { SupportedLanguage, EditorTheme, EditorState, ConsoleOutput } from '../types/editor';
import { getBoilerplate } from '../utils/boilerplate';
import { executeCode as apiExecuteCode } from '../services/api';

const STORAGE_KEY = 'codelinka_editor_state';

interface UseEditorReturn {
  code: string;
  language: SupportedLanguage;
  theme: EditorTheme;
  output: ConsoleOutput[];
  isRunning: boolean;
  setCode: (code: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setTheme: (theme: EditorTheme) => void;
  runCode: () => void;
  clearOutput: () => void;
  clearCode: () => void;
}

export const useEditor = (): UseEditorReturn => {
  const [code, setCodeState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as EditorState;
        return parsed.code;
      } catch {
        return getBoilerplate('javascript');
      }
    }
    return getBoilerplate('javascript');
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as EditorState;
        return parsed.language;
      } catch {
        return 'javascript';
      }
    }
    return 'javascript';
  });

  const [theme, setThemeState] = useState<EditorTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as EditorState;
        return parsed.theme;
      } catch {
        return 'vs-dark';
      }
    }
    return 'vs-dark';
  });

  const [output, setOutput] = useState<ConsoleOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const state: EditorState = { code, language, theme };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [code, language, theme]);

  const setCode = useCallback((newCode: string) => {
    setCodeState(newCode);
  }, []);

  const setLanguage = useCallback((newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    // Load boilerplate for the new language
    setCodeState(getBoilerplate(newLanguage));
  }, []);

  const setTheme = useCallback((newTheme: EditorTheme) => {
    setThemeState(newTheme);
  }, []);

  const runCode = useCallback(async () => {
    setIsRunning(true);

    // Add "Running..." message
    const runningOutput: ConsoleOutput = {
      id: `running-${Date.now()}`,
      type: 'info',
      content: `Executing ${language} code...`,
      timestamp: new Date(),
    };
    setOutput((prev) => [...prev, runningOutput]);

    try {
      const result = await apiExecuteCode({
        code,
        language,
      });

      // Remove "Running..." message and add result
      setOutput((prev) => {
        const filtered = prev.filter((o) => o.id !== runningOutput.id);

        const outputs: ConsoleOutput[] = [];

        // Add stdout if present
        if (result.output) {
          outputs.push({
            id: `output-${Date.now()}`,
            type: 'output',
            content: result.output,
            timestamp: new Date(),
          });
        }

        // Add stderr/error if present
        if (result.error) {
          outputs.push({
            id: `error-${Date.now()}`,
            type: 'error',
            content: result.error,
            timestamp: new Date(),
          });
        }

        // Add execution info
        outputs.push({
          id: `info-${Date.now()}`,
          type: 'info',
          content: `Execution ${result.success ? 'completed' : 'failed'} in ${result.executionTime}ms`,
          timestamp: new Date(),
        });

        return [...filtered, ...outputs];
      });
    } catch (error) {
      setOutput((prev) => {
        const filtered = prev.filter((o) => o.id !== runningOutput.id);
        return [
          ...filtered,
          {
            id: `error-${Date.now()}`,
            type: 'error',
            content: error instanceof Error ? error.message : 'Execution failed',
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  const clearCode = useCallback(() => {
    setCodeState('');
  }, []);

  return {
    code,
    language,
    theme,
    output,
    isRunning,
    setCode,
    setLanguage,
    setTheme,
    runCode,
    clearOutput,
    clearCode,
  };
};
