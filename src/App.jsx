import React from "react";
import VoiceToTextConverter from "./pages/VoiceConverter";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HindiTextToSpeech from "./pages/HindiTextToSpeech";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VoiceToTextConverter />} />
        <Route path="/test" element={<HindiTextToSpeech />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
