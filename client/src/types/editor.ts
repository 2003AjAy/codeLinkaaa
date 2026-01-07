export type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java';

export type EditorTheme = 'vs-dark' | 'light' | 'hc-black';

export interface LanguageConfig {
  id: SupportedLanguage;
  label: string;
  monacoLanguage: string;
  extension: string;
  defaultFileName: string;
}

export interface EditorState {
  code: string;
  language: SupportedLanguage;
  theme: EditorTheme;
}

export interface ConsoleOutput {
  id: string;
  type: 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}
