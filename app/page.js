'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import OutputPanel from '../components/OutputPanel'; 
import styles from '../styles/Home.module.css';


const CodeEditor = dynamic(() => import('../components/CodeEditor'), { ssr: false });

export default function HomePage() {
    const [messages, setMessages] = useState([]);
    const [code, setCode] = useState('// Write your code here...');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [submissionResponse, setSubmissionResponse] = useState('');


    const handleRunCode = async () => {
        console.log("Running code with language:", language);
        console.log("Code to run:", code);
        try {
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language }),
            });

            if (!response.ok) {
                const errorText = await response.text(); // Get the response text for more details
                console.error("Failed to compile code:", errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log("Compilation result:", result);
            setOutput(result.output);
        } catch (error) {
            console.error("Error running code:", error);
            setOutput(`Error: ${error.message}`);
        }
    };

    const handleSubmit = async () => {
        console.log("Submitting code with language:", language);
        console.log("Code to submit:", code);
    
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language }), // Send code and language as payload
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to submit code:", errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
    
            const result = await response.json();
            console.log("Submission result:", result);
            setSubmissionResponse(result.message || "Submission successful!");
        } catch (error) {
            console.error("Error during submission:", error.message);
            setSubmissionResponse(`Error: ${error.message}`);
        }
    };
    
    

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                
            
            </div>
            <div className={styles.rightPanel}>
                <div className={styles.codeEditorSection}>
                    <CodeEditor
                        code={code}
                        setCode={setCode}
                        language={language}
                        setLanguage={setLanguage}
                        onRun={handleRunCode}  
                        onSubmit={handleSubmit}  
                    />
                </div>
                <OutputPanel output={output} /> {/* Displaying output here */}
            </div>
        </div>
    );
}