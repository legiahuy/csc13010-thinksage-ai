import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

/**
 * VideoPreview component
 * Props:
 * - mediaItems: array of { url, duration, transition, ... }
 * - audioUrl: string
 */
const TRANSITION_DURATION = 0.7; // seconds, must match CSS

const VideoPreview = ({ mediaItems, audioUrl, backgroundMusic, narratorVolume = 100, musicVolume = 50, musicStart = 0, musicEnd = null }) => {
  // Debug log for props
  console.log('VideoPreview mediaItems:', mediaItems, 'audioUrl:', audioUrl);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionFrom, setTransitionFrom] = useState(null); // index of outgoing scene
  const audioRef = useRef(null);
  const bgmRef = useRef(null);
  const timerRef = useRef(null);

  // Calculate cumulative start times for each scene
  const sceneStartTimes = mediaItems.reduce((acc, item, idx) => {
    const prev = acc[idx - 1] || 0;
    acc.push(prev + (mediaItems[idx - 1]?.duration || 0));
    return acc;
  }, []);

  // Play/pause handler
  const handlePlayPause = () => {
    console.log('Play/Pause button clicked');
    if (!isPlaying) {
      const now = Date.now();
      setStartTime(now - elapsed * 1000);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.currentTime = elapsed;
        audioRef.current.play().catch((e) => {
          console.warn('Audio play failed:', e);
        });
      }
      if (bgmRef.current) {
        bgmRef.current.currentTime = musicStart;
        bgmRef.current.play().catch((e) => {
          console.warn('BGM play failed:', e);
        });
      }
    } else {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (isPlaying && startTime !== null) {
      timerRef.current = setInterval(() => {
        const newElapsed = (Date.now() - startTime) / 1000;
        setElapsed(newElapsed);
        // Find which scene we're in
        let found = false;
        for (let i = 0; i < sceneStartTimes.length; i++) {
          const sceneStart = sceneStartTimes[i];
          const sceneEnd = sceneStart + mediaItems[i].duration;
          // If we're in the transition window before the next scene
          if (
            newElapsed >= sceneEnd - TRANSITION_DURATION &&
            newElapsed < sceneEnd &&
            i < mediaItems.length - 1
          ) {
            if (!transitioning) {
              setTransitioning(true);
              setTransitionFrom(i);
              setCurrentIndex(i + 1); // Start showing the next scene
            }
            found = true;
            break;
          }
          // If we're in the normal window of a scene
          if (newElapsed >= sceneStart && newElapsed < sceneEnd - TRANSITION_DURATION) {
            if (currentIndex !== i) {
              setCurrentIndex(i);
            }
            if (transitioning) {
              setTransitioning(false);
              setTransitionFrom(null);
            }
            found = true;
            break;
          }
        }
        // If not found, we're at the last scene or finished
        if (!found && mediaItems.length > 0) {
          // Check if audio is still playing
          if (audioRef.current && !audioRef.current.paused) {
            setCurrentIndex(mediaItems.length - 1); // Stay on last image
            setTransitioning(false);
            setTransitionFrom(null);
          } else {
            setCurrentIndex(mediaItems.length - 1);
            setTransitioning(false);
            setTransitionFrom(null);
          }
        }
        // Stop if finished (audio ends)
        const audioDuration = audioRef.current?.duration || 0;
        if (audioDuration && newElapsed >= audioDuration) {
          setIsPlaying(false);
          setElapsed(0);
          setCurrentIndex(0);
          setTransitioning(false);
          setTransitionFrom(null);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current.currentTime = 0;
          }
          clearInterval(timerRef.current);
        }
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [isPlaying, startTime, mediaItems, sceneStartTimes, transitioning, currentIndex]);

  // Reset on mediaItems/audioUrl change
  useEffect(() => {
    // Full reset: stop playback, reset audio, reset timeline
    setCurrentIndex(0);
    setElapsed(0);
    setIsPlaying(false);
    setStartTime(null);
    setTransitioning(false);
    setTransitionFrom(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load && audioRef.current.load();
    }
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      bgmRef.current.load && bgmRef.current.load();
    }
  }, [mediaItems, audioUrl, backgroundMusic]);

  // Add effect to stop BGM at musicEnd
  useEffect(() => {
    if (!bgmRef.current || !musicEnd) return;
    const audio = bgmRef.current;
    const onTimeUpdate = () => {
      if (musicEnd && audio.currentTime >= musicEnd) {
        audio.pause();
        audio.currentTime = musicEnd;
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => audio.removeEventListener('timeupdate', onTimeUpdate);
  }, [musicEnd, bgmRef]);

  // Transition class logic
  function getTransitionClass(item, idx) {
    // If this is the outgoing scene during transition
    if (transitioning && idx === transitionFrom) {
      switch (item.transition) {
        case 'slide':
          return 'animate-slide-out z-10';
        case 'zoom':
          return 'animate-zoom-out z-10';
        case 'dissolve':
          return 'animate-dissolve-out z-10';
        case 'fade':
        default:
          return 'opacity-0 transition-opacity duration-700 z-10';
      }
    }
    // If this is the incoming scene during transition
    if (transitioning && idx === currentIndex) {
      switch (item.transition) {
        case 'slide':
          return 'animate-slide-in z-20';
        case 'zoom':
          return 'animate-zoom-in z-20';
        case 'dissolve':
          return 'animate-dissolve-in z-20';
        case 'fade':
        default:
          return 'opacity-100 transition-opacity duration-700 z-20';
      }
    }
    // If this is the current scene and not transitioning
    if (!transitioning && idx === currentIndex) {
      return 'opacity-100 z-20';
    }
    // Otherwise, hidden
    return 'opacity-0 z-0';
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = narratorVolume / 100;
    }
    if (bgmRef.current) {
      bgmRef.current.volume = musicVolume / 100;
    }
  }, [narratorVolume, musicVolume]);

  if (!mediaItems || mediaItems.length === 0) {
    return <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">No scenes to preview</div>;
  }

  return (
    <div className="relative w-full max-w-[360px] mx-auto">
      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
        .animate-slide-in { animation: slide-in 0.7s forwards; }
        .animate-slide-out { animation: slide-out 0.7s forwards; }
        @keyframes zoom-in { from { transform: scale(1.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes zoom-out { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }
        .animate-zoom-in { animation: zoom-in 0.7s forwards; }
        .animate-zoom-out { animation: zoom-out 0.7s forwards; }
        @keyframes dissolve-in { from { filter: blur(8px); opacity: 0; } to { filter: blur(0); opacity: 1; } }
        @keyframes dissolve-out { from { filter: blur(0); opacity: 1; } to { filter: blur(8px); opacity: 0; } }
        .animate-dissolve-in { animation: dissolve-in 0.7s forwards; }
        .animate-dissolve-out { animation: dissolve-out 0.7s forwards; }
      `}</style>
      <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
        {mediaItems.map((item, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${getTransitionClass(item, idx)}`}
          >
            <img
              src={item.url}
              alt={`Scene ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 100 }}
        >
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handlePlayPause}
              className="bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-lg"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
          <span className="text-white text-sm">
            Scene {currentIndex + 1} / {mediaItems.length}
          </span>
        </div>
      </div>
      {/* Audio element (hidden) */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} />
      )}
      {backgroundMusic && backgroundMusic.url && (
        <audio ref={bgmRef} src={backgroundMusic.url} />
      )}
    </div>
  );
};

export default VideoPreview; 