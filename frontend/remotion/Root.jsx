import React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';
import RemotionComposition from './../app/_components/RemotionComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Composition"
        component={RemotionComposition}
        durationInFrames={60 * 30} // 60 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoData: {
            audioUrl: "",
            captionJson: [],
            images: [],
            caption: { style: "default" }
          }
        }}
      />
    </>
  );
};
