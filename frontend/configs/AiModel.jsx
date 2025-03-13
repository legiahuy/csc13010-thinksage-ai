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
  
    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());