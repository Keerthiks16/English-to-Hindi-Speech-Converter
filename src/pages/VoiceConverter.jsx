import React, { useState } from "react";
import AudioUploadToTextGen from "./AudioUploadToTextGen";
import TranslationToHindi from "./TranslationToHindi";
import TextToHindiSpeech from "./TextToHindiSpeech";

const VoiceConverter = () => {
  // Global state management
  const [transcribedText, setTranscribedText] = useState("");
  const [hindiText, setHindiText] = useState("");
  const [audioFileName, setAudioFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handler for when transcription is completed
  const handleTranscriptionComplete = (text, fileName) => {
    setTranscribedText(text);
    setAudioFileName(fileName);
    setHindiText(""); // Reset Hindi text when new transcription arrives
  };

  // Handler for when translation is completed
  const handleTranslationComplete = (translatedText) => {
    setHindiText(translatedText);
  };

  // Global error handler
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setSuccess(""); // Clear success message when error occurs
  };

  // Global success handler
  const handleSuccess = (successMessage) => {
    setSuccess(successMessage);
    setError(""); // Clear error message when success occurs
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-300">
          English to Hindi Speech Converter
        </h1>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Audio Upload & Transcription */}
          <AudioUploadToTextGen
            onTranscriptionComplete={handleTranscriptionComplete}
            onError={handleError}
            onSuccess={handleSuccess}
          />

          {/* Middle column - Translation */}
          <TranslationToHindi
            transcribedText={transcribedText}
            onTranslationComplete={handleTranslationComplete}
            onError={handleError}
            onSuccess={handleSuccess}
          />

          {/* Right column - Speech & Download */}
          <TextToHindiSpeech
            hindiText={hindiText}
            transcribedText={transcribedText}
            audioFileName={audioFileName}
            onError={handleError}
            onSuccess={handleSuccess}
          />
        </div>

        {/* Global Status Messages */}
        <div className="mt-6 max-w-2xl mx-auto">
          {error && (
            <div className="p-4 bg-red-900/50 text-red-300 rounded-lg text-sm mb-4 border border-red-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">Error:</span>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-900/50 text-green-300 rounded-lg text-sm border border-green-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Status:</span>
              </div>
              <p className="mt-1">{success}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">
              How to Use:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  1
                </div>
                <h4 className="font-medium text-blue-300 mb-1">Upload Audio</h4>
                <p>Upload your audio file (MP3) and convert it to text</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  2
                </div>
                <h4 className="font-medium text-orange-300 mb-1">Translate</h4>
                <p>Translate the English text to Hindi</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  3
                </div>
                <h4 className="font-medium text-green-300 mb-1">
                  Listen & Download
                </h4>
                <p>
                  Listen to Hindi speech and download the complete translation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceConverter;
