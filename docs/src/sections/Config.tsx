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
  code: {
    display: 'block',
    padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    color: '#e4e4e7',
    fontSize: '13px',
    lineHeight: 1.6,
    overflow: 'auto' as const,
    whiteSpace: 'pre' as const,
  },
  keyword: { color: '#c084fc' },
  comment: { color: 'rgba(161, 161, 170, 0.5)' },
  type: { color: '#60a5fa' },
  desc: {
    fontSize: '13px',
    color: 'rgba(161, 161, 170, 0.8)',
    lineHeight: 1.6,
    marginTop: '16px',
  },
};

const s = styles;

export function Config() {
  return (
    <section id="config" style={s.section}>
      <h2 style={s.heading}>Configuration</h2>
      <pre style={s.code}>
        <span style={s.keyword}>interface</span>{' '}<span style={s.type}>JankMeterConfig</span>{' {\n'}
        {'  enabled'}<span style={s.keyword}>?</span>{': '}<span style={s.type}>boolean</span>{';        '}<span style={s.comment}>{'// default: true'}</span>{'\n'}
        {'  shortcut'}<span style={s.keyword}>?</span>{': '}<span style={s.type}>string</span>{';         '}<span style={s.comment}>{"// default: 'Ctrl+Shift+M'"}</span>{'\n'}
        {'  throttleMs'}<span style={s.keyword}>?</span>{': '}<span style={s.type}>number</span>{';       '}<span style={s.comment}>{'// DOM update interval, default: 500'}</span>{'\n'}
        {'  maxHistory'}<span style={s.keyword}>?</span>{': '}<span style={s.type}>number</span>{';       '}<span style={s.comment}>{'// sparkline data points, default: 60'}</span>{'\n'}
        {'  onMetrics'}<span style={s.keyword}>?</span>{': (metrics: '}<span style={s.type}>AllMetrics</span>{') => '}<span style={s.type}>void</span>{';\n'}
        {'}'}
      </pre>
      <div style={s.desc}>
        <p>All options are optional. Pass them to <code>init()</code>, <code>&lt;JankMeter /&gt;</code>, or the plugin constructors.</p>
      </div>

      <h3 style={{ ...s.heading, fontSize: '18px', marginTop: '32px' }}>Features</h3>
      <ul style={{ ...s.desc, paddingLeft: '20px' }}>
        <li><strong>Zero config</strong> — drop in and go</li>
        <li><strong>Shadow DOM</strong> — styles never leak into your app</li>
        <li><strong>Auto-calibrates</strong> — detects 60/90/120/144Hz displays</li>
        <li><strong>Keyboard shortcut</strong> — Ctrl+Shift+M (or Cmd+Shift+M) to toggle</li>
        <li><strong>Minimize to dot</strong> — severity-colored indicator</li>
        <li><strong>Download</strong> — export metrics as JSON</li>
        <li><strong>Production safe</strong> — conditional exports + runtime guard + sideEffects: false</li>
        <li><strong>SSR safe</strong> — no-ops on the server</li>
      </ul>
    </section>
  );
}
