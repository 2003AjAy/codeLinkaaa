import { type JSX } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';
import { InterviewEditor } from './components/InterviewEditor';
import { JoinRoom } from './pages/JoinRoom';
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

function RoomMode(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
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

  // TODO: Fetch room data and determine mode based on room type
  console.log('Joining room:', roomId);

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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/teaching"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeachingMode />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute allowedRoles={['interviewer']}>
                <InterviewMode />
              </ProtectedRoute>
            }
          />
          <Route
            path="/join"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <JoinRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute allowedRoles={['user', 'teacher', 'interviewer']}>
                <RoomMode />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
