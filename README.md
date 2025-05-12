# ThinkSage AI

## Overview

ThinkSage AI is an advanced AI-powered platform that automates the creation of educational and scientific content videos. The system combines multiple AI technologies to transform scientific data into engaging video content, making complex information accessible and engaging for various audiences.

## Description

ThinkSage AI is a comprehensive solution that streamlines the process of creating educational videos from scientific content. The platform automatically collects data from reliable sources (Wikipedia, Nature, PubMed), processes it through various AI models, and generates professional-quality videos with synchronized audio, visuals, and effects. The system is designed to be both powerful and user-friendly, allowing for both automated and manual customization of content.

## Information & Contact

- Course: CSC13010
- Project: ThinkSage AI
- Team Members:

| No. | Student ID | Full Name           | Email                       |
| --- | ---------- | ------------------- | --------------------------- |
| 1   | 22127152   | Lê Gia Huy          | lghuy22@clc.fitus.edu.vn    |
| 2   | 22127203   | Võ Ngọc Khoa        | vnkhoa22@clc.fitus.edu.vn   |
| 3   | 22127031   | Nguyễn Duy Bảo      | ndbao22@clc.fitus.edu.vn    |
| 4   | 22127193   | Vũ Nguyễn Gia Khiêm | vngkhiem22@clc.fitus.edu.vn |

## Features

### Core Features

1. **Scientific Data Collection**

   - Automated web crawling from Wikipedia, Nature, and PubMed
   - Python-based crawler for efficient data collection and analysis
   - Support for open-source API integration

2. **AI-Powered Script Generation**

   - OpenAI API integration for automated script creation
   - Content customization based on target audience
   - Intelligent content structuring and formatting

3. **Text-to-Speech Synthesis**

   - AiguruLab API integration for high-quality voice synthesis
   - Multiple voice options and languages
   - Natural-sounding speech generation

4. **AI Image & Video Generation**

   - Multi-step AI processing pipeline:
     1. Data collection from scientific sources
     2. Content summarization using OpenAI/Gemini
     3. Image generation with DeepSeek/Gemini
     4. Video rendering with Remotion

5. **Video Production Pipeline**

   - Automated audio-visual synchronization
   - Professional transitions and effects
   - High-quality output with customizable settings

6. **Dashboard & Video Management**
   - Comprehensive video creation interface
   - Video status tracking (pending, processing, completed)
   - Convex-based data storage and management

### Advanced Features

1. **Manual Content Editing**

   - Script modification capabilities
   - Image customization options
   - Voice-over adjustments
   - Real-time preview functionality

2. **Performance Analytics**

   - YouTube integration for view statistics
   - Real-time analytics dashboard
   - Auto-refresh every 5 minutes
   - Customizable reporting

3. **Content Personalization**

   - Target audience-based content adaptation
   - Google Gemini AI integration for style customization
   - Custom prompt engineering

4. **Voice Recording & Captioning**

   - Human voice recording per scene
   - Automatic caption generation
   - Reading speed-based timing

5. **Multi-AI Integration**

   - OpenAI for language processing
   - Gemini for image generation
   - DeepSeek for illustrations
   - Aigurulab for voice synthesis

6. **Social Media Integration**
   - Direct YouTube publishing
   - OAuth2 authentication
   - Video link management

### User Interface

- Modern, responsive design using shadcn/ui and TailwindCSS
- Dark mode support
- Optimized for desktop and tablet devices
- Consistent layout and intuitive navigation
- Real-time preview capabilities

### Quality Features

- Synchronized audio-visual content
- Professional transitions and effects
- High-resolution output
- Natural scene transitions
- Clear and readable captions

## Screenshots

[Add screenshots of your application here]

## Tech Stack

### Frontend

- Next.js - React framework for production
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - Component library
- Remotion - Video rendering framework
- Firebase - Authentication and real-time database
- Convex - Backend as a service
- Recharts - Data visualization

### Backend

