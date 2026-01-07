import { LanguageConfig, SupportedLanguage } from '../types/editor';

export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    extension: '.js',
    defaultFileName: 'main.js',
  },
  python: {
    id: 'python',
    label: 'Python',
    monacoLanguage: 'python',
    extension: '.py',
    defaultFileName: 'main.py',
  },
  cpp: {
    id: 'cpp',
    label: 'C++',
    monacoLanguage: 'cpp',
    extension: '.cpp',
    defaultFileName: 'main.cpp',
  },
  java: {
    id: 'java',
    label: 'Java',
    monacoLanguage: 'java',
    extension: '.java',
    defaultFileName: 'Main.java',
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
