'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, DownloadIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify'; // Or use `useToast` from shadcn if preferred

function VideoInfo({ videoData }) {
  const handleDownloadClick = () => {
    if (!videoData?.downloadUrl) {
      toast.warning('The video is still processing. Please try again later.');
    }
  };

  const getDownloadLink = (url) => {
    try {
      const parts = url.split('/upload/');
      return parts.length === 2 ? `${parts[0]}/upload/fl_attachment/${parts[1]}` : url;
    } catch {
      return url;
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
        <h2 className="mt-5">Project Name: {videoData?.title}</h2>
        <p className="text-gray-500">Script: {videoData?.script}</p>
        <h2>Video Style : {videoData?.videoStyle}</h2>

        {videoData?.downloadUrl ? (
          <a
            href={getDownloadLink(videoData.downloadUrl)}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-full" // Ensures full width for anchor
          >
            <Button className="w-full flex items-center gap-2 justify-center">
              <DownloadIcon className="w-4 h-4" />
              Export & Download
            </Button>
          </a>
        ) : (
          <Button
            className="w-full flex items-center gap-2 justify-center"
            onClick={handleDownloadClick}
          >
            <DownloadIcon className="w-4 h-4" />
            Export & Download
          </Button>
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
  }),
};

export default VideoInfo;
