import React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';
import RemotionComposition from './../app/_components/RemotionComposition';

const videoData = {
  audioUrl: GenerateAudioFile,
  captionJson: GenerateCaptions,
  images: GenerateImages,
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="youtubeShort"
        component={RemotionComposition}
        durationInFrames={Number(
          (videoData?.captionJson[videoData?.captionJson?.length - 1]?.end * 30).toFixed(0)
        )}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          videoData: videoData,
        }}
      />
    </>
  );
};
