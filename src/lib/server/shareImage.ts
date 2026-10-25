import { ImageResponse } from '@vercel/og';
import type { ApologyPage } from '../apologyPages';

// Share images for an apology page, drawn in the brand's "ink on paper" palette:
//  - "og":    1200×630 link preview (WhatsApp, iMessage, X…)
//  - "story": 1080×1920 for Instagram/WhatsApp stories
// Only the title and names are shown — never the apology text itself.

const PAPER = '#F5F1E8';
const PAPER_DEEP = '#EDE5D6';
const INK = '#241F1A';
const INK_BLUE = '#2C4A6E';
const RED = '#C1272D';
const MUTED = '#6E655A';

type Font = { name: string; data: ArrayBuffer; weight: 400 | 600; style: 'normal' };
const fontCache = new Map<string, Promise<ArrayBuffer>>();

// Google Fonts serves TTF to a client without a browser UA; `text=` subsets it.
function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const key = `${family}:${weight}:${text}`;
  if (!fontCache.has(key)) {
    fontCache.set(
      key,
      (async () => {
        const css = await fetch(
          `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`,
        ).then((r) => r.text());
        const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
        if (!src) throw new Error(`font not found: ${family}`);
        return fetch(src).then((r) => r.arrayBuffer());
      })(),
    );
  }
  return fontCache.get(key)!;
}

// satori rejects undefined style values, so drop them.
const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
  type,
  props: {
    style: Object.fromEntries(Object.entries({ display: 'flex', ...style }).filter(([, v]) => v !== undefined)),
    children,
  },
});

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

export async function renderShareImage(page: ApologyPage, format: 'og' | 'story'): Promise<Response> {
  const story = format === 'story';
  const width = story ? 1080 : 1200;
  const height = story ? 1920 : 630;
  const name = clip(page.recipientName?.trim() || 'you', 22);
  const title = clip(page.title, story ? 90 : 70);
  const from = page.senderName?.trim() ? `from ${clip(page.senderName.trim(), 28)}` : '';
  const eyebrowText = 'An apology for';
  const footer = story ? 'apologify.com' : 'Tap to open  ·  apologify.com';

  const allText = `${eyebrowText}${name}${title}${from}${footer}…`;
  let fonts: Font[] = [];
  try {
    const [display, script, sans] = await Promise.all([
      googleFont('Fraunces', 600, allText),
      googleFont('Dancing Script', 600, allText),
      googleFont('Inter', 400, allText),
    ]);
    fonts = [
      { name: 'Fraunces', data: display, weight: 600, style: 'normal' },
      { name: 'Dancing Script', data: script, weight: 600, style: 'normal' },
      { name: 'Inter', data: sans, weight: 400, style: 'normal' },
    ];
  } catch (e) {
    console.error('share image fonts unavailable, using default:', e);
  }

  // A sealed envelope: crisp geometry only (body, flap, wax seal), as inline SVG.
  const envW = story ? 520 : 300;
  const envH = Math.round(envW * 0.64);
  const fy = Math.round(envH * 0.58);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${envW}" height="${envH + 24}" viewBox="0 0 ${envW} ${envH + 24}">
    <rect x="2" y="14" width="${envW - 4}" height="${envH - 4}" rx="10" fill="rgba(36,31,26,0.10)"/>
    <rect x="2" y="2" width="${envW - 4}" height="${envH - 4}" rx="10" fill="${PAPER_DEEP}" stroke="${INK}" stroke-width="3"/>
    <path d="M4 ${envH - 6} L${envW / 2} ${Math.round(envH * 0.48)} L${envW - 4} ${envH - 6}" fill="none" stroke="${INK}" stroke-width="2" opacity="0.35"/>
    <path d="M3 4 L${envW / 2} ${fy} L${envW - 3} 4 Z" fill="${INK}"/>
    <path d="M9 6 L${envW / 2} ${fy - 6} L${envW - 9} 6 Z" fill="${PAPER}"/>
    <circle cx="${envW / 2}" cy="${fy}" r="${Math.round(envW * 0.09)}" fill="${RED}"/>
    <circle cx="${envW / 2 - envW * 0.025}" cy="${fy - envW * 0.025}" r="${Math.round(envW * 0.03)}" fill="#d8454a" opacity="0.7"/>
  </svg>`;
  const envelope = {
    type: 'img',
    props: {
      src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      width: envW,
      height: envH + 24,
      style: { flexShrink: 0 },
    },
  };

  const text = el(
    'div',
    {
      flexDirection: 'column', alignItems: story ? 'center' : 'flex-start',
      textAlign: story ? 'center' : 'left', flex: story ? undefined : 1,
    },
    [
      el('div', { fontFamily: 'Inter', fontSize: story ? 40 : 26, color: MUTED, letterSpacing: 1 }, eyebrowText),
      el('div', { fontFamily: 'Dancing Script', fontSize: story ? 150 : 96, color: INK_BLUE, lineHeight: 1.05, marginTop: 6 }, name),
      el('div', {
        fontFamily: 'Fraunces', fontSize: story ? 64 : 40, color: INK, lineHeight: 1.18,
        marginTop: story ? 36 : 18, maxWidth: story ? 860 : 680,
      }, title),
      from ? el('div', { fontFamily: 'Dancing Script', fontSize: story ? 56 : 36, color: INK, marginTop: story ? 30 : 16 }, from) : null,
    ].filter(Boolean),
  );

  const root = el(
    'div',
    {
      width, height, background: PAPER, color: INK,
      flexDirection: story ? 'column' : 'row', alignItems: 'center',
      justifyContent: story ? 'center' : 'flex-start',
      padding: story ? '140px 90px' : '0 80px', gap: story ? 90 : 64, position: 'relative',
    },
    [
      el('div', { position: 'absolute', top: story ? 36 : 22, left: story ? 36 : 22, right: story ? 36 : 22, bottom: story ? 36 : 22, border: `2px solid rgba(36,31,26,0.18)`, borderRadius: 18 }),
      envelope,
      text,
      el('div', {
        position: 'absolute', bottom: story ? 90 : 40, right: story ? 0 : 80, left: story ? 0 : undefined,
        justifyContent: 'center', fontFamily: 'Inter', fontSize: story ? 36 : 22, color: RED, letterSpacing: 1,
      }, footer),
    ],
  );

  return new ImageResponse(root as any, {
    width,
    height,
    fonts: fonts.length ? (fonts as any) : undefined,
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable' },
  });
}
