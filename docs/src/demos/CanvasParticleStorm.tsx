import { useState, useEffect, useRef } from 'preact/hooks';
import { DemoCard } from './DemoCard';

const buttonStyle: Record<string, string | number> = {
  padding: '6px 12px',
  fontSize: '13px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: '#e4e4e7',
  cursor: 'pointer',
  marginRight: '8px',
  marginBottom: '8px',
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function createParticles(count: number, width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    });
  }
  return particles;
}

export function CanvasParticleStorm() {
  const [particleCount, setParticleCount] = useState(500);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let particles = createParticles(particleCount, width, height);
    let rafId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        ctx.fillStyle = '#4ade80';
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [particleCount]);

  return (
    <DemoCard
      title="Canvas Particle Storm"
      metrics={['FPS', 'Jank']}
      watchFor="FPS and Jank degrade as particle count increases."
    >
      <div style={{ marginBottom: '12px' }}>
        <button style={buttonStyle} onClick={() => setParticleCount(500)}>500</button>
        <button style={buttonStyle} onClick={() => setParticleCount(2000)}>2000</button>
        <button style={buttonStyle} onClick={() => setParticleCount(5000)}>5000</button>
        <button style={buttonStyle} onClick={() => setParticleCount((c) => c + 1000)}>Add 1000</button>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{
          display: 'block',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      />
      <p style={{ fontSize: '12px', color: 'rgba(161, 161, 170, 0.6)', marginTop: '8px' }}>
        Particles: {particleCount}
      </p>
    </DemoCard>
  );
}
