import React, { useEffect, useRef } from 'react';
import { ConsoleOutput } from '../../types/editor';

interface OutputConsoleProps {
  output: ConsoleOutput[];
  onClear: () => void;
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const OutputConsole: React.FC<OutputConsoleProps> = ({ output, onClear }) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="console-container">
      <div className="console-header">
        <span className="console-title">Console</span>
        <button
          className="console-clear-button"
          onClick={onClear}
          title="Clear console"
        >
          Clear
        </button>
      </div>
      <div className="console-output">
        {output.length === 0 ? (
          <div className="console-placeholder">
            Output will appear here when you run your code...
          </div>
        ) : (
          output.map((item) => (
            <div
              key={item.id}
              className={`console-line console-line-${item.type}`}
            >
              <span className="console-timestamp">[{formatTime(item.timestamp)}]</span>
              <pre className="console-content">{item.content}</pre>
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default OutputConsole;
