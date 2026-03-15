interface SparklineOpts {
  width?: number;
  height?: number;
  color?: string;
}

export function renderSparkline(data: number[], opts: SparklineOpts = {}): string {
  const { width = 60, height = 16, color = '#4ade80' } = opts;

  if (data.length < 2) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="${color}" stroke-opacity="0.3" stroke-width="1"/></svg>`;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padding + ((max - v) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

export function renderBarChart(data: number[], opts: SparklineOpts = {}): string {
  const { width = 60, height = 16, color = '#4ade80' } = opts;

  if (data.length === 0) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"></svg>`;
  }

  const max = Math.max(...data) || 1;
  const barWidth = Math.max(1, width / data.length - 1);
  const gap = 1;

  const bars = data.map((v, i) => {
    const barHeight = Math.max(1, (v / max) * height);
    const x = i * (barWidth + gap);
    const y = height - barHeight;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" fill="${color}" opacity="0.8"/>`;
  }).join('');

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${bars}</svg>`;
}
