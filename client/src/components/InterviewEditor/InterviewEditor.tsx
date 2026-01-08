import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clock, Lock, FileText, ChevronDown, RotateCcw, Play, BookOpen, Briefcase } from 'lucide-react';
import { CodeEditor } from '../Editor';
import { SupportedLanguage, EditorTheme, ConsoleOutput } from '../../types/editor';
import { LANGUAGE_LIST } from '../../config/languages';
import { THEME_LIST } from '../../config/themes';
import './InterviewEditor.css';

interface Question {
  title: string;
  description: string;
  constraints: string[];
  example: {
    input: string;
    output: string;
    explanation: string;
  };
}

interface InterviewEditorProps {
  code: string;
  language: SupportedLanguage;
  theme: EditorTheme;
  output: ConsoleOutput[];
  isRunning: boolean;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  onThemeChange: (theme: EditorTheme) => void;
  onRun: () => void;
  onClearCode: () => void;
  onClearOutput: () => void;
  mode?: 'teaching' | 'interview';
}

const defaultQuestion: Question = {
  title: 'Two Sum',
  description: 'Given an array of integers nums[] and an integer target, return the indices of the two numbers such that they add up to the target.',
  constraints: [
    'Exactly one solution exists',
    'No duplicate elements',
    'Can be solved in O(n) time'
  ],
  example: {
    input: 'nums = [2, 7, 11, 15], target = 9',
    output: '[0, 1]',
    explanation: 'Because nums[0] + nums[1] == 2 + 7 = 9'
  }
};

