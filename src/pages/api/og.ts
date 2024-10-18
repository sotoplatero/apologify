import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';

export const get: APIRoute = async ({ url }) => {
  const { searchParams } = url;
  const title = searchParams.get('title');
  const pubDate = searchParams.get('pubDate');
  const minutesRead = searchParams.get('minutesRead');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to bottom right, #1a237e, #4a148c)',
          padding: '40px 60px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1 style={{ fontSize: 64, color: 'white', margin: 0, lineHeight: 1.2 }}>{title}</h1>
          <div style={{ display: 'flex', gap: '20px', fontSize: 24, color: '#b3e5fc' }}>
            <p style={{ margin: 0 }}>{pubDate}</p>
            <p style={{ margin: 0 }}>{minutesRead} min read</p>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 40, right: 60, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="https://yourdomain.com/logo.png" alt="Logo" width="60" height="60" />
          <p style={{ fontSize: 28, color: 'white', margin: 0 }}>yourdomain.com</p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
};
