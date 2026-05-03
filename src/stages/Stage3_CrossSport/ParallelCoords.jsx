import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const SPORT_COLORS = { football: '#F59E0B', chess: '#14B8A6', boxing: '#EF4444' };

const AXES = [
  { key: 'dominance_score', label: 'Dominance' },
  { key: 'championship_rate', label: 'Championship' },
  { key: 'longevity_index', label: 'Longevity' },
  { key: 'accolade_density', label: 'Accolades' },
  { key: 'opposition_quality', label: 'Opposition' },
  { key: 'peak_performance_index', label: 'Peak Perf.' },
  { key: 'consistency_rating', label: 'Consistency' },
  { key: 'pressure_performance', label: 'Pressure' },
];

function reorderByX(order, draggedKey, dropX, xScale) {
  const withoutDragged = order.filter((k) => k !== draggedKey);
  let insertIndex = withoutDragged.length;

  for (let i = 0; i < withoutDragged.length; i += 1) {
    if (dropX < xScale(withoutDragged[i])) {
      insertIndex = i;
      break;
    }
  }

  const next = [...withoutDragged];
  next.splice(insertIndex, 0, draggedKey);
  return next;
}

function buildXScale(order, width) {
  return d3.scalePoint().domain(order).range([0, width]).padding(0.1);
}

