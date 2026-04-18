import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const SPORT_COLORS = { football: '#F59E0B', chess: '#14B8A6', boxing: '#EF4444' };

const AXES = [
  { key: 'dominance',     label: 'Dominance' },
  { key: 'longevity',     label: 'Longevity' },
  { key: 'accolades',     label: 'Accolades' },
  { key: 'eraDifficulty', label: 'Era Difficulty' },
];

export default function ParallelCoords({ athletes, highlightedId, setHighlightedId }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(700);
  const [brushFilters, setBrushFilters] = useState({});

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !athletes.length) return;

    const height = 360;
    const margin = { top: 48, right: 32, bottom: 20, left: 32 };
    const W = width - margin.left - margin.right;
    const H = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale per axis
    const axisScale = {};
    AXES.forEach(axis => {
      axisScale[axis.key] = d3.scaleLinear()
        .domain([0, 1])
        .range([H, 0]);
    });

    const xScale = d3.scalePoint()
      .domain(AXES.map(a => a.key))
      .range([0, W])
      .padding(0.1);

    // Line function
    function line(d) {
      return d3.line()(AXES.map(axis => [xScale(axis.key), axisScale[axis.key](d.breakdown?.[axis.key] || 0)]));
    }

    // Check if athlete passes all brush filters
    function passesFilter(d) {
      return Object.entries(brushFilters).every(([key, [lo, hi]]) => {
        const val = d.breakdown?.[key] || 0;
        return val >= lo && val <= hi;
      });
    }

    // Draw paths
    const paths = g.append('g').attr('class', 'paths');
    paths.selectAll('path')
      .data(athletes)
      .enter().append('path')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', d => SPORT_COLORS[d.sport])
      .attr('stroke-width', d => d.id === highlightedId ? 2.5 : 1)
      .attr('stroke-opacity', d => {
        if (!passesFilter(d)) return 0.03;
        if (highlightedId) return d.id === highlightedId ? 1 : 0.1;
        return 0.55;
      })
      .style('cursor', 'pointer')
      .on('mouseenter', function (_, d) {
        setHighlightedId(d.id);
        d3.select(this).raise().attr('stroke-opacity', 1).attr('stroke-width', 2.5);
      })
      .on('mouseleave', function (_, d) {
        setHighlightedId(null);
      });

    // Draw axes
    AXES.forEach(axis => {
      const axisG = g.append('g')
        .attr('transform', `translate(${xScale(axis.key)},0)`);

      axisG.call(d3.axisLeft(axisScale[axis.key]).ticks(5).tickFormat(d3.format('.0%')))
        .selectAll('text').style('fill', '#6b7280').style('font-size', '9px');
      axisG.select('.domain').style('stroke', '#4b5563');
      axisG.selectAll('.tick line').style('stroke', '#4b5563');

      // Axis label
      axisG.append('text')
        .attr('y', -12).attr('text-anchor', 'middle')
        .attr('fill', '#9ca3af').attr('font-size', 12).attr('font-weight', 600)
        .text(axis.label);

      // Brush
      const brush = d3.brushY()
        .extent([[-12, 0], [12, H]])
        .on('brush end', (event) => {
          if (!event.selection) {
            const newFilters = { ...brushFilters };
            delete newFilters[axis.key];
            setBrushFilters(newFilters);
          } else {
            const [y0, y1] = event.selection;
            const lo = axisScale[axis.key].invert(y1);
            const hi = axisScale[axis.key].invert(y0);
            setBrushFilters(prev => ({ ...prev, [axis.key]: [lo, hi] }));
          }
        });

      axisG.append('g').attr('class', 'brush').call(brush)
        .selectAll('rect')
        .style('fill', '#F59E0B').style('fill-opacity', '0.2')
        .style('stroke', '#F59E0B').style('stroke-width', '0.5');
    });

  }, [athletes, highlightedId, brushFilters, width]);

  const hasBrush = Object.keys(brushFilters).length > 0;

  return (
    <div ref={containerRef} style={{ backgroundColor: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {Object.entries(SPORT_COLORS).map(([sport, col]) => (
            <div key={sport} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 3, backgroundColor: col, borderRadius: 1 }} />
              <span style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{sport}</span>
            </div>
          ))}
        </div>
        {hasBrush && (
          <button
            onClick={() => setBrushFilters({})}
            style={{
              background: 'none', border: '1px solid #4b5563', borderRadius: 6,
              color: '#9ca3af', padding: '4px 10px', fontSize: 11, cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        )}
      </div>
      <p style={{ color: '#4b5563', fontSize: 11, marginBottom: 8 }}>
        Drag on any axis to filter athletes · Hover a line to highlight
      </p>
      <svg ref={svgRef} style={{ overflow: 'visible' }} />
    </div>
  );
}
