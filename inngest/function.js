import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

const BASE_URL='https://aigurulab.tech';
export const GenerateVideoData = inngest.createFunction(
  { id: "generate-video-data" },
  { event: "generate-video-data" },
  async ({ event, step }) => {
    
    const {script, topic, voice, videoStyle, caption, title} = event?.data;
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

    //generate image prompt

    //generate image

    //Save all to db
    return GenerateAudioFile
    }
);

