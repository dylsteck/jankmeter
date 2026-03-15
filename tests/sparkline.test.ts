import { describe, it, expect } from 'bun:test';
import { renderSparkline, renderBarChart } from '../src/core/sparkline';

describe('renderSparkline', () => {
  it('should return an SVG string', () => {
    const svg = renderSparkline([10, 20, 30, 40, 50]);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('<polyline');
  });

  it('should handle empty data with a flat line', () => {
    const svg = renderSparkline([]);
    expect(svg).toContain('<svg');
    expect(svg).toContain('<line');
  });

  it('should handle single data point with a flat line', () => {
    const svg = renderSparkline([42]);
    expect(svg).toContain('<svg');
    expect(svg).toContain('<line');
  });

  it('should apply custom color', () => {
    const svg = renderSparkline([1, 2, 3], { color: '#ff0000' });
    expect(svg).toContain('#ff0000');
  });

  it('should apply custom dimensions', () => {
    const svg = renderSparkline([1, 2, 3], { width: 100, height: 32 });
    expect(svg).toContain('width="100"');
    expect(svg).toContain('height="32"');
  });

  it('should handle identical values', () => {
    const svg = renderSparkline([5, 5, 5, 5]);
    expect(svg).toContain('<polyline');
  });
});

describe('renderBarChart', () => {
  it('should return an SVG string with rects', () => {
    const svg = renderBarChart([10, 20, 30]);
    expect(svg).toContain('<svg');
    expect(svg).toContain('<rect');
  });

  it('should handle empty data', () => {
    const svg = renderBarChart([]);
    expect(svg).toContain('<svg');
    expect(svg).not.toContain('<rect');
  });

  it('should apply custom color', () => {
    const svg = renderBarChart([1, 2], { color: '#00ff00' });
    expect(svg).toContain('#00ff00');
  });
});
