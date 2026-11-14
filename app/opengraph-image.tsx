import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { resumeData } from '@/lib/resume';

export const alt = `${resumeData.name}, ${resumeData.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#16151f';
const LIME = '#c6ff3d';
const CYAN = '#4fe3ff';
const PINK = '#ff5fae';
const MUTED = '#a1a1b5';

const STATS = '800K monthly readers  ·  703 campaigns  ·  WAN-IFRA Award 2024';

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

/** The link-preview card (LinkedIn, X, WhatsApp, Slack, Google). Rendered at build time. */
export default async function OpengraphImage() {
  const kicker = `PLAYER 1 · ${resumeData.location.toUpperCase()}`;
  const allText = `${kicker}${resumeData.name}${resumeData.title}${STATS}Full-stack · Web3 · ${resumeData.availability}www.rzknkbr.xyz`;
  const [avatar, bold, regular] = await Promise.all([
    imageDataUrl(resumeData.avatarUrl),
    googleFont('Geist', 800, allText),
    googleFont('Geist', 500, allText),
  ]);
  const fonts = [
    ...(bold ? [{ name: 'Geist', data: bold, weight: 800 as const, style: 'normal' as const }] : []),
    ...(regular ? [{ name: 'Geist', data: regular, weight: 500 as const, style: 'normal' as const }] : []),
  ];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '64px 80px',
        background: BG,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
        color: 'white',
        fontFamily: fonts.length ? 'Geist' : 'sans-serif',
        fontWeight: 500,
      }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 680 }}>
        <div style={{ display: 'flex', fontSize: 22, letterSpacing: 5, color: LIME }}>{kicker}</div>
        <div
          style={{ display: 'flex', fontSize: 96, fontWeight: 800, lineHeight: 1, marginTop: 22, letterSpacing: -4 }}>
          {resumeData.name}
        </div>
        <div style={{ display: 'flex', fontSize: 42, fontWeight: 800, color: LIME, marginTop: 20, letterSpacing: -1 }}>
          {resumeData.title}
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: MUTED, marginTop: 12 }}>
          Full-stack · Web3 · {resumeData.availability}
        </div>
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            marginTop: 40,
            padding: '12px 20px',
            fontSize: 20,
            whiteSpace: 'nowrap',
            borderRadius: 16,
            border: `2px solid ${PINK}`,
            background: 'rgba(255,95,174,0.08)',
          }}>
          {STATS}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div
          style={{
            display: 'flex',
            padding: 6,
            borderRadius: 36,
            backgroundImage: `linear-gradient(135deg, ${LIME}, ${CYAN}, ${PINK})`,
          }}>
          {/* biome-ignore lint/performance/noImgElement: Satori (next/og) renders plain <img> only */}
          <img
            src={avatar}
            alt=""
            width={300}
            height={340}
            style={{ borderRadius: 30, objectFit: 'cover', objectPosition: 'top' }}
          />
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: MUTED, letterSpacing: 2 }}>www.rzknkbr.xyz</div>
      </div>
    </div>,
    { ...size, fonts },
  );
}
