
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import LanguageSelector from './LanguageSelector';
import styles from '../styles/CodeEditor.module.css';

const CodeEditor = ({ code, setCode, language, setLanguage, onRun, onSubmit }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.getModel().setValue(code);
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setModelLanguage(editorRef.current.getModel(), language);
    }
  }, [language]);

  return (
    <div className={styles.editorContainer}>
      <div className={styles.controlsContainer}>
        <LanguageSelector language={language} setLanguage={setLanguage} />
        <div className={styles.controls}>
          <button className={styles.runButton} onClick={onRun}>Run</button>
          <button className={styles.submitButton} onClick={onSubmit}>Submit</button>
        </div>
      </div>
      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={handleEditorChange}
        editorDidMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;