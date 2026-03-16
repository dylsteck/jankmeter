import { useState, useCallback } from 'preact/hooks';
import { DemoCard } from './DemoCard';

let cache: unknown[] = [];

const buttonStyle: Record<string, string | number> = {
  padding: '8px 16px',
  fontSize: '14px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: '#e4e4e7',
  cursor: 'pointer',
  marginRight: '8px',
  marginBottom: '8px',
};

export function MemoryPressure() {
  const [domNodes, setDomNodes] = useState<HTMLDivElement[]>([]);

  const allocate20 = useCallback(() => {
    cache.push(new Array(2_500_000).fill(0));
  }, []);

  const allocate50 = useCallback(() => {
    cache.push(new Array(6_250_000).fill(0));
  }, []);

  const createDomNodes = useCallback(() => {
    const nodes: HTMLDivElement[] = [];
    for (let i = 0; i < 5000; i++) {
      const div = document.createElement('div');
      div.textContent = '.';
      div.style.cssText = 'position: absolute; left: -9999px;';
      document.body.appendChild(div);
      nodes.push(div);
    }
    setDomNodes((prev) => [...prev, ...nodes]);
  }, []);

  const clear = useCallback(() => {
    cache = [];
    for (const node of domNodes) {
      if (node.parentNode) node.parentNode.removeChild(node);
    }
    setDomNodes([]);
  }, [domNodes]);

  return (
    <DemoCard
      title="Memory Pressure"
      metrics={['Memory']}
      watchFor="Memory (usedMB) increases; may take a few seconds or a GC cycle."
    >
      <p style={{ fontSize: '12px', color: 'rgba(161, 161, 170, 0.6)', marginBottom: '12px' }}>
        Chrome only — Memory uses performance.memory.
      </p>
      <div>
        <button style={buttonStyle} onClick={allocate20}>Allocate 20MB</button>
        <button style={buttonStyle} onClick={allocate50}>Allocate 50MB</button>
        <button style={buttonStyle} onClick={createDomNodes}>Create 5000 DOM nodes</button>
        <button style={{ ...buttonStyle, marginRight: 0 }} onClick={clear}>Clear</button>
      </div>
    </DemoCard>
  );
}
