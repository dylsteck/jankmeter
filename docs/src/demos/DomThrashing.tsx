import { useState, useEffect, useRef } from 'preact/hooks';
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

export function DomThrashing() {
  const [thrashing, setThrashing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!thrashing || !containerRef.current) return;

    const container = containerRef.current;
    const div = document.createElement('div');
    div.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -9999px;';
    container.appendChild(div);

    let cancelled = false;

    const thrash = () => {
      if (cancelled) return;
      for (let i = 0; i < 100; i++) {
        void div.offsetHeight;
        div.style.width = `${i % 2}px`;
      }
      setTimeout(thrash, 0);
    };

    thrash();

    return () => {
      cancelled = true;
      if (div.parentNode) div.parentNode.removeChild(div);
    };
  }, [thrashing]);

  return (
    <DemoCard
      title="DOM Thrashing"
      metrics={['FPS', 'Jank']}
      watchFor="FPS drops, Jank spikes; recovers when stopped."
    >
      <div ref={containerRef}>
        <button
          style={buttonStyle}
          onClick={() => setThrashing(true)}
          disabled={thrashing}
        >
          Start thrashing
        </button>
        <button
          style={{ ...buttonStyle, marginRight: 0 }}
          onClick={() => setThrashing(false)}
          disabled={!thrashing}
        >
          Stop
        </button>
      </div>
    </DemoCard>
  );
}