export default function ParallelCoords({ athletes, highlightedId, setHighlightedId }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(700);
  const [brushFilters, setBrushFilters] = useState({});
  const [axisOrder, setAxisOrder] = useState(AXES.map((a) => a.key));
  const [activeSports, setActiveSports] = useState({ football: true, chess: true, boxing: true });
  const [hoveredAthlete, setHoveredAthlete] = useState(null);

  const axesInOrder = axisOrder.map((key) => AXES.find((a) => a.key === key)).filter(Boolean);
  const visibleAthletes = (athletes || []).filter((a) => activeSports[a.sport]);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !visibleAthletes.length || !axesInOrder.length) return;

    const height = 360;
    const margin = { top: 48, right: 32, bottom: 20, left: 32 };
    const W = width - margin.left - margin.right;
    const H = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const axisScale = {};
    axesInOrder.forEach((axis) => {
      axisScale[axis.key] = d3.scaleLinear().domain([0, 1]).range([H, 0]);
    });

    const xScale = buildXScale(axisOrder, W);

    function buildLine(order) {
      const orderScale = buildXScale(order, W);
      return (d) => d3.line()(order.map((axisKey) => [orderScale(axisKey), axisScale[axisKey](d.breakdown?.[axisKey] || 0)]));
    }

    function passesFilter(d) {
      return Object.entries(brushFilters).every(([key, [lo, hi]]) => {
        const val = d.breakdown?.[key] || 0;
        return val >= lo && val <= hi;
      });
    }

    const pathLayer = g.append('g').attr('class', 'paths');
    const axisLayer = g.append('g').attr('class', 'axes');

    const pathSelection = pathLayer.selectAll('path')
      .data(visibleAthletes)
      .enter().append('path')
      .attr('d', buildLine(axisOrder))
      .attr('fill', 'none')
      .attr('stroke', (d) => SPORT_COLORS[d.sport])
      .attr('stroke-width', (d) => d.id === highlightedId ? 2.5 : 1)
      .attr('stroke-opacity', (d) => {
        if (!passesFilter(d)) return 0.03;
        if (highlightedId) return d.id === highlightedId ? 1 : 0.1;
        return 0.55;
      })
      .style('cursor', 'pointer')
      .on('mouseenter', function onEnter(_, d) {
        setHighlightedId(d.id);
        setHoveredAthlete(d);
        d3.select(this).raise().attr('stroke-opacity', 1).attr('stroke-width', 2.5);
      })
      .on('mouseleave', function onLeave() {
        setHighlightedId(null);
        setHoveredAthlete(null);
      });

    const axisGroups = axisLayer.selectAll('.axis-group')
      .data(axesInOrder, (d) => d.key)
      .enter()
      .append('g')
      .attr('class', 'axis-group')
      .attr('transform', (d) => `translate(${xScale(d.key)},0)`);

    axisGroups.each(function drawAxis(axis) {
      const axisG = d3.select(this);

      axisG.call(d3.axisLeft(axisScale[axis.key]).ticks(5).tickFormat(d3.format('.0%')))
        .selectAll('text').style('fill', '#6b7280').style('font-size', '9px');
      axisG.select('.domain').style('stroke', '#4b5563');
      axisG.selectAll('.tick line').style('stroke', '#4b5563');

      axisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9ca3af')
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .style('cursor', 'grab')
        .text(`⋮⋮ ${axis.label}`);

      const brush = d3.brushY()
        .extent([[-12, 0], [12, H]])
        .on('brush end', (event) => {
          if (!event.selection) {
            setBrushFilters((prev) => {
              const next = { ...prev };
              delete next[axis.key];
              return next;
            });
          } else {
            const [y0, y1] = event.selection;
            const lo = axisScale[axis.key].invert(y1);
            const hi = axisScale[axis.key].invert(y0);
            setBrushFilters((prev) => ({ ...prev, [axis.key]: [lo, hi] }));
          }
        });

      axisG.append('g').attr('class', 'brush').call(brush)
        .selectAll('rect')
        .style('fill', '#F59E0B').style('fill-opacity', '0.2')
        .style('stroke', '#F59E0B').style('stroke-width', '0.5');
    });

    function renderLive(order, draggedKey = null, draggedX = null) {
      const liveXScale = buildXScale(order, W);

      pathSelection.attr('d', buildLine(order));

      axisLayer.selectAll('.axis-group').attr('transform', (axis) => {
        if (draggedKey && axis.key === draggedKey && draggedX != null) {
          return `translate(${draggedX},0)`;
        }
        return `translate(${liveXScale(axis.key)},0)`;
      });
    }

    const dragBehavior = d3.drag()
      .on('start', function onStart() {
        d3.select(this).raise();
        d3.select(this).select('.axis-label').attr('fill', '#FBBF24').style('cursor', 'grabbing');
      })
      .on('drag', function onDrag(event, axis) {
        const clampedX = Math.max(0, Math.min(W, event.x));
        const liveOrder = reorderByX(axisOrder, axis.key, clampedX, xScale);
        renderLive(liveOrder, axis.key, clampedX);
      })
      .on('end', function onEnd(event, axis) {
        const clampedX = Math.max(0, Math.min(W, event.x));
        const liveOrder = reorderByX(axisOrder, axis.key, clampedX, xScale);
        setAxisOrder(liveOrder);
      });

    axisGroups.call(dragBehavior);
  }, [visibleAthletes, axesInOrder, axisOrder, highlightedId, brushFilters, width, setHighlightedId]);

  const hasBrush = Object.keys(brushFilters).length > 0;
  const hasSportFilter = Object.values(activeSports).some((v) => !v);

  function toggleSport(sport) {
    setActiveSports((prev) => {
      const next = { ...prev, [sport]: !prev[sport] };
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  }

  return (
    <div ref={containerRef} style={{ backgroundColor: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(SPORT_COLORS).map(([sport, col]) => (
            <button
              key={sport}
              type="button"
              onClick={() => toggleSport(sport)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none',
                border: `1px solid ${activeSports[sport] ? `${col}99` : '#4b5563'}`,
                borderRadius: 999, padding: '4px 10px',
                color: activeSports[sport] ? '#d1d5db' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 20, height: 3, backgroundColor: col, borderRadius: 1, opacity: activeSports[sport] ? 1 : 0.4 }} />
              <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{sport}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hoveredAthlete && (
            <div style={{
              fontSize: 12, color: '#d1d5db', border: '1px solid #4b5563',
              borderRadius: 6, padding: '4px 8px',
            }}>
              {hoveredAthlete.name} ({hoveredAthlete.sport})
            </div>
          )}
          {(hasBrush || hasSportFilter) && (
            <button
              onClick={() => {
                setBrushFilters({});
                setActiveSports({ football: true, chess: true, boxing: true });
              }}
              style={{
                background: 'none', border: '1px solid #4b5563', borderRadius: 6,
                color: '#9ca3af', padding: '4px 10px', fontSize: 11, cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <p style={{ color: '#4b5563', fontSize: 11, marginBottom: 8 }}>
        Drag on any axis to filter · Hover a line to see athlete · Use chips to filter sports · Drag axis labels (⋮⋮) to reorder
      </p>
      <svg ref={svgRef} style={{ overflow: 'visible' }} />
    </div>
  );
}
