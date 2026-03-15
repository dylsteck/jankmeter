const styles = {
  section: {
    paddingTop: '100px',
    paddingBottom: '60px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#e4e4e7',
    letterSpacing: '-1px',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(161, 161, 170, 0.8)',
    lineHeight: 1.6,
    maxWidth: '560px',
    margin: '0 auto 32px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid rgba(74, 222, 128, 0.2)',
    borderRadius: '20px',
    color: '#4ade80',
    fontSize: '12px',
    marginBottom: '24px',
  },
  install: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#e4e4e7',
    fontSize: '14px',
  },
  hint: {
    fontSize: '12px',
    color: 'rgba(161, 161, 170, 0.5)',
    marginTop: '24px',
  },
};

export function Hero() {
  return (
    <section style={styles.section}>
      <div style={styles.badge}>v0.1.0</div>
      <h1 style={styles.title}>jankmeter</h1>
      <p style={styles.subtitle}>
        Real-time performance monitoring toolbar for React apps. FPS, jank %, input delay, memory, network, React renders, and hydration timing — all in one zero-config overlay.
      </p>
      <code style={styles.install}>npm install jankmeter</code>
      <p style={styles.hint}>↓ The live toolbar is running at the bottom of this page</p>
    </section>
  );
}
