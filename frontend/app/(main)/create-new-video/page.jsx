'use client';
import { useRef, useState, useEffect } from 'react';
import Topic from './_components/Topic';
import VideoStyle from './_components/VideoStyle';
import Voice from './_components/Voice';
import Captions from './_components/Captions';
import { Loader2Icon, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Preview from './_components/Preview';
import axios from 'axios';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/providers';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import VideoEditor from './_components/VideoEditor';
import VideoPreview from './_components/VideoPreview';
import GuidedRecordingModal from './_components/GuidedRecordingModal';

function CreateNewVideo() {
  const [formData, setFormData] = useState({});
  const CreateInitialVideoRecord = useMutation(api.videoData.CreateVideoData);
  const GetVideoTitle = useMutation(api.videoData.CreateVideo);
  const UpdateImages = useMutation(api.videoData.UpdateImages);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const router = useRouter();
  const [titleSubmitted, setTitleSubmitted] = useState(false);
  const [audioStatus, setAudio] = useState(false);
  const [imagesStatus, setImages] = useState(false);
  const audioRef = useRef(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [narratorVolume, setNarratorVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(50);
  const [musicStart, setMusicStart] = useState(0);
  const [musicEnd, setMusicEnd] = useState(null);
  const [narrationMode, setNarrationMode] = useState('ai');
  const [userRecordingUrl, setUserRecordingUrl] = useState(null);
  const [alignedSegments, setAlignedSegments] = useState(null);
  const [showGuidedModal, setShowGuidedModal] = useState(false);
  const [guidedRecordings, setGuidedRecordings] = useState([]);

  // Fetch images if videoId exists
  const images = useQuery(
    api.videoData.fetchImages,
    formData?.recordId ? { videoId: formData.recordId } : 'skip'
  );

  // Fetch audio if videoId exists
  const audio = useQuery(
    api.videoData.fetchAudio,
    formData?.recordId ? { videoId: formData.recordId } : 'skip'
  );

  // Clear loading states when content is fetched
  useEffect(() => {
    if (images && images.length > 0) {
      setImagesLoading(false);
    }
  }, [images]);

  useEffect(() => {
    if (audio) {
      setAudioLoading(false);
    }
  }, [audio]);

  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => {
      const newData = {
      ...prev,
      [fieldName]: fieldValue,
      };
      // If we're setting caption, ensure captionJson is also set
      if (fieldName === 'caption' && fieldValue && typeof fieldValue === 'object') {
        newData.captionJson = {
          style: fieldValue.style,
          name: fieldValue.name
        };
      }
      console.log('Updated formData:', newData);
      return newData;
    });
  };

  useEffect(() => {
    if (audioRef.current && audio) {
      audioRef.current.load(); // Force reload the audio element
    }
  }, [audio]);

  // Update media items when images or audio are fetched
  useEffect(() => {
    if (images && images.length > 0 && audioUrl) {
      // Get audio duration
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        const totalDuration = audio.duration;
        
        let newMediaItems;
        if (narrationMode === 'ai') {
          // Original AI narrator logic
        const perImage = totalDuration / images.length;
          newMediaItems = images.map((image, index) => ({
          id: `scene-${index}`,
          name: `Scene ${index + 1}`,
          url: typeof image === 'string' ? image : image.url,
            duration: (typeof perImage === 'number' && isFinite(perImage)) ? perImage : 5,
            startTime: (typeof perImage === 'number' && isFinite(perImage)) ? index * perImage : 0,
            endTime: (typeof perImage === 'number' && isFinite(perImage)) ? (index + 1) * perImage : 5,
          volume: 100,
            transition: 'fade',
        }));
        } else {
          // User recording with forced alignment
          newMediaItems = images.map((image, index) => {
            const segment = alignedSegments?.[index] || {
              start: index * (totalDuration / images.length),
              end: (index + 1) * (totalDuration / images.length),
              duration: totalDuration / images.length
            };
            const duration = (typeof segment.duration === 'number' && isFinite(segment.duration)) ? segment.duration : 5;
            const startTime = (typeof segment.start === 'number' && isFinite(segment.start)) ? segment.start : 0;
            const endTime = (typeof segment.end === 'number' && isFinite(segment.end)) ? segment.end : startTime + duration;
            return {
              id: `scene-${index}`,
              name: `Scene ${index + 1}`,
              url: typeof image === 'string' ? image : image.url,
              duration,
              startTime,
              endTime,
              volume: 100,
              transition: 'fade',
            };
          });
        }
        setMediaItems(newMediaItems);
      });
      audio.load();
    }
  }, [images, audioUrl, narrationMode, alignedSegments]);

  // Update audio URL when audio is fetched
  useEffect(() => {
    if (audio && (typeof audio === 'string' || audio.url)) {
      setAudioUrl(typeof audio === 'string' ? audio : audio.url);
    }
  }, [audio]);

  const GetTitle = async () => {
    if (formData?.title && formData.title.trim() !== '') {
      try {
        const response = await GetVideoTitle({
          uid: user?._id,
          createdBy: user?.email,
          title: formData.title,
        });

        // Save the returned ID into formData
        setFormData((prev) => ({
          ...prev,
          recordId: response.id,
        }));

        setTitleSubmitted(true);
      } catch (error) {
        console.error('Error creating video title:', error);
        alert('Error creating video. Please try again.');
      }
    } else {
      alert('Please enter a title for the video!');
    }
  };

  const GenerateVideo = async () => {
    setLoading(true);
    try {
      // Create initial video record with caption data
      await CreateInitialVideoRecord({
        recordId: formData.recordId,
        script: formData.script,
        topic: formData.topic,
        voice: formData.voice || '',
        videoStyle: formData.videoStyle,
        caption: formData.caption || '',
        captionJson: formData.captionJson || null,
        uid: user?._id,
        createdBy: user?.email,
        credits: user?.credits,
        narratorVolume: narratorVolume,
        backgroundMusic: backgroundMusic
          ? {
          url: backgroundMusic.url,
          volume: musicVolume,
          start: musicStart,
              end: musicEnd,
            }
          : undefined,
      });

      // Update images with timing data
      await UpdateImages({
        recordId: formData.recordId,
        images: mediaItems.map((item) => ({
          url: typeof item === 'string' ? item : item.url,
          transition: item.transition || 'fade',
          duration: item.duration || 5,
          startTime: item.startTime || 0,
          endTime: item.endTime || 5,
          volume: item.volume || 100,
        })),
      });

      // Generate video with all necessary data
      await axios.post('/api/generate-video', {
        ...formData,
        caption: formData.caption || '',
        captionJson: formData.captionJson || null,
        narratorVolume: narratorVolume,
        mediaItems: mediaItems.map((item) => ({
          url: typeof item === 'string' ? item : item.url,
          transition: item.transition || 'fade',
          duration: item.duration || 5,
          startTime: item.startTime || 0,
          endTime: item.endTime || 5,
          volume: item.volume || 100,
        })),
        backgroundMusic: backgroundMusic
          ? {
          url: backgroundMusic.url,
          volume: musicVolume,
          start: musicStart,
              end: musicEnd,
            }
          : undefined,
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Error generating video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Audio generation
  const PreviewAudio = async () => {
    if (user?.credits <= 0) {
      alert('Please add more credits!');
      return;
    }
    if (!formData?.topic || !formData?.script || !formData?.voice) {
      alert('Error: Missing fields');
      return;
    }
    setAudioLoading(true);
    try {
      // Save data
      await CreateInitialVideoRecord({
        recordId: formData.recordId,
        script: formData.script,
        topic: formData.topic,
        voice: formData.voice,
        videoStyle: formData.videoStyle || '',
        caption: formData.caption || '',
        uid: user?._id,
        createdBy: user?.email,
        credits: user?.credits,
      });

      // Generate audio preview
      await axios.post('/api/preview-audio', formData);
      setAudio(true);
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Error generating audio. Please try again.');
      setAudioLoading(false); // Only clear loading on error
    }
  };

  // Image generation
  const PreviewImages = async () => {
    if (user?.credits <= 0) {
      alert('Please add more credits!');
      return;
    }
    if (!formData?.topic || !formData?.script || !formData?.videoStyle) {
      alert('Error: Please fill required fields');
      return;
    }
    setImagesLoading(true);
    try {
      // Save data
      await CreateInitialVideoRecord({
        recordId: formData.recordId,
        script: formData.script,
        topic: formData.topic,
        voice: formData.voice || '',
        videoStyle: formData.videoStyle,
        caption: formData.caption || '',
        uid: user?._id,
        createdBy: user?.email,
        credits: user?.credits,
      });

      // Generate image previews
      await axios.post('/api/preview-images', formData);
      setImages(true);
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Error generating images. Please try again.');
      setImagesLoading(false); // Only clear loading on error
    }
  };

  // Add function to handle narration mode change
  const handleNarrationModeChange = (mode) => {
    setNarrationMode(mode);
    if (mode === 'user') {
      // Reset to default timing if no alignment data yet
      setAlignedSegments(null);
    }
  };

  // Add function to handle user recording
  const handleUserRecording = async (recordingUrl) => {
    setUserRecordingUrl(recordingUrl);
    // Here you would call your forced alignment service
    // For now, we'll use a placeholder
    const alignmentResult = await performForcedAlignment(recordingUrl, formData.script);
    setAlignedSegments(alignmentResult.segments);
  };

  // Add a ref for formData to use in the AudioRecorder callback
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // Utility: Concatenate WebM audio blobs
  async function concatenateAudioBlobs(blobs) {
    // Simple approach: use webm-concat (if available) or fallback to Blob concat (may not work for all browsers)
    // For production, use ffmpeg on the backend for best results
    return new Blob(blobs, { type: 'audio/webm' });
  }

  // Utility: Upload to Cloudinary
  async function uploadToCloudinary(blob) {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  }

  return (
    <div className="container mx-auto px-4">
      {/* Page Header */}
      <h2 className="text-3xl font-bold border-b border-gray-700 pb-4 mb-6">Create New Video</h2>

      {!titleSubmitted ? (
        // Title Entry Screen
        <div className="max-w-xl mx-auto mt-12 p-6 border border-gray-800 rounded-xl bg-gray-900/50">
          <h3 className="text-xl font-medium mb-4">Enter Project Title</h3>
          <input
            type="text"
            className="w-full p-3 rounded-md border border-gray-700 bg-black text-white mb-4"
            placeholder="My Awesome Video"
            onChange={(e) => onHandleInputChange('title', e.target.value)}
          />
          <Button className="w-full" onClick={GetTitle}>
            Continue
          </Button>
        </div>
      ) : (
        // Main Content - Two Column Layout
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-7 border border-gray-800 rounded-xl p-6 bg-gray-900/30">
            <div className="h-[75vh] overflow-auto pr-2 space-y-8">
              {/* Topic and Script */}
              <Topic onHandleInputChange={onHandleInputChange} />

              {/* Video Style */}
              <div className="space-y-4">
                <VideoStyle onHandleInputChange={onHandleInputChange} />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={PreviewImages}
                  disabled={imagesLoading}
                >
                  {imagesLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {imagesLoading
                    ? 'Generating Images...'
                    : imagesStatus
                      ? 'Regenerate Images'
                      : 'Preview Images'}
                </Button>
              </div>

              {/* Voice */}
              <div className="space-y-4">
                {/* Narration Mode Selector */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Video Voice</label>
                  <div className="flex gap-2">
                    <Button
                      variant={narrationMode === 'ai' ? 'default' : 'outline'}
                      onClick={() => handleNarrationModeChange('ai')}
                      className="flex-1"
                    >
                      AI Narrator
                    </Button>
                    <Button
                      variant={narrationMode === 'user' ? 'default' : 'outline'}
                      onClick={() => handleNarrationModeChange('user')}
                      className="flex-1"
                    >
                      Self Recording
                    </Button>
                  </div>
                </div>
                {/* Conditional Panels */}
                {narrationMode === 'ai' ? (
                  <>
                    <Voice onHandleInputChange={onHandleInputChange} />
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={PreviewAudio}
                      disabled={audioLoading}
                    >
                      {audioLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {audioLoading
                        ? 'Generating Audio...'
                        : audioStatus
                          ? 'Regenerate Audio'
                          : 'Preview Audio'}
                    </Button>
                  </>
                ) : (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-lg font-medium mb-2">Record Your Voice</h4>
                    <Button className="w-full mb-2" onClick={() => setShowGuidedModal(true)}>
                      Guided Recording
                    </Button>
                    <GuidedRecordingModal
                      images={images || []}
                      script={formData.script || ''}
                      open={showGuidedModal}
                      onClose={() => setShowGuidedModal(false)}
                      onComplete={async (recordings) => {
                        // 1. Concatenate audio blobs
                        const audioBlobs = recordings.map(r => r.audio);
                        const finalAudioBlob = await concatenateAudioBlobs(audioBlobs);
                        // 2. Upload to server-side API
                        const uploadForm = new FormData();
                        const file = new File([finalAudioBlob], 'voice.webm', { type: 'audio/webm' });
                        uploadForm.append('audio', file);
                        uploadForm.append('recordId', formData.recordId || '');
                        const uploadRes = await fetch('/api/upload-voice', {
                          method: 'POST',
                          body: uploadForm,
                        });
                        const uploadData = await uploadRes.json();
                        const audioUrl = uploadData.url || uploadData.wavUrl || uploadData.mp3Url;
                        setAudioUrl(audioUrl);
                        setAudio(true);
                        // 3. Set durations for each image from recordings
                        if (images && images.length === recordings.length) {
                          const newMediaItems = images.map((image, idx) => ({
                            id: `scene-${idx}`,
                            name: `Scene ${idx + 1}`,
                            url: typeof image === 'string' ? image : image.url,
                            duration: (typeof recordings[idx]?.duration === 'number' && isFinite(recordings[idx]?.duration))
                              ? recordings[idx].duration
                              : 5, // fallback to 5 seconds
                            audioBlob: recordings[idx]?.audio,
                            startTime: 0,
                            endTime: 0,
                            volume: 100,
                            transition: 'fade',
                          }));
                          setMediaItems(newMediaItems);
                        }
                        // 4. Update Convex DB
                        if (formData.recordId && audioUrl) {
                          await fetch('/api/update-audio-url', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ recordId: formData.recordId, audioUrl }),
                          });
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Captions */}
              <Captions onHandleInputChange={onHandleInputChange} />

              {/* Video Preview */}
              <div className="mt-8 mb-8 p-4 bg-gray-800 rounded-xl">
                <h2 className="text-xl font-bold mb-2 text-white">Image Slideshow Preview</h2>
                <p className="text-gray-300 mb-4">
                  Get an early look at your image sequence and transitions before generating the
                  final video.
                </p>
                <VideoPreview
                  mediaItems={mediaItems}
                  audioUrl={audioUrl}
                  backgroundMusic={backgroundMusic}
                  narratorVolume={narratorVolume}
                  musicVolume={musicVolume}
                  musicStart={musicStart}
                  musicEnd={musicEnd}
                />
              </div>

              {/* Volume Settings */}
              <div className="mt-5">
                <h2>Volume Settings</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Adjust the volume for the narrator and background music below.
                </p>
                <VideoEditor
                  mediaItems={mediaItems}
                  setMediaItems={setMediaItems}
                  audioUrl={audioUrl}
                  onBackgroundMusicChange={setBackgroundMusic}
                  narratorVolume={narratorVolume}
                  setNarratorVolume={setNarratorVolume}
                  musicVolume={musicVolume}
                  setMusicVolume={setMusicVolume}
                  backgroundMusic={backgroundMusic}
                  musicStart={musicStart}
                  setMusicStart={setMusicStart}
                  musicEnd={musicEnd}
                  setMusicEnd={setMusicEnd}
                  recordId={formData.recordId}
                  narrationMode={narrationMode}
                  onNarrationModeChange={handleNarrationModeChange}
                  onUserRecording={handleUserRecording}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Generated Content */}
          <div className="lg:col-span-5">
            {/* Generated Content Section */}
            <div className="border border-gray-800 rounded-xl p-6 bg-gray-900/30">
              <div className="overflow-auto h-[75vh] pr-2 space-y-8">
                <Preview formData={formData} />

                <div className="mt-5 pr-2 space-y-8">
                  {/* Generated Images */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3">Images</h4>
                    {images && images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {images.map((img, idx) => (
                          <img
                            key={idx}
                            src={typeof img === 'string' ? img : img.url}
                            alt={`Scene ${idx + 1}`}
                            className="rounded-lg shadow-md w-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                        {imagesLoading ? 'Generating images...' : 'No images generated yet'}
                      </div>
                    )}
                  </div>

                  {/* Generated Audio */}
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-3">Audio</h4>
                    {audioUrl ? (
                      <div className="bg-gray-800 rounded-lg p-3">
                        <audio ref={audioRef} controls className="w-full">
                          <source src={audioUrl} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : (
                      <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                        {audioLoading ? 'Generating audio...' : 'No audio generated yet'}
                      </div>
                    )}
                  </div>
                  {audioStatus && imagesStatus && (
                    <Button
                      className="w-full mt-6"
                      size="lg"
                      disabled={loading}
                      onClick={GenerateVideo}
                    >
                      {loading ? (
                        <>
                        <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                          Generating Video...
                        </>
                      ) : (
                        <>
                          <WandSparkles className="mr-2 h-5 w-5" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateNewVideo;
