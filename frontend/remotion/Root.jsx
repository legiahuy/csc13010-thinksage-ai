import React from 'react';
import { Composition } from 'remotion';
import PropTypes from 'prop-types';
import RemotionComposition from './../app/_components/RemotionComposition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Composition"
        component={RemotionComposition}
        calculateMetadata={({ props }) => {
          const fps = 30;
          
          // Calculate duration based on images with proper timing
          let imageDuration = 0;
          if (props.videoData.images?.length) {
            imageDuration = props.videoData.images.reduce((total, item) => {
              const durationSec = Number(item.duration) || 1;
              return total + durationSec;
            }, 0);
          }

          // Calculate duration based on captions
          const captionDuration = props.videoData.captionJson?.length
            ? props.videoData.captionJson[props.videoData.captionJson.length - 1]?.end
            : 30; // Fallback to 30 seconds if no captions

          // Use the longer duration between images and captions
          const durationInSeconds = Math.max(imageDuration, captionDuration);
          
          // Add a small buffer to ensure no content is cut off
          const finalDuration = durationInSeconds + 0.5;
          
          return {
            durationInFrames: Math.ceil(finalDuration * fps),
            fps,
            width: 720,
            height: 1280,
          };
        }}
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

RemotionRoot.propTypes = {
  videoData: PropTypes.shape({
    captionJson: PropTypes.arrayOf(
      PropTypes.shape({
        end: PropTypes.number,
      })
    ),
    audioUrl: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        duration: PropTypes.number,
        url: PropTypes.string,
      })
    ),
    caption: PropTypes.object,
  }),
};

export default RemotionRoot;
