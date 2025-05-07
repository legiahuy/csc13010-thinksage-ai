"use client"
import { useRef, useState, useEffect } from "react"
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

function CreateNewVideo() {
  const [formData, setFormData] = useState({})
  const CreateInitialVideoRecord = useMutation(api.videoData.CreateVideoData)
  const GetVideoTitle = useMutation(api.videoData.CreateVideo)
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [imagesLoading, setImagesLoading] = useState(false)
  const router = useRouter()
  const [titleSubmitted, setTitleSubmitted] = useState(false)
  const [audioStatus, setAudio] = useState(false)
  const [imagesStatus, setImages] = useState(false)
  const audioRef = useRef(null)

  // Fetch images if videoId exists
  const images = useQuery(api.videoData.fetchImages, formData?.recordId ? { videoId: formData.recordId } : "skip")

  // Fetch audio if videoId exists
  const audio = useQuery(api.videoData.fetchAudio, formData?.recordId ? { videoId: formData.recordId } : "skip")
  
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


  const GetTitle = async () => {
    if (formData?.title && formData.title.trim() !== "") {
      const response = await GetVideoTitle({
        uid: user?._id,
        createdBy: user?.email,
        title: formData.title,
      })

      console.log("Title created by:", response.createdBy)

      // Save the returned ID into formData
      setFormData((prev) => ({
        ...prev,
        recordId: response.id,
      }))

      setTitleSubmitted(true)
    } else {
      alert("Please enter a title for the video!")
    }
  }

  const GenerateVideo = async () => {
    setLoading(true)
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
      })
      console.log(resp)
      // Generate video
      const result = await axios.post("/api/generate-video", formData)
      console.log("RecordID:", formData.recordId)
      console.log(result)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error generating video:", error)
      alert("Error generating video. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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

    setAudioLoading(true)
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
      setAudio(true)
      
      // We don't want to immediately clear the loading state here
      // The useEffect will handle that when the audio is actually loaded
    } catch (error) {
      console.error("Error previewing audio:", error)
      alert("Error generating audio preview. Please try again.")
      setAudioLoading(false) // Only clear loading on error
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

    setImagesLoading(true)
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
      setImages(true)
      
      // We don't want to immediately clear the loading state here
      // The useEffect will handle that when the images are actually loaded
    } catch (error) {
      console.error("Error previewing images:", error)
      alert("Error generating image previews. Please try again.")
      setImagesLoading(false) // Only clear loading on error
    }
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
                <Button className="w-full" variant="outline" onClick={PreviewImages} disabled={imagesLoading}>
                  {imagesLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {imagesLoading ? "Generating Images..." : (imagesStatus ? "Regenerate Images" : "Preview Images")}
                </Button>
              </div>

              {/* Voice */}
              <div className="space-y-4">
                <Voice onHandleInputChange={onHandleInputChange} />
                <Button className="w-full" variant="outline" onClick={PreviewAudio} disabled={audioLoading}>
                  {audioLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {audioLoading ? "Generating Audio..." : (audioStatus ? "Regenerate Audio" : "Preview Audio")}
                </Button>
              </div>

              {/* Captions */}
              <Captions onHandleInputChange={onHandleInputChange} />

              {/* Generate Button */}
              
            </div>
          </div>

          {/* Right Column - Preview & Generated Content */}
          <div className="lg:col-span-5">
            {/* Generated Content Section */}
            <div className=" border border-gray-800 rounded-xl p-6 bg-gray-900/30">
            <div className=" overflow-auto h-[75vh] pr-2 space-y-8">
              
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
                          src={img || "/placeholder.svg"}
                          alt={`Scene ${idx + 1}`}
                          className="rounded-lg shadow-md w-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                      {imagesLoading ? "Generating images..." : "No images generated yet"}
                    </div>
                  )}
                </div>

                {/* Generated Audio */}
                <div className="mb-4">
                  <h4 className="text-lg font-medium mb-3">Audio</h4>
                  {audio ? (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <audio ref={audioRef} controls className="w-full">
                        <source src={audio} type="audio/mp3" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                      {audioLoading ? "Generating audio..." : "No audio generated yet"}
                    </div>
                  )}
                </div>
                {(audioStatus && imagesStatus) && (
                  <Button className="w-full mt-6" size="lg" disabled={loading} onClick={GenerateVideo}>
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
  )
}

export default CreateNewVideo