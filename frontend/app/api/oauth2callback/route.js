import { google } from 'googleapis';
import { serialize } from 'cookie';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = JSON.parse(searchParams.get('state') || '{}');

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const cookieHeader = [
      serialize('accessToken', tokens.access_token, {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 3600,
      }),
      serialize('refreshToken', tokens.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60,
      }),
    ];

    return new Response(`
      <html>
        <body>
          <script>
            window.opener?.postMessage("google-auth-success", "*");
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': cookieHeader
      }
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response('Lỗi xác thực OAuth.', { status: 500 });
  }
}
