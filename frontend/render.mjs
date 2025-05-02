import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {createRequire} from 'node:module';
import fs from 'fs';
import path from 'path';
 
const require = createRequire(import.meta.url);

// Get input props from environment variable OR from file
let inputProps;
const inputPropsPath = process.env.INPUT_PROPS_PATH || './tmp/videoData.json';
const outputPath = process.env.OUTPUT_PATH || './data/output.mp4';

// Debug information
console.log('Current working directory:', process.cwd());
console.log('Environment variables:');
console.log('OUTPUT_PATH:', outputPath);
console.log('INPUT_PROPS_PATH:', inputPropsPath);

// Try to load data from file first (new method)
if (fs.existsSync(inputPropsPath)) {
  console.log(`Loading video data from file: ${inputPropsPath}`);
  try {
    const rawData = fs.readFileSync(inputPropsPath, 'utf8');
    inputProps = JSON.parse(rawData);
    console.log('Input props loaded successfully from file');
  } catch (error) {
    console.error(`Error loading video data from file: ${error.message}`);
  }
} else {
  throw new Error('No video data found. Please provide INPUT_PROPS_PATH');
}

if (!inputProps) {
  throw new Error('Failed to load input props from any source');
}

console.log('Input props:', JSON.stringify(inputProps, null, 2));

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