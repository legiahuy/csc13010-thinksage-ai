'use client';
import React, { useEffect, useState } from 'react';
import RemotionPlayer from '../_components/RemotionPlayer';
import VideoInfo from '../_components/VideoInfo';
import VideoStats from '../_components/VideoStats';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';

function PlayVideo() {
  const { videoId } = useParams();
  const convex = useConvex();
  const [videoData, setVideoData] = useState();
  const [videoStats, setVideoStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    videoId && GetVideoDataById();
  }, [videoId]);

  const GetVideoDataById = async () => {
    const result = await convex.query(api.videoData.GetVideoById, {
      videoId: videoId,
    });
    setVideoData(result);
    setVideoStats(result?.youtubeStats || null);
  };

  const fetchStats = async () => {
    const ytUrl = videoData?.youtubeUrl;
    if (!ytUrl) return;
    const id = new URL(ytUrl)?.searchParams.get('v') || ytUrl?.split('v=')[1];
    if (!id) return;

    const res = await fetch(`/api/youtube-stats?videoId=${id}`);
    const data = await res.json();
    if (!data?.stats) return;

    setVideoStats(data.stats);
    setLastUpdated(new Date());
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <RemotionPlayer videoData={videoData} />
        <VideoInfo
          videoData={videoData}
          onStatsChange={setVideoStats}
          onLastUpdatedChange={setLastUpdated}
        />
      </div>
      <VideoStats
        videoStats={videoStats}
        lastUpdated={lastUpdated}
        fetchStats={fetchStats}
      />
    </div>
  );
}

export default PlayVideo;