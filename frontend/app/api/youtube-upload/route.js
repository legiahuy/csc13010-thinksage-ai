import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(req) {
  try {
    const { downloadUrl, title, description } = await req.json();
    console.log('Starting upload process with:', { title, description, downloadUrl });

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    console.log('OAuth2 client created with credentials:', {
      hasClientId: !!process.env.YOUTUBE_CLIENT_ID,
      hasClientSecret: !!process.env.YOUTUBE_CLIENT_SECRET,
      hasRedirectUri: !!process.env.YOUTUBE_REDIRECT_URI,
      hasAccessToken: !!process.env.YOUTUBE_ACCESS_TOKEN,
      hasRefreshToken: !!process.env.YOUTUBE_REFRESH_TOKEN
    });

    // Kiểm tra token
    if (!process.env.YOUTUBE_ACCESS_TOKEN || !process.env.YOUTUBE_REFRESH_TOKEN) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        details: 'Vui lòng xác thực với Google trước khi upload video',
        code: 'AUTH_ERROR'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    oauth2Client.setCredentials({
      access_token: process.env.YOUTUBE_ACCESS_TOKEN,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    // Thử refresh token nếu cần
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error('Failed to refresh token:', refreshError);
      return new Response(JSON.stringify({ 
        error: 'Authentication failed',
        details: 'Token đã hết hạn hoặc không hợp lệ. Vui lòng xác thực lại với Google.',
        code: 'AUTH_ERROR'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Fetch video file từ URL
    console.log('Fetching video from URL:', downloadUrl);
    const res = await fetch(downloadUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Video buffer size:', buffer.length);

    // Chuyển buffer thành stream
    const videoStream = Readable.from(buffer);

    console.log('Starting YouTube upload with config:', {
      title,
      description,
      privacyStatus: 'public',
      mimeType: 'video/mp4'
    });

    const response = await youtube.videos.insert({
      part: ['snippet', 'status', 'contentDetails'],
      requestBody: {
        snippet: {
          title,
          description,
          tags: ['ThinkSage AI', 'AI Generated'],
          categoryId: '22', // People & Blogs category
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        },
        contentDetails: {
          dimension: '2d',
          definition: 'hd',
        }
      },
      media: {
        mimeType: 'video/mp4',
        body: videoStream,
      },
    });

    console.log('Upload successful:', response.data.id);
    
    // Đợi video được xử lý
    console.log('Waiting for video processing...');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Đợi 5 giây

    // Kiểm tra trạng thái video
    const videoStatus = await youtube.videos.list({
      part: ['status'],
      id: [response.data.id]
    });

    console.log('Video status:', videoStatus.data.items[0].status);

    return Response.json({
      youtubeUrl: `https://www.youtube.com/watch?v=${response.data.id}`,
      videoId: response.data.id,
      status: videoStatus.data.items[0].status
    });
  } catch (error) {
    console.error('Upload failed with details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      code: error.code,
      errors: error.errors
    });

    // Kiểm tra nếu là lỗi xác thực
    if (error.message?.includes('invalid_grant') || 
        error.message?.includes('invalid_token') ||
        error.message?.includes('Invalid Credentials')) {
      return new Response(JSON.stringify({ 
        error: 'Authentication failed',
        details: 'Token đã hết hạn hoặc không hợp lệ. Vui lòng xác thực lại với Google.',
        code: 'AUTH_ERROR'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      details: error.message,
      response: error.response?.data,
      code: error.code
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
