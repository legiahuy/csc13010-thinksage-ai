import { google } from 'googleapis';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title') || '';
  const description = searchParams.get('description') || '';
  const downloadUrl = searchParams.get('downloadUrl') || '';

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent select_account', // chọn lại tài khoản
    include_granted_scopes: true,
    state: JSON.stringify({
      title,
      description,
      downloadUrl
    })
  });

  return Response.redirect(authUrl);
}
