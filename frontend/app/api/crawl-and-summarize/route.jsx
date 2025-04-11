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
    // Gọi FastAPI để crawl
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
    // Tạo prompt cho Gemini
    const prompt = SUMMARY_PROMPT.replace('{audience}', audience)
      .replace('{purpose}', purpose)
      .replace('{content}', content);

    console.log('Calling Gemini API');
    // Gọi Gemini API
    const aiResponse = await generateScript.sendMessage(prompt);
    console.log('Gemini response:', aiResponse?.response?.text());
    const scriptData = JSON.parse(aiResponse?.response?.text() || '{}');
    //const scriptData = content;

    return NextResponse.json({
      script: scriptData?.script || '',
      sources: sources
        .map((s) => {
          // Trích url từ mỗi nguồn có định dạng khác nhau
          if (s.url) return s.url;
          if (s.related_pages?.length) return s.related_pages.map((p) => p.url);
          if (s.articles?.length) return s.articles.map((a) => a.url);
          return null;
        })
        .flat()
        .filter(Boolean), // loại bỏ null
    });
  } catch (error) {
    console.error('Error in crawl-and-summarize:', error);
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
  }
}
