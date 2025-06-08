import React from "react";
import VoiceToTextConverter from "./pages/VoiceConverter";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VoiceToTextConverter />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
