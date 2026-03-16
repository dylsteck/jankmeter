import { useState, useCallback } from 'preact/hooks';
import { DemoCard } from './DemoCard';

const inputStyle: Record<string, string | number> = {
  padding: '8px 12px',
  fontSize: '14px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: '#e4e4e7',
  width: '200px',
  marginRight: '12px',
};

const labelStyle: Record<string, string | number> = {
  fontSize: '13px',
  color: 'rgba(161, 161, 170, 0.8)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '8px',
};

export function BlockingInput() {
  const [value, setValue] = useState('');
  const [heavyValidation, setHeavyValidation] = useState(false);

  const handleInput = useCallback(
    (e: Event) => {
      const target = e.target as HTMLInputElement;
      const newValue = target.value;
      if (heavyValidation) {
        const start = performance.now();
        while (performance.now() - start < 200) {
          // Block for 200ms before updating
        }
      }
      setValue(newValue);
    },
    [heavyValidation]
  );

  return (
    <DemoCard
      title="Blocking Input"
      metrics={['Delay']}
      watchFor="Delay spikes when typing with heavy validation on."
    >
      <div>
        <input
          type="text"
          style={inputStyle}
          value={value}
          onInput={handleInput}
          placeholder="Type here..."
        />
      </div>
      <label style={labelStyle}>
        <input
          type="checkbox"
          checked={heavyValidation}
          onChange={(e) => setHeavyValidation((e.target as HTMLInputElement).checked)}
        />
        Heavy validation
      </label>
    </DemoCard>
  );
}
