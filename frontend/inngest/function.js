import { inngest } from './client';
import axios from 'axios';
import { GenerateImageScript } from '../configs/AiModel';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { createClient } from '@deepgram/sdk';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://aigurulab.tech';
const ImagePromptScript = `Generate Image prompt of {style} style with all details for each scene for a 30 second video: script: {script}
- Do not give camera angles image prompt
- Follow the schema and return JSON data (4-5 images max)
- [
    {
        imagePrompt: '',
        sceneContent: '<Script content>'
    }
]`;

export const GenImg = inngest.createFunction(
  { id: 'preview-images' },
  { event: 'preview-images' },
  async ({ event, step }) => {
    if (!event?.data) {
      throw new Error('Event data is required');
    }
    const { script, videoStyle, recordId } = event.data;
    console.log('Starting image generation with data:', { script, videoStyle, recordId });
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    const GenerateImagePrompt = await step.run('generateImagePrompt', async () => {
      try {
        const FINAL_SCRIPT = ImagePromptScript.replace('{style}', videoStyle).replace(
          '{script}',
          script
        );
        console.log('Generating image prompts with script:', FINAL_SCRIPT);
        const result = await GenerateImageScript.sendMessage(FINAL_SCRIPT);
        console.log('Image prompt generation result:', result);
        const resp = JSON.parse(result.response.text());
        return resp;
      } catch (error) {
        console.error('Error generating image prompts:', error);
        throw new Error(`Failed to generate image prompts: ${error.message}`);
      }
    });

    //generate image
    const GenerateImages = await step.run('generateImages', async () => {
      try {
        if (!process.env.NEXT_PUBLIC_AIGURULAB_API_KEY) {
          throw new Error('AIGURULAB_API_KEY is not configured');
        }

        let images = [];
        images = await Promise.all(
          GenerateImagePrompt.map(async (element) => {
            if (!element?.imagePrompt) {
              console.warn('Skipping image generation for empty prompt');
              return null;
            }

            console.log('Generating image for prompt:', element.imagePrompt);
            const result = await axios.post(
              BASE_URL + '/api/generate-image',
              {
                width: 1024,
                height: 1024,
                input: element.imagePrompt,
                model: 'sdxl',
                aspectRatio: '1:1',
              },
              {
                headers: {
                  'x-api-key': process.env.NEXT_PUBLIC_AIGURULAB_API_KEY,
                  'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
              }
            );

            if (!result.data?.image) {
              throw new Error('No image data in response');
            }

            console.log('Successfully generated image');
            return result.data.image;
          })
        );

        // Filter out any null values from failed generations
        images = images.filter(img => img !== null);
        
        if (images.length === 0) {
          throw new Error('No images were successfully generated');
        }

        return images;
      } catch (error) {
        console.error('Error generating images:', error);
        if (error.response) {
          console.error('API Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
        throw new Error(`Failed to generate images: ${error.message}`);
      }
    });

    //Save all to db
    await step.run('updateDB', async () => {
      try {
        console.log('Updating database with images:', GenerateImages);
        const result = await convex.mutation(api.videoData.UpdateImages, {
          recordId: recordId,
          images: GenerateImages,
        });
        console.log('Database update result:', result);
        return result;
      } catch (error) {
        console.error('Error updating database:', error);
        throw new Error(`Failed to update database: ${error.message}`);
      }
    });
  }
);

export const GenAudio = inngest.createFunction(
  { id: 'preview-audio' },
  { event: 'preview-audio' },
  async ({ event, step }) => {
    if (!event?.data) {
      throw new Error('Event data is required');
    }
    const { script, voice, recordId } = event.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    //generate audio
    const GenerateAudioFile = await step.run('generateAudioFile', async () => {
      const result = await axios.post(
        BASE_URL + '/api/text-to-speech',
        {
          input: script,
          voice: voice,
        },
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_AIGURULAB_API_KEY, // Your API Key
            'Content-Type': 'application/json', // Content Type
          },
        }
      );
      console.log(result.data.audio); //Output Result: Audio Mp3 Url
      return result.data.audio;
    });
    //generate captions
    const GenerateCaptions = await step.run('generateCaptions', async () => {
      const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

      const { result } = await deepgram.listen.prerecorded.transcribeUrl(
        {
          url: GenerateAudioFile,
        },
        // STEP 3: Configure Deepgram options for audio analysis
        {
          model: 'nova-3',
        }
      );
      //return full result here
      return result.results?.channels[0]?.alternatives[0]?.words;
    });
    //save to db
    await step.run('updateDB', async () => {
      const result = await convex.mutation(api.videoData.UpdateCaptionsAndAudio, {
        recordId: recordId,
        audioUrl: GenerateAudioFile,
        captionJson: GenerateCaptions,
      });
      return result;
    });
  }
);

export const GenVideo = inngest.createFunction(
  { name: "Generate Video" },
  { event: "video/generate" },
  async ({ event, step }) => {
    const { recordId } = event.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Fetch DB values for fallback
    const VideoData = await step.run("Fetch Video Data", async () => {
      const result = await convex.query(api.videoData.GetVideoById, {
        videoId: recordId,
      });
      return result;
    });

    // Use event.data for latest values, fallback to DB if not present
    const videoData = {
      ...VideoData,
      ...event.data,
      images: event.data.mediaItems || VideoData.images || [],
      backgroundMusic: event.data.backgroundMusic || VideoData.backgroundMusic || undefined,
      narratorVolume: event.data.narratorVolume ?? VideoData.narratorVolume,
    };

    // Write video data to JSON file
    await step.run("Write Video Data", async () => {
      const jsonData = JSON.stringify(videoData);
      fs.writeFileSync(path.join(process.cwd(), "public", "videoData.json"), jsonData);
    });

    const RenderVideo = await step.run('renderVideo', async () => {
      const { exec } = require('child_process');
      const path = require('path');
      const fs = require('fs');

      // Create a temporary directory for the video data
      const tempDir = path.resolve(process.cwd(), 'tmp');

      // Create the directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Prepare the video data for Docker
      const dockerVideoData = {
        videoData: videoData,
      };

      console.log('Rendering video with data:', dockerVideoData);

      // Write the video data to a JSON file
      const videoDataPath = path.join(tempDir, 'videoData.json');
      fs.writeFileSync(videoDataPath, JSON.stringify(dockerVideoData), 'utf8');

      // Create output directory if it doesn't exist
      const outputDir = path.join(tempDir, 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Get absolute paths for mounting
      const remotionPath = path.resolve(process.cwd(), 'remotion');
      const publicPath = path.resolve(process.cwd(), 'public');
      const appPath = path.resolve(process.cwd(), 'app');

      // Execute Docker command to render the video
      const dockerCommand = `docker run --rm \
          -v "${remotionPath}:/app/remotion" \
          -v "${publicPath}:/app/public" \
          -v "${appPath}:/app/app" \
          -v "${tempDir}:/app/tmp" \
          -v "${outputDir}:/app/data" \
          -e INPUT_PROPS_PATH=/app/tmp/videoData.json \
          -e OUTPUT_PATH=/app/data/output.mp4 \
          -e NODE_ENV=production \
          think-sage-video-renderer`;

      console.log('Executing Docker command:', dockerCommand);

      return new Promise((resolve, reject) => {
        exec(dockerCommand, async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            console.error(`stderr: ${stderr}`);
            return reject(error);
          }

          if (stderr) console.error(`stderr: ${stderr}`);
          console.log(`stdout: ${stdout}`);

          const outputPath = path.join(outputDir, 'output.mp4');
          if (!fs.existsSync(outputPath)) {
            return reject(new Error('Video file not found after rendering'));
          }

          // Upload to Cloudinary
          try {
            cloudinary.config({
              cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            const uploadResult = await cloudinary.uploader.upload(outputPath, {
              resource_type: 'video',
              folder: 'generated_videos',
              public_id: `${recordId}-${Date.now()}`,
            });

            console.log('Upload successful:', uploadResult.secure_url);
            resolve(uploadResult.secure_url);
          } catch (uploadErr) {
            console.error('Upload to Cloudinary failed:', uploadErr);
            reject(uploadErr);
          }
        });
      });
    });

    await step.run('UpdateDownloadUrl', async () => {
      const result = await convex.mutation(api.videoData.UpdateCompletedvideo, {
        recordId: recordId,
        downloadUrl: RenderVideo,
        status: 'completed',
      });
      return result;
    });

    return RenderVideo;
  }
);

export const UploadMusic = inngest.createFunction(
  { id: 'upload-music' },
  { event: 'upload-music' },
  async ({ event, step }) => {
    if (!event?.data) {
      throw new Error('Event data is required');
    }
    const { recordId, downloadUrl } = event.data;
    console.log('Processing music upload:', { recordId, downloadUrl });
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Update video data with music URL
    await step.run('updateDB', async () => {
      try {
        console.log('Updating database with music URL:', downloadUrl);
        const result = await convex.mutation(api.videoData.UpdateBackgroundMusic, {
          recordId: recordId,
          backgroundMusic: {
            url: downloadUrl,
            volume: 50 // Default volume
          }
        });
        console.log('Database update result:', result);
        return result;
      } catch (error) {
        console.error('Error updating database:', error);
        throw new Error(`Failed to update database: ${error.message}`);
      }
    });
  }
);
