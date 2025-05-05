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
          
          // Ensure transition duration is valid and won't cause duplicate values
          const minTransition = 1; // Minimum transition duration in frames
          const maxTransition = Math.max(minTransition, Math.min(30, Math.floor(durationFrames / 2) - 1));
          const transitionDuration = maxTransition;
          
          // Calculate when the next image should start appearing
          const nextImageStartTime = startFrame + durationFrames - transitionDuration;

          // More subtle scale effect with easing
          const scale = interpolate(
            frame,
            [startFrame, startFrame + durationFrames / 2, startFrame + durationFrames],
            [1, 1.1, 1],
            { 
              extrapolateLeft: 'clamp', 
              extrapolateRight: 'clamp',
              easing: easeInOutCubic
            }
          );

          const imageUrl = typeof item === 'string' ? item : item.url;

          // Calculate transition progress with easing
          const transitionProgress = interpolate(
            frame,
            [startFrame, startFrame + transitionDuration],
            [0, 1],
            { 
              extrapolateLeft: 'clamp', 
              extrapolateRight: 'clamp',
              easing: easeInOutBack
            }
          );

          // Calculate exit transition progress
          const exitProgress = interpolate(
            frame,
            [nextImageStartTime, startFrame + durationFrames],
            [0, 1],
            { 
              extrapolateLeft: 'clamp', 
              extrapolateRight: 'clamp',
              easing: easeInOutCubic
            }
          );

          return (
            <Sequence key={index} from={startFrame} durationInFrames={durationFrames}>
              <AbsoluteFill>
                <Img
                  src={imageUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale})`,
                    opacity: interpolate(
                      frame,
                      [startFrame, startFrame + transitionDuration, nextImageStartTime, startFrame + durationFrames],
                      [0, 1, 1, 0],
                      { 
                        extrapolateLeft: 'clamp', 
                        extrapolateRight: 'clamp',
                        easing: easeInOutCubic
                      }
                    ),
                    ...(transition === 'fade' && { 
                      filter: `blur(${interpolate(
                        transitionProgress,
                        [0, 0.5, 1],
                        [4, 0, 0],
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
                        [startFrame, startFrame + transitionDuration, nextImageStartTime, startFrame + durationFrames],
                        [20, 0, 0, -20],
                        { 
                          extrapolateLeft: 'clamp', 
                          extrapolateRight: 'clamp',
                          easing: easeOutBack
                        }
                      )}%)`,
                      filter: `blur(${interpolate(
                        transitionProgress,
                        [0, 0.5, 1],
                        [2, 0, 0],
                        { 
                          extrapolateLeft: 'clamp', 
                          extrapolateRight: 'clamp',
                          easing: easeInOutCubic
                        }
                      )}px)`
                    }),
                    ...(transition === 'zoom' && { 
                      transform: `scale(${interpolate(
                        frame,
                        [startFrame, startFrame + transitionDuration, nextImageStartTime, startFrame + durationFrames],
                        [1.1, 1, 1, 0.9],
                        { 
                          extrapolateLeft: 'clamp', 
                          extrapolateRight: 'clamp',
                          easing: easeInOutBack
                        }
                      )})`,
                      filter: `blur(${interpolate(
                        transitionProgress,
                        [0, 0.5, 1],
                        [2, 0, 0],
                        { 
                          extrapolateLeft: 'clamp', 
                          extrapolateRight: 'clamp',
                          easing: easeInOutCubic
                        }
                      )}px)`
                    }),
                    ...(transition === 'dissolve' && { 
                      filter: `blur(${interpolate(
                        frame,
                        [startFrame, startFrame + transitionDuration, nextImageStartTime, startFrame + durationFrames],
                        [8, 0, 0, 8],
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
