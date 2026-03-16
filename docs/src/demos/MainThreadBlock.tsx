import { useState, useCallback } from 'preact/hooks';
import { DemoCard } from './DemoCard';

const buttonStyle: Record<string, string | number> = {
  padding: '8px 16px',
  fontSize: '14px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: '#e4e4e7',
  cursor: 'pointer',
};

export function MainThreadBlock() {
  const [count, setCount] = useState(0);

  const causeBlock = useCallback(() => {
    const start = performance.now();
    while (performance.now() - start < 500) {
      // Block main thread for 500ms
    }
    setCount((c) => c + 1);
  }, []);

  return (
    <DemoCard
      title="Main Thread Block"
      metrics={['FPS', 'Jank', 'Delay']}
      watchFor="FPS drops, Jank % spikes, Delay spikes on click."
    >
      <button style={buttonStyle} onClick={causeBlock}>
        Block main thread 500ms
      </button>
      <span style={{ marginLeft: '12px', color: 'rgba(161, 161, 170, 0.8)', fontSize: '13px' }}>
        Clicks: {count}
      </span>
    </DemoCard>
  );
}
