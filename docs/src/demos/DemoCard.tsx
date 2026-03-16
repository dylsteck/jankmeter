import type { ComponentChildren } from 'preact';

const styles = {
  card: {
    padding: '20px 24px',
    marginBottom: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e4e4e7',
    marginBottom: '8px',
  },
  badges: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginBottom: '8px',
  },
  badge: {
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#4ade80',
    background: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid rgba(74, 222, 128, 0.2)',
    borderRadius: '4px',
  },
  hint: {
    fontSize: '13px',
    color: 'rgba(161, 161, 170, 0.8)',
    marginBottom: '16px',
    lineHeight: 1.5,
  },
};

interface DemoCardProps {
  title: string;
  metrics: string[];
  watchFor: string;
  children: ComponentChildren;
}

export function DemoCard({ title, metrics, watchFor, children }: DemoCardProps) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.badges}>
        {metrics.map((m) => (
          <span key={m} style={styles.badge}>{m}</span>
        ))}
      </div>
      <p style={styles.hint}>Watch for: {watchFor}</p>
      {children}
    </div>
  );
}
