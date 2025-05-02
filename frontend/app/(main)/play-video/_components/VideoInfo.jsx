'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon, UploadCloudIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

function VideoInfo({ videoData }) {
  const [isUploading, setIsUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);

  const handleShareToYouTube = async () => {
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
          // Nếu là lỗi xác thực, chuyển hướng người dùng đến trang xác thực
          window.location.href = '/api/auth/google';
          return;
        }
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }

      const data = await res.json();
      setYoutubeUrl(data.youtubeUrl);
      setVideoStatus(data.status);

      // Kiểm tra trạng thái video sau mỗi 10 giây
      const checkVideoStatus = async () => {
        try {
          const statusRes = await fetch(`/api/youtube-status?videoId=${data.videoId}`);
          const statusData = await statusRes.json();
          setVideoStatus(statusData.status);
          
          if (statusData.status.uploadStatus === 'processed') {
            return;
          }
          
          setTimeout(checkVideoStatus, 10000);
        } catch (error) {
          console.error('Error checking video status:', error);
        }
      };

      checkVideoStatus();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Unknown error');
    } finally {
      setIsUploading(false);
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

        <Button>
          <DownloadIcon className="mr-2" />
          Export & Download
        </Button>

        {videoData?.downloadUrl && (
          <Button
            onClick={handleShareToYouTube}
            disabled={isUploading}
            variant="outline"
          >
            <UploadCloudIcon className="mr-2" />
            {isUploading ? 'Uploading to YouTube...' : 'Share to YouTube'}
          </Button>
        )}

        {youtubeUrl && (
          <div className="text-green-600">
            <p>
              ✅ Video đã upload:
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline"
              >
                Xem trên YouTube
              </a>
            </p>
            {videoStatus && (
              <p className="text-sm text-gray-600 mt-2">
                Trạng thái: {
                  videoStatus.uploadStatus === 'processed' 
                    ? '✅ Đã xử lý xong' 
                    : '⏳ Đang xử lý...'
                }
              </p>
            )}
          </div>
        )}

        {uploadError && (
          <div className="text-red-600">
            <p>❌ Lỗi upload: {uploadError}</p>
            <small className="text-sm text-gray-500">
              Vui lòng kiểm tra console để biết thêm chi tiết
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoInfo;
