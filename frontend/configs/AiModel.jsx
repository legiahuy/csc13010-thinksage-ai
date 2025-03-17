const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  

    export const generateScript = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [
                    {text: "write a two different script for 30 seconds video on Topic:Kids Story,\n\nDo not add Scene description\nDo notAdd Anything in Braces, just return the plain story in text\nGive me response in JSON format and follow the schema\n-{\nscripts:[\n{\ncontent:\"\n},\n],\n}\n"},
                ],
            },
            {
                role: "model",
                parts: [
                    {text: "```json\n{\n  \"scripts\": [\n    {\n      \"content\": \"Once upon a time, lived a tiny turtle named Timmy. Timmy was sad because he was so slow. One day, a big race was announced! All the animals laughed when Timmy signed up. But Timmy practiced every day, one slow step at a time. On race day, the speedy rabbit zoomed ahead, then took a nap! Timmy kept going, slow and steady. He passed the sleeping rabbit and crossed the finish line! Timmy the slow turtle won the race! The moral is, slow and steady wins the race.\"\n    },\n    {\n      \"content\": \"Once there was a little star named Twinkle, who felt she wasn't bright enough. All the other stars shone so brilliantly. Twinkle wished she could sparkle like them. One night, a little girl looked up and cried, 'I can't see any stars!' Then she noticed Twinkle. 'Oh, look! A tiny star! It's guiding me home!' Twinkle shone as bright as she could. Twinkle realized that even small light can make a big difference.\"\n    }\n  ]\n}\n```"},
                ],
            },
        ],
    });

     export const GenerateImageScript = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {text: "const ImagePromptScript = `Generate Image prompt of {style} style with all details for each scene for a 30 second video: script: {script}\n- Do not give camera angles image prompt\n- Follow the schema and return JSON data (4-5 images max)\n- [\n    {\n        imagePrompt: '',\n        sceneContent: '<Script content>'\n    }\n]`;\n"},
            ],
          },
          {
            role: "model",
            parts: [
              {text: "Okay, I understand. I will generate a JSON output containing image prompts based on your provided script and style, following your specifications.\n\nHere's the structure I will use for the JSON output:\n\n```json\n[\n    {\n        \"imagePrompt\": \"Detailed image prompt describing the visual elements of the scene in {style} style, focusing on subject, setting, lighting, colors, and mood.\",\n        \"sceneContent\": \"<Corresponding script content for this scene>\"\n    },\n    {\n        \"imagePrompt\": \"Detailed image prompt describing the visual elements of the scene in {style} style, focusing on subject, setting, lighting, colors, and mood.\",\n        \"sceneContent\": \"<Corresponding script content for this scene>\"\n    },\n    {\n        \"imagePrompt\": \"Detailed image prompt describing the visual elements of the scene in {style} style, focusing on subject, setting, lighting, colors, and mood.\",\n        \"sceneContent\": \"<Corresponding script content for this scene>\"\n    },\n    {\n        \"imagePrompt\": \"Detailed image prompt describing the visual elements of the scene in {style} style, focusing on subject, setting, lighting, colors, and mood.\",\n        \"sceneContent\": \"<Corresponding script content for this scene>\"\n    }\n]\n```\n\n**Important:** I need you to provide the following:\n\n1.  **`{style}`:**  The artistic style you want the image prompts to be based on (e.g., \"photorealistic\", \"impressionist painting\", \"anime\", \"cyberpunk\", \"cartoon\", \"pixel art\", \"watercolor illustration\", etc.).\n2.  **`{script}`:**  The script for the 30-second video.  Please provide the full script so I can break it down into scenes and generate appropriate image prompts.\n\nOnce you provide the style and script, I'll generate the JSON output with the image prompts and corresponding scene content.  I will ensure the image prompts don't include camera angles.\n"},
            ],
          },
          {
            role: "user",
            parts: [
              {text: "Realistic\n\nDuring World War II, Navajo code talkers played a crucial role. These brave Marines used their native language to transmit secret messages. The Navajo code was unbreakable, baffling the enemy. Their contributions were vital to the Allied victory. The Navajo code talkers were true heroes, their story a testament to ingenuity and dedication. They helped change the course of history.  "},
            ],
          },
          {
            role: "model",
            parts: [
              {text: "```json\n[\n    {\n        \"imagePrompt\": \"Photorealistic scene depicting a group of Navajo Marines in World War II uniforms standing in a dimly lit communications tent.  Radios and maps are scattered around.  Focus is on their determined faces as they listen intently to the radio.  Warm, muted color palette with hints of tension in the air. Authentic WWII era details.\",\n        \"sceneContent\": \"During World War II, Navajo code talkers played a crucial role.\"\n    },\n    {\n        \"imagePrompt\": \"Realistic depiction of a Navajo Marine speaking rapidly into a vintage radio handset, transmitting a message.  Sweat is on his brow.  He is surrounded by other Marines working with maps and communication equipment. Focus on the focused expression on his face.  Background shows a slightly blurred image of a war-torn landscape. Dark green and brown color tones dominate the scene.\",\n        \"sceneContent\": \"These brave Marines used their native language to transmit secret messages.\"\n    },\n    {\n        \"imagePrompt\": \"Photorealistic depiction of Japanese soldiers in a command center, frustrated and bewildered, surrounded by papers filled with seemingly gibberish code. The room is cluttered with maps and communication devices. One officer slams his fist on the table in anger. Cold, harsh lighting creates a sense of desperation. Grays, blacks, and browns are the primary colors.\",\n        \"sceneContent\": \"The Navajo code was unbreakable, baffling the enemy.\"\n    },\n    {\n        \"imagePrompt\": \"A wide shot showing a group of Navajo code talkers in a field, silhouetted against a vibrant sunrise. They are looking towards the rising sun with a sense of hope and accomplishment. The sky is a mix of orange, red, and gold.  Focus is on their strong, proud silhouettes. The landscape is rugged and war-torn but showing signs of regrowth.\",\n        \"sceneContent\": \"Their contributions were vital to the Allied victory. The Navajo code talkers were true heroes, their story a testament to ingenuity and dedication. They helped change the course of history.\"\n    }\n]\n```\n"},
            ],
          },
        ],
      });
    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());