import React, { useState, useRef, ChangeEvent } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputFieldProps {
  onTranscriptChange?: (transcript: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const VoiceInputField: React.FC<VoiceInputFieldProps> = ({
  onTranscriptChange,
  placeholder = "Click microphone to start recording...",
  className = "",
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent): void => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async (): Promise<void> => {
        setIsLoading(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // In a real application, you would send this blob to your speech-to-text service
        // For demo purposes, we'll simulate a delay and set some text
        setTimeout(() => {
          const simulatedText = "This is a simulated transcript of the recorded speech.";
          setTranscript(simulatedText);
          onTranscriptChange?.(simulatedText);
          setIsLoading(false);
        }, 1000);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setTranscript(newValue);
    onTranscriptChange?.(newValue);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
          value={transcript}
          onChange={handleInputChange}
          disabled={disabled || isRecording || isLoading}
        />
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

export default VoiceInputField;
