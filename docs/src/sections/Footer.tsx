const styles = {
  footer: {
    paddingTop: '40px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: 'rgba(161, 161, 170, 0.5)',
    lineHeight: 1.8,
  },
  link: {
    color: 'rgba(161, 161, 170, 0.7)',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(161, 161, 170, 0.2)',
  },
};

export function Footer() {
  return (
    <footer style={styles.footer}>
      <p>
        <a href="https://github.com/dylsteck/jankmeter" style={styles.link}>GitHub</a>
        {' · '}
        <a href="https://www.npmjs.com/package/jankmeter" style={styles.link}>npm</a>
        {' · '}
        <a href="/llms.txt" style={styles.link}>llms.txt</a>
      </p>
      <p style={{ marginTop: '12px' }}>
        Inspired by <a href="https://x.com/karrisaarinen" style={styles.link}>Karri Saarinen</a> (Linear CEO) sharing Linear's internal jank meter.
      </p>
      <p style={{ marginTop: '8px' }}>MIT License</p>
    </footer>
  );
}
