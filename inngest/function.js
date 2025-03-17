import { inngest } from "./client";
import axios from 'axios';
import { GenerateImageScript } from "../frontend/configs/AiModel";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";



export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

const { createClient } = require("@deepgram/sdk");
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

export const GenerateVideoData = inngest.createFunction(
  { id: "generate-video-data" },
  { event: "generate-video-data" },
  async ({ event, step }) => {
    
    const {script, topic, voice, videoStyle, caption, title, recordId} = event?.data;
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

        const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
          {
            url: GenerateAudioFile,
          },
          // STEP 3: Configure Deepgram options for audio analysis
          {
            model: "nova-3",
          }
          
        );
        return result.results?.channels[0]?.alternatives[0]?.words;
      }
    )
    //generate image prompt
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
      async()=>{
        const result = await convex.mutation(api.videoData.UpdateVideoRecord,{
          recordId: recordId,
          audioUrl: GenerateAudioFile,
          images: GenerateImages,
          captionJson: GenerateCaptions
        })
        return result;
      }
    )

    return UpdateDB
    }
);

