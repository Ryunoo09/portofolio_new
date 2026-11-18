"use client";

/**
 * Last-resort boundary: replaces the whole document when the root layout itself
 * throws, so the page keeps its own <html>/<body> and inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#09090b",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <main>
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.75rem" }}>The site failed to load</h1>
          <p style={{ color: "#a1a1aa", margin: "0 0 1.5rem", maxWidth: "40ch" }}>
            Something went wrong before the page could render.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#a3e635",
              color: "#0a0a0a",
              border: 0,
              borderRadius: "0.375rem",
              padding: "0.625rem 1rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ color: "#71717a", fontSize: "0.75rem", marginTop: "1.5rem" }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
