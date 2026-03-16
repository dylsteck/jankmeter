import { useCallback } from 'preact/hooks';
import { DemoCard } from './DemoCard';

const buttonStyle: Record<string, string | number> = {
  padding: '8px 16px',
  fontSize: '14px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: '#e4e4e7',
  cursor: 'pointer',
  marginRight: '8px',
};

const url = 'https://jsonplaceholder.typicode.com/posts/1';

export function NetworkFlood() {
  const fireRequests = useCallback((count: number) => {
    Promise.all(
      Array.from({ length: count }, () => fetch(url))
    ).catch(() => {});
  }, []);

  return (
    <DemoCard
      title="Network Flood"
      metrics={['Network']}
      watchFor="Network in-flight count spikes."
    >
      <div>
        <button style={buttonStyle} onClick={() => fireRequests(10)}>
          Fire 10 requests
        </button>
        <button style={{ ...buttonStyle, marginRight: 0 }} onClick={() => fireRequests(50)}>
          Fire 50 requests
        </button>
      </div>
    </DemoCard>
  );
}
