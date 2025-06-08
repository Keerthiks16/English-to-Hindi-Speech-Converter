import React, { useState, useRef, useEffect } from "react";
import { Upload, Mic, Square, Play, Pause } from "lucide-react";

const AudioUploadToTextGen = ({
  onTranscriptionComplete,
  onError,
  onSuccess,
}) => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "record"

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // API configuration
  const ASSEMBLYAI_API_URL = "https://api.assemblyai.com/v2";
  const API_KEY = "b3188a1a156f41a1b8fb05dcc40c27bc";

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
    if (!file) return;

    // Validate file type and size
    const acceptedFormats = [".mp3", ".wav", ".m4a", ".aac"];
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!acceptedFormats.includes(fileExtension)) {
      onError(
        `Unsupported file format. Please use ${acceptedFormats.join(", ")}`
      );
      return;
    }

    if (file.size > maxFileSize) {
      onError("File size exceeds 50MB limit");
      return;
    }

    setAudioFile(file);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(file));
    onError("");
    onSuccess("");
    simulateUpload();
  };

  // Simulate upload progress
  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e);
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const file = new File([blob], `recording-${Date.now()}.wav`, {
          type: "audio/wav",
        });

        setAudioFile(file);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        setRecordedChunks(chunks);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      onError("");
      onSuccess("");

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      onError("Failed to access microphone. Please check permissions.");
      console.error("Error accessing microphone:", err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      onSuccess("Recording completed!");
    }
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle audio playback
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Upload audio file to AssemblyAI
  const uploadAudioFile = async (file) => {
    const formData = new FormData();
    formData.append("audio", file);

    const response = await fetch(`${ASSEMBLYAI_API_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.upload_url;
  };

  // Transcribe audio using AssemblyAI
  const transcribeAudio = async (audioUrl) => {
    const response = await fetch(`${ASSEMBLYAI_API_URL}/transcript`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speaker_labels: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Transcription request failed (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return data.id;
  };

  // Poll transcription result
  const pollTranscriptionResult = async (transcriptId) => {
    while (true) {
      const response = await fetch(
        `${ASSEMBLYAI_API_URL}/transcript/${transcriptId}`,
        {
          headers: {
            Authorization: API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get transcription result (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      if (data.status === "completed") {
        return data;
      } else if (data.status === "error") {
        throw new Error(`Transcription failed: ${data.error}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  };

  // Start transcription process
  const startTranscription = async () => {
    if (!audioFile) {
      onError("Please upload an audio file or record audio first");
      return;
    }

    setIsTranscribing(true);
    onError("");
    onSuccess("");

    try {
      onSuccess("Uploading audio file...");
      const uploadUrl = await uploadAudioFile(audioFile);

      onSuccess("Starting transcription...");
      const transcriptId = await transcribeAudio(uploadUrl);

      onSuccess("Processing audio... This may take a few minutes.");
      const result = await pollTranscriptionResult(transcriptId);

      onTranscriptionComplete(result.text, audioFile.name);
      onSuccess("Transcription completed successfully!");
    } catch (err) {
      onError(`Error: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-blue-300">Audio Input</h2>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium ${
            activeTab === "upload"
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          <Upload className="inline-block w-4 h-4 mr-2" />
          Upload File
        </button>
        <button
          onClick={() => setActiveTab("record")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium ${
            activeTab === "record"
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          <Mic className="inline-block w-4 h-4 mr-2" />
          Record Audio
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
            dragActive ? "border-blue-400 bg-gray-700" : "border-gray-600"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-8 w-8 text-blue-400 mb-3" />
          <p className="text-sm mb-1">
            {audioFile && activeTab === "upload"
              ? audioFile.name
              : "Drag & drop audio file"}
          </p>
          <p className="text-xs text-gray-400">MP3, WAV, M4A, AAC (max 50MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.aac"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Record Tab */}
      {activeTab === "record" && (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
          <Mic className="mx-auto h-8 w-8 text-blue-400 mb-3" />

          {!isRecording && !audioFile ? (
            <>
              <p className="text-sm mb-1">Click to start recording</p>
              <p className="text-xs text-gray-400 mb-4">
                Make sure to allow microphone access
              </p>
              <button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <Mic className="inline-block w-4 h-4 mr-2" />
                Start Recording
              </button>
            </>
          ) : isRecording ? (
            <>
              <p className="text-sm mb-1">Recording in progress...</p>
              <p className="text-xl font-mono text-red-400 mb-4">
                {formatTime(recordingTime)}
              </p>
              <button
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <Square className="inline-block w-4 h-4 mr-2" />
                Stop Recording
              </button>
            </>
          ) : (
            <>
              <p className="text-sm mb-1">Recording completed</p>
              <p className="text-xs text-gray-400 mb-4">{audioFile?.name}</p>
              <button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mr-2"
              >
                <Mic className="inline-block w-4 h-4 mr-2" />
                Record Again
              </button>
            </>
          )}
        </div>
      )}

      {/* Upload Progress Animation */}
      {isUploading && (
        <div className="mt-6">
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-center text-sm mt-2 text-blue-300">
            Uploading your file... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Audio Preview */}
      {audioUrl && !isUploading && (
        <div className="mt-4">
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">{audioFile?.name}</span>
              <button
                onClick={togglePlayback}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              className="w-full"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          </div>

          <button
            onClick={startTranscription}
            disabled={isTranscribing}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isTranscribing
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isTranscribing ? "Processing..." : "Convert to Text"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioUploadToTextGen;
