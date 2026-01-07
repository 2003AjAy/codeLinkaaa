import React, { useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { SupportedLanguage, EditorTheme } from '../../types/editor';
import { LANGUAGES } from '../../config/languages';
import { DEFAULT_EDITOR_OPTIONS, READONLY_EDITOR_OPTIONS } from '../../config/editorOptions';

interface CodeEditorProps {
  language: SupportedLanguage;
  theme: EditorTheme;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  theme,
  value,
  onChange,
  readOnly = false,
}) => {
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    // Focus the editor when mounted
    editor.focus();

    // Add keyboard shortcut for save (Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Prevent default save dialog
      // In Phase 2, this can trigger file save or code submission
      console.log('Code saved (Phase 2 feature)');
    });

    // Add keyboard shortcut for run (Ctrl+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // In Phase 2, this will trigger code execution
      console.log('Run code triggered (Phase 2 feature)');
    });
  }, []);

  const handleChange: OnChange = useCallback(
    (newValue) => {
      onChange(newValue || '');
    },
    [onChange]
  );

  const monacoLanguage = LANGUAGES[language]?.monacoLanguage || 'plaintext';
  const editorOptions = readOnly ? READONLY_EDITOR_OPTIONS : DEFAULT_EDITOR_OPTIONS;

  return (
    <div className="code-editor-container">
      <Editor
        height="100%"
        language={monacoLanguage}
        theme={theme}
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={editorOptions}
        loading={
          <div className="editor-loading">
            <span>Loading editor...</span>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
