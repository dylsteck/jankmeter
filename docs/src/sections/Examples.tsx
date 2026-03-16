import { MainThreadBlock } from '../demos/MainThreadBlock';
import { CanvasParticleStorm } from '../demos/CanvasParticleStorm';
import { DomThrashing } from '../demos/DomThrashing';
import { BlockingInput } from '../demos/BlockingInput';
import { MemoryPressure } from '../demos/MemoryPressure';
import { NetworkFlood } from '../demos/NetworkFlood';
import { StressTest } from '../demos/StressTest';

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
  intro: {
    fontSize: '14px',
    color: 'rgba(161, 161, 170, 0.8)',
    lineHeight: 1.6,
    marginBottom: '32px',
  },
};

export function Examples() {
  return (
    <section id="examples" style={styles.section}>
      <h2 style={styles.heading}>Examples</h2>
      <p style={styles.intro}>
        Use these demos to stress the toolbar and see metrics spike. Watch the bar at the bottom as you interact.
      </p>
      <MainThreadBlock />
      <CanvasParticleStorm />
      <DomThrashing />
      <BlockingInput />
      <MemoryPressure />
      <NetworkFlood />
      <StressTest />
    </section>
  );
}
