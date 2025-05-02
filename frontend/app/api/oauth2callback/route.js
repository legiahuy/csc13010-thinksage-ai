import { google } from 'googleapis';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('ACCESS TOKEN:', tokens.access_token);
    console.log('REFRESH TOKEN:', tokens.refresh_token);

    return new Response(`
      <html>
        <body>
          <h1>✅ Xác thực thành công</h1>
          <p>Access token và Refresh token đã được log ra terminal.</p>
          <p>Bạn có thể đóng tab này.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response('Lỗi xác thực OAuth. Kiểm tra terminal để xem chi tiết.', { status: 500 });
  }
}
