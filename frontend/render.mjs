import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {createRequire} from 'node:module';
import fs from 'fs';
import path from 'path';
 
const require = createRequire(import.meta.url);

// Get input props from environment variable
const videoDataBase64 = process.env.VIDEO_DATA_BASE64;
const outputPath = process.env.OUTPUT_PATH || './data/output.mp4';

// Debug information
console.log('Current working directory:', process.cwd());
console.log('Environment variables:');
console.log('OUTPUT_PATH:', outputPath);
console.log('VIDEO_DATA_BASE64 present:', !!videoDataBase64);

if (!videoDataBase64) {
  throw new Error('VIDEO_DATA_BASE64 environment variable is required');
}

// Decode the video data
const inputProps = JSON.parse(Buffer.from(videoDataBase64, 'base64').toString('utf8'));
console.log('Input props loaded successfully:', JSON.stringify(inputProps, null, 2));

// Ensure the output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  console.log(`Creating output directory: ${outputDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
}

// Verify directory permissions
console.log('Checking directory permissions...');
const dirStats = fs.statSync(outputDir);
console.log(`Output directory permissions: ${dirStats.mode.toString(8)}`);

console.log('Starting to bundle...');
const bundled = await bundle({
  entryPoint: require.resolve('./remotion/index.js'),
  webpackOverride: (config) => config,
});
console.log('Bundle completed');

console.log('Selecting composition...');
const composition = await selectComposition({
  serveUrl: bundled,
  id: 'Composition',
  inputProps,
});
console.log('Composition selected:', composition.id);
 
console.log('Starting to render composition...');
try {
  await renderMedia({
    codec: 'h264',
    composition,
    serveUrl: bundled,
    outputLocation: outputPath,
    chromiumOptions: {
      enableMultiProcessOnLinux: true,
    },
    inputProps,
    onProgress: ({ progress }) => {
      console.log(`Rendering progress: ${Math.round(progress * 100)}%`);
    },
  });
  console.log(`Rendered composition ${composition.id} to ${outputPath}`);
} catch (error) {
  console.error('Error during rendering:', error);
  throw error;
}