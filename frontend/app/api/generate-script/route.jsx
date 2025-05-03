import { NextResponse } from 'next/server';
import { generateScript } from '@/configs/AiModel';

const SCRIPT_PROMPT = `write a two different script for 30 seconds video on Topic: {topic} for Audience: {audience} with Purpose: {purpose},
Do not add Scene description
Do not Add Anything in Braces, just return the plain story in text
Give me response in JSON format and follow the schema
-{
scripts:[
{
content:''
},
],
}`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, audience, purpose, aiService = 'gemini' } = body;

    const prompt = SCRIPT_PROMPT.replace('{topic}', topic)
      .replace('{audience}', audience)
      .replace('{purpose}', purpose);

    let result;
    try {
      console.log(prompt);
      result = await generateScript(prompt, aiService);
      console.log(result);
    } catch (error) {
      console.error(`Error generating script with ${aiService}:`, error);
      return NextResponse.json(
        { error: `Error generating script with ${aiService}: ${error.message}` },
        { status: 500 }
      );
    }

    // Handle different response types based on AI service
    if (aiService === 'gemini' || aiService === 'deepseek') {
      // For Gemini, we need to parse the JSON string
      return NextResponse.json(JSON.parse(result));
    } else {
      // For GPT, the result is already parsed
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error in generate-script route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
