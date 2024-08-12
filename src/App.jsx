import { useState, useEffect } from "react";
import "./App.css";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export const App = () => {
  const [isListening, setIsListening] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    commands: [
      {
        command: "Please open array.",
        callback: () => window.open("https://www.geeksforgeeks.org/array-data-structure-guide/?ref=shm", "_blank"),
      },
      {
        command: "Please open tree.",
        callback: () => window.open("https://www.geeksforgeeks.org/tree-data-structure/?ref=shm", "_blank"),
      },
      {
        command: "Please open stack.",
        callback: () => window.open("https://www.geeksforgeeks.org/stack-data-structure/?ref=shm", "_blank"),
      },
      {
        command: "Please open *",
        callback: (site) => {
          const sanitizedSite = site.trim().replace(/\.$/, ""); // Remove trailing full stop
          const formattedSite = sanitizedSite.replace(/\s+/g, "-"); // Replace spaces with dashes
          const url = `https://www.geeksforgeeks.org/${formattedSite}-data-structure/?ref=shm`;
          window.open(url, "_blank");
        },
      },
    ],
  });

  useEffect(() => {
    if (listening !== isListening) {
      setIsListening(listening);
    }
  }, [listening, isListening]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>;
  }

  const startListening = () => {
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: false });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
  };

  return (
    <div className="container">
      <h2>Speech to Text Converter</h2>
      <p>Please click on start and tell me where you want to navigate.</p>
      <div className="main-content">
        <p>Microphone: {listening ? "on" : "off"}</p>
        <div className="button-section">
          <button 
            onClick={startListening} 
            disabled={isListening} 
            className={isListening ? "button-active" : ""}
          >
            {isListening ? "Listening..." : "Start"}
          </button>
          <button 
            onClick={stopListening} 
            disabled={!isListening}
          >
            Stop
          </button>
          <button onClick={resetTranscript}>Reset</button>
        </div>
        <p className="transcript">{transcript}</p>
      </div>
    </div>
  );
};

export default App;
