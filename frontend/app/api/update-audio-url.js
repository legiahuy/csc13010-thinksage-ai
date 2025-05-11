import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

export async function POST(req) {
  try {
    const { recordId, audioUrl } = await req.json();
    if (!recordId || !audioUrl) {
      return NextResponse.json({ error: 'Missing recordId or audioUrl' }, { status: 400 });
    }
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    await convex.mutation(api.videoData.UpdateCaptionsAndAudio, {
      recordId,
      audioUrl,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 