"use client"
import { useRef, useState,useEffect } from "react"
import Topic from "./_components/Topic"
import VideoStyle from "./_components/VideoStyle"
import Voice from "./_components/Voice"
import Captions from "./_components/Captions"
import { Loader2Icon, WandSparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Preview from "./_components/Preview"
import axios from "axios"
import { api } from "@/convex/_generated/api"
import { useAuthContext } from "@/app/providers"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import VideoEditor from './_components/VideoEditor'
import VideoPreview from './_components/VideoPreview'

function CreateNewVideo() {
  const [formData, setFormData] = useState({})
  const CreateInitialVideoRecord = useMutation(api.videoData.CreateVideoData)
  const GetVideoTitle = useMutation(api.videoData.CreateVideo)
  const UpdateImages = useMutation(api.videoData.UpdateImages)
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [titleSubmitted, setTitleSubmitted] = useState(false)
  const [audioStatus,setAudio] = useState(false)
  const [imagesStatus,setImages] = useState(false)
  const audioRef = useRef(null)
  const [mediaItems, setMediaItems] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState(null);

  // Fetch images if videoId exists
  const images = useQuery(api.videoData.fetchImages, formData?.recordId ? { videoId: formData.recordId } : "skip")

  // Fetch audio if videoId exists
  const audio = useQuery(api.videoData.fetchAudio, formData?.recordId ? { videoId: formData.recordId } : "skip")

  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }))
    console.log(formData)
  }

  useEffect(() => {
    if (audioRef.current && audio) {
      audioRef.current.load(); // Force reload the audio element
    }
  }, [audio]);

  // Update media items when images are fetched
  useEffect(() => {
    if (images && images.length > 0) {
      const newMediaItems = images.map((image, index) => ({
        id: `scene-${index}`,
        name: `Scene ${index + 1}`,
        url: typeof image === 'string' ? image : image.url,
        duration: 5, // Default duration for each scene
        startTime: 0,
        endTime: 5,
        volume: 100,
        transition: 'none',
      }));
      setMediaItems(newMediaItems);
      setPreviewImages(images);
    }
  }, [images]);

  // Update audio URL when audio is fetched
  useEffect(() => {
    if (audio && (typeof audio === 'string' || audio.url)) {
      setAudioUrl(typeof audio === 'string' ? audio : audio.url);
    }
  }, [audio]);

  const GetTitle = async () => {
    if (formData?.title && formData.title.trim() !== "") {
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
        console.error("Error creating video title:", error);
        alert("Error creating video. Please try again.");
      }
    } else {
      alert("Please enter a title for the video!");
    }
  };

  const GenerateVideo = async () => {
    try {
      const resp = await CreateInitialVideoRecord({
        recordId: formData.recordId,
        script: formData.script,
        topic: formData.topic,
        voice: formData.voice || "",
        videoStyle: formData.videoStyle,
        caption: formData.caption || "",
        uid: user?._id,
        createdBy: user?.email,
        credits: user?.credits,
        backgroundMusic: backgroundMusic ? {
          url: backgroundMusic.url,
          volume: backgroundMusic.volume
        } : null,
      });

      // Update images in the database with transitions
      await UpdateImages({
        recordId: formData.recordId,
        images: mediaItems.map(item => ({
          url: typeof item === 'string' ? item : item.url,
          transition: item.transition || 'fade',
          duration: item.duration || 5,
          startTime: item.startTime || 0,
          endTime: item.endTime || 5,
          volume: item.volume || 100
        })),
      });

      // Generate video with transitions and background music
      const result = await axios.post("/api/generate-video", {
        ...formData,
        mediaItems: mediaItems.map(item => ({
          url: typeof item === 'string' ? item : item.url,
          transition: item.transition || 'fade',
          duration: item.duration || 5,
          startTime: item.startTime || 0,
          endTime: item.endTime || 5,
          volume: item.volume || 100
        })),
        backgroundMusic: backgroundMusic ? {
          url: backgroundMusic.url,
          volume: backgroundMusic.volume
        } : null
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Error generating video:", error);
      alert("Error generating video. Please try again.");
    }
  };

  // Audio generation
  const PreviewAudio = async () => {
    if (user?.credits <= 0) {
      alert("Please add more credits!")
      return
    }
    if (!formData?.topic || !formData?.script || !formData?.voice) {
      alert("Error: Missing fields")
      return
    }

    try {
      // Save data
      const resp = await CreateInitialVideoRecord({
        recordId: formData.recordId,
        script: formData.script,
        topic: formData.topic,
        voice: formData.voice,
        videoStyle: formData.videoStyle || "",
        caption: formData.caption || "",
        uid: user?._id,
        createdBy: user?.email,
        credits: user?.credits,
      })
      console.log(resp)

      // Generate audio preview
      const result = await axios.post("/api/preview-audio", formData)
      console.log("RecordID:", formData.recordId)
      console.log(result)
      setAudio(true);
    } catch (error) {
      console.error("Error generating audio:", error)
      alert("Error generating audio. Please try again.")
    }
  }

  // Image generation
  const PreviewImages = async () => {
    if (user?.credits <= 0) {
      alert("Please add more credits!")
      return
    }
    if (!formData?.topic || !formData?.script || !formData?.videoStyle) {
      alert("Error: Please fill required fields")
      return
    }

    try {
      // Save data
      const resp = await CreateInitialVideoRecord({
        recordId: formData.recordId,
        script: formData.script,
        topic: formData.topic,
        voice: formData.voice || "",
        videoStyle: formData.videoStyle,
        caption: formData.caption || "",
        uid: user?._id,
        createdBy: user?.email,
        credits: user?.credits,
      })
      console.log(resp)

      // Generate image previews
      const result = await axios.post("/api/preview-images", formData)
      console.log("RecordID:", formData.recordId)
      console.log(result)
      setImages(true);
    } catch (error) {
      console.error("Error generating images:", error)
      alert("Error generating images. Please try again.")
    }
  }

  // Add this function to handle media uploads
  const handleMediaUpload = (files) => {
    const newItems = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      duration: 5, // Default duration in seconds
      startTime: 0,
      endTime: 5,
    }));
    setMediaItems([...mediaItems, ...newItems]);
  };

  const handleGeneratePreviews = async () => {
    setIsGenerating(true);
    try {
      // Generate audio preview
      const audioResponse = await fetch('/api/preview-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script: formData.script }),
      });
      const audioData = await audioResponse.json();
      setAudioUrl(audioData.url);

      // Generate image previews
      const imagesResponse = await fetch('/api/preview-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script: formData.script }),
      });
      const imagesData = await imagesResponse.json();
      
      // Convert images to media items
      const newMediaItems = imagesData.images.map((image, index) => ({
        id: `scene-${index}`,
        name: `Scene ${index + 1}`,
        url: image.url,
        duration: 5, // Default duration for each scene
        startTime: 0,
        endTime: 5,
        volume: 100,
        transition: 'none',
      }));
      
      setMediaItems(newMediaItems);
      setPreviewImages(imagesData.images);
    } catch (error) {
      console.error('Error generating previews:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
            onChange={(e) => onHandleInputChange("title", e.target.value)}
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
                <Button className="w-full" variant="outline" onClick={PreviewImages} disabled={loading}>
                  {loading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Preview Images
                </Button>
              </div>

              {/* Voice */}
              <div className="space-y-4">
                <Voice onHandleInputChange={onHandleInputChange} />
                <Button className="w-full" variant="outline" onClick={PreviewAudio} disabled={loading}>
                  {loading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Preview Audio
                </Button>
              </div>

              {/* Captions */}
              <Captions onHandleInputChange={onHandleInputChange} />

              {/* Video Preview */}
              <div className="mt-8 mb-8 p-4 bg-gray-800 rounded-xl">
                <h2 className="text-xl font-bold mb-2 text-white">Video Preview (Live Slideshow)</h2>
                <p className="text-gray-300 mb-4">Preview your video with current edits before generating the final video.</p>
                <VideoPreview mediaItems={mediaItems} audioUrl={audioUrl} />
              </div>

              {/* Video Editor */}
              <div className="mt-5">
                <h2>Video Editor</h2>
                <p className="text-sm text-gray-400 mb-4">Edit your generated media</p>
                <VideoEditor
                  mediaItems={mediaItems}
                  setMediaItems={setMediaItems}
                  audioUrl={audioUrl}
                  onBackgroundMusicChange={(music) => setBackgroundMusic(music)}
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
                    {previewImages && previewImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {previewImages.map((img, idx) => (
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
                        No images generated yet
                      </div>
                    )}
                  </div>

                  {/* Generated Audio */}
                  <div className="mb-4">
                    <h4 className="text-lg font-medium mb-3">Audio</h4>
                    {audioUrl ? (
                      <div className="bg-gray-800 rounded-lg p-3">
                        <audio controls className="w-full">
                          <source src={audioUrl} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : (
                      <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                        No audio generated yet
                      </div>
                    )}
                  </div>
                  {(audio && images) && (
                    <Button className="w-full mt-6" size="lg" disabled={loading} onClick={GenerateVideo}>
                      {loading ? (
                        <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
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
  )
}

export default CreateNewVideo

