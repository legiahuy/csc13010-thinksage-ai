FROM node:22-bookworm-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libcups2 \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create necessary directories with proper permissions
RUN mkdir -p /app/data /app/remotion /app/public /app/app/_components && \
    chown -R node:node /app && \
    chmod -R 755 /app

# Switch to non-root user
USER node

# Copy package files
COPY --chown=node:node package.json package*.json yarn.lock* pnpm-lock.yaml* bun.lockb* bun.lock* tsconfig.json* remotion.config.* ./
COPY --chown=node:node tailwind.config.mjs postcss.config.mjs ./ 


# Copy source files
COPY --chown=node:node remotion ./remotion
COPY --chown=node:node public ./public
COPY --chown=node:node app ./app

COPY --chown=node:node app/globals.css ./app/globals.css

# Install dependencies
RUN npm install
RUN npm install @remotion/compositor-linux-x64-gnu

# Build CSS with proper error handling
RUN npm run build:css || true


# Install Chrome
RUN npx remotion browser ensure

# Copy render script
COPY --chown=node:node render.mjs render.mjs

# Set environment variables
ENV INPUT_PROPS_PATH=/tmp/videoData.json
ENV OUTPUT_PATH=/app/data/output.mp4
ENV NODE_ENV=production

# Verify directory structure and permissions
RUN ls -la /app && \
    ls -la /app/data && \
    ls -la /app/app/_components && \
    touch /app/data/test.txt && \
    rm /app/data/test.txt

# Command to run the render script
CMD ["node", "render.mjs"]