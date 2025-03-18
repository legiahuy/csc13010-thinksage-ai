'use client';
import React from 'react';
import Topic from './_components/Topic';
import { useState } from 'react';
import VideoStyle from './_components/VideoStyle';
import Voice from './_components/Voice';
import Captions from './_components/Captions';
import { Loader2Icon, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Preview from './_components/Preview';
import axios from 'axios';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/providers';
import { useMutation } from 'convex/react';
function CreateNewVideo() {
  const [formData, setFormData] = useState();
  const CreateInitialVideoRecord = useMutation(api.videoData.CreateVideoData);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
    console.log(formData);
  };

  const GenerateVideo = async () => {
    if (
      !formData?.topic ||
      !formData?.script ||
      !formData?.voice ||
      !formData?.videoStyle ||
      !formData?.caption
    ) {
      console.log('Error: Please fill all fields');
      return;
    }
    setLoading(true);
    //save data
    const resp = await CreateInitialVideoRecord({
      title: formData.title,
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

    const result = await axios.post('/api/generate-video-data', {
      ...formData,
      recordId: resp,
    });

    console.log(result);
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-3xl">Create New Video</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-7">
        <div className="col-span-2 p-8 border rounded-xl h-[75vh] overflow-auto">
          {/* Topic and Script */}
          <Topic onHandleInputChange={onHandleInputChange} />
          {/* Video Image Style */}
          <VideoStyle onHandleInputChange={onHandleInputChange} />
          {/* Voice */}
          <Voice onHandleInputChange={onHandleInputChange} />
          {/* Captions */}
          <Captions onHandleInputChange={onHandleInputChange} />
          <Button className="w-full mt-5" disabled={loading} onClick={GenerateVideo}>
            {' '}
            {loading ? <Loader2Icon className="animate-spin" /> : <WandSparkles />} Generate Video
          </Button>
        </div>
        <div>
          <Preview formData={formData} />
        </div>
      </div>
    </div>
  );
}

export default CreateNewVideo;
