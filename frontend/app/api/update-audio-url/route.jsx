import { NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received request body:', body);

    const { recordId, audioUrl, captionJson } = body;
    
    if (!recordId || !audioUrl || !captionJson) {
      console.error('Missing required fields:', { recordId, audioUrl, captionJson });
      return NextResponse.json(
        { error: 'Missing required fields: recordId or audioUrl or captionJson' }, 
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.error('Missing NEXT_PUBLIC_CONVEX_URL environment variable');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    console.log('Updating Convex with:', {
      recordId,
      audioUrl,
      captionJson
    });

    // Update both audio URL and captions
    const result = await convex.mutation(api.videoData.UpdateCaptionsAndAudio, {
      recordId,
      audioUrl,
      captionJson
    });

    console.log('Convex update result:', result);

    return NextResponse.json({ 
      success: true,
      message: 'Audio and captions updated successfully',
      result
    });
  } catch (error) {
    console.error('Error updating audio and captions:', {
      message: error.message,
      stack: error.stack,
      data: error.data
    });

    return NextResponse.json(
      { 
        error: error.message || 'Failed to update audio and captions',
        details: error.data || null
      }, 
      { status: 500 }
    );
  }
} 