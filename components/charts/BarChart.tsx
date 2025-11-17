import React from 'react';

interface BarChartProps {
  data: {
    label: string;
    plan: number;
    actual: number;
  }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-slate-400">Tidak ada data untuk ditampilkan.</div>;
  }
  
  const maxValue = Math.max(...data.flatMap(d => [d.plan, d.actual]), 1);
  const barGap = 4;
  const barWidth = 8;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex-grow overflow-x-auto overflow-y-hidden relative">
        <div className="flex h-full items-end" style={{ minWidth: data.length * (barWidth * 2 + barGap * 3) }}>
          {data.map((item, index) => {
            const planHeight = (item.plan / maxValue) * 100;
            const actualHeight = (item.actual / maxValue) * 100;

            return (
              <div key={index} className="flex-grow h-full flex flex-col-reverse items-center group relative pt-4" style={{ gap: `${barGap}px` }}>
                <div className="truncate text-xs text-slate-400 w-full text-center px-1" title={item.label}>
                  {item.label}
                </div>
                <div className="flex items-end h-full" style={{ gap: `${barGap}px` }}>
                  <div 
                      className="bg-yellow-400 dark:bg-yellow-600 rounded-t-sm"
                      style={{ height: `${planHeight}%`, width: `${barWidth}px` }}
                  />
                  <div 
                      className="bg-green-500 dark:bg-green-600 rounded-t-sm"
                      style={{ height: `${actualHeight}%`, width: `${barWidth}px` }}
                  />
                </div>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-xs rounded-md shadow-lg z-10 w-max whitespace-nowrap">
                  <strong className="block truncate max-w-xs">{item.label}</strong>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>Plan: {item.plan.toFixed(1)}j</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span>Actual: {item.actual.toFixed(1)}j</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center justify-center gap-6 pt-3 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Planning Time</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Actual Time</span>
      </div>
    </div>
  );
};

export default BarChart;