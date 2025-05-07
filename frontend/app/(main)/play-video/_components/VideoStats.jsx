'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';

function VideoStats({ videoStats, lastUpdated, fetchStats }) {
  if (!videoStats) return null;

  return (
    <div className="p-5 border rounded-xl mt-10">
      <h3 className="font-semibold mb-2">📈 Real-Time YouTube Performance</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={[
            { name: 'Views', count: parseInt(videoStats.viewCount || 0) },
            { name: 'Likes', count: parseInt(videoStats.likeCount || 0) },
            { name: 'Comments', count: parseInt(videoStats.commentCount || 0) },
          ]}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center mt-2">
        <Button variant="outline" size="sm" onClick={fetchStats} className="mr-3">
          🔄 Refresh now
        </Button>
        {lastUpdated && (
          <span className="text-sm text-gray-500">
            🕒 Last updated: {lastUpdated.toLocaleTimeString('en-US')} on {lastUpdated.toLocaleDateString('en-US')}
          </span>
        )}
      </div>
    </div>
  );
}

export default VideoStats;