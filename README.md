# English to Hindi Speech Converter

A modern React web application that converts English audio to Hindi speech through a seamless three-step process: audio transcription, translation, and text-to-speech synthesis.

## 🚀 Features

### 🎤 Audio Input
- **File Upload**: Support for MP3, WAV, M4A, and AAC formats (up to 50MB)
- **Real-time Recording**: Record audio directly in the browser
- **Drag & Drop**: Intuitive file upload interface
- **Audio Preview**: Play and preview uploaded/recorded audio

### 📝 Speech-to-Text
- **AI-Powered Transcription**: Uses AssemblyAI for accurate English transcription
- **Real-time Processing**: Live progress tracking during transcription
- **Speaker Labels**: Supports multi-speaker audio identification

### 🔄 Translation
- **Automatic Translation**: Converts English text to Hindi using Google Translate API
- **Fallback Service**: Uses alternative translation service if primary fails
- **Accurate Results**: Maintains context and meaning in translation

### 🔊 Text-to-Speech
- **Native Browser TTS**: Uses Web Speech API for Hindi speech synthesis
- **Voice Selection**: Choose from available Hindi voices
- **Customizable Settings**: Adjust speed, volume, and pitch
- **Progress Tracking**: Real-time speech progress indication

### 💾 Export Options
- **Download Transcription**: Save both English and Hindi text as a file
- **Formatted Output**: Includes timestamps and metadata

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **APIs**: 
  - AssemblyAI (Speech-to-Text)
  - Google Translate (Translation)
  - Web Speech API (Text-to-Speech)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/keerthiks16/english-to-hindi-speech-converter.git
   cd english-to-hindi-speech-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up API Key**
   - Open `src/pages/AudioUploadToTextGen.jsx`
   - Replace the `API_KEY` constant with your AssemblyAI API key:
     ```javascript
     const API_KEY = "your_assemblyai_api_key_here";
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## 🔧 Configuration

### AssemblyAI API Key
To use the transcription feature, you need an AssemblyAI API key:

1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Replace the placeholder in `AudioUploadToTextGen.jsx`

### Browser Requirements
- Modern browser with Web Speech API support
- Microphone access for recording feature
- Internet connection for transcription and translation

## 🎯 Usage

### Step 1: Audio Input
1. **Upload Method**: 
   - Click the upload area or drag & drop an audio file
   - Supported formats: MP3, WAV, M4A, AAC (max 50MB)

2. **Recording Method**:
   - Click "Record Audio" tab
   - Allow microphone access
   - Click "Start Recording" and speak
   - Click "Stop Recording" when done

3. **Convert to Text**:
   - Preview your audio using the built-in player
   - Click "Convert to Text" to start transcription

### Step 2: Translation
1. Review the transcribed English text
2. Click "Translate to Hindi" 
3. The Hindi translation will appear automatically

### Step 3: Speech & Download
1. **Listen to Hindi Speech**:
   - Select preferred Hindi voice (if available)
   - Adjust speed and volume settings
   - Click play button to hear the Hindi speech

2. **Download Results**:
   - Click "Download Translation" to save both English and Hindi text
   - File includes timestamps and metadata

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|---------|---------|---------|------|
| File Upload | ✅ | ✅ | ✅ | ✅ |
| Audio Recording | ✅ | ✅ | ✅ | ✅ |
| Hindi TTS | ✅ | ✅ | ⚠️ | ✅ |
| Translation | ✅ | ✅ | ✅ | ✅ |

*⚠️ Safari has limited Hindi voice support*

## 🔊 Supported Languages

- **Input**: English audio/speech
- **Output**: Hindi (Devanagari script)
- **TTS**: Hindi voices (availability depends on browser/OS)



### Project Structure
```
src/
├── App.jsx                     # Main app component
├── pages/
│   ├── VoiceConverter.jsx      # Main converter component
│   ├── AudioUploadToTextGen.jsx# Audio upload & transcription
│   ├── TranslationToHindi.jsx  # Translation component
│   └── TextToHindiSpeech.jsx   # TTS component
├── assets/                     # Static assets
└── styles/                     # CSS files
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request




## 🤝 Acknowledgments

- [AssemblyAI](https://www.assemblyai.com/) for speech-to-text API
- [Google Translate](https://translate.google.com/) for translation services
- [Lucide React](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for styling


