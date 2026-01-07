import { editor } from 'monaco-editor';

export const DEFAULT_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
  fontLigatures: true,
  lineNumbers: 'on',
  minimap: {
    enabled: true,
    scale: 1,
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  padding: {
    top: 16,
    bottom: 16,
  },
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  bracketPairColorization: {
    enabled: true,
  },
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  formatOnPaste: true,
  formatOnType: true,
};

export const READONLY_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  ...DEFAULT_EDITOR_OPTIONS,
  readOnly: true,
  domReadOnly: true,
};
