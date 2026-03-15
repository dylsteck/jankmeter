const styles = {
  section: {
    paddingBottom: '60px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#e4e4e7',
    marginBottom: '24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(161, 161, 170, 0.8)',
    fontWeight: 500,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#e4e4e7',
  },
  metric: {
    fontWeight: 600,
    color: '#4ade80',
  },
};

const s = styles;

const metrics = [
  { name: 'FPS', source: 'requestAnimationFrame rolling window', browsers: 'All', thresholds: '≥55 good, ≥30 warn, <30 bad' },
  { name: 'Jank %', source: 'Dropped frames / expected frames + LAF/LongTask', browsers: 'All (enhanced in Chrome)', thresholds: '<5% good, ≤15% warn, >15% bad' },
  { name: 'Delay', source: 'Event Timing API (INP-style)', browsers: 'Chrome 96+', thresholds: '<100ms good, ≤300ms warn, >300ms bad' },
  { name: 'Memory', source: 'performance.memory', browsers: 'Chrome only', thresholds: '<200MB good, ≤500MB warn, >500MB bad' },
  { name: 'Network', source: 'fetch/XHR instrumentation + PerformanceObserver', browsers: 'All', thresholds: '≤2 good, ≤5 warn, >5 bad' },
  { name: 'React', source: 'bippy + DevTools hook', browsers: 'All (with React)', thresholds: 'Always good' },
  { name: 'Hydration', source: 'First commit timing from navigation', browsers: 'All (with SSR)', thresholds: '<100ms good, ≤500ms warn, >500ms bad' },
];

export function Metrics() {
  return (
    <section id="metrics" style={s.section}>
      <h2 style={s.heading}>Metrics Reference</h2>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Metric</th>
            <th style={s.th}>Source</th>
            <th style={s.th}>Browsers</th>
            <th style={s.th}>Thresholds</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.name}>
              <td style={{ ...s.td, ...s.metric }}>{m.name}</td>
              <td style={s.td}>{m.source}</td>
              <td style={s.td}>{m.browsers}</td>
              <td style={s.td}>{m.thresholds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
