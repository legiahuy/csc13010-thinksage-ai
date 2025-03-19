import React from 'react';
import VideoList from './_components/VideoList';

function Dashboard() {
  return (
    <div>
      <h2 className="font-bold text-3xl">My Videos</h2>
      <VideoList />
    </div>
  );
}

export default Dashboard;
