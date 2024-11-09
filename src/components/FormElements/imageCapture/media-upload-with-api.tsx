// MediaUploadField.tsx

import React, { useState, useRef } from 'react';
import { Camera, Trash2, Upload, Image, Send } from 'lucide-react';
import EditableAttributesTable from "@/components/FormElements/sendData/complete-attributes-table-copy";

// Types
interface MediaFile {
  file: File;
  preview: string;
  base64?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Alert Component
const Alert: React.FC<{
  variant?: 'destructive' | 'success';
  children: React.ReactNode;
}> = ({ variant, children }) => (
  <div className={`p-4 rounded-lg ${
    variant === 'destructive' ? 'bg-red-100 text-red-700' : 
    variant === 'success' ? 'bg-green-100 text-green-700' : 
    'bg-blue-100 text-blue-700'
  }`}>
    {children}
  </div>
);

const AlertDescription: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <p className="text-sm">{children}</p>
);

const MediaUploadField: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newMediaFiles = await Promise.all(files.map(async file => ({
      file,
      preview: URL.createObjectURL(file),
      base64: await convertToBase64(file)
    })));

    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles(prev => {
      const updatedFiles = [...prev];
      URL.revokeObjectURL(updatedFiles[index].preview);
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
    setApiResponse(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setShowCamera(true);
      setCameraError(null);
    } catch (error) {
      setCameraError('Unable to access camera. Please ensure you have granted camera permissions.');
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const preview = URL.createObjectURL(blob);
            const base64 = await convertToBase64(file);
            setMediaFiles(prev => [...prev, { file, preview, base64 }]);
          }
        }, 'image/jpeg');
      }
    }
    stopCamera();
  };

  const sendToApi = async (index: number) => {
    const mediaFile = mediaFiles[index];
    if (!mediaFile.base64) return;

    setIsLoading(true);
    setApiResponse(null);

    try {
      // Replace with your API endpoint
      const response = await fetch('https://dc7c-91-194-240-2.ngrok-free.app/add-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning' : 'skip-browser-warning',
        },
        body: JSON.stringify({
          image: mediaFile.base64
          // filename: mediaFile.file.name,
          // type: mediaFile.file.type
        })
      });

      const data = await response.json();
      setApiResponse({
        success: response.ok,
        message: data.message || (response.ok ? 'Success' : 'Failed'),
        data: data
      });
    } catch (error) {
      setApiResponse({
        success: false,
        message: 'Error sending to API: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup function for unmounting
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      mediaFiles.forEach(media => URL.revokeObjectURL(media.preview));
    };
  }, [mediaFiles]);

  return (
    <div className="w-full space-y-4">
      {!showCamera ? (
        <>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Images or Videos (MAX. 10 files)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={triggerFileInput}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </button>
            <button
              onClick={startCamera}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Camera className="w-4 h-4 mr-2" />
              Open Camera
            </button>
          </div>
        </>
      ) : (
        <div className="relative w-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={captureImage}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Image className="w-4 h-4 mr-2" />
              Capture
            </button>
            <button
              onClick={stopCamera}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <Alert variant="destructive">
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      )}

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {mediaFiles.map((media, index) => (
            <div key={index} className="relative group">
              {media.file.type.startsWith('image/') ? (
                <img
                  src={media.preview}
                  alt={`Preview ${index}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={media.preview}
                  className="w-full h-32 object-cover rounded-lg"
                  controls
                />
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => sendToApi(index)}
                  disabled={isLoading}
                  className="p-1 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                  aria-label="Send to API"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {apiResponse && (
        <div className="mt-4">
          <Alert variant={apiResponse.success ? 'success' : 'destructive'}>
            <AlertDescription>{apiResponse.message}</AlertDescription>
          </Alert>
          {apiResponse.data && (
            <>
            <EditableAttributesTable data={apiResponse.data} /></>
          )}
        </div>
      )}

      {mediaFiles.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {mediaFiles.length} {mediaFiles.length === 1 ? 'file' : 'files'} selected
          </p>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default MediaUploadField;
