'use client';
import React, { useEffect, useState } from 'react';
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
  const captions = videoData?.captionJson || [];
  const { fps, width, height } = useVideoConfig();
  const imageList = videoData?.images || [];
  const frame = useCurrentFrame();
  const [duration, setDuration] = useState(5 * 30); // Default 5 seconds

  useEffect(() => {
    if (captions.length > 0) {
      const lastCaption = captions[captions.length - 1];
      if (lastCaption?.end) {
        setDuration(Math.ceil(lastCaption.end * fps));
      }
    }
  }, [captions, fps]);

  const getCurrentCaption = () => {
    const currentTime = frame / fps;
    const currentCaption = captions.find(
      (item) => currentTime >= item.start && currentTime <= item.end
    );
    return currentCaption ? currentCaption.word : '';
  };

  const getCurrentCaptionStyle = () => {
    return videoData?.caption?.style || 'default';
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AbsoluteFill>
        {imageList.map((item, index) => {
          const startTime = (index * duration) / imageList.length;
          const imageDuration = duration / imageList.length;

          const scale = interpolate(
            frame,
            [startTime, startTime + imageDuration / 2, startTime + imageDuration],
            [1, 1.2, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <Sequence key={index} from={startTime} durationInFrames={imageDuration}>
              <AbsoluteFill>
                <Img
                  src={item}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale})`,
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
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            padding: '10px 20px',
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '40px',
              margin: 0,
              textAlign: 'center',
              width: '100%',
              color: 'white',
            }}
          >
            {getCurrentCaption()}
          </h2>
        </div>
      </AbsoluteFill>

      {videoData?.audioUrl && (
        <Audio
          src={videoData.audioUrl}
          startFrom={0}
          endAt={duration}
        />
      )}
    </div>
  );
}

export default RemotionComposition;
