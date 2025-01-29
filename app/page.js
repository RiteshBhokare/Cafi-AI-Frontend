"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  DisconnectButton,
} from "@livekit/components-react";
import { MediaDeviceFailure } from "livekit-client";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { NoAgentNotification } from "../components/NoAgentNotification";
import { CloseIcon } from "../components/CloseIcon";
import OutputPanel from "../components/OutputPanel";
import styles from "../styles/Home.module.css";
// import { ConnectionDetails } from "../pages/api/route";


const CodeEditor = dynamic(() => import("../components/CodeEditor"), { ssr: false });

export default function HomePage() {
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState("// Write your code here...");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submissionResponse, setSubmissionResponse] = useState("");
  const [connectionDetails, updateConnectionDetails] = useState(undefined);
  const [agentState, setAgentState] = useState("disconnected");

  // Fetch connection details for LiveKit
  const onConnectButtonClicked = useCallback(async () => {
    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
      window.location.origin
    );
    const response = await fetch(url.toString());
    const connectionDetailsData = await response.json();
    updateConnectionDetails(connectionDetailsData);
  }, []);

  // Handle Code Execution
  const handleRunCode = async () => {
    console.log("Running code with language:", language);
    console.log("Code to run:", code);
    try {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        const errorText = await response.text();
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

  // Handle Code Submission
  const handleSubmit = async () => {
    console.log("Submitting code with language:", language);
    console.log("Code to submit:", code);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
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
      {/* Left Panel - LiveKit Voice Assistant */}
      <div className={styles.leftPanel}>
        <LiveKitRoom
          token={connectionDetails?.participantToken}
          serverUrl={connectionDetails?.serverUrl}
          connect={!!connectionDetails}
          audio={true}
          video={false}
          onMediaDeviceFailure={onDeviceFailure}
          onDisconnected={() => updateConnectionDetails(undefined)}
          className="grid grid-rows-[2fr_1fr] items-center"
        >
          <SimpleVoiceAssistant onStateChange={setAgentState} />
          <ControlBar
            onConnectButtonClicked={onConnectButtonClicked}
            agentState={agentState}
          />
          <RoomAudioRenderer />
          <NoAgentNotification state={agentState} />
        </LiveKitRoom>
      </div>

      {/* Right Panel - Code Editor */}
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
        <OutputPanel output={output} />
      </div>
    </div>
  );
}

function SimpleVoiceAssistant({ onStateChange }) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  return (
    <div className="h-[300px] max-w-[90vw] mx-auto">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar({ onConnectButtonClicked, agentState }) {
  const krisp = useKrispNoiseFilter();

  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
  }, [krisp]);

  return (
    <div className="relative h-[100px]">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
            onClick={onConnectButtonClicked}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <CloseIcon />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab."
  );
}
