export default function OfflinePage() {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#1e293b",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2274a5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: "1.5rem" }}
          >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            idea.
          </h1>
          <p style={{ color: "#64748b", marginBottom: "0.25rem" }}>Vous êtes hors ligne.</p>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Vos idées seront synchronisées dès la reconnexion.
          </p>
        </div>
      </body>
    </html>
  )
}
