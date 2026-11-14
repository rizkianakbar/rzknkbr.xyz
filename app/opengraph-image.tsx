import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { resumeData } from '@/lib/resume';

export const alt = `${resumeData.name}, ${resumeData.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#111019';
const INK = '#f4f4f7';
const MUTED = '#8b8a9c';
const HAIRLINE = 'rgba(255,255,255,0.10)';
const ACCENT = '#c6ff3d';

const DOMAIN = new URL(resumeData.url).host;

/** Reads an image as a data URL, detecting the real type from its bytes (not its file extension). */
async function imageDataUrl(publicPath: string) {
  const bytes = await readFile(path.join(process.cwd(), 'public', publicPath));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  return `data:image/${isJpeg ? 'jpeg' : 'png'};base64,${bytes.toString('base64')}`;
}

/**
 * Loads one weight of a Google Font, subset to the given text. Returns null on any failure so the
 * build never breaks over a font: the card then falls back to the default font.
 */
async function googleFont(family: string, weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * The link-preview card (LinkedIn, X, WhatsApp, Slack, Google), rendered at build time.
 * Quiet on purpose: one accent, one typeface, lots of room. The site is the loud part.
 */
export default async function OpengraphImage() {
  const allText = [
    DOMAIN,
    resumeData.name,
    resumeData.title,
    resumeData.location,
    resumeData.availability,
    'Full-stack & Web3',
  ].join('');
  const [avatar, bold, medium] = await Promise.all([
    imageDataUrl(resumeData.avatarUrl),
    googleFont('Geist', 700, allText),
    googleFont('Geist', 400, allText),
  ]);
  const fonts = [
    ...(bold ? [{ name: 'Geist', data: bold, weight: 700 as const, style: 'normal' as const }] : []),
    ...(medium ? [{ name: 'Geist', data: medium, weight: 400 as const, style: 'normal' as const }] : []),
  ];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: BG,
        // A faint accent light from the top right, so the card isn't flat black.
        backgroundImage: 'radial-gradient(circle at 88% 0%, rgba(198,255,61,0.10), transparent 45%)',
        color: INK,
        fontFamily: fonts.length ? 'Geist' : 'sans-serif',
        fontWeight: 400,
      }}>
      {/* Top: domain and availability */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 22 }}>
        <div style={{ display: 'flex', color: MUTED, letterSpacing: 1 }}>{DOMAIN}</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 18px',
            borderRadius: 999,
            border: `1px solid ${HAIRLINE}`,
            color: INK,
          }}>
          <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 999, background: ACCENT }} />
          {resumeData.availability}
        </div>
      </div>

      {/* Middle: who, and a face */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, lineHeight: 1, letterSpacing: -3.5 }}>
            {resumeData.name}
          </div>
          <div style={{ display: 'flex', fontSize: 38, color: MUTED, marginTop: 20, letterSpacing: -0.5 }}>
            {resumeData.title}
            <span style={{ color: ACCENT, margin: '0 14px' }}>/</span>
            Full-stack & Web3
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: MUTED, marginTop: 14 }}>{resumeData.location}</div>
        </div>

        {/* biome-ignore lint/performance/noImgElement: Satori (next/og) renders plain <img> only */}
        <img
          src={avatar}
          alt=""
          width={240}
          height={288}
          style={{
            borderRadius: 28,
            objectFit: 'cover',
            objectPosition: 'top',
            border: `1px solid ${HAIRLINE}`,
          }}
        />
      </div>
    </div>,
    { ...size, fonts },
  );
}
