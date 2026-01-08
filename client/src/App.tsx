import { useState, useCallback, useRef, useEffect, type JSX } from 'react';
import { Header, MainLayout } from './components/Layout';
import { CodeEditor, EditorToolbar } from './components/Editor';
import { OutputConsole } from './components/Console';
import { LandingPage } from './components/LandingPage';
import { useEditor } from './hooks/useEditor';
import './App.css';

type AppView = 'landing' | 'editor';

function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<AppView>('landing');

  const {
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
  } = useEditor();

  const [consoleWidth, setConsoleWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = useCallback(() => {
    setCurrentView('editor');
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;

      // Constrain width between 200px and 60% of container
      const minWidth = 200;
      const maxWidth = containerRect.width * 0.6;
      setConsoleWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Show landing page first
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Show editor after clicking Get Started
  return (
    <div className="app" data-theme={theme}>
      <Header />
      <MainLayout>
        <div className="main-content" ref={containerRef}>
          <div className="editor-panel">
            <EditorToolbar
              language={language}
              theme={theme}
              isRunning={isRunning}
              onLanguageChange={setLanguage}
              onThemeChange={setTheme}
              onRun={runCode}
              onClear={clearCode}
            />
            <div className="editor-wrapper">
              <CodeEditor
                language={language}
                theme={theme}
                value={code}
                onChange={setCode}
              />
            </div>
          </div>
          <div
            className={`resizer ${isDragging ? 'resizer-active' : ''}`}
            onMouseDown={handleMouseDown}
          />
          <div className="console-panel" style={{ width: consoleWidth }}>
            <OutputConsole output={output} onClear={clearOutput} />
          </div>
        </div>
      </MainLayout>
    </div>
  );
}

export default App;
