import { useState, useEffect } from "react";
import "./App.css";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import searchPrompt from "./gemini";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { API_KEY_Google, searchengineID } from  './assets/configAPI';

export const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [urls, setUrls] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedUrl, setSelectedUrl] = useState(""); // URL for iframe

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setIsListening(listening);
    if (!listening && transcript.trim() !== "") {
      fetchUrls(transcript);
    }
  }, [listening, transcript]);

  const fetchUrls = async (input) => {
    try {
      setLoading(true); // Set loading to true when starting fetch
      const fetchedUrls = await searchForUrls(input);
      setUrls(fetchedUrls);
      if (fetchedUrls.length > 0) {
        const geminiRes = await getGeminiResponse(input, fetchedUrls);
        setGeminiResponse(geminiRes);

        // Display the first URL in the left section iframe
        if (fetchedUrls.length > 0) {
          setSelectedUrl(fetchedUrls[0]);
        }
      }
    } catch (error) {
      console.error('Error processing the voice command:', error);
      setUrls([]);
      setGeminiResponse("");
    } finally {
      setLoading(false); // Set loading to false once fetch is complete
    }
  };

  const getGeminiResponse = async (query, fetchedUrls) => {
    const urlsText = fetchedUrls.join(", ");
    const prompt = `Given the phrase "${query}" and the following URLs, analyze and rank the URLs solely based on their relevance to this phrase. Return only the ranked URLs in descending order of relevance, with no additional explanations, commentary, text, or formatting. The output should be a plain list of URLs in the correct order: List of URLs - [${urlsText}].`;
    const response = await searchPrompt(prompt);
    return response;
  };

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

  // Clean URLs
  const cleanUrl = (url) => url.replace(/^-+|-+$/g, '');

  return (
    <div className="container">
      <div className="top-bar">
        <img src="public/logo/websitelogo-removebg-preview.png" alt="Logo" className="left-icon" />
        <section className="logo-text"> 
          Wave<span className="logo-subtext">Length</span>
        </section>
        <div className="top-input">Coming soon ...</div>
      </div>
      <div className="content">
        <div className="left-section">
          {loading ? (
            <div className="box">Loading...</div> // Show loading while fetching
          ) : selectedUrl ? (
            <iframe src={selectedUrl} title="Selected Website" className="iframe-content"></iframe> // Display the selected URL in iframe
          ) : (
            <div className="box">Click on mic icon and tell where you want to navigate.</div>
          )}
        </div>
        <div className="right-section">
          <div className="suggestions-title">Suggestions</div>
          <ul className="suggestions">
            {geminiResponse.split(' ').map((url, index) => (
              <li key={index}>
                <a href="#!" onClick={() => setSelectedUrl(cleanUrl(url))} title={url}>
                  {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bottom-bar">
        <div className="bottom-icon1" title="Mic on" onClick={startListening}>
          <FontAwesomeIcon 
            icon={faMicrophone} 
            size="2x" 
            style={{ color: "#484b6a", transition: "color 0.3s ease" }} 
            className="icon-mic-on"
          />
        </div>
        <div className="bottom-icon2" title="Mic off" onClick={stopListening}>
          <FontAwesomeIcon 
            icon={faMicrophoneSlash} 
            size="2x" 
            style={{ color: "#484b6a", transition: "color 0.3s ease" }} 
            className="icon-mic-off"
          />
        </div>
        <div className="bottom-icon3" title="Clear" onClick={resetTranscript}>
          <FontAwesomeIcon 
            icon={faCircleXmark} 
            size="2x" 
            style={{ color: "#484b6a", transition: "color 0.3s ease" }} 
            className="icon-clear"
          />
        </div>
        <div className="bottom-input">{transcript}</div>
      </div>
    </div>
  );
};

// Function to search for URLs
const searchForUrls = async (query) => {
  try {
    const apiKey2 = API_KEY_Google;
    const searchEngineId = searchengineID;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey2}&cx=${searchEngineId}&q=${query}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const urls = data.items.map(item => item.link);
    return urls;
  } catch (error) {
    console.error('Error searching for URLs:', error);
    return [];
  }
};

export default App;