- Node.js - Runtime environment
- Python - Data crawling and processing
- Convex - Backend infrastructure
- Inngest - Workflow automation
- Deepgram - Speech-to-text processing
- Google APIs - Integration with Google services
- OpenAI API - Content generation
- Gemini AI - Image and content processing
- DeepSeek - Illustration generation
- Aigurulab - Voice synthesis

### Development Tools

- ESLint - Code linting
- Prettier - Code formatting
- Husky - Git hooks
- Docker - Containerization

## Building and Usage

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- npm (comes with Node.js)
- pip (Python package manager)
- Docker Desktop
- ffmpeg (for human voice recording feature)
- Git

### Installation

#### Part 1: Frontend Setup

1. Clone the repository:

```bash
git clone https://github.com/legiahuy/csc13010-thinksage-ai.git
cd csc13010-thinksage-ai
```

2. Navigate to the frontend directory:

```bash
cd ./frontend
```

3. Set up environment files:

```bash
# Create environment files from samples
cp .env.sample .env
cp .env.local.sample .env.local
```

Edit both `.env` and `.env.local` files to update configuration settings according to your environment.

4. Install dependencies:

```bash
npm install
```

5. Start Convex (realtime database):

```bash
npx convex dev
```

6. Start Inngest (background jobs):

```bash
npx inngest-cli@latest dev
```

7. Start the application:

```bash
npm run dev
```

The application will be available at http://localhost:3000

8. Build Docker image for video rendering:

```bash
# Make sure Docker Desktop is running
./build-docker.ps1  # For Windows
./build-docker.sh   # For Unix-based systems
```

9. Install ffmpeg for human voice recording:

- Follow the installation guide at: https://www.youtube.com/watch?v=JR36oH35Fgg

#### Part 2: Crawler Service Setup

1. Navigate to the crawler directory:

```bash
cd ./crawler
```

2. Create and activate virtual environment:

For Windows:

```bash
python -m venv env
.\env\Scripts\activate
```

For Mac/Linux:

```bash
python3 -m venv env
source env/bin/activate
```

3. Install required Python packages:

```bash
pip install fastapi uvicorn nltk requests beautifulsoup4 wikipedia pubmed_parser scikit-learn pandas python-dotenv springernature-api-client
```

4. Download NLTK data:

```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')
exit()
```

5. Start the crawler server:

```bash
uvicorn server:app --reload
```

The crawler API will be available at http://127.0.0.1:8000

### Environment Variables

Create and configure the following environment files:

1. Frontend `.env`:

```
# API Keys
OPENAI_API_KEY=
GEMINI_API_KEY=
AIGURULAB_API_KEY=
DEEPSEEK_API_KEY=

# OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
CONVEX_DEPLOYMENT=
```

2. Frontend `.env.local`:

```
# Add any local-specific environment variables here
```

3. Crawler `.env`:

```
# Add crawler-specific environment variables here
```

### Docker Deployment

The project includes Docker support for containerized deployment:

```bash
# Build the Docker image
./build-docker.ps1  # For Windows
./build-docker.sh   # For Unix-based systems

# Run the container
docker run -p 3000:3000 thinksage-ai
```

## Project Structure

```
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── public/        # Static assets
│   └── remotion/      # Video rendering components
├── convex/            # Backend functions and database
├── crawler/           # Python-based web crawler
│   ├── src/          # Crawler source code
│   └── requirements.txt # Python dependencies
└── .husky/           # Git hooks configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- OpenAI for GPT API
- Google for Gemini AI
- Aigurulab for voice synthesis
- DeepSeek for illustration generation
- Remotion for video rendering
- Convex for backend infrastructure

## Credits & Inspiration

This project was inspired by and built upon the concepts and architecture demonstrated in [AI Video Generator with Next.js, OpenAI, and Remotion](https://www.youtube.com/watch?v=uBgFPmieR6M). We've extended the original implementation with additional features including:

- Enhanced scientific content processing
- Multi-source data crawling
- Advanced AI model integration
- Extended video customization options
- Improved user interface and experience

## Support

For support, please open an issue in the GitHub repository or contact the development team.
