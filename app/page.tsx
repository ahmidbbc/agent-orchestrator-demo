export default function Home() {
  return (
    <main>
      <h1>agent-orchestrator demo</h1>
      <span
        id="delivery-verified-badge"
        lang="fr"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          border: '1px solid #166534',
          borderRadius: '999px',
          backgroundColor: '#f0fdf4',
          color: '#166534',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        <span aria-hidden="true">✓</span>
        Livraison vérifiée
      </span>
      <p>Minimal task API used as a target for the agent-orchestrator demo mode.</p>
    </main>
  )
}
