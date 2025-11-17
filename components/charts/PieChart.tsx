import React from 'react';

interface PieChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return <div className="text-center text-slate-400">Tidak ada data tugas selesai.</div>;
  }

  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map(item => {
    const percent = item.value / total;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    const pathData = [
      `M ${startX} ${startY}`, // Move
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
      'L 0 0', // Line to center
    ].join(' ');
    
    return { path: pathData, color: item.color, label: item.label, value: item.value };
  });

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-4">
      <div className="w-36 h-36 flex-shrink-0">
         <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
          {slices.map((slice, index) => (
            <g key={index}>
              <path d={slice.path} fill={slice.color} />
              <title>{`${slice.label}: ${((slice.value / total) * 100).toFixed(1)}%`}</title>
            </g>
          ))}
        </svg>
      </div>
      <div className="text-sm w-full md:w-auto max-h-48 overflow-y-auto">
        <ul className="space-y-1 pr-2">
          {data.map(item => (
            <li key={item.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="truncate" title={`${item.label} (${item.value.toFixed(1)} jam)`}>
                {item.label} ({((item.value/total) * 100).toFixed(0)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PieChart;