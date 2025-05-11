import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { execFile } from 'child_process';
import path from 'path';
import axios from 'axios';
import { NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Common FFmpeg paths for Windows
const FFMPEG_PATHS = [
  'C:\\ffmpeg\\bin\\ffmpeg.exe',
  'C:\\ffmpeg\\ffmpeg.exe',
  'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
  'ffmpeg' // Fallback to PATH
];

// Check if ffmpeg is installed and get its path
const getFfmpegPath = async () => {
  for (const ffmpegPath of FFMPEG_PATHS) {
    try {
      await new Promise((resolve, reject) => {
        execFile(ffmpegPath, ['-version'], (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      console.log('Found FFmpeg at:', ffmpegPath);
      return ffmpegPath;
    } catch (error) {
      console.log('FFmpeg not found at:', ffmpegPath);
    }
  }
  throw new Error('FFmpeg not found. Please ensure it is installed and in your PATH.');
};

// Generate captions using Deepgram
const generateCaptions = async (audioUrl) => {
  try {
    console.log('Generating captions with Deepgram...');
    const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

    const { result } = await deepgram.listen.prerecorded.transcribeUrl(
      {
        url: audioUrl,
      },
      {
        model: 'nova-3',
      }
    );

    return result.results?.channels[0]?.alternatives[0]?.words;
  } catch (error) {
    console.error('Error generating captions:', error);
    throw error;
  }
};

export async function POST(request) {
  // Declare variables at the top level so they're accessible in catch block
  let filePath, wavPath, mp3Path;
  let ffmpegPath;

  try {
    // Get FFmpeg path
    ffmpegPath = await getFfmpegPath();
    console.log('Using FFmpeg from:', ffmpegPath);

    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const recordId = formData.get('recordId');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Create a temporary file
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    filePath = path.join(tempDir, `temp-${Date.now()}-${audioFile.name}`);
    const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    // Prepare temp output paths
    const baseName = path.basename(filePath);
    wavPath = path.join(path.dirname(filePath), baseName + '.wav');
    mp3Path = path.join(path.dirname(filePath), baseName + '.mp3');

    console.log('Converting to WAV...');
    // Convert to WAV (16kHz, mono)
    await new Promise((resolve, reject) => {
      execFile(ffmpegPath, ['-y', '-i', filePath, '-ar', '16000', '-ac', '1', wavPath], (err) => {
        if (err) {
          console.error('WAV conversion error:', err);
          reject(err);
        } else resolve();
      });
    });

    console.log('Converting to MP3...');
    // Convert to MP3
    await new Promise((resolve, reject) => {
      execFile(ffmpegPath, ['-y', '-i', filePath, mp3Path], (err) => {
        if (err) {
          console.error('MP3 conversion error:', err);
          reject(err);
        } else resolve();
      });
    });

    console.log('Uploading to Cloudinary...');
    // Upload WAV to Cloudinary
    const wavBuffer = fs.readFileSync(wavPath);
    const wavResult = await new Promise((resolveUpload, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'user_voice',
          public_id: recordId ? `${recordId}-${Date.now()}-wav` : `voice-${Date.now()}-wav`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolveUpload(result);
        }
      );
      uploadStream.end(wavBuffer);
    });

    // Upload MP3 to Cloudinary
    const mp3Buffer = fs.readFileSync(mp3Path);
    const mp3Result = await new Promise((resolveUpload, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'user_voice',
          public_id: recordId ? `${recordId}-${Date.now()}-mp3` : `voice-${Date.now()}-mp3`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolveUpload(result);
        }
      );
      uploadStream.end(mp3Buffer);
    });

    // Generate captions using Deepgram
    console.log('Generating captions...');
    const captions = await generateCaptions(wavResult.secure_url);
    console.log('Captions generated:', captions);

    // Update database with audio URL and captions
    if (recordId) {
      try {
        console.log('Updating database with:', {
          recordId,
          audioUrl: wavResult.secure_url,
          captionJson: captions
        });

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/update-audio-url`,
          {
            recordId,
            audioUrl: wavResult.secure_url,
            captionJson: captions
          }
        );

        console.log('Database update response:', response.data);
      } catch (convexError) {
        console.error('Failed to update database:', convexError.response?.data || convexError.message);
        // Don't throw the error, just log it and continue
      }
    }

    // Clean up temp files
    [filePath, wavPath, mp3Path].forEach((p) => {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    return NextResponse.json({
      wavUrl: wavResult.secure_url,
      mp3Url: mp3Result.secure_url,
      captions,
    });

  } catch (error) {
    // Clean up temp files on error
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (wavPath && fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
    if (mp3Path && fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);

    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process audio file' },
      { status: 500 }
    );
  }
} 