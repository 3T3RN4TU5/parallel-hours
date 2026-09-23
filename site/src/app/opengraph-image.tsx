import { ImageResponse } from 'next/og';

export const alt = 'Parallel Hours — Motion is a material';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0B0B0C', color: '#EDE8DF', padding: '48px 56px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, letterSpacing: 3, textTransform: 'uppercase' }}>
          <span>Parallel Hours</span>
          <span style={{ color: 'rgba(237,232,223,.62)' }}>Independent interactive studio</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 150, fontWeight: 800, lineHeight: 0.85, textTransform: 'uppercase', letterSpacing: -2 }}>
          <span>Motion</span>
          <span style={{ fontSize: 56, fontStyle: 'italic', fontWeight: 400, textTransform: 'none', color: '#C8FF3C', margin: '10px 0 10px 12px' }}>is a</span>
          <span>Material</span>
        </div>
        <div style={{ height: 4, width: '100%', background: '#C8FF3C' }} />
      </div>
    ),
    size,
  );
}
