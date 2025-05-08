'use client';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon, UploadCloudIcon } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import VideoStats from '../_components/VideoStats';

function VideoInfo({ videoData }) {
  const [isUploading, setIsUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [videoStats, setVideoStats] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const saveYoutubeStats = useMutation(api.videoData.saveYoutubeStats);

  const handleActualUpload = async () => {
    if (!videoData?.downloadUrl) return;

    setIsUploading(true);
    setUploadError(null);
    setYoutubeUrl(null);
    setVideoStatus(null);

    try {
      const res = await fetch('/api/youtube-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          downloadUrl: videoData.downloadUrl,
          title: videoData.title || 'Untitled',
          description: videoData.script || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.code === 'AUTH_ERROR') {
          alert('Chưa đăng nhập Google. Hãy thử lại.');
          return;
        }
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }

      const data = await res.json();
      setYoutubeUrl(data.youtubeUrl);
      setVideoStatus(data.status);

      const vidId = data.videoId;
      setVideoId(vidId);
      fetchStats(vidId);

      const checkVideoStatus = async () => {
        try {
          const statusRes = await fetch(`/api/youtube-status?videoId=${vidId}`);
          const statusData = await statusRes.json();
          setVideoStatus(statusData.status);

          if (statusData?.status?.uploadStatus === 'processed') return;
          setTimeout(checkVideoStatus, 10000);
        } catch (err) {
          console.error('Error checking video status:', err);
        }
      };

      checkVideoStatus();
    } catch (err) {
      setUploadError(err.message || 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleShareToYouTube = () => {
    if (!videoData?.downloadUrl) {
      alert('Video chưa sẵn sàng.');
      return;
    }

    window.open(
      `/api/auth/google?title=${encodeURIComponent(videoData.title || 'Untitled')}&description=${encodeURIComponent(videoData.script || '')}&downloadUrl=${encodeURIComponent(videoData.downloadUrl)}`,
      '_blank',
      'width=500,height=600'
    );
  };

  const fetchStats = async (idOverride) => {
    const id = idOverride || videoId;
    if (!id) return;

    try {
      const res = await fetch(`/api/youtube-stats?videoId=${id}`);
      const data = await res.json();
      if (!data?.stats) return;

      const stats = {
        viewCount: data.stats.viewCount || '0',
        likeCount: data.stats.likeCount || '0',
        commentCount: data.stats.commentCount || '0',
      };

      setVideoStats(stats);
      setLastUpdated(new Date());

      if (videoData?._id) {
        await saveYoutubeStats({
          videoId: videoData._id,
          stats,
          youtubeUrl: youtubeUrl || videoData.youtubeUrl,
        });
      }
    } catch (error) {
      console.error('Failed to fetch video stats:', error);
    }
  };

  useEffect(() => {
    if (videoData?.youtubeStats) {
      setVideoStats(videoData.youtubeStats);
    }
  }, [videoData]);

  useEffect(() => {
    const listener = (event) => {
      if (event.data === 'google-auth-success') {
        handleActualUpload();
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [videoData]);

  useEffect(() => {
    let intervalId;
    const ytUrl = youtubeUrl || videoData?.youtubeUrl;

    if (ytUrl) {
      try {
        const idFromUrl = new URL(ytUrl)?.searchParams.get('v') || ytUrl?.split('v=')[1];
        if (idFromUrl) {
          setVideoId(idFromUrl);
          fetchStats(idFromUrl);
          intervalId = setInterval(() => fetchStats(idFromUrl), 5 * 60 * 1000);
        }
      } catch (err) {
        console.error('Invalid YouTube URL:', ytUrl);
      }
    }

    return () => clearInterval(intervalId);
  }, [youtubeUrl, videoData]);

  const getDownloadLink = (url) => {
    try {
      const parts = url.split('/upload/');
      return parts.length === 2 ? `${parts[0]}/upload/fl_attachment/${parts[1]}` : url;
    } catch {
      return url;
    }
  };

  const handleDownloadClick = () => {
    if (!videoData?.downloadUrl) {
      alert('The video is still processing. Please try again later.');
    }
  };

  return (
    <div className="p-5 border rounded-xl">
      <Link href="/dashboard">
        <h2 className="flex gap-2 items-center">
          <ArrowLeft />
          Back to Dashboard
        </h2>
      </Link>

      <div className="flex flex-col gap-3">
        <h2 className="mt-5 font-semibold">Project Name: {videoData?.title}</h2>
        <p className="text-gray-500">Script: {videoData?.script}</p>
        <h2>Video Style: {videoData?.videoStyle}</h2>

        {videoData?.downloadUrl ? (
          <a
            href={getDownloadLink(videoData.downloadUrl)}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full flex items-center gap-2 justify-center">
              <DownloadIcon className="w-4 h-4" />
              Export & Download
            </Button>
          </a>
        ) : (
          <Button className="w-full flex items-center gap-2 justify-center" onClick={handleDownloadClick}>
            <DownloadIcon className="w-4 h-4" />
            Export & Download
          </Button>
        )}

        {videoData?.downloadUrl && !(youtubeUrl || videoData?.youtubeUrl) && (
          <Button onClick={handleShareToYouTube} disabled={isUploading} variant="outline">
            <UploadCloudIcon className="mr-2" />
            {isUploading ? 'Uploading to YouTube...' : 'Share to YouTube'}
          </Button>
        )}

        {(youtubeUrl || videoData?.youtubeUrl) && (
          <Button disabled variant="secondary" className="opacity-60 cursor-not-allowed">
            <UploadCloudIcon className="mr-2" />
            Video already shared
          </Button>
        )}

        {(youtubeUrl || videoData?.youtubeUrl) && (
          <div className="text-green-600">
            <p>
              ✅ Video uploaded successfully:
              <a
                href={youtubeUrl || videoData?.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline"
              >
                Watch on YouTube
              </a>
            </p>
          </div>
        )}

        {youtubeUrl && videoStatus?.uploadStatus !== 'processed' && (
          <div className="text-yellow-700">
            <p>⏳ The video is still being processed by YouTube...</p>
          </div>
        )}

        {uploadError && (
          <div className="text-red-600">
            <p>❌ Upload error: {uploadError}</p>
            <small className="text-sm text-gray-500">Please check the browser console for more details.</small>
          </div>
        )}
      </div>
    </div>
  );
}

VideoInfo.propTypes = {
  videoData: PropTypes.shape({
    title: PropTypes.string,
    script: PropTypes.string,
    videoStyle: PropTypes.string,
    downloadUrl: PropTypes.string,
    youtubeUrl: PropTypes.string,
    _id: PropTypes.string,
    youtubeStats: PropTypes.object,
  }),
};

export default VideoInfo;
