'use client';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import { RefreshCcw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function GeneratedVideosList() {
  const [videoList, setVideoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [userDataMap, setUserDataMap] = useState({});
  const convex = useConvex();

  const GetAllVideos = useCallback(async () => {
    const GetPendingVideoStatus = (pendingVideo) => {
      const intervalId = setInterval(async () => {
        const result = await convex.query(api.videoData.GetVideoById, {
          videoId: pendingVideo?._id,
        });
        if (result?.status == 'completed') {
          clearInterval(intervalId);
          console.log('Video Process Completed');
          GetAllVideos();
        }
        console.log('Still Pending...');
      }, 5000);
    };

    setIsLoading(true);
    try {
      const result = await convex.query(api.videoData.GetAllVideos);
      console.log('Query result:', result);
      setVideoList(result);

      // Fetch user data for each unique creator
      const uniqueEmails = [...new Set(result.map((video) => video.createdBy))];
      const userDataPromises = uniqueEmails.map((email) =>
        convex.query(api.users.GetUserByEmail, { email })
      );
      const userDataResults = await Promise.all(userDataPromises);

      // Create a map of email to user data
      const userMap = {};
      userDataResults.forEach((userData) => {
        if (userData) {
          userMap[userData.email] = userData;
        }
      });
      setUserDataMap(userMap);

      const isPendingVideo = result?.find((item) => item.status == 'pending');
      isPendingVideo && GetPendingVideoStatus(isPendingVideo);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [convex]);

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      await convex.mutation(api.videoData.DeleteVideo, {
        videoId: videoToDelete._id,
      });
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
      GetAllVideos(); // Refresh the list
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  useEffect(() => {
    GetAllVideos();
  }, [GetAllVideos]);

  // Helper to safely extract image URL (reuse from VideoList)
  const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img.url) return img.url;
    return '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCcw className="animate-spin mr-2" />
        <span>Loading videos...</span>
      </div>
    );
  }

  return (
    <div>
      {videoList?.length == 0 ? (
        <div className="flex flex-col items-center justify-center mt-28 gap-5 border border-dashed rounded-x py-16">
          <Image src={'/logo.svg'} alt="logo" width={60} height={60} />
          <h2 className="text-gray-400 text-lg">No videos found in the system.</h2>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mt-10">
          {videoList?.map((video, index) => (
            <div key={index} className="group relative">
              <Link href={'/play-video/' + video?._id}>
                <div className="relative">
                  {video?.status === 'completed' &&
                  getImageUrl(video?.images?.[0]) &&
                  typeof getImageUrl(video?.images?.[0]) === 'string' &&
                  getImageUrl(video?.images?.[0]).trim() !== '' ? (
                    <Image
                      src={getImageUrl(video?.images?.[0])}
                      alt={video?.title || 'Video thumbnail'}
                      width={500}
                      height={500}
                      className="w-full object-cover rounded-xl aspect-[2/3]"
                    />
                  ) : (
                    <div className="aspect-[2/3] p-5 w-full rounded-xl bg-slate-900 flex items-center justify-center">
                      <RefreshCcw className="animate-spin mr-2" />
                      <h2>Generating...</h2>
                    </div>
                  )}
                  <div className="absolute bottom-3 px-5 w-full">
                    <h2>{video?.title}</h2>
                    <h2 className="text-sm">{moment(video?._creationTime).fromNow()}</h2>
                  </div>
                </div>
              </Link>

              {/* Creator Info */}
              <div className="mt-2 flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={userDataMap[video?.createdBy]?.pictureURL || '/default-avatar.png'}
                    alt={userDataMap[video?.createdBy]?.name || 'User'}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-400 truncate">
                  {userDataMap[video?.createdBy]?.name || 'Unknown User'}
                </span>
              </div>

              {/* Delete Button (shows on hover) */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setVideoToDelete(video);
                  setDeleteDialogOpen(true);
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video and all its
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVideo} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default GeneratedVideosList;
