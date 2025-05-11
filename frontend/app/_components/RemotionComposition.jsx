'use client';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import './tailwind-output.css';

function RemotionComposition({ videoData }) {
  const captions = videoData?.captionJson;
  const { fps } = useVideoConfig();
  const imageList = videoData?.images;
  const frame = useCurrentFrame();

  // Easing functions for smoother transitions
  const easeInOutCubic = (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  const easeInOutBack = (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  };

  const getDurationFrame = () => {
    const totalDuration = captions[captions?.length - 1]?.end * fps;
    return totalDuration;
  };

  useEffect(() => {
    videoData && getDurationFrame();
  }, [videoData, getDurationFrame]);

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

  // Calculate start frames for each image based on their durations
  const imageStartFrames = [];
  let cumulativeFrames = 0;
  imageList?.forEach((item, idx) => {
    imageStartFrames[idx] = cumulativeFrames;
    const durationSec = Number(item.duration) || 1;
    cumulativeFrames += Math.floor(durationSec * fps);
  });
  const totalFrames = cumulativeFrames;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AbsoluteFill>
        {imageList?.filter(item => {
          const imageUrl = typeof item === 'string' ? item : item?.url;
          return imageUrl && imageUrl.trim() !== '';
        }).map((item, index) => {
          const startFrame = imageStartFrames[index];
          const durationSec = Number(item.duration) || 1;
          const durationFrames = Math.floor(durationSec * fps);
          const transition = item.transition || 'fade';
          
          // Calculate transition timing
          const transitionDuration = Math.min(30, Math.floor(durationFrames / 3));
          
            // Calculate frame ranges for transitions - only fade in
          const fadeInStart = startFrame;
          const fadeInEnd = startFrame + transitionDuration;

          // Calculate opacity - only fade in, stay at 1
          const opacity = interpolate(
            frame,
            [fadeInStart, fadeInEnd],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOutCubic
            }
          );

          // Calculate scale - only scale in, stay at 1.05
          const scale = interpolate(
            frame,
            [fadeInStart, fadeInEnd],
            [1, 1.05],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easeInOutCubic
            }
          );

          // Calculate next clip's start frame
          const nextStartFrame = index < imageList.length - 1 
            ? imageStartFrames[index + 1] 
            : startFrame + durationFrames;

          // Ensure the clip stays visible until the next one is fully visible
          const actualDuration = nextStartFrame - startFrame + transitionDuration;

          const imageUrl = typeof item === 'string' ? item : item.url;

          return (
            <Sequence 
              key={index} 
              from={startFrame} 
              durationInFrames={actualDuration}
            >
              <AbsoluteFill>
                <Img
                  src={imageUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    ...(transition === 'fade' && { 
                      filter: `blur(${interpolate(
                        frame,
                        [fadeInStart, fadeInEnd],
                        [2, 0],
                        { 
                          extrapolateLeft: 'clamp', 
                          extrapolateRight: 'clamp',
                          easing: easeInOutCubic
                        }
                      )}px)`
                    }),
                    ...(transition === 'slide' && { 
                      transform: `scale(${scale}) translateX(${interpolate(
                        frame,
                        [fadeInStart, fadeInEnd],
                        [10, 0],
                        { 
                          extrapolateLeft: 'clamp', 
                          extrapolateRight: 'clamp',
                          easing: easeOutBack
                        }
                      )}%)`
                    }),
                    ...(transition === 'zoom' && { 
                      transform: `scale(${interpolate(
                        frame,
                        [fadeInStart, fadeInEnd],
                        [1.05, 1],
                        { 
                          extrapolateLeft: 'clamp', 
                          extrapolateRight: 'clamp',
                          easing: easeInOutBack
                        }
                      )})`
                    }),
                    ...(transition === 'dissolve' && { 
                      filter: `blur(${interpolate(
                        frame,
                        [fadeInStart, fadeInEnd],
                        [4, 0],
                        { 
                          extrapolateLeft: 'clamp', 
                          extrapolateRight: 'clamp',
                          easing: easeInOutCubic
                        }
                      )}px)`
                    })
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

      {/* Narrator Audio */}
      {videoData?.audioUrl && (
        <Audio
          src={videoData.audioUrl}
          volume={(videoData.narratorVolume ?? 100) / 100}
        />
      )}
      {/* Background Music */}
      {videoData?.backgroundMusic && (
        <Audio
          src={videoData.backgroundMusic.url}
          startFrom={Math.floor((videoData.backgroundMusic.start || 0) * fps)}
          endAt={Math.floor((videoData.backgroundMusic.end || (totalFrames / fps)) * fps)}
          volume={videoData.backgroundMusic.volume / 100}
        />
      )}
    </div>
  );
}

RemotionComposition.propTypes = {
  videoData: PropTypes.shape({
    captionJson: PropTypes.array,
    images: PropTypes.array,
    caption: PropTypes.shape({
      style: PropTypes.string,
    }),
    audioUrl: PropTypes.string,
    backgroundMusic: PropTypes.shape({
      url: PropTypes.string,
      volume: PropTypes.number,
    }),
  }),
};

export default RemotionComposition;
