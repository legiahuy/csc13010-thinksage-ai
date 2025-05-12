# ThinkSage AI

## Overview

ThinkSage AI is an intelligent platform that leverages artificial intelligence to provide advanced solutions for content creation, analysis, and processing. The project combines modern web technologies with AI capabilities to deliver a powerful and user-friendly experience.

## Description

ThinkSage AI is a full-stack application that integrates various AI services and modern web technologies to provide intelligent content processing and generation capabilities. The platform is designed to be scalable, maintainable, and user-friendly, offering a seamless experience for users.

## Student Information

- Course: CSC13010
- Project: ThinkSage AI
- Team Members: [Add team members here]

## Features

- AI-powered content processing
- Real-time content generation
- Video rendering capabilities using Remotion
- Authentication and user management
- Responsive and modern UI
- Cloud-based processing and storage
- Integration with various AI services

## Screenshots

[Add screenshots of your application here]

## Tech Stack

### Frontend

- Next.js - React framework for production
- Tailwind CSS - Utility-first CSS framework
- Remotion - Video rendering framework
- Firebase - Authentication and real-time database
- Convex - Backend as a service

### Backend

- Node.js - Runtime environment
- Convex - Backend infrastructure
- Inngest - Workflow automation
- Deepgram - Speech-to-text processing
- Google APIs - Integration with Google services

### Development Tools

- ESLint - Code linting
- Prettier - Code formatting
- Husky - Git hooks
- Docker - Containerization

## Building and Usage

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for containerized deployment)
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/legiahuy/ctt504-thinksage-ai.git
cd ctt504-thinksage-ai
```

2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and frontend directory with the necessary environment variables.

4. Start the development server:

```bash
# From the frontend directory
npm run dev
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
├── crawler/           # Web crawling functionality
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

- [Add any acknowledgments here]
- [List any third-party libraries or services used]

## Contact

[Add contact information here]

## Support

For support, please open an issue in the GitHub repository or contact the development team.
