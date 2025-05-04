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

const MediaItem = ({ item, index, moveItem, onDurationChange, onVolumeChange }) => {
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

  return (
    <div
      ref={ref}
      className={`p-2 border rounded-lg mb-2 cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={item.url}
            alt={item.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <p className="font-medium">Scene {index + 1}</p>
            <p className="text-sm text-gray-500">{item.duration}s</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onDurationChange(index)}>
            <Scissors className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-1">
            <Volume2 className="w-4 h-4" />
            <Slider
              defaultValue={[item.volume || 100]}
              min={0}
              max={100}
              step={1}
              className="w-20"
              onValueChange={(value) => onVolumeChange(index, value[0])}
            />
          </div>
        </div>
      </div>
      <div className="mt-2">
        <Slider
          defaultValue={[item.startTime, item.endTime]}
          min={0}
          max={item.duration}
          step={0.1}
          onValueChange={(value) => {
            onDurationChange(index, value);
          }}
        />
      </div>
      <div className="mt-2">
        <Select
          value={item.transition || 'none'}
          onValueChange={(value) => {
            const updatedItem = { ...item, transition: value };
            onDurationChange(index, null, updatedItem);
          }}
        >
          <SelectTrigger className="w-[180px]">
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
  );
};

const Timeline = ({ mediaItems, setMediaItems, onDurationChange, onVolumeChange }) => {
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
        />
      ))}
    </div>
  );
};

const VideoEditor = ({ mediaItems, setMediaItems, audioUrl, onBackgroundMusicChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [musicVolume, setMusicVolume] = useState(50);
  const audioRef = useRef(null);
  const musicRef = useRef(null);

  const handleMusicUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Get the recordId from the URL if available
        const urlParams = new URLSearchParams(window.location.search);
        const recordId = urlParams.get('recordId');

        // Create a FormData object
        const formData = new FormData();
        formData.append('file', file);
        if (recordId) {
          formData.append('recordId', recordId);
        }

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
          setBackgroundMusic(newBackgroundMusic);
          onBackgroundMusicChange?.(newBackgroundMusic);
        }
      } catch (error) {
        console.error('Error uploading music:', error);
        alert(`Error uploading music: ${error.message}`);
      }
    }
  };

  const handleMusicVolumeChange = (value) => {
    setMusicVolume(value[0]);
    if (backgroundMusic) {
      const updatedMusic = {
        ...backgroundMusic,
        volume: value[0]
      };
      setBackgroundMusic(updatedMusic);
      onBackgroundMusicChange?.(updatedMusic);
    }
  };

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  const handleDurationChange = (index, value, updatedItem = null) => {
    const items = [...mediaItems];
    if (updatedItem) {
      items[index] = updatedItem;
    } else if (value) {
      // Calculate new duration based on start and end times
      const newDuration = value[1] - value[0];
      items[index] = {
        ...items[index],
        startTime: value[0],
        endTime: value[1],
        duration: newDuration
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

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsPlaying(!isPlaying);
              if (audioRef.current) {
                isPlaying ? audioRef.current.pause() : audioRef.current.play();
              }
              if (musicRef.current) {
                isPlaying ? musicRef.current.pause() : musicRef.current.play();
              }
            }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <span className="text-sm text-gray-400">
            {currentTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Background Music Section */}
      <div className="mb-4 p-2 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span className="text-sm">Background Music</span>
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
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 truncate">{backgroundMusic.name}</span>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" />
                <Slider
                  defaultValue={[musicVolume]}
                  min={0}
                  max={100}
                  step={1}
                  className="w-20"
                  onValueChange={handleMusicVolumeChange}
                />
              </div>
            </div>
            <audio
              ref={musicRef}
              src={backgroundMusic.url}
              loop
              className="w-full"
            />
          </div>
        )}
      </div>

      {audioUrl && (
        <div className="mb-4 p-2 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm">Narrator Audio</span>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="w-full mt-2"
          />
        </div>
      )}

      <DndProvider backend={HTML5Backend}>
        <Timeline
          mediaItems={mediaItems}
          setMediaItems={setMediaItems}
          onDurationChange={handleDurationChange}
          onVolumeChange={handleVolumeChange}
        />
      </DndProvider>
    </div>
  );
};

export default VideoEditor; 