const {
  GoogleGenerativeAI,
  // Removed unused imports
} = require('@google/generative-ai');
const axios = require('axios');
const qs = require('querystring');
const OpenAI = require('openai');
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Base configuration for all models
const baseConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

// Model-specific configurations
const modelConfigs = {
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    model: 'gemini-2.0-flash',
    config: {
      ...baseConfig,
      responseMimeType: 'application/json',
    },
    client: null, // Will be initialized when needed
    getClient: function () {
      if (!this.client) {
        const genAI = new GoogleGenerativeAI(this.apiKey);
        this.client = genAI.getGenerativeModel({
          model: this.model,
        });
      }
      return this.client;
    },
    generate: async function (prompt) {
      const chat = this.getClient().startChat({
        generationConfig: this.config,
        history: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });
      return await chat.sendMessage(prompt);
    },
  },
  gpt: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'efbfa3b04b960f1332bfbd3cb62ae243',
    model: 'gpt-3.5-turbo',
    config: {
      ...baseConfig,
    },
    generate: async function (prompt) {
      const apiUrl = `http://195.179.229.119/gpt/api.php?${qs.stringify({
        prompt: prompt,
        api_key: this.apiKey,
        model: this.model,
      })}`;

      try {
        const response = await axios.get(apiUrl);
        // Extract the content from the response and parse it
        const content = response.data.content;
        return { choices: [{ message: { content } }] };
      } catch (error) {
        console.error('GPT API Error:', error.message);
        throw new Error(`Failed to generate response: ${error.message}`);
      }
    },
  },
  deepseek: {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    model: 'deepseek/deepseek-chat-v3-0324:free',
    config: {
      ...baseConfig,
    },
    client: null,
    getClient: function () {
      if (!this.client) {
        this.client = new OpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: this.apiKey,
          defaultHeaders: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'ThinkSage AI',
          },
        });
      }
      return this.client;
    },
    generate: async function (prompt) {
      const client = this.getClient();
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates video scripts. Always respond in valid JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: this.config.temperature,
        top_p: this.config.topP,
        max_tokens: this.config.maxOutputTokens,
      });
      return completion;
    },
  },
};

// Helper function to get model configuration
export const getModelConfig = (modelName) => {
  const config = modelConfigs[modelName];
  if (!config) {
    throw new Error(`Model ${modelName} not found`);
  }
  return config;
};

// Main function to generate script using any model
export const generateScript = async (prompt, modelName = 'gemini') => {
  const model = getModelConfig(modelName);
  const response = await model.generate(prompt);

  let result;

  // Handle different response formats based on model
  switch (modelName) {
    case 'gemini': {
      // For Gemini, we need to clean up the response text
      const resp = response.response.text();
      // Clean up the response by removing markdown code block syntax
      result = resp.replace(/```json\n|\n```/g, '').trim();
      break;
    }
    case 'gpt': {
      // For GPT, we need to parse the content as it's a JSON string
      const content = response.choices[0].message.content;
      try {
        result = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing GPT response:', error);
        throw new Error('Invalid JSON response from GPT');
      }
      break;
    }
    case 'deepseek': {
      // For DeepSeek, we need to parse the content as it's a JSON string
      const deepseekContent = response.choices[0].message.content;
      result = deepseekContent.replace(/```json\n|\n```/g, '').trim();
      break;
    }
    default:
      throw new Error(`Unsupported model: ${modelName}`);
  }

  return result;
};

// Image generation specific configuration
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

