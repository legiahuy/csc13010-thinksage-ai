import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { execFile } from 'child_process';
import path from 'path';
import axios from 'axios';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    console.log('UPLOAD-VOICE FIELDS:', fields);
    console.log('UPLOAD-VOICE FILES:', files);
    if (err) {
      res.status(500).json({ error: 'Form parse error' });
      return;
    }
    const recordId = Array.isArray(fields.recordId) ? fields.recordId[0] : fields.recordId;
    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if (!file) {
      res.status(400).json({ error: 'Audio file is required' });
      return;
    }
    const filePath = file.filepath || file.path;
    if (!filePath) {
      res.status(400).json({ error: 'File path not found' });
      return;
    }

    // Prepare temp output paths
    const baseName = path.basename(filePath);
    const wavPath = path.join(path.dirname(filePath), baseName + '.wav');
    const mp3Path = path.join(path.dirname(filePath), baseName + '.mp3');

    try {
      // Convert to WAV (16kHz, mono)
      await new Promise((resolve, reject) => {
        execFile('ffmpeg', ['-y', '-i', filePath, '-ar', '16000', '-ac', '1', wavPath], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      // Convert to MP3
      await new Promise((resolve, reject) => {
        execFile('ffmpeg', ['-y', '-i', filePath, mp3Path], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

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

      // Update Convex with the wavUrl as audioUrl
      if (recordId && wavResult.secure_url) {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/update-audio-url`,
            {
              recordId,
              audioUrl: wavResult.secure_url,
            }
          );
        } catch (convexError) {
          console.error('Failed to update Convex with audioUrl:', convexError);
          // Optionally handle error (but don't block the main upload)
        }
      }

      // Clean up temp files
      [filePath, wavPath, mp3Path].forEach((p) => {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });

      res.status(200).json({
        wavUrl: wavResult.secure_url,
        mp3Url: mp3Result.secure_url,
      });
      return;
    } catch (error) {
      // Clean up temp files on error
      [filePath, wavPath, mp3Path].forEach((p) => {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
      res.status(500).json({ error: error.message });
      return;
    }
  });
} 