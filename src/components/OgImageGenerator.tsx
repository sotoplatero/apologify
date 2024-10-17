import { ImageResponse } from '@vercel/og';

export function OgImageGenerator(title: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1F2937',
          fontSize: 60,
          fontWeight: 'bold',
          textAlign: 'center',
          color: 'white',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            backgroundImage: 'linear-gradient(90deg, #3B82F6, #10B981)',
            backgroundClip: 'text',
            '-webkit-background-clip': 'text',
            color: 'transparent',
            marginBottom: '20px',
            fontSize: '72px',
          }}
        >
          Apology Letter
        </div>
        <div
          style={{
            fontSize: '48px',
            maxWidth: '80%',
            wordWrap: 'break-word',
          }}
        >
          {title}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
