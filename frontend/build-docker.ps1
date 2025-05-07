Write-Host "Building docker image..."

# Create necessary directories
Write-Host "Setting up directories..."
New-Item -ItemType Directory -Force -Path "remotion", "public", "app/_components", "data"

# Build the Docker image
Write-Host "Building Docker image..."
docker build -t think-sage-video-renderer .
