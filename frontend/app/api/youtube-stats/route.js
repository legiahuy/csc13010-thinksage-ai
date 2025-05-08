import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.videos.list({
      part: ['statistics'],
      id: [videoId],
    });

    const stats = response.data.items[0]?.statistics;

    return Response.json({ stats });
  } catch (err) {
    console.error('Error fetching video stats:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { status: 500 });
  }
}
