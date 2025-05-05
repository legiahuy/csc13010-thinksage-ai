import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, Scissors, Play, Pause, Music, Upload } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const TRANSITION_EFFECTS = [
  { name: 'Fade', value: 'fade' },
  { name: 'Slide', value: 'slide' },
  { name: 'Zoom', value: 'zoom' },
  { name: 'Dissolve', value: 'dissolve' },
];

const MediaItem = ({ item, index, moveItem, onDurationChange, onVolumeChange, mediaItems, totalAudioDuration }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: 'MEDIA_ITEM',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'MEDIA_ITEM',
    hover: (draggedItem) => {
      if (draggedItem.index === index) return;
      moveItem(draggedItem.index, index);
      draggedItem.index = index;
    },
  });

  drag(drop(ref));

  // Calculate the sum of durations of all other images
  const sumOtherDurations = mediaItems.reduce((sum, img, idx) => idx === index ? sum : sum + (img.duration || 0), 0);
  const maxDuration = Math.max(1, totalAudioDuration - sumOtherDurations);

  return (
    <div
      ref={ref}
      className={`p-2 border rounded-lg mb-2 cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center space-x-2">
        <img
          src={item.url}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <p className="font-medium">Scene {index + 1}</p>
          <p className="text-sm text-gray-500">{Number(item.duration).toFixed(2)}s</p>
        </div>
      </div>
      <div className="flex flex-row gap-2 mt-2 items-center">
        <div className="flex items-center space-x-1 flex-1">
          <Slider
            value={[item.duration]}
            min={1}
            max={maxDuration}
            step={0.1}
            onValueChange={(value) => onDurationChange(index, value[0])}
            className="flex-1"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <Select
            value={item.transition || 'none'}
            onValueChange={(value) => {
              const updatedItem = { ...item, transition: value };
              onDurationChange(index, item.duration, updatedItem);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select transition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Transition</SelectItem>
              {TRANSITION_EFFECTS.map((effect) => (
                <SelectItem key={effect.value} value={effect.value}>
                  {effect.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

const Timeline = ({ mediaItems, setMediaItems, onDurationChange, onVolumeChange, totalAudioDuration }) => {
  const moveItem = (fromIndex, toIndex) => {
    const items = [...mediaItems];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    setMediaItems(items);
  };

  return (
    <div className="space-y-2">
      {mediaItems.map((item, index) => (
        <MediaItem
          key={index}
          item={item}
          index={index}
          moveItem={moveItem}
          onDurationChange={onDurationChange}
          onVolumeChange={onVolumeChange}
          mediaItems={mediaItems}
          totalAudioDuration={totalAudioDuration}
        />
      ))}
    </div>
  );
};

const VideoEditor = ({ mediaItems, setMediaItems, audioUrl, onBackgroundMusicChange, narratorVolume, setNarratorVolume, musicVolume, setMusicVolume, backgroundMusic, musicStart, setMusicStart, musicEnd, setMusicEnd, recordId }) => {
  console.log('VideoEditor backgroundMusic prop:', backgroundMusic);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicIsPlaying, setMusicIsPlaying] = useState(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const audioRef = useRef(null);
  const musicRef = useRef(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const handleMusicUpload = async (event) => {
    const file = event.target.files[0];
    if (file && recordId) {
      try {
        // Create a FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('recordId', recordId);

        console.log('Uploading file:', {
          name: file.name,
          type: file.type,
          size: file.size,
          recordId
        });

        // Send the file to the server
        const response = await fetch('/api/upload-music', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        console.log('Upload successful:', data);

        if (data.result) {
          const newBackgroundMusic = {
            url: data.result,
            name: file.name,
            volume: musicVolume
          };
          onBackgroundMusicChange?.(newBackgroundMusic);
          console.log('Background music set:', newBackgroundMusic);
        }
      } catch (error) {
        console.error('Error uploading music:', error);
        alert(`Error uploading music: ${error.message}`);
      }
    } else {
      alert('No recordId found. Please create or select a video first.');
    }
  };

  // Narrator audio handlers
  const handleNarratorPlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleNarratorTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };
  const handleNarratorLoadedMetadata = (e) => {
    setDuration(e.target.duration);
    setAudioDuration(e.target.duration);
  };
  const handleNarratorTimeSliderChange = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = narratorVolume / 100;
    }
  }, [narratorVolume]);

  // Background music handlers
  const handleMusicPlayPause = () => {
    if (musicRef.current) {
      if (musicIsPlaying) {
        musicRef.current.pause();
      } else {
        musicRef.current.currentTime = musicStart;
        musicRef.current.play();
      }
      setMusicIsPlaying(!musicIsPlaying);
    }
  };
  const handleMusicTimeUpdate = (e) => {
    setMusicCurrentTime(e.target.currentTime);
  };
  const handleMusicLoadedMetadata = (e) => {
    setMusicDuration(e.target.duration);
  };
  const handleMusicTimeSliderChange = (value) => {
    if (musicRef.current) {
      musicRef.current.currentTime = value[0];
      setMusicCurrentTime(value[0]);
    }
  };
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  // Ensure musicEnd is always after musicStart and not null
  useEffect(() => {
    if (backgroundMusic && musicDuration && (musicEnd === null || musicEnd > musicDuration || musicEnd <= musicStart)) {
      setMusicEnd(musicDuration);
    }
  }, [backgroundMusic, musicDuration, musicStart]);

  const handleDurationChange = (index, newDuration, updatedItem = null) => {
    const items = [...mediaItems];
    if (updatedItem) {
      items[index] = updatedItem;
    } else if (newDuration) {
      items[index] = {
        ...items[index],
        duration: newDuration,
        endTime: (items[index].startTime || 0) + newDuration,
      };
    }
    setMediaItems(items);
  };

  const handleVolumeChange = (index, value) => {
    const items = [...mediaItems];
    items[index] = {
      ...items[index],
      volume: value,
    };
    setMediaItems(items);
  };

  // Update Convex when crop changes
  const updateBackgroundMusicInConvex = async (newStart, newEnd) => {
    if (!recordId || !backgroundMusic?.url) return;
    const { ConvexHttpClient } = await import('convex/browser');
    const { api } = await import('@/convex/_generated/api');
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    await convex.mutation(api.videoData.UpdateBackgroundMusic, {
      recordId,
      backgroundMusic: {
        url: backgroundMusic.url,
        volume: musicVolume,
        start: newStart,
        end: newEnd
      }
    });
  };

  // Update narratorVolume in Convex when changed
  const updateNarratorVolumeInConvex = async (newVolume) => {
    if (!recordId) return;
    const { ConvexHttpClient } = await import('convex/browser');
    const { api } = await import('@/convex/_generated/api');
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    // Fetch current values to avoid overwriting
    const currentData = await convex.query(api.videoData.GetVideoById, { videoId: recordId });
    await convex.mutation(api.videoData.UpdateCaptionsAndAudio, {
      recordId,
      audioUrl: currentData?.audioUrl,
      captionJson: currentData?.captionJson,
      narratorVolume: newVolume,
    });
  };

  return (
    <div className="space-y-4">
      {/* Narrator Audio Section */}
      {audioUrl && (
        <div className="mb-4 p-2 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Narrator Audio</span>
            <div className="flex items-center space-x-2">
              <button onClick={handleNarratorPlayPause} className="bg-white/80 hover:bg-white text-black rounded-full p-1 shadow">
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <span className="text-xs text-gray-500">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <Volume2 className="w-4 h-4" />
              <Slider
                value={[narratorVolume]}
                min={0}
                max={100}
                step={1}
                className="w-20"
                onValueChange={(value) => {
                  setNarratorVolume(value[0]);
                  updateNarratorVolumeInConvex(value[0]);
                }}
              />
              <span className="text-xs text-gray-500">{narratorVolume}%</span>
            </div>
          </div>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleNarratorTimeSliderChange}
          />
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleNarratorTimeUpdate}
            onLoadedMetadata={handleNarratorLoadedMetadata}
            className="w-full mt-2"
          />
        </div>
      )}

      {/* Background Music Section */}
      <div className="mb-4 p-2 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span className="text-sm font-semibold">Background Music</span>
            {backgroundMusic && (
              <span className="text-xs text-gray-400 truncate max-w-[180px]">{backgroundMusic.name}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleMusicUpload}
              className="hidden"
              id="music-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('music-upload').click()}
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload Music
            </Button>
          </div>
        </div>
        {backgroundMusic && (
          <div className="flex items-center space-x-2 mb-2">
            <button onClick={handleMusicPlayPause} className="bg-white/80 hover:bg-white text-black rounded-full p-1 shadow">
              {musicIsPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span className="text-xs text-gray-500">{formatTime(musicCurrentTime)} / {formatTime(musicDuration)}</span>
            <Volume2 className="w-4 h-4" />
            <Slider
              value={[musicVolume]}
              min={0}
              max={100}
              step={1}
              className="w-20"
              onValueChange={(value) => setMusicVolume(value[0])}
            />
            <span className="text-xs text-gray-500">{musicVolume}%</span>
          </div>
        )}
        {backgroundMusic && (
          <>
            <Slider
              value={[musicCurrentTime]}
              max={musicDuration}
              step={0.1}
              onValueChange={handleMusicTimeSliderChange}
            />
            {/* Crop Range Slider */}
            <div className="flex flex-col mt-2">
              <label className="text-xs text-gray-400 mb-1">Crop Music Range</label>
              <Slider
                value={[musicStart, musicEnd !== null ? musicEnd : musicDuration]}
                min={0}
                max={musicDuration}
                step={0.1}
                onValueChange={(value) => {
                  setMusicStart(value[0]);
                  setMusicEnd(value[1]);
                  updateBackgroundMusicInConvex(value[0], value[1]);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Start: {formatTime(musicStart)}</span>
                <span>End: {formatTime(musicEnd !== null ? musicEnd : musicDuration)}</span>
              </div>
            </div>
          </>
        )}
        {backgroundMusic && (
          <audio
            ref={musicRef}
            src={backgroundMusic.url}
            onTimeUpdate={handleMusicTimeUpdate}
            onLoadedMetadata={handleMusicLoadedMetadata}
            className="w-full mt-2"
          />
        )}
      </div>

      {/* Timeline/Scenes Editor */}
      <div className="mb-2 mt-4">
        <h3 className="text-lg font-semibold mb-1">Arrange Scenes</h3>
        <p className="text-sm text-gray-400 mb-2">Drag and drop to rearrange the order of your images. Adjust the duration, transition, and volume for each scene below.</p>
      </div>
      <DndProvider backend={HTML5Backend}>
        <Timeline
          mediaItems={mediaItems}
          setMediaItems={setMediaItems}
          onDurationChange={handleDurationChange}
          onVolumeChange={handleVolumeChange}
          totalAudioDuration={audioDuration}
        />
      </DndProvider>
    </div>
  );
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default VideoEditor; 