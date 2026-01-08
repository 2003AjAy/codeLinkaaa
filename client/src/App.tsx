import { type JSX } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { InterviewEditor } from './components/InterviewEditor';
import { useEditor } from './hooks/useEditor';
import './App.css';

function TeachingMode(): JSX.Element {
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
      mode="teaching"
    />
  );
}

function InterviewMode(): JSX.Element {
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
      mode="interview"
    />
  );
}

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/teaching" element={<TeachingMode />} />
        <Route path="/interview" element={<InterviewMode />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
