import React, { useState } from "react";

const TranslationToHindi = ({
  transcribedText,
  onTranslationComplete,
  onError,
  onSuccess,
}) => {
  const [hindiText, setHindiText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Translate text to Hindi
  const TranslateToHindi = async (text) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    setIsConverting(true);
    onError("");

    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(
          text
        )}`
      );

      if (!response.ok) {
        throw new Error("Translation service unavailable");
      }

      const data = await response.json();

      let translatedText = "";
      if (data && data[0]) {
        for (let i = 0; i < data[0].length; i++) {
          if (data[0][i][0]) {
            translatedText += data[0][i][0];
          }
        }
      }

      if (!translatedText) {
        throw new Error("Translation failed - no text returned");
      }

      const finalTranslation = translatedText.trim();
      setHindiText(finalTranslation);
      onTranslationComplete(finalTranslation);
      onSuccess("Translation completed successfully!");
    } catch (err) {
      try {
        onSuccess("Trying alternative translation service...");

        const fallbackResponse = await fetch(
          "https://translate.argosopentech.com/translate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              q: text,
              source: "en",
              target: "hi",
              format: "text",
            }),
          }
        );

        if (!fallbackResponse.ok) {
          throw new Error("Both translation services unavailable");
        }

        const fallbackData = await fallbackResponse.json();

        if (fallbackData.translatedText) {
          const finalTranslation = fallbackData.translatedText.trim();
          setHindiText(finalTranslation);
          onTranslationComplete(finalTranslation);
          onSuccess("Translation completed via alternative service!");
        } else {
          throw new Error("Alternative translation failed");
        }
      } catch (fallbackErr) {
        onError(
          `Translation error: ${err.message}. Please check your internet connection or try a shorter text.`
        );
      }
    } finally {
      setIsTranslating(false);
      setTimeout(() => setIsConverting(false), 1000);
    }
  };

  const handleTranslateClick = () => {
    setIsConverting(true);
    translateToHindi(transcribedText);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-orange-300">
        Translate to Hindi
      </h2>

      {/* Converting Animation */}
      {isConverting && !hindiText && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
          <p className="text-center mt-4 text-orange-300">
            Converting to Hindi...
          </p>
        </div>
      )}

      {/* English Text Display */}
      {transcribedText && !isConverting && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              English Text:
            </h3>
            <div className="bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap text-gray-100">
                {transcribedText}
              </p>
            </div>
          </div>

          <button
            onClick={handleTranslateClick}
            disabled={isTranslating}
            className={`w-full py-2 rounded-lg font-medium transition-colors ${
              isTranslating
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {isTranslating ? "Translating..." : "Translate to Hindi"}
          </button>
        </div>
      )}

      {/* Hindi Text Display */}
      {hindiText && !isConverting && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Hindi Translation:
            </h3>
            <div className="bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
              <p
                className="text-sm whitespace-pre-wrap text-gray-100"
                style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}
              >
                {hindiText}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationToHindi;
