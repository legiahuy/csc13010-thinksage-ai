'use client';
import React, { useState, useEffect } from 'react';
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
import { toast } from 'react-hot-toast'; // Make sure to import toast

function CreateNewVideo() {
  const [formData, setFormData] = useState({});
  const CreateInitialVideoRecord = useMutation(api.videoData.CreateVideoData);
  const GetVideoTitle = useMutation(api.videoData.CreateVideo);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [titleSubmitted, setTitleSubmitted] = useState(false);

  // Fetch images if videoId exists
  const images = useQuery(
    api.videoData.fetchImages,
    formData?.recordId ? { videoId: formData.recordId } : "skip"
  );
  
  // Fetch audio if videoId exists
  const audio = useQuery(
    api.videoData.fetchAudio,
    formData?.recordId ? { videoId: formData.recordId } : "skip"
  );

  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
    console.log(formData);
  }

  const GetTitle = async () => {
    if (formData?.title && formData.title.trim() !== '') {
      const response = await GetVideoTitle({
        uid: user?._id,
        createdBy: user?.email,
        title: formData.title,
      });
  
      console.log('Title created by:', response.createdBy);
  
      // Save the returned ID into formData
      setFormData((prev) => ({
        ...prev,
        recordId: response.id,
      }));
  
      setTitleSubmitted(true);
    } else {
      alert('Please enter a title for the video!');
    }
  };
  
  const GenerateVideo = async () => {
    if (user?.credits <= 0) {
      toast('Please add more credits!');
      return;
    }
    if (
      !formData?.topic ||
      !formData?.script ||
      !formData?.voice ||
      !formData?.videoStyle ||
      !formData?.caption
    ) {
      alert('Error: Please fill all fields');
      return;
    }
    setLoading(true);
    
    // Save data
    const resp = await CreateInitialVideoRecord({
      recordId: formData.recordId,
      script: formData.script,
      topic: formData.topic,
      voice: formData.voice,
      videoStyle: formData.videoStyle,
      caption: formData.caption,
      uid: user?._id,
      createdBy: user?.email,
      credits: user?.credits,
    });
    console.log(resp);

    // Generate video
    const result = await axios.post('/api/generate-video', formData);
    console.log("RecordID:", formData.recordId);
    console.log(result);
    
    setLoading(false);
    router.push('/dashboard');
  };

  // Audio generation
  const PreviewAudio = async () => {
    if (user?.credits <= 0) {
      toast('Please add more credits!');
      return;
    }
    if (
      !formData?.topic ||
      !formData?.script ||
      !formData?.voice 
    ) {
      alert('Error: Missing fields');
      return;
    }
    setLoading(true);
    
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
    });
    console.log(resp);

    // Generate audio preview
    const result = await axios.post('/api/preview-audio', formData);
    console.log("RecordID:", formData.recordId);
    console.log(result);
    
    setLoading(false);
  };

  // Image generation
  const PreviewImages = async () => {
    if (user?.credits <= 0) {
      toast('Please add more credits!');
      return;
    }
    if (
      !formData?.topic ||
      !formData?.script ||
      !formData?.videoStyle 
    ) {
      alert('Error: Please fill required fields');
      return;
    }
    setLoading(true);
    
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
    });
    console.log(resp);

    // Generate image previews
    const result = await axios.post('/api/preview-images', formData);
    console.log("RecordID:", formData.recordId);
    console.log(result);
    
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-3xl">Create New Video</h2>
  
      {!titleSubmitted ? (
        <div className="mt-6 space-y-4 max-w-xl">
          <label className="block text-lg font-medium">Enter Project Title</label>
          <input
            type="text"
            className="w-full p-2 rounded-md border bg-black text-white"
            placeholder="My Awesome Video"
            onChange={(e) => onHandleInputChange('title', e.target.value)}
          />
          <Button className="mt-2" onClick={GetTitle}>
            Submit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-7">
          <div className="col-span-2 p-8 border rounded-xl h-[75vh] overflow-auto">
            {/* Topic and Script */}
            <Topic onHandleInputChange={onHandleInputChange} />
  
            {/* Video Style */}
            <VideoStyle onHandleInputChange={onHandleInputChange} />
            <Button className="w-full mt-4" onClick={PreviewImages}>
              Preview Images
            </Button>
  
            {/* Voice */}
            <Voice onHandleInputChange={onHandleInputChange} />
            <Button className="w-full mt-4" onClick={PreviewAudio}>
              Preview Audio
            </Button>
  
            {/* Captions */}
            <Captions onHandleInputChange={onHandleInputChange} />
  
            <Button
              className="w-full mt-5"
              disabled={loading}
              onClick={GenerateVideo}
            >
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <>
                  <WandSparkles className="mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
  
          <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">Generated Content</h1>
  
            {/* Display generated images */}
            {images && images.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Generated Images</h2>
                <div className="grid grid-cols-2 gap-4">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Scene ${idx + 1}`}
                      className="rounded-lg shadow-md w-full"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                No images generated yet
              </div>
            )}
  
            {/* Display generated audio */}
            {audio ? (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Generated Audio</h2>
                <audio controls className="w-full">
                  <source src={audio} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                No audio generated yet
              </div>
            )}
  
            {/* Preview component */}
            <div>
              <Preview formData={formData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateNewVideo;