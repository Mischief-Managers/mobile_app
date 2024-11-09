import React, { useState, useRef, ChangeEvent } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface VoiceInputFieldProps {
  onTranscriptChange?: (transcript: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  language?: string;
}

const VoiceInputField: React.FC<VoiceInputFieldProps> = ({
  onTranscriptChange,
  placeholder = "Click microphone to start recording...",
  className = "",
  disabled = false,
  language = "en-US"
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = (): void => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    recognitionRef.current = new SpeechRecognition() as ISpeechRecognition;
    
    // Configure recognition
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    // Handle results
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const newTranscript = finalTranscript || interimTranscript;
      setTranscript(prevTranscript => {
        const updatedTranscript = prevTranscript + finalTranscript;
        onTranscriptChange?.(updatedTranscript);
        return updatedTranscript;
      });
    };

    // Handle errors
    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access was denied. Please allow microphone access to use voice input.');
      }
      stopRecording();
    };

    // Handle end of recognition
    recognitionRef.current.onend = () => {
      if (isRecording) {
        recognitionRef.current?.start();
      }
    };
  };

  const startRecording = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Initialize recognition if not already done
      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start recognition
      recognitionRef.current?.start();
      setIsRecording(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
      setIsLoading(false);
    }
  };

  const stopRecording = (): void => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setTranscript(newValue);
    onTranscriptChange?.(newValue);
  };

  const handleClear = (): void => {
    setTranscript('');
    onTranscriptChange?.('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
            placeholder={placeholder}
            value={transcript}
            onChange={handleInputChange}
            disabled={disabled || isRecording}
          />
          {transcript && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-full ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </div>
      {isRecording && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
      )}
    </div>
  );
};

// Add type definitions for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default VoiceInputField;
