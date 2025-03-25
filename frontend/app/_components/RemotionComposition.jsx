'use client';
import React, { useEffect } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

function RemotionComposition({ videoData }) {
  const captions = videoData?.captionJson;
  const { fps, width, height } = useVideoConfig();
  const imageList = videoData?.images;
  const frame = useCurrentFrame();

  useEffect(() => {
    videoData && getDurationFrame();
  }, [videoData]);

  const getDurationFrame = () => {
    const totalDuration = captions[captions?.length - 1]?.end * fps;
    return totalDuration;
  };

  const getCurrentCaption = () => {
    const currentTime = frame / 30;
    const currentCaption = captions?.find(
      (item) => currentTime >= item.start && currentTime <= item.end
    );
    return currentCaption ? currentCaption.word : '';
  };

  const getCurrentCaptionStyle = () => {
    const currentTime = frame / 30;
    const currentCaption = captions?.find(
      (item) => currentTime >= item.start && currentTime <= item.end
    );

    return currentCaption ? videoData?.caption?.style || '' : '';
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AbsoluteFill>
        {imageList?.map((item, index) => {
          const startTime = (index * getDurationFrame()) / imageList.length;
          const duration = getDurationFrame();

          const scale = (index) =>
            interpolate(
              frame,
              [startTime, startTime + duration / 2, startTime + duration],
              index % 2 === 0 ? [1, 1.8, 1] : [1.8, 1, 1.8],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

          return (
            <Sequence key={index} from={startTime} durationInFrames={duration}>
              <AbsoluteFill>
                <Img
                  src={item}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale(index)})`,
                  }}
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Centered Caption Container */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          paddingTop: '100%',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            padding: '10px 20px',
            maxWidth: '80%',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2
            className={getCurrentCaptionStyle()}
            style={{
              fontSize: '40px',
              margin: 0,
              textAlign: 'center',
              width: '100%',
            }}
          >
            {getCurrentCaption()}
          </h2>
        </div>
      </AbsoluteFill>

      {videoData?.audioUrl && <Audio src={videoData?.audioUrl} />}
    </div>
  );
}

export default RemotionComposition;
