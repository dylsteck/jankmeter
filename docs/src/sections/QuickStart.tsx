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
  subheading: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'rgba(161, 161, 170, 0.9)',
    marginBottom: '8px',
    marginTop: '24px',
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
  string: { color: '#4ade80' },
  comment: { color: 'rgba(161, 161, 170, 0.5)' },
  fn: { color: '#60a5fa' },
  tag: { color: '#f87171' },
};

const s = styles;

export function QuickStart() {
  return (
    <section id="quickstart" style={s.section}>
      <h2 style={s.heading}>Quick Start</h2>

      <h3 style={s.subheading}>React Component (recommended)</h3>
      <pre style={s.code}>
        <span style={s.comment}>{'// App.tsx or layout.tsx'}</span>{'\n'}
        <span style={s.keyword}>import</span>{' { '}<span style={s.fn}>JankMeter</span>{" } "}<span style={s.keyword}>from</span>{' '}<span style={s.string}>'jankmeter/react'</span>{';\n\n'}
        <span style={s.keyword}>export default function</span>{' '}<span style={s.fn}>App</span>{'() {\n'}
        {'  '}<span style={s.keyword}>return</span>{' (\n'}
        {'    <>\n'}
        {'      <'}<span style={s.tag}>JankMeter</span>{' />\n'}
        {'      '}<span style={s.comment}>{'{/* your app */}'}</span>{'\n'}
        {'    </>\n'}
        {'  );\n'}
        {'}'}
      </pre>

      <h3 style={s.subheading}>Vite Plugin</h3>
      <pre style={s.code}>
        <span style={s.comment}>{'// vite.config.ts'}</span>{'\n'}
        <span style={s.keyword}>import</span>{' { '}<span style={s.fn}>jankMeter</span>{" } "}<span style={s.keyword}>from</span>{' '}<span style={s.string}>'jankmeter/vite'</span>{';\n\n'}
        <span style={s.keyword}>export default</span>{' {\n'}
        {'  plugins: ['}<span style={s.fn}>jankMeter</span>{'()],\n'}
        {'};'}
      </pre>

      <h3 style={s.subheading}>Next.js (App Router)</h3>
      <pre style={s.code}>
        <span style={s.comment}>{'// app/layout.tsx'}</span>{'\n'}
        <span style={s.keyword}>import</span>{' { '}<span style={s.fn}>JankMeter</span>{" } "}<span style={s.keyword}>from</span>{' '}<span style={s.string}>'jankmeter/next'</span>{';\n\n'}
        <span style={s.keyword}>export default function</span>{' '}<span style={s.fn}>RootLayout</span>{'({ children }) {\n'}
        {'  '}<span style={s.keyword}>return</span>{' (\n'}
        {'    <'}<span style={s.tag}>html</span>{'><'}<span style={s.tag}>body</span>{'>\n'}
        {'      <'}<span style={s.tag}>JankMeter</span>{' />\n'}
        {'      {children}\n'}
        {'    </'}<span style={s.tag}>body</span>{'></'}<span style={s.tag}>html</span>{'>\n'}
        {'  );\n'}
        {'}'}
      </pre>

      <h3 style={s.subheading}>Webpack Plugin</h3>
      <pre style={s.code}>
        <span style={s.comment}>{'// webpack.config.js'}</span>{'\n'}
        <span style={s.keyword}>const</span>{' { '}<span style={s.fn}>JankMeterWebpackPlugin</span>{" } = "}<span style={s.fn}>require</span>{'('}<span style={s.string}>'jankmeter/webpack'</span>{');\n\n'}
        {'module.exports = {\n'}
        {'  plugins: ['}<span style={s.keyword}>new</span>{' '}<span style={s.fn}>JankMeterWebpackPlugin</span>{'()],\n'}
        {'};'}
      </pre>

      <h3 style={s.subheading}>Script / Programmatic</h3>
      <pre style={s.code}>
        <span style={s.keyword}>import</span>{' { '}<span style={s.fn}>init</span>{', '}<span style={s.fn}>destroy</span>{', '}<span style={s.fn}>getMetrics</span>{" } "}<span style={s.keyword}>from</span>{' '}<span style={s.string}>'jankmeter'</span>{';\n\n'}
        <span style={s.fn}>init</span>{'({\n'}
        {'  onMetrics: (m) => console.log(m),\n'}
        {'});\n\n'}
        <span style={s.comment}>{'// Later: destroy();'}</span>
      </pre>
    </section>
  );
}
