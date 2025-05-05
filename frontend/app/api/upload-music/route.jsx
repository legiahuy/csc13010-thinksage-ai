import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    console.log('Received upload request');
    const formData = await request.formData();
    const file = formData.get('file');
    const recordId = formData.get('recordId');

    console.log('Upload request details:', {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      recordId
    });

    if (!file) {
      console.error('Missing file');
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'background_music',
          public_id: recordId ? `${recordId}-${Date.now()}` : `music-${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    console.log('Cloudinary upload successful:', result.secure_url);

    // If we have a recordId, update Convex immediately
    if (recordId) {
      const { ConvexHttpClient } = await import('convex/browser');
      const { api } = await import('@/convex/_generated/api');
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
      console.log('Attempting to update Convex backgroundMusic for recordId:', recordId);
      const resultConvex = await convex.mutation(api.videoData.UpdateBackgroundMusic, {
        recordId,
        backgroundMusic: {
          url: result.secure_url,
          volume: 50 // Default volume, adjust as needed
        }
      });
      console.log('Convex update result:', resultConvex);
      if (!resultConvex) {
        console.warn('Convex update returned null/undefined. The recordId may not exist:', recordId);
      }
    }

    // Return the Cloudinary URL immediately
    return NextResponse.json({ result: result.secure_url });

  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error.message || 'Failed to upload music' },
      { status: 500 }
    );
  }
} 