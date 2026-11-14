'use client';

import { useEffect } from 'react';

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
};

/**
 * Last-resort screen when the root layout itself crashes. It replaces the layout (so it brings its own
 * html/body) and uses inline styles: importing globals.css here would make every page preload a stylesheet
 * it never uses, and this screen must render even if the app's CSS is what broke.
 */
export default function GlobalErrorPage(props: GlobalErrorPageProps) {
  const { error } = props;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          background: '#16151f',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
        }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Something went wrong</h1>
        <p style={{ margin: 0, color: '#a1a1aa' }}>The game crashed. A reload usually fixes it.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            justifySelf: 'center',
            border: 0,
            borderRadius: 16,
            padding: '12px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            background: '#c6ff3d',
            color: '#0e1404',
          }}>
          Reload
        </button>
      </body>
    </html>
  );
}
