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
          // Calculate duration based on the end time of the last caption
          const durationInFrames = props.videoData.captionJson?.length
            ? Number(
                (
                  props.videoData.captionJson[props.videoData.captionJson.length - 1]?.end * 30
                ).toFixed(0)
              )
            : 30 * 30; // Fallback to 30 seconds if no captions

          return {
            durationInFrames,
            fps: 30,
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
    images: PropTypes.array,
    caption: PropTypes.object,
  }),
};

export default RemotionRoot;
