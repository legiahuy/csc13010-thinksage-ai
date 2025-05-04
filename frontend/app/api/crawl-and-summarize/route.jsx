import { NextResponse } from 'next/server';
import axios from 'axios';
import { generateScript } from '@/configs/AiModel';

const SUMMARY_PROMPT = `
Summarize the following content into a short, engaging, and informative script suitable for a 1-min to 1-min-30-second video.
Audience: {audience}
Purpose: {purpose}
Content:
{content}

Instructions:
- Use a conversational and clear tone.
- Highlight at least 3 key concepts from the content.
- Maintain important details without overloading technical jargon.
- Make it flow like a natural short explainer, with a hook, explanation, and closing remark.
- Keep it concise — around 80 to 100 words maximum.
- Output the result in this format:

Return a JSON like this:
{
  "script": "your summarized video script here"
}
`;

export async function POST(req) {
  const body = await req.json();
  const { topic, audience, purpose } = body;
  console.log('Received request with:', { topic, audience, purpose });

  try {
    // Call FastAPI to crawl
    console.log('Calling FastAPI to crawl data for:', topic);
    const crawlRes = await axios.post('http://localhost:8000/crawl', { topic });
    console.log('FastAPI response:', crawlRes.data);

    const content = crawlRes.data?.relevant_content;
    const sources = crawlRes.data?.sources || [];

    if (!content) {
      console.error('No content returned from FastAPI');
      return NextResponse.json({ error: 'No content found' }, { status: 404 });
    }

    console.log('Creating prompt with content length:', content.length);
    // Create prompt for Gemini
    const prompt = SUMMARY_PROMPT.replace('{audience}', audience)
      .replace('{purpose}', purpose)
      .replace('{content}', content);

    console.log('Calling Gemini API');
    // Call Gemini API using the new generateScript function
    const result = await generateScript(prompt, 'gemini');
    console.log('Gemini response:', result);

    // Parse the cleaned response
    const scriptData = JSON.parse(result);

    return NextResponse.json({
      script: scriptData?.script || '',
      sources: sources
        .map((s) => {
          // Extract URL from each source with different formats
          if (s.url) return s.url;
          if (s.related_pages?.length) return s.related_pages.map((p) => p.url);
          if (s.articles?.length) return s.articles.map((a) => a.url);
          return null;
        })
        .flat()
        .filter(Boolean), // remove null values
    });
  } catch (error) {
    console.error('Error in crawl-and-summarize:', error);
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
  }
}
