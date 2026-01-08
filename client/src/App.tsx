import { useState, useCallback, type JSX } from 'react';
import { LandingPage } from './components/LandingPage';
import { InterviewEditor } from './components/InterviewEditor';
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

  const handleGetStarted = useCallback(() => {
    setCurrentView('editor');
  }, []);

  // Show landing page first
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Show Interview Editor after clicking Get Started
  return (
    <InterviewEditor
      code={code}
      language={language}
      theme={theme}
      output={output}
      isRunning={isRunning}
      onCodeChange={setCode}
      onLanguageChange={setLanguage}
      onThemeChange={setTheme}
      onRun={runCode}
      onClearCode={clearCode}
      onClearOutput={clearOutput}
    />
  );
}

export default App;