export const InterviewEditor: React.FC<InterviewEditorProps> = ({
  code,
  language,
  theme,
  output,
  isRunning,
  onCodeChange,
  onLanguageChange,
  onThemeChange,
  onRun,
  onClearCode,
  onClearOutput,
  mode = 'interview',
}) => {
  const [question, setQuestion] = useState<Question>(defaultQuestion);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [consoleDividerPosition, setConsoleDividerPosition] = useState(60);
  const [isDraggingConsole, setIsDraggingConsole] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isDraggingRightPanel, setIsDraggingRightPanel] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [isDraggingLeftPanel, setIsDraggingLeftPanel] = useState(false);
  const centerPanelRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isTeachingMode = mode === 'teaching';
  const modeLabel = isTeachingMode ? 'TEACHING MODE' : 'INTERVIEW MODE';
  const ModeIcon = isTeachingMode ? BookOpen : Briefcase;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  // Console divider drag
  const handleConsoleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingConsole(true);
  }, []);

  // Right panel resizer drag
  const handleRightPanelResizerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRightPanel(true);
  }, []);

  // Left panel resizer drag
  const handleLeftPanelResizerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeftPanel(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingConsole && centerPanelRef.current) {
        const rect = centerPanelRef.current.getBoundingClientRect();
        const percentage = ((e.clientY - rect.top) / rect.height) * 100;
        setConsoleDividerPosition(Math.max(30, Math.min(80, percentage)));
      }
      if (isDraggingRightPanel && contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const newWidth = rect.right - e.clientX;
        setRightPanelWidth(Math.max(200, Math.min(500, newWidth)));
      }
      if (isDraggingLeftPanel && contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        setLeftPanelWidth(Math.max(200, Math.min(500, newWidth)));
      }
    },
    [isDraggingConsole, isDraggingRightPanel, isDraggingLeftPanel]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingConsole(false);
    setIsDraggingRightPanel(false);
    setIsDraggingLeftPanel(false);
  }, []);

  useEffect(() => {
    const isDragging = isDraggingConsole || isDraggingRightPanel || isDraggingLeftPanel;
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDraggingConsole ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingConsole, isDraggingRightPanel, isDraggingLeftPanel, handleMouseMove, handleMouseUp]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionEdit = () => {
    const text = `Title: ${question.title}\n\nDescription:\n${question.description}\n\nConstraints:\n${question.constraints.map(c => `- ${c}`).join('\n')}\n\nExample:\nInput: ${question.example.input}\nOutput: ${question.example.output}\nExplanation: ${question.example.explanation}`;
    setQuestionText(text);
    setIsEditingQuestion(true);
  };

  const handleQuestionSave = () => {
    const lines = questionText.split('\n');
    let title = '';
    let description = '';
    const constraints: string[] = [];
    let input = '';
    let outputStr = '';
    let explanation = '';

    let section = '';
    for (const line of lines) {
      if (line.startsWith('Title:')) {
        title = line.replace('Title:', '').trim();
      } else if (line.startsWith('Description:')) {
        section = 'description';
      } else if (line.startsWith('Constraints:')) {
        section = 'constraints';
      } else if (line.startsWith('Example:')) {
        section = 'example';
      } else if (line.startsWith('Input:')) {
        input = line.replace('Input:', '').trim();
      } else if (line.startsWith('Output:')) {
        outputStr = line.replace('Output:', '').trim();
      } else if (line.startsWith('Explanation:')) {
        explanation = line.replace('Explanation:', '').trim();
      } else if (section === 'description' && line.trim()) {
        description += (description ? ' ' : '') + line.trim();
      } else if (section === 'constraints' && line.startsWith('-')) {
        constraints.push(line.replace('-', '').trim());
      }
    }

    setQuestion({
      title: title || question.title,
      description: description || question.description,
      constraints: constraints.length > 0 ? constraints : question.constraints,
      example: {
        input: input || question.example.input,
        output: outputStr || question.example.output,
        explanation: explanation || question.example.explanation
      }
    });
    setIsEditingQuestion(false);
  };

  return (
    <div className={`interview-editor ${isTeachingMode ? 'teaching-mode' : ''}`} data-theme={theme}>
      {/* Header */}
      <header className="interview-header">
        <div className="interview-header-left">
          <img src="/codeLinkaLogo.png" alt="CodeLinka" className="interview-logo" />
          <div className={`interview-mode-badge ${isTeachingMode ? 'teaching' : ''}`}>
            <span className={`mode-dot ${isTeachingMode ? 'teaching' : ''}`}></span>
            <ModeIcon size={14} />
            <span>{modeLabel}</span>
          </div>
          <div className="interview-timer">
            <Clock size={16} />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
        <div className="interview-header-right">
          <div className={`interview-locked-badge ${isTeachingMode ? 'teaching' : ''}`}>
            <Lock size={14} />
            <Lock size={14} />
            <span>{isTeachingMode ? 'Session Active' : 'Interview Locked'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="interview-content" ref={contentRef}>
        {/* Left Panel - Question */}
        <div className="interview-panel question-panel" style={{ width: leftPanelWidth }}>
          <div className="panel-header">
            <span className="panel-title">{isTeachingMode ? 'LESSON' : 'QUESTION'}</span>
            <button
              className="edit-question-btn"
              onClick={isEditingQuestion ? handleQuestionSave : handleQuestionEdit}
            >
              {isEditingQuestion ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="panel-content">
            {isEditingQuestion ? (
              <textarea
                className="question-textarea"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter question details..."
              />
            ) : (
              <>
                <h2 className="question-title">{question.title}</h2>
                <p className="question-description">{question.description}</p>

                <h3 className="question-section-title">Constraints:</h3>
                <ul className="question-constraints">
                  {question.constraints.map((constraint, idx) => (
                    <li key={idx}>{constraint}</li>
                  ))}
                </ul>

                <h3 className="question-section-title">Example:</h3>
                <ul className="question-example">
                  <li>{question.example.input}</li>
                </ul>
                <p className="question-output-label">Output:</p>
                <ul className="question-example">
                  <li>{question.example.explanation}</li>
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Left Panel Resizer */}
        <div
          className={`left-panel-resizer ${isDraggingLeftPanel ? 'active' : ''}`}
          onMouseDown={handleLeftPanelResizerMouseDown}
        />

        {/* Center Panel - Editor & Console */}
        <div className="interview-panel center-panel" ref={centerPanelRef}>
          {/* Toolbar */}
          <div className="interview-toolbar">
            <div className="toolbar-left">
              <div className="toolbar-group">
                <label className="toolbar-label">LANGUAGE</label>
                <div className="toolbar-select-wrapper">
                  <select
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
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
              <div className="toolbar-group">
                <label className="toolbar-label">THEME</label>
                <div className="toolbar-select-wrapper">
                  <select
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
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
            </div>
            <div className="toolbar-right">
              <button className="toolbar-btn toolbar-btn-secondary" onClick={onClearCode}>
                Clear
              </button>
              <button
                className="toolbar-btn toolbar-btn-primary"
                onClick={onRun}
                disabled={isRunning}
              >
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="editor-section" style={{ height: `${consoleDividerPosition}%` }}>
            <CodeEditor
              language={language}
              theme={theme}
              value={code}
              onChange={onCodeChange}
            />
          </div>

          {/* Divider */}
          <div
            className={`console-divider ${isDraggingConsole ? 'active' : ''}`}
            onMouseDown={handleConsoleDividerMouseDown}
          />

          {/* Console */}
          <div className="console-section" style={{ height: `${100 - consoleDividerPosition}%` }}>
            <div className="console-header">
              <span>CONSOLE</span>
              <button className="console-clear-btn" onClick={onClearOutput}>
                Clear <ChevronDown size={14} />
              </button>
            </div>
            <div className="console-output">
              {output.length === 0 ? (
                <div className="console-placeholder">Output will appear here...</div>
              ) : (
                output.map((item) => (
                  <div key={item.id} className={`console-line console-${item.type}`}>
                    {item.content}
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
            <div className="console-footer">
              <button className="console-action-btn">
                <RotateCcw size={16} />
              </button>
              <button className="console-action-btn">
                <Play size={16} /> Compile
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel Resizer */}
        <div
          className={`right-panel-resizer ${isDraggingRightPanel ? 'active' : ''}`}
          onMouseDown={handleRightPanelResizerMouseDown}
        />

        {/* Right Panel - Video & Notes */}
        <div className="interview-panel right-panel" style={{ width: rightPanelWidth }}>
          {/* Video Feeds */}
          <div className="video-section">
            <div className="video-card">
              <div className={`video-placeholder ${isTeachingMode ? 'teacher' : 'interviewer'}`}>
                <div className="video-avatar"></div>
              </div>
              <span className="video-label">{isTeachingMode ? 'Teacher' : 'Interviewer'}</span>
            </div>
            <div className="video-card">
              <div className={`video-placeholder ${isTeachingMode ? 'student' : 'candidate'}`}>
                <div className="video-avatar"></div>
              </div>
              <span className="video-label">{isTeachingMode ? 'Student' : 'Candidate'}</span>
            </div>
          </div>

          {/* Notes Section */}
          <div className="notes-section">
            <button
              className="notes-btn"
              onClick={() => setShowNotes(!showNotes)}
            >
              <FileText size={18} />
              <span>Notes</span>
            </button>
            {showNotes && (
              <textarea
                className="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isTeachingMode ? "Add lesson notes here..." : "Add interview notes here..."}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewEditor;
