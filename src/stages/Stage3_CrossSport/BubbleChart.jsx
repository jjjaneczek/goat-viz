import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { TAG_COLORS } from '../../components/KeywordSidePanel';
import { keywordScoreFromBreakdown } from '../../utils/keywordScoring';

const SPORT_COLORS = { football: '#F59E0B', chess: '#14B8A6', boxing: '#EF4444' };

export default function BubbleChart({ athletes, selectedTags, bubbleAxes, highlightedId, setHighlightedId }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [width, setWidth] = useState(700);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const tags = (selectedTags || []).filter(Boolean);
    const xTag = bubbleAxes?.x || tags[0];
    const yTag = bubbleAxes?.y || tags[1];

    if (!svgRef.current || !athletes.length || !xTag || !yTag) return;
    const height = 380;
    const margin = { top: 20, right: 20, bottom: 48, left: 52 };
    const W = width - margin.left - margin.right;
    const H = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xVal = (a) => keywordScoreFromBreakdown(a.breakdown || {}, xTag);
    const yVal = (a) => keywordScoreFromBreakdown(a.breakdown || {}, yTag);
    const rVal = (a) => a.overallScore || 0;

    const x = d3.scaleLinear().domain([0, 1]).range([0, W]);
    const y = d3.scaleLinear().domain([0, 1]).range([H, 0]);
    const r = d3.scaleLinear()
      .domain(d3.extent(athletes, rVal))
      .range([5, 22]);

    // Axes
    g.append('g').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.0%')))
      .selectAll('text').style('fill', '#6b7280').style('font-size', '10px');
    g.select('.domain').remove();
    g.selectAll('.tick line').style('stroke', '#2a2a2a');

    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')))
      .selectAll('text').style('fill', '#6b7280').style('font-size', '10px');
    g.select('.domain').remove();

    // Grid lines
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-W).tickFormat(''))
      .selectAll('line').style('stroke', '#1f1f1f').style('stroke-dasharray', '3,3');
    g.selectAll('.grid .domain').remove();

    // Axis labels
    svg.append('text')
      .attr('x', margin.left + W / 2).attr('y', height - 4)
      .attr('text-anchor', 'middle').attr('fill', '#6b7280').attr('font-size', 11)
      .text(xTag);
    svg.append('text')
      .attr('x', -(margin.top + H / 2)).attr('y', 14)
      .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
      .attr('fill', '#6b7280').attr('font-size', 11)
      .text(yTag);

    // Bubbles
    const circles = g.selectAll('circle').data(athletes).enter().append('circle')
      .attr('cx', d => x(xVal(d)))
      .attr('cy', d => y(yVal(d)))
      .attr('r', 0)
      .attr('fill', d => SPORT_COLORS[d.sport])
      .attr('fill-opacity', d => highlightedId ? (d.id === highlightedId ? 0.9 : 0.15) : 0.7)
      .attr('stroke', d => d.id === highlightedId ? '#fff' : SPORT_COLORS[d.sport])
      .attr('stroke-width', d => d.id === highlightedId ? 2 : 0.5)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          athlete: d,
        });
        setHighlightedId(d.id);
      })
      .on('mouseleave', () => {
        setTooltip(null);
        setHighlightedId(null);
      })
      .on('click', (_, d) => setHighlightedId(prev => prev === d.id ? null : d.id));

    circles.transition().duration(600).delay((_, i) => i * 20)
      .attr('r', d => r(rVal(d)));

  }, [athletes, highlightedId, width, selectedTags, bubbleAxes]);

  return (
    <div ref={containerRef} style={{ backgroundColor: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a', padding: 16, position: 'relative' }}>
      {(selectedTags || []).filter(Boolean).length < 3 ? (
        <div style={{ padding: '26px 14px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: 0, fontWeight: 700 }}>
            Select at least 3 keywords to enable this chart
          </p>
          <p style={{ color: '#6b7280', fontSize: 12, margin: '8px 0 0' }}>
            Bubble chart uses the chosen x, y, and size keywords.
          </p>
        </div>
      ) : null}
      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(SPORT_COLORS).map(([sport, col]) => (
          <div key={sport} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: col }} />
            <span style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{sport}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#555', opacity: 0.6 }} />
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            size = overall weighted score
          </span>
        </div>
        {[
          bubbleAxes?.x,
          bubbleAxes?.y,
        ].filter(Boolean).map((t) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: TAG_COLORS[t] || '#9ca3af' }} />
            <span style={{ fontSize: 11, color: TAG_COLORS[t] || '#9ca3af', fontWeight: 700 }}>{t}</span>
          </div>
        ))}
      </div>

      {(selectedTags || []).filter(Boolean).length >= 2 && bubbleAxes?.x && bubbleAxes?.y && (
        <svg ref={svgRef} style={{ overflow: 'visible' }} />
      )}

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 12, top: tooltip.y - 10,
          backgroundColor: '#0f0f0f', border: `1px solid ${SPORT_COLORS[tooltip.athlete.sport]}`,
          borderRadius: 8, padding: '10px 14px', fontSize: 12, pointerEvents: 'none',
          zIndex: 10, minWidth: 160,
        }}>
          <p style={{ color: SPORT_COLORS[tooltip.athlete.sport], fontWeight: 700, margin: '0 0 4px', fontSize: 14 }}>
            {tooltip.athlete.name}
          </p>
          <p style={{ color: '#9ca3af', margin: '0 0 6px', textTransform: 'capitalize' }}>{tooltip.athlete.sport}</p>
          {[
            bubbleAxes?.x,
            bubbleAxes?.y,
          ].filter(Boolean).map((t) => (
            <p key={t} style={{ color: TAG_COLORS[t] || '#9ca3af', margin: '2px 0' }}>
              {t}: {Math.round(keywordScoreFromBreakdown(tooltip.athlete.breakdown || {}, t) * 100)}
            </p>
          ))}
          <p style={{ color: '#9ca3af', margin: '2px 0' }}>
            Overall: {Math.round((tooltip.athlete.overallScore || 0) * 100)}
          </p>
        </div>
      )}
    </div>
  );
}
