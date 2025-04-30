import { inngest } from "./client";
import axios from 'axios';
import { GenerateImageScript } from "../configs/AiModel";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import {getServices, renderMediaOnCloudrun} from '@remotion/cloudrun/client';
import { createClient } from "@deepgram/sdk";


const BASE_URL='https://aigurulab.tech';
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
  { id: "preview-images" },
  { event: "preview-images" },
  async ({ event, step }) => {
    const {script, videoStyle, recordId} = event?.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    const GenerateImagePrompt = await step.run(
      "generateImagePrompt",
      async()=>{
        const FINAL_SCRIPT = ImagePromptScript.replace('{style}', videoStyle).replace('{script}', script);
        const result = await GenerateImageScript.sendMessage(FINAL_SCRIPT)
        const resp= JSON.parse(result.response.text());
        return resp;
      }
    )
    //generate image
    const GenerateImages = await step.run(
      "generateImages",
      async()=>{
        let images = [];
        images = await Promise.all(
          GenerateImagePrompt.map(async(element)=>{
            const result = await axios.post(BASE_URL+'/api/generate-image',
              {
                  width: 1024,
                  height: 1024,
                  input: element?.imagePrompt,
                  model: 'sdxl',//'flux'
                  aspectRatio:"1:1"//Applicable to Flux model only
              },
              {
                  headers: {
                      'x-api-key': process.env.NEXT_PUBLIC_AIGURULAB_API_KEY, // Your API Key
                      'Content-Type': 'application/json', // Content Type
                  },
              })
            console.log(result.data.image) //Output Result: Base 64 Image
              return result.data.image;
          })
        )
        return images;
      }
    )
    //Save all to db
    const UpdateDB = await step.run(
      "updateDB",
      async()=> {
        const result = await convex.mutation(api.videoData.UpdateImages, {
          recordId: recordId,
          images: GenerateImages,
        });
        return result;
      }
    )
    }
);

export const GenAudio = inngest.createFunction(
  {id: "preview-audio"},
  {event: "preview-audio"},
  async ({ event, step }) => {
    const {script, voice, recordId} = event?.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    //generate audio
    const GenerateAudioFile = await step.run(
      "generateAudioFile",
      async()=>{
          const result = await axios.post(BASE_URL+'/api/text-to-speech',
              {
                  input: script,
                  voice: voice
              },
              {
                  headers: {
                      'x-api-key': process.env.NEXT_PUBLIC_AIGURULAB_API_KEY, // Your API Key
                      'Content-Type': 'application/json', // Content Type
                  },
              })
           console.log(result.data.audio) //Output Result: Audio Mp3 Url
          return result.data.audio;
      }
  )
  //generate captions
  const GenerateCaptions = await step.run(
    "generateCaptions",
    async()=>{
      const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

      const { result} = await deepgram.listen.prerecorded.transcribeUrl(
        {
          url: GenerateAudioFile,
        },
        // STEP 3: Configure Deepgram options for audio analysis
        {
          model: "nova-3",
        }
        
      );
      //return full result here
      return result.results?.channels[0]?.alternatives[0]?.words;
    }
  )
  //save to db
  const UpdateDB = await step.run(
    "updateDB",
    async()=> {
      const result = await convex.mutation(api.videoData.UpdateCaptionsAndAudio, {
        recordId: recordId,
        audioUrl: GenerateAudioFile,
        captionJson: GenerateCaptions,
      });
      return result;
    }
  )
  }
)

export const GenVideo = inngest.createFunction(
  { id: "generate-video" },
  { event: "generate-video" },
  async ({ event, step }) => {
    const { captionJson, audioUrl, images, recordId } = event?.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    const RenderVideo = await step.run(
      "renderVideo",
      async () => {
        // Create a temporary directory for the video data
        const tempDir = `/tmp/video-${Date.now()}`;
        const fs = require('fs');
        const { exec } = require('child_process');
        const path = require('path');

        // Create the directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Prepare the video data
        const videoData = {
          videoData: {
            audioUrl,
            captionJson,
            images
          }
        };

        // Base64 encode the video data to pass through environment variable
        const videoDataBase64 = Buffer.from(JSON.stringify(videoData)).toString('base64');

        // Get absolute paths for mounting
        const remotionPath = path.resolve(process.cwd(), 'remotion');
        const publicPath = path.resolve(process.cwd(), 'public');

        // Execute Docker command to render the video
        const dockerCommand = `docker run --rm \
          -v ${remotionPath}:/app/remotion \
          -v ${publicPath}:/app/public \
          -e VIDEO_DATA_BASE64="${videoDataBase64}" \
          -e OUTPUT_PATH=/app/data/output.mp4 \
          -e NODE_ENV=production \
          think-sage-video-renderer`;

        console.log('Executing Docker command:', dockerCommand);

        return new Promise((resolve, reject) => {
          exec(dockerCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error: ${error.message}`);
              reject(error);
              return;
            }
            if (stderr) {
              console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);

            // The output file will be in the container's /app/data directory
            // We need to copy it out using docker cp
            const containerId = stdout.match(/Container ID: ([a-f0-9]+)/)?.[1];
            if (containerId) {
              const outputPath = path.join(tempDir, 'output.mp4');
              exec(`docker cp ${containerId}:/app/data/output.mp4 ${outputPath}`, (cpError) => {
                if (cpError) {
                  reject(cpError);
                  return;
                }
                if (fs.existsSync(outputPath)) {
                  resolve(outputPath);
                } else {
                  reject(new Error('Video file not found after rendering'));
                }
              });
            } else {
              reject(new Error('Could not get container ID from output'));
            }
          });
        });
      }
    );
    
    const UpdateDownloadUrl = await step.run(
      'UpdateDownloadUrl',
      async () => {
        const result = await convex.mutation(api.videoData.UpdateVideoRecord, {
          recordId: recordId,
          audioUrl: audioUrl,
          images: images,
          captionJson: captionJson,
          downloadUrl: RenderVideo
        });
        return result;
      }
    );
    return RenderVideo;
  }
);