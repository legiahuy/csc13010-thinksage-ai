import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

// Utility: Split script into sentences (basic, can be improved)
function splitScriptToSentences(script) {
  return script.match(/[^.!?]+[.!?]+/g) || [script];
}

export default function GuidedRecordingModal({ images, script, open, onClose, onComplete }) {
  const scriptSegments = splitScriptToSentences(script);
  const [currentScene, setCurrentScene] = useState(0);
  const [recordings, setRecordings] = useState(Array(images.length).fill(null));
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  if (!open) return null;

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setAudioUrl(URL.createObjectURL(audioBlob));
      // Get duration and save this segment's audio
      const audio = new window.Audio(URL.createObjectURL(audioBlob));
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        setRecordings(prev => {
          const updated = [...prev];
          updated[currentScene] = { audio: audioBlob, duration, script: scriptSegments[currentScene], image: images[currentScene] };
          return updated;
        });
      });
    };
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleNext = () => {
    setAudioUrl(null);
    if (currentScene < images.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      onComplete(recordings);
      onClose();
    }
  };

  const handlePrev = () => {
    setAudioUrl(null);
    if (currentScene > 0) setCurrentScene(currentScene - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">Scene {currentScene + 1} of {images.length}</h2>
        <img src={typeof images[currentScene] === 'string' ? images[currentScene] : images[currentScene].url} alt="" className="w-48 h-72 object-cover rounded mb-4" />
        <p className="mb-4 text-lg text-center">{scriptSegments[currentScene]}</p>
        <div className="flex flex-col items-center w-full">
          <Button onClick={recording ? stopRecording : startRecording} className="mb-2 w-full">
            {recording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full mb-2" />
          )}
          <div className="flex w-full justify-between">
            <Button onClick={handlePrev} disabled={currentScene === 0}>Previous</Button>
            <Button onClick={handleNext} disabled={!recordings[currentScene]}>Next</Button>
          </div>
        </div>
        <Button onClick={onClose} className="mt-4 w-full" variant="outline">Cancel</Button>
      </div>
    </div>
  );
} 