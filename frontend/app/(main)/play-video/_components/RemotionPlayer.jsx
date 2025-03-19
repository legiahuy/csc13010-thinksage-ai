'use client';
import RemotionComposition from '@/app/_components/RemotionComposition';
import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { useVideoConfig } from 'remotion';

function RemotionPlayer({ videoData }) {
  //const [durationInFrames, setDurationInFrame] = useState(100);

  return (
    <div>
      <Player
        component={RemotionComposition}
        durationInFrames={
          videoData?.captionJson
            ? Number(
                (videoData?.captionJson[videoData?.captionJson?.length - 1]?.end * 30).toFixed(0)
              )
            : 200
        }
        compositionWidth={720}
        compositionHeight={1280}
        fps={30}
        controls
        style={{
          width: '25vw',
          height: '70vh',
        }}
        inputProps={{
          videoData: videoData,
        }}
      />
    </div>
  );
}

export default RemotionPlayer;
