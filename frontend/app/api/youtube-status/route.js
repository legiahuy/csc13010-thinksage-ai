import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Video ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 🟩 Lấy token từ cookie sau khi đã xác thực thành công trước đó
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({
        error: 'Missing access or refresh token in cookie',
        code: 'AUTH_ERROR'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 🟩 Tạo OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // 🔁 Refresh token nếu cần (quan trọng nếu access_token hết hạn)
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error('🔴 Failed to refresh token:', refreshError);
      return new Response(JSON.stringify({
        error: 'Token expired or invalid',
        code: 'AUTH_ERROR'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 📺 Gọi API YouTube để lấy trạng thái video
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.videos.list({
      part: ['status'],
      id: [videoId],
    });

    const status = response.data?.items?.[0]?.status;

    if (!status) {
      return new Response(JSON.stringify({
        error: 'Video not found or no status returned',
        code: 'NOT_FOUND'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return Response.json({ status });

  } catch (error) {
    console.error('🔥 Error checking video status:', error);
    return new Response(JSON.stringify({
      error: 'Failed to check video status',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
