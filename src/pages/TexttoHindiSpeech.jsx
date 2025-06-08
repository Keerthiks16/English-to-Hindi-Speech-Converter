import React, { useState, useRef, useEffect } from "react";
import { Download, Play, Square, Volume2, VolumeX } from "lucide-react";

const TextToHindiSpeech = ({
  hindiText,
  transcribedText,
  audioFileName,
  onError,
  onSuccess,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [speechRate, setSpeechRate] = useState(0.8);
  const [speechVolume, setSpeechVolume] = useState(1);

  const currentUtteranceRef = useRef(null);
  const speechQueueRef = useRef([]);
  const currentChunkIndexRef = useRef(0);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const hindiVoices = voices.filter(
        (voice) =>
          voice.lang.includes("hi") ||
          voice.lang.includes("HI") ||
          voice.name.toLowerCase().includes("hindi") ||
          voice.name.toLowerCase().includes("devanagari")
      );

      setAvailableVoices(hindiVoices);

      if (hindiVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(hindiVoices[0].name);
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  // Speak Hindi text
  const speakHindi = () => {
    if (!hindiText.trim()) {
      onError("No Hindi text to speak");
      return;
    }

    if (!("speechSynthesis" in window)) {
      onError("Text-to-speech not supported in this browser");
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechProgress(0);
    currentChunkIndexRef.current = 0;

    const createTextChunks = (text) => {
      const cleanText = text.replace(/\s+/g, " ").trim();
      if (cleanText.length <= 100) return [cleanText];

      const chunks = [];
      const sentences = cleanText.split(/[।|!|?|\.]+/).filter((s) => s.trim());
      let currentChunk = "";
      const maxChunkLength = 150;

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;

        if (
          currentChunk &&
          (currentChunk + " " + trimmedSentence).length > maxChunkLength
        ) {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        } else {
          currentChunk = currentChunk
            ? currentChunk + " " + trimmedSentence
            : trimmedSentence;
        }
      }

      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      return chunks.length > 0 ? chunks : [cleanText];
    };

    const textChunks = createTextChunks(hindiText);
    speechQueueRef.current = textChunks;

    setIsSpeaking(true);
    onError("");

    const speakNextChunk = () => {
      const currentIndex = currentChunkIndexRef.current;

      if (currentIndex >= speechQueueRef.current.length) {
        setIsSpeaking(false);
        setSpeechProgress(100);
        currentUtteranceRef.current = null;
        onSuccess("Speech completed successfully!");
        return;
      }

      const chunk = speechQueueRef.current[currentIndex];
      const utterance = new SpeechSynthesisUtterance(chunk);

      if (selectedVoice) {
        const chosenVoice = availableVoices.find(
          (voice) => voice.name === selectedVoice
        );
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }
      } else {
        const hindiVoice = availableVoices.find(
          (voice) =>
            voice.lang.includes("hi") ||
            voice.lang.includes("HI") ||
            voice.name.toLowerCase().includes("hindi")
        );
        if (hindiVoice) {
          utterance.voice = hindiVoice;
        }
      }

      utterance.lang = "hi-IN";
      utterance.rate = speechRate;
      utterance.pitch = 1;
      utterance.volume = speechVolume;

      utterance.onstart = () => {
        console.log(
          `Speaking chunk ${currentIndex + 1}/${speechQueueRef.current.length}`
        );
      };

      utterance.onend = () => {
        currentChunkIndexRef.current++;
        const progress =
          ((currentIndex + 1) / speechQueueRef.current.length) * 100;
        setSpeechProgress(Math.round(progress));

        setTimeout(() => {
          if (isSpeaking) {
            speakNextChunk();
          }
        }, 200);
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);

        if (event.error === "interrupted" || event.error === "canceled") {
          return;
        }

        if (event.error === "network" || event.error === "synthesis-failed") {
          currentChunkIndexRef.current++;
          if (currentChunkIndexRef.current < speechQueueRef.current.length) {
            setTimeout(() => speakNextChunk(), 500);
            return;
          }
        }

        setIsSpeaking(false);
        onError(
          `Speech error: ${event.error}. Try using shorter text or refresh the page.`
        );
      };

      currentUtteranceRef.current = utterance;

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setIsSpeaking(false);
        onError("Speech synthesis error. Please try again.");
      }
    };

    speakNextChunk();
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechProgress(0);
    currentUtteranceRef.current = null;
    speechQueueRef.current = [];
    currentChunkIndexRef.current = 0;
  };

  // Download transcription
  const downloadTranscription = () => {
    const content = `Transcription for: ${audioFileName}\nDate: ${new Date().toLocaleString()}\n\n--- ENGLISH ---\n${transcribedText}\n\n--- HINDI (हिंदी) ---\n${
      hindiText || "Not translated"
    }`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${audioFileName.replace(
      /\.[^/.]+$/,
      ""
    )}_translation.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onSuccess("File downloaded successfully!");
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-green-300">
        Hindi Speech & Download
      </h2>

      {hindiText ? (
        <div className="space-y-4">
          {/* TTS Controls */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-center gap-4 mb-4">
              {!isSpeaking ? (
                <button
                  onClick={speakHindi}
                  className="p-3 bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                  title="Play Hindi Speech"
                >
                  <Play size={20} />
                </button>
              ) : (
                <button
                  onClick={stopSpeaking}
                  className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  title="Stop Speech"
                >
                  <Square size={20} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Voice Selection */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Voice Selection
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2 bg-gray-600 rounded text-sm text-white"
                >
                  <option value="">Default Hindi Voice</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Control */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Speed: {speechRate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Volume Control */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Volume: {Math.round(speechVolume * 100)}%
                </label>
                <div className="flex items-center gap-2">
                  <VolumeX size={14} className="text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={speechVolume}
                    onChange={(e) =>
                      setSpeechVolume(parseFloat(e.target.value))
                    }
                    className="flex-1"
                  />
                  <Volume2 size={14} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isSpeaking && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Speech Progress</span>
                  <span>{speechProgress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${speechProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={downloadTranscription}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={18} />
            Download Translation
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>Hindi translation will appear here</p>
          <p className="text-sm mt-2">Upload audio and translate to continue</p>
        </div>
      )}
    </div>
  );
};

export default TextToHindiSpeech;
