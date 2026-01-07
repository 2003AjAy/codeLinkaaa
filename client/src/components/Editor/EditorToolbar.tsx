import React from 'react';
import { SupportedLanguage, EditorTheme } from '../../types/editor';
import { LANGUAGE_LIST } from '../../config/languages';
import { THEME_LIST } from '../../config/themes';

interface EditorToolbarProps {
  language: SupportedLanguage;
  theme: EditorTheme;
  isRunning: boolean;
  onLanguageChange: (language: SupportedLanguage) => void;
  onThemeChange: (theme: EditorTheme) => void;
  onRun: () => void;
  onClear: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  language,
  theme,
  isRunning,
  onLanguageChange,
  onThemeChange,
  onRun,
  onClear,
}) => {
  return (
    <div className="editor-toolbar">
      <div className="toolbar-left">
        <div className="toolbar-group">
          <label htmlFor="language-select" className="toolbar-label">
            Language
          </label>
          <select
            id="language-select"
            className="toolbar-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          >
            {LANGUAGE_LIST.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <label htmlFor="theme-select" className="toolbar-label">
            Theme
          </label>
          <select
            id="theme-select"
            className="toolbar-select"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as EditorTheme)}
          >
            {THEME_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="toolbar-right">
        <button
          className="toolbar-button toolbar-button-secondary"
          onClick={onClear}
          title="Clear code"
        >
          Clear
        </button>
        <button
          className="toolbar-button toolbar-button-primary"
          onClick={onRun}
          disabled={isRunning}
          title="Run code (Ctrl+Enter)"
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
