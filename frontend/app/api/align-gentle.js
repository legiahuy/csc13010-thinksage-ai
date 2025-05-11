import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { execFile } from 'child_process';
import path from 'path';
import os from 'os';

console.log('!!! align-gentle route loaded at', new Date().toISOString());

export const config = {
  api: {
    bodyParser: false,
  },
};

function convertWebmToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    execFile('ffmpeg', ['-y', '-i', inputPath, '-ar', '16000', '-ac', '1', outputPath], (error) => {
      if (error) {
        console.error('ffmpeg error:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('align-gentle handler called');
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());

  // Parse multipart form
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {
      console.log('Entered formidable parse callback');
      if (err) {
        console.error('Form parse error:', err);
        console.log('Returning due to form parse error');
        return res.status(500).json({ error: 'Form parse error', details: err.message });
      }

      console.log('ALIGN-GENTLE FIELDS:', fields);
      console.log('ALIGN-GENTLE FILES:', files);
      console.log('files keys:', Object.keys(files));
      const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
      console.log('file:', file);
      const audioPath = file && (file.filepath || file.path);
      console.log('audioPath:', audioPath);
      
      if (!audioPath) {
        console.log('Returning due to missing audioPath');
        return res.status(400).json({ error: 'File path not found' });
      }

      // Ensure useraudio directory exists (always inside frontend)
      const userAudioDir = path.join(process.cwd(), 'frontend', 'useraudio');
      console.log('Resolved userAudioDir:', userAudioDir);
      if (!fs.existsSync(userAudioDir)) {
        console.log('userAudioDir does not exist, creating...');
        fs.mkdirSync(userAudioDir, { recursive: true });
        console.log('Created userAudioDir:', userAudioDir);
      } else {
        console.log('userAudioDir already exists.');
      }

      // Copy the uploaded file to useraudio with .webm extension
      const webmFileName = `${path.basename(audioPath)}.webm`;
      const webmFilePath = path.join(userAudioDir, webmFileName);
      console.log('About to copy file to:', webmFilePath);
      try {
        fs.copyFileSync(audioPath, webmFilePath);
        console.log('Copied file to:', webmFilePath);
      } catch (copyErr) {
        console.error('Failed to copy file to useraudio:', copyErr);
        return res.status(500).json({ error: 'Failed to copy file to useraudio', details: copyErr.message });
      }

      // Convert .webm to .wav using ffmpeg in useraudio folder
      const wavFileName = `${path.basename(audioPath)}.wav`;
      const wavPath = path.join(userAudioDir, wavFileName);
      console.log('About to convert to WAV:', wavPath);
      try {
        await convertWebmToWav(webmFilePath, wavPath);
        if (fs.existsSync(wavPath)) {
          const stats = fs.statSync(wavPath);
          console.log('WAV file created:', wavPath, 'Size:', stats.size, 'bytes');
        } else {
          console.error('WAV file not found after conversion:', wavPath);
        }
      } catch (error) {
        console.error('ffmpeg conversion error:', error);
        return res.status(500).json({ error: 'ffmpeg conversion error', details: error.message });
      }

      // Send to Gentle
      const gentleForm = new FormData();
      gentleForm.append('audio', fs.createReadStream(wavPath));
      gentleForm.append('transcript', script);

      try {
        console.log('Sending to Gentle server...');
        const gentleRes = await fetch('http://localhost:8765/transcribe', {
          method: 'POST',
          body: gentleForm,
          headers: gentleForm.getHeaders(),
        });
        console.log('Gentle response status:', gentleRes.status);
        console.log('Gentle response headers:', gentleRes.headers.raw());
        const responseText = await gentleRes.text();
        console.log('Gentle response body:', responseText);
        if (!gentleRes.ok) {
          console.error('Gentle server error:', responseText);
          return res.status(500).json({ error: 'Gentle server error', details: responseText });
        }
        const result = JSON.parse(responseText);
        console.log('Gentle response (parsed JSON):', result);

        // Extract segments (words with timings) and ensure valid numbers
        const segments = result.words
          .filter(w => w.case === 'success')
          .map(w => {
            const start = parseFloat(w.start);
            const end = parseFloat(w.end);
            if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
              return null;
            }
            return {
              word: w.word,
              start: start,
              end: end,
              duration: end - start,
            };
          })
          .filter(segment => segment !== null); // Remove any invalid segments

        // Clean up temporary files
        fs.unlinkSync(webmFilePath);
        fs.unlinkSync(wavPath);
        
        res.status(200).json({ segments });
      } catch (error) {
        console.error('Gentle fetch error:', error);
        if (fs.existsSync(webmFilePath)) fs.unlinkSync(webmFilePath);
        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
        return res.status(500).json({ error: error.message });
      }
    } catch (e) {
      console.error('Error in formidable callback:', e);
      return res.status(500).json({ error: 'Internal error', details: e.message });
    }
  });
} 