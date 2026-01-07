export type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java';

export interface ExecutionRequest {
  code: string;
  language: SupportedLanguage;
  input?: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export interface LanguageConfig {
  image: string;
  fileName: string;
  compileCmd?: string;
  runCmd: string;
  timeout: number;
}

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    image: 'node:20-alpine',
    fileName: 'script.js',
    runCmd: 'node script.js',
    timeout: 10000,
  },
  python: {
    image: 'python:3.12-alpine',
    fileName: 'script.py',
    runCmd: 'python script.py',
    timeout: 10000,
  },
  cpp: {
    image: 'gcc:13',
    fileName: 'main.cpp',
    compileCmd: 'g++ -o main main.cpp',
    runCmd: './main',
    timeout: 15000,
  },
  java: {
    image: 'eclipse-temurin:21',
    fileName: 'Main.java',
    compileCmd: 'javac Main.java',
    runCmd: 'java Main',
    timeout: 30000,
  },
};
