import { useState } from 'react';
import type { OrderStatusCount } from '../types/user.types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Fixed categorical order (never cycled) — slots 1-5 of the validated default palette.
const STATUS_COLOR: Record<string, string> = {
  pending: '#2a78d6', // blue
  confirmed: '#1baf7a', // aqua
  shipped: '#eda100', // yellow
  delivered: '#008300', // green
  cancelled: '#4a3aa7', // violet
};

const CHART_HEIGHT = 200;
const BAR_WIDTH = 24;
const GAP = 40;

function niceMax(max: number): number {
  if (max <= 5) return 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalized = max / magnitude;
  const step = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export default function OrderStatusChart({ data }: { data: OrderStatusCount[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.count, 0);
  const max = niceMax(Math.max(...data.map((d) => d.count), 1));
  const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max];

  const chartWidth = data.length * (BAR_WIDTH + GAP);
  const plotHeight = CHART_HEIGHT;
  const scaleY = (v: number) => (v / max) * plotHeight;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Orders by Status</h2>
      <p className="text-xs text-gray-500 mb-4">{total} orders total</p>

      <div className="relative overflow-x-auto">
        <svg
          width={chartWidth + 50}
          height={plotHeight + 90}
          role="img"
          aria-label="Bar chart of order counts by status"
        >
          <g transform="translate(40, 50)">
            {/* Gridlines */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={0}
                  x2={chartWidth}
                  y1={plotHeight - scaleY(t)}
                  y2={plotHeight - scaleY(t)}
                  stroke="#e1e0d9"
                  strokeWidth={1}
                />
                <text
                  x={-8}
                  y={plotHeight - scaleY(t)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="#898781"
                >
                  {Math.round(t)}
                </text>
              </g>
            ))}
            {/* Baseline */}
            <line x1={0} x2={chartWidth} y1={plotHeight} y2={plotHeight} stroke="#c3c2b7" strokeWidth={1} />

            {/* Bars */}
            {data.map((d, i) => {
              const barHeight = scaleY(d.count);
              const x = i * (BAR_WIDTH + GAP) + GAP / 2;
              const y = plotHeight - barHeight;
              const pct = total ? Math.round((d.count / total) * 100) : 0;
              return (
                <g
                  key={d.status}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Hit area for easier hover */}
                  <rect x={x - 6} y={0} width={BAR_WIDTH + 12} height={plotHeight} fill="transparent" />
                  <rect
                    x={x}
                    y={barHeight > 0 ? y : plotHeight - 1}
                    width={BAR_WIDTH}
                    height={Math.max(barHeight, 1)}
                    rx={4}
                    fill={STATUS_COLOR[d.status] ?? '#898781'}
                    opacity={hovered === null || hovered === i ? 1 : 0.55}
                  />
                  {/* Value at the cap */}
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="#0b0b0b"
                  >
                    {d.count}
                  </text>
                  {/* Category label */}
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={plotHeight + 20}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#52514e"
                  >
                    {STATUS_LABEL[d.status] ?? d.status}
                  </text>

                  {hovered === i && (
                    <g>
                      <rect
                        x={x + BAR_WIDTH / 2 - 46}
                        y={y - 42}
                        width={92}
                        height={28}
                        rx={6}
                        fill="#0b0b0b"
                      />
                      <text
                        x={x + BAR_WIDTH / 2}
                        y={y - 28}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={600}
                        fill="#ffffff"
                      >
                        {d.count} · {pct}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
