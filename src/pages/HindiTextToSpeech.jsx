import React, { useState, useEffect } from "react";
import SpeakTTS from "speak-tts";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          <h3 className="font-bold">
            Something went wrong with the TTS component
          </h3>
          <p className="mb-2">{this.state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const HindiTTS = () => {
  const [text, setText] = useState("");
  const [tts, setTts] = useState(null);
  const [status, setStatus] = useState("initializing"); // 'initializing', 'loading-voices', 'ready', 'error'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Initialize TTS
  useEffect(() => {
    const speech = new SpeakTTS();

    const initTTS = async () => {
      try {
        setStatus("initializing");
        await speech.init({
          volume: volume,
          lang: "hi-IN",
          rate: rate,
          pitch: pitch,
          splitSentences: true,
          listeners: {
            onvoiceschanged: (voices) => {
              setStatus("loading-voices");
              setVoices(voices);
              const hindiVoice =
                voices.find((v) => v.lang.includes("hi")) ||
                voices.find((v) => v.lang.includes("en")) ||
                voices[0];

              if (hindiVoice) {
                setSelectedVoice(hindiVoice);
                setVoicesLoaded(true);
                setStatus("ready");
              } else {
                setError("No Hindi voice found. Using default voice.");
                setSelectedVoice(voices[0]);
                setVoicesLoaded(true);
                setStatus("ready");
              }
            },
            onstart: () => setIsSpeaking(true),
            onend: () => {
              setIsSpeaking(false);
              setIsPaused(false);
            },
            onpause: () => setIsPaused(true),
            onresume: () => setIsPaused(false),
            onerror: (err) => {
              setError(`TTS Error: ${err.message}`);
              setStatus("error");
            },
          },
        });

        setTts(speech);
      } catch (err) {
        console.error("TTS initialization failed:", err);
        setError(
          "Text-to-speech initialization failed. Please try refreshing the page."
        );
        setStatus("error");
      }
    };

    initTTS();

    return () => {
      if (speech && speech.cancel) {
        speech.cancel();
      }
    };
  }, []);

  // Update TTS settings when they change
  useEffect(() => {
    if (tts && voicesLoaded) {
      try {
        tts.setRate(rate);
        tts.setPitch(pitch);
        tts.setVolume(volume);
        if (selectedVoice) {
          tts.setVoice(selectedVoice);
        }
      } catch (err) {
        console.error("Failed to update TTS settings:", err);
        setError("Failed to update voice settings. Please try again.");
      }
    }
  }, [tts, rate, pitch, volume, selectedVoice, voicesLoaded]);

  const handleVoiceChange = (e) => {
    const voiceName = e.target.value;
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    } else {
      setError("Selected voice not available. Using default voice.");
      setSelectedVoice(voices[0]);
    }
  };

  const speak = () => {
    if (status !== "ready" || !text.trim()) return;

    setError(null);
    tts
      .speak({
        text: text,
        queue: false,
      })
      .catch((err) => {
        console.error("Speech error:", err);
        setError("Error speaking the text. Please try again.");
        setStatus("error");
      });
  };

  const pause = () => {
    if (tts && isSpeaking) {
      tts.pause();
    }
  };

  const resume = () => {
    if (tts && isPaused) {
      tts.resume();
    }
  };

  const stop = () => {
    if (tts) {
      tts.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "initializing":
        return "Initializing text-to-speech engine...";
      case "loading-voices":
        return "Loading available voices...";
      case "error":
        return "An error occurred. Please try again.";
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Hindi Text-to-Speech
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label
            htmlFor="hindi-text"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Enter Hindi Text:
          </label>
          <textarea
            id="hindi-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[200px] p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="यहाँ हिंदी में टेक्स्ट लिखें..."
            disabled={status !== "ready"}
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Voice Settings
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {voices.length > 0 && (
              <div>
                <label
                  htmlFor="voice-select"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Voice:
                </label>
                <select
                  id="voice-select"
                  value={selectedVoice?.name || ""}
                  onChange={handleVoiceChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={status !== "ready"}
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="rate"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Speed: {rate.toFixed(1)}
              </label>
              <input
                id="rate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full"
                disabled={status !== "ready"}
              />
            </div>

            <div>
              <label
                htmlFor="pitch"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Pitch: {pitch.toFixed(1)}
              </label>
              <input
                id="pitch"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full"
                disabled={status !== "ready"}
              />
            </div>

            <div>
              <label
                htmlFor="volume"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Volume: {volume.toFixed(1)}
              </label>
              <input
                id="volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full"
                disabled={status !== "ready"}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {!isSpeaking ? (
            <button
              onClick={speak}
              disabled={status !== "ready" || !text.trim()}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                status !== "ready" || !text.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Speak
            </button>
          ) : isPaused ? (
            <button
              onClick={resume}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg"
            >
              Pause
            </button>
          )}

          <button
            onClick={stop}
            disabled={!isSpeaking && !isPaused}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              !isSpeaking && !isPaused
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Stop
          </button>
        </div>

        {status !== "ready" && (
          <div className="text-center text-gray-600">
            {getStatusMessage()}
            {status === "error" && (
              <button
                onClick={() => window.location.reload()}
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default HindiTTS;
