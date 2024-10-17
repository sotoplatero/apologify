import { ImageResponse } from '@vercel/og';

export async function GET({ params }) {
  const { title } = params;

  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        },
        children: title,
      },
    },
    {
      width: 1200,
      height: 630,
    }
  );
}
