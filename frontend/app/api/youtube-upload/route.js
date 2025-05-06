import { google } from 'googleapis';
import { Readable } from 'stream';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { downloadUrl, title, description } = await req.json();
    console.log('Starting upload process with:', { title, description, downloadUrl });

    // Lấy token từ cookie (sau khi xác thực OAuth2)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        details: 'Người dùng chưa đăng nhập Google',
        code: 'AUTH_ERROR'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Tạo OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
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

    // Tải video từ URL
    const res = await fetch(downloadUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const videoStream = Readable.from(buffer);

    // Upload video lên YouTube
    const response = await youtube.videos.insert({
      part: ['snippet', 'status', 'contentDetails'],
      requestBody: {
        snippet: {
          title,
          description,
          tags: ['ThinkSage AI', 'AI Generated'],
          categoryId: '22', // People & Blogs
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

    const videoId = response.data.id;

    // Đợi xử lý xong (tuỳ chỉnh nếu muốn polling)
    await new Promise(resolve => setTimeout(resolve, 5000));

    const videoStatus = await youtube.videos.list({
      part: ['status'],
      id: [videoId]
    });

    return Response.json({
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      videoId,
      status: videoStatus.data.items[0].status
    });

  } catch (error) {
    console.error('Upload failed:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      code: error.code,
    });

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