export const GenerateImageScript = model.startChat({
  generationConfig,
  history: [
    {
      role: 'user',
      parts: [
        {
          text: "const ImagePromptScript = `Generate Image prompt of {style} style with all details for each scene for a 30 second video: script: {script}\n- Do not give camera angles image prompt\n- Follow the schema and return JSON data (4-5 images max)\n- [\n    {\n        imagePrompt: '',\n        sceneContent: '<Script content>'\n    }\n]`;\n",
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: 'Okay, I understand. I will generate a JSON output containing image prompts based on your provided script and style, following your specifications.\n\nHere\'s the structure I will use for the JSON output:\n\n```json\n[\n    {\n        "imagePrompt": "Detailed image prompt describing the visual elements of the scene in {style} style, focusing on subject, setting, lighting, colors, and mood.",\n        "sceneContent": "<Corresponding script content for this scene>"\n    },\n    {\n        "imagePrompt": "Detailed image prompt describing the visual elements of the scene in {style} style, focusing on subject, setting, lighting, colors, and mood.",\n        "sceneContent": "<Corresponding script content for this scene>"\n    },\n    {\n        "imagePrompt": "Detailed image prompt describing the visual elements of the scene in {style} style, focusing on subject, setting, lighting, colors, and mood.",\n        "sceneContent": "<Corresponding script content for this scene>"\n    },\n    {\n        "imagePrompt": "Detailed image prompt describing the visual elements of the scene in {style} style, focusing on subject, setting, lighting, colors, and mood.",\n        "sceneContent": "<Corresponding script content for this scene>"\n    }\n]\n```\n\n**Important:** I need you to provide the following:\n\n1.  **`{style}`:**  The artistic style you want the image prompts to be based on (e.g., "photorealistic", "impressionist painting", "anime", "cyberpunk", "cartoon", "pixel art", "watercolor illustration", etc.).\n2.  **`{script}`:**  The script for the 30-second video.  Please provide the full script so I can break it down into scenes and generate appropriate image prompts.\n\nOnce you provide the style and script, I\'ll generate the JSON output with the image prompts and corresponding scene content.  I will ensure the image prompts don\'t include camera angles.\n',
        },
      ],
    },
    {
      role: 'user',
      parts: [
        {
          text: 'Realistic\n\nDuring World War II, Navajo code talkers played a crucial role. These brave Marines used their native language to transmit secret messages. The Navajo code was unbreakable, baffling the enemy. Their contributions were vital to the Allied victory. The Navajo code talkers were true heroes, their story a testament to ingenuity and dedication. They helped change the course of history.  ',
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text: '```json\n[\n    {\n        "imagePrompt": "Photorealistic scene depicting a group of Navajo Marines in World War II uniforms standing in a dimly lit communications tent.  Radios and maps are scattered around.  Focus is on their determined faces as they listen intently to the radio.  Warm, muted color palette with hints of tension in the air. Authentic WWII era details.",\n        "sceneContent": "During World War II, Navajo code talkers played a crucial role."\n    },\n    {\n        "imagePrompt": "Realistic depiction of a Navajo Marine speaking rapidly into a vintage radio handset, transmitting a message.  Sweat is on his brow.  He is surrounded by other Marines working with maps and communication equipment. Focus on the focused expression on his face.  Background shows a slightly blurred image of a war-torn landscape. Dark green and brown color tones dominate the scene.",\n        "sceneContent": "These brave Marines used their native language to transmit secret messages."\n    },\n    {\n        "imagePrompt": "Photorealistic depiction of Japanese soldiers in a command center, frustrated and bewildered, surrounded by papers filled with seemingly gibberish code. The room is cluttered with maps and communication devices. One officer slams his fist on the table in anger. Cold, harsh lighting creates a sense of desperation. Grays, blacks, and browns are the primary colors.",\n        "sceneContent": "The Navajo code was unbreakable, baffling the enemy."\n    },\n    {\n        "imagePrompt": "A wide shot showing a group of Navajo code talkers in a field, silhouetted against a vibrant sunrise. They are looking towards the rising sun with a sense of hope and accomplishment. The sky is a mix of orange, red, and gold.  Focus is on their strong, proud silhouettes. The landscape is rugged and war-torn but showing signs of regrowth.",\n        "sceneContent": "Their contributions were vital to the Allied victory. The Navajo code talkers were true heroes, their story a testament to ingenuity and dedication. They helped change the course of history."\n    }\n]\n```\n',
        },
      ],
    },
  ],
});

// Export configurations for reference
export const aiConfigs = modelConfigs;
