import { useCallback } from 'preact/hooks';
import { DemoCard } from './DemoCard';

const stressCache: unknown[] = [];

const buttonStyle: Record<string, string | number> = {
  padding: '8px 16px',
  fontSize: '14px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: '#e4e4e7',
  cursor: 'pointer',
};

export function StressTest() {
  const runStressTest = useCallback(async () => {
    const start = performance.now();
    while (performance.now() - start < 300) {
      // Block 300ms
    }

    stressCache.push(new Array(1_250_000).fill(0));

    await Promise.all(
      Array.from({ length: 5 }, () =>
        fetch('https://jsonplaceholder.typicode.com/posts/1')
      )
    );

    const div = document.createElement('div');
    div.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -9999px;';
    document.body.appendChild(div);
    const thrashEnd = performance.now() + 500;
    while (performance.now() < thrashEnd) {
      for (let i = 0; i < 50; i++) {
        void div.offsetHeight;
        div.style.width = `${i % 2}px`;
      }
    }
    if (div.parentNode) div.parentNode.removeChild(div);
  }, []);

  return (
    <DemoCard
      title="Stress Test"
      metrics={['FPS', 'Jank', 'Delay', 'Memory', 'Network']}
      watchFor="Multiple metrics move at once."
    >
      <button style={buttonStyle} onClick={runStressTest}>
        Run stress test
      </button>
    </DemoCard>
  );
}
