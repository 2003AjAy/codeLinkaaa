import { SupportedLanguage } from '../types/editor';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export interface ExecutionRequest {
  code: string;
  language: SupportedLanguage;
  input?: string;
}

export const executeCode = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        output: '',
        error: errorData.error || `Server error: ${response.status}`,
        executionTime: 0,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error
        ? `Connection error: ${error.message}. Make sure the server is running.`
        : 'Failed to connect to server',
      executionTime: 0,
    };
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};
