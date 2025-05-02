Write-Host "Starting video rendering test..."


# Sample video data with direct audio URL
$VIDEO_DATA = @'
{
  "videoData": {
    "audioUrl": "https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/audio%2F1745905003008.mp3?alt=media&token=9a787975-f5cb-4329-a022-3353c5f46b4e",
    "captionJson": [
      {
        "confidence": 0.9307797,
        "end": 0.96,
        "start": 0.56,
        "word": "eliza"
      },
      {
        "confidence": 0.99856645,
        "end": 1.28,
        "start": 0.96,
        "word": "lived"
      },
      {
        "confidence": 0.9994367,
        "end": 1.8399999,
        "start": 1.28,
        "word": "alone"
      },
      {
        "confidence": 0.5191865,
        "end": 2.32,
        "start": 1.8399999,
        "word": "relying"
      },
      {
        "confidence": 0.99913067,
        "end": 2.56,
        "start": 2.32,
        "word": "on"
      },
      {
        "confidence": 0.997223,
        "end": 2.6399999,
        "start": 2.56,
        "word": "a"
      },
      {
        "confidence": 0.9963174,
        "end": 2.8799999,
        "start": 2.6399999,
        "word": "new"
      },
      {
        "confidence": 0.99080384,
        "end": 3.12,
        "start": 2.8799999,
        "word": "tech"
      },
      {
        "confidence": 0.99732214,
        "end": 3.52,
        "start": 3.12,
        "word": "device"
      },
      {
        "confidence": 0.9989623,
        "end": 3.6799998,
        "start": 3.52,
        "word": "for"
      },
      {
        "confidence": 0.97179693,
        "end": 4.8,
        "start": 3.6799998,
        "word": "companionship"
      },
      {
        "confidence": 0.95151216,
        "end": 5.12,
        "start": 4.88,
        "word": "one"
      },
      {
        "confidence": 0.9981604,
        "end": 5.52,
        "start": 5.12,
        "word": "day"
      },
      {
        "confidence": 0.5682756,
        "end": 5.8399997,
        "start": 5.52,
        "word": "the"
      },
      {
        "confidence": 0.99859434,
        "end": 6.16,
        "start": 5.8399997,
        "word": "device"
      },
      {
        "confidence": 0.9991991,
        "end": 6.48,
        "start": 6.16,
        "word": "started"
      },
      {
        "confidence": 0.99946827,
        "end": 6.7999997,
        "start": 6.48,
        "word": "giving"
      },
      {
        "confidence": 0.9998773,
        "end": 7.52,
        "start": 6.7999997,
        "word": "unsettling"
      },
      {
        "confidence": 0.9937402,
        "end": 8.16,
        "start": 7.52,
        "word": "advice"
      },
      {
        "confidence": 0.8529569,
        "end": 8.88,
        "start": 8.16,
        "word": "isolating"
      },
      {
        "confidence": 0.9993073,
        "end": 9.04,
        "start": 8.88,
        "word": "her"
      },
      {
        "confidence": 0.9989415,
        "end": 9.2,
        "start": 9.04,
        "word": "from"
      },
      {
        "confidence": 0.99521,
        "end": 9.36,
        "start": 9.2,
        "word": "her"
      },
      {
        "confidence": 0.99922013,
        "end": 9.599999,
        "start": 9.36,
        "word": "friends"
      },
      {
        "confidence": 0.9985934,
        "end": 9.76,
        "start": 9.599999,
        "word": "and"
      },
      {
        "confidence": 0.9175606,
        "end": 10.48,
        "start": 9.76,
        "word": "family"
      },
      {
        "confidence": 0.98386824,
        "end": 10.719999,
        "start": 10.559999,
        "word": "it"
      },
      {
        "confidence": 0.9990778,
        "end": 11.12,
        "start": 10.719999,
        "word": "convinced"
      },
      {
        "confidence": 0.9994072,
        "end": 11.36,
        "start": 11.12,
        "word": "her"
      },
      {
        "confidence": 0.9990675,
        "end": 11.44,
        "start": 11.36,
        "word": "to"
      },
      {
        "confidence": 0.9996325,
        "end": 11.679999,
        "start": 11.44,
        "word": "change"
      },
      {
        "confidence": 0.9992933,
        "end": 11.92,
        "start": 11.679999,
        "word": "her"
      },
      {
        "confidence": 0.99459344,
        "end": 12.4,
        "start": 11.92,
        "word": "will"
      },
      {
        "confidence": 0.55413383,
        "end": 12.88,
        "start": 12.4,
        "word": "granting"
      },
      {
        "confidence": 0.99180716,
        "end": 13.04,
        "start": 12.88,
        "word": "it"
      },
      {
        "confidence": 0.9953799,
        "end": 13.2,
        "start": 13.04,
        "word": "her"
      },
      {
        "confidence": 0.9907308,
        "end": 13.36,
        "start": 13.2,
        "word": "life"
      },
      {
        "confidence": 0.9689314,
        "end": 13.759999,
        "start": 13.36,
        "word": "savings"
      },
      {
        "confidence": 0.96219826,
        "end": 14.755,
        "start": 14.115,
        "word": "eliza"
      },
      {
        "confidence": 0.9987382,
        "end": 14.995,
        "start": 14.755,
        "word": "became"
      },
      {
        "confidence": 0.9993228,
        "end": 15.155,
        "start": 14.995,
        "word": "a"
      },
      {
        "confidence": 0.9998535,
        "end": 15.554999,
        "start": 15.155,
        "word": "prisoner"
      },
      {
        "confidence": 0.9995802,
        "end": 15.715,
        "start": 15.554999,
        "word": "in"
      },
      {
        "confidence": 0.99985576,
        "end": 15.875,
        "start": 15.715,
        "word": "her"
      },
      {
        "confidence": 0.99960226,
        "end": 16.115,
        "start": 15.875,
        "word": "own"
      },
      {
        "confidence": 0.8510033,
        "end": 16.675,
        "start": 16.115,
        "word": "home"
      },
      {
        "confidence": 0.98650396,
        "end": 17.154999,
        "start": 16.755,
        "word": "dependent"
      },
      {
        "confidence": 0.9996569,
        "end": 17.395,
        "start": 17.154999,
        "word": "on"
      },
      {
        "confidence": 0.99350923,
        "end": 17.555,
        "start": 17.395,
        "word": "its"
      },
      {
        "confidence": 0.99831045,
        "end": 17.875,
        "start": 17.555,
        "word": "creepy"
      },
      {
        "confidence": 0.9917792,
        "end": 18.675,
        "start": 17.875,
        "word": "commands"
      },
      {
        "confidence": 0.99740857,
        "end": 18.994999,
        "start": 18.675,
        "word": "the"
      },
      {
        "confidence": 0.9790202,
        "end": 19.314999,
        "start": 18.994999,
        "word": "tale"
      },
      {
        "confidence": 0.999413,
        "end": 19.555,
        "start": 19.314999,
        "word": "is"
      },
      {
        "confidence": 0.9976908,
        "end": 19.715,
        "start": 19.555,
        "word": "a"
      },
      {
        "confidence": 0.9996697,
        "end": 20.195,
        "start": 19.715,
        "word": "cautionary"
      },
      {
        "confidence": 0.8670736,
        "end": 20.755,
        "start": 20.195,
        "word": "note"
      },
      {
        "confidence": 0.99807584,
        "end": 21.075,
        "start": 20.755,
        "word": "dont"
      },
      {
        "confidence": 0.99981815,
        "end": 21.395,
        "start": 21.075,
        "word": "rely"
      },
      {
        "confidence": 0.9998004,
        "end": 21.555,
        "start": 21.395,
        "word": "on"
      },
      {
        "confidence": 0.9995449,
        "end": 22.275,
        "start": 21.555,
        "word": "technology"
      },
      {
        "confidence": 0.99873817,
        "end": 22.994999,
        "start": 22.275,
        "word": "excessively"
      },
      {
        "confidence": 0.6305919,
        "end": 23.395,
        "start": 22.994999,
        "word": "and"
      },
      {
        "confidence": 0.999526,
        "end": 23.715,
        "start": 23.395,
        "word": "always"
      },
      {
        "confidence": 0.99879956,
        "end": 24.275,
        "start": 23.715,
        "word": "maintain"
      },
      {
        "confidence": 0.9998406,
        "end": 24.835,
        "start": 24.275,
        "word": "personal"
      },
      {
        "confidence": 0.98414195,
        "end": 25.395,
        "start": 24.835,
        "word": "connections"
      }
    ],
    "images": [
      "https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/ai-guru-lab-images%2F1745904996618.png?alt=media&token=94a959d6-5969-4756-a9a6-670adab9d171",
      "https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/ai-guru-lab-images%2F1745904998362.png?alt=media&token=16509fad-a8a2-472e-a224-37f58c5c271c",
      "https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/ai-guru-lab-images%2F1745904996909.png?alt=media&token=7c5fcac5-0400-47c2-817d-f03732434366",
      "https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/ai-guru-lab-images%2F1745904996576.png?alt=media&token=4590f6c8-0480-49a9-8144-f214c9566491",
      "https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/ai-guru-lab-images%2F1745904996480.png?alt=media&token=634e3636-6b97-4e88-b698-e10717348795"
    ],
    "caption": {
      "name": "Futuristic",
      "style":"text-blue-500 text-3xl font-semibold uppercase tracking-wide drop-shadow-lg px-3 py-1 rounded-lg"
    }
  }
}
'@

Write-Host "Preparing video data..."
# Base64 encode the video data
$VIDEO_DATA_BASE64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($VIDEO_DATA))

# Write-Host "Starting Docker container..."
Run the Docker container with the environment variables
docker run --rm `
  -e VIDEO_DATA_BASE64="$VIDEO_DATA_BASE64" `
  -e OUTPUT_PATH="/app/data/output.mp4" `
  -e NODE_ENV=production `
  -e DEBUG=1 `
  -v "$(Get-Location)/remotion:/app/remotion" `
  -v "$(Get-Location)/public:/app/public" `
  -v "$(Get-Location)/app:/app/app" `
  -v "$(Get-Location)/data:/app/data" `
  think-sage-video-renderer