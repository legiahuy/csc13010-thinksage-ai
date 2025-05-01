import React from 'react';
import { Composition } from 'remotion';
import RemotionComposition from './../app/_components/RemotionComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Composition"
        component={RemotionComposition}
        durationInFrames={40 * 30} // 60 seconds at 30fps
        fps={30}
        width={720}
        height={1280}
        defaultProps={{
          videoData: {
            audioUrl: '',
            captionJson: [],
            images: [],
            caption: {},
          },
        }}
      />
    </>
  );
};
