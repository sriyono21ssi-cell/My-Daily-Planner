import React, { useMemo } from 'react';
import { Task, SummaryData } from '../types';
import PieChart from './charts/PieChart';
import BarChart from './charts/BarChart';
import { SparkIcon } from './icons/SparkIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { generateAiAnalysis } from '../services/geminiService';

interface DashboardProps {
  allTasks: Record<string, Task[]>;
  range: 'kemarin' | 'today' | 'week' | 'month';
  setRange: (range: 'kemarin' | 'today' | 'week' | 'month') => void;
  summary: SummaryData | null;
  setSummary: (summary: SummaryData | null) => void;
  aiAnalysis: string;
  setAiAnalysis: (analysis: string) => void;
  isGeneratingAI: boolean;
  setIsGeneratingAI: (isGenerating: boolean) => void;
}

const getJakartaCurrentDate = (): Date => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
  const jakartaDateString = formatter.format(now);
  return new Date(`${jakartaDateString}T00:00:00Z`);
};

const Dashboard: React.FC<DashboardProps> = ({ 
    allTasks, range, setRange, summary, setSummary,
    aiAnalysis, setAiAnalysis, isGeneratingAI, setIsGeneratingAI 
}) => {

  const getTasksForRange = (selectedRange: 'kemarin' | 'today' | 'week' | 'month'): Task[] => {
    const today = getJakartaCurrentDate();
    const tasksInRange: Task[] = [];

    let startDate: Date;
    let endDate: Date;

    switch (selectedRange) {
        case 'kemarin':
            startDate = new Date(today);
            startDate.setUTCDate(today.getUTCDate() - 1);
            endDate = new Date(startDate);
            break;
        case 'today':
            startDate = today;
            endDate = today;
            break;
        case 'week': // Last 7 days
            endDate = new Date(today);
            startDate = new Date(today);
            startDate.setUTCDate(today.getUTCDate() - 6);
            break;
        case 'month':
            startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
            endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
            break;
    }

    Object.keys(allTasks).forEach(dateKey => {
      // dateKey is in YYYY-MM-DD format, which is correctly interpreted as UTC midnight
      const taskDate = new Date(`${dateKey}T00:00:00Z`);
      if (taskDate >= startDate && taskDate <= endDate) {
        tasksInRange.push(...allTasks[dateKey]);
      }
    });
    return tasksInRange;
  };

  const handleGenerateSummary = () => {
    const tasks = getTasksForRange(range);
    const done = tasks.filter(t => t.completed).length;
    const totalPlanning = tasks.reduce((sum, t) => sum + t.planningTime, 0);
    const totalActual = tasks.reduce((sum, t) => sum + t.actualTime, 0);
    const totalActualDone = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.actualTime, 0);

    setSummary({
      tasks,
      total: tasks.length,
      done,
      pending: tasks.length - done,
      totalPlanning,
      totalActual,
      totalActualDone,
    });
    setAiAnalysis(''); // Reset AI analysis
  };
  
  const handleGenerateAI = async () => {
    if (!summary) {
        alert("Silakan hasilkan ringkasan terlebih dahulu.");
        return;
    }

    setIsGeneratingAI(true);
    setAiAnalysis('');
    
    try {
        const analysisText = await generateAiAnalysis(summary, range);
        setAiAnalysis(analysisText);
    } catch(error) {
        console.error("AI Analysis Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Gagal menghasilkan analisis. Silakan coba lagi.";
        setAiAnalysis(errorMessage);
    } finally {
        setIsGeneratingAI(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;

    const selisihWaktu = summary.totalPlanning - summary.totalActual;
    const pendingTasks = summary.tasks.filter(task => !task.completed);

    let content = `Ringkasan Kinerja - Rentang: ${range}\n`;
    content += `==============================================\n\n`;
    
    content += `STATUS TUGAS\n`;
    content += `- jumlah task: ${summary.total}\n`;
    content += `- total selesai: ${summary.done}\n`;
    content += `- total tertunda: ${summary.pending}\n\n`;

    content += `TUGAS YANG TERTUNDA:\n`;
    if (pendingTasks.length > 0) {
        pendingTasks.forEach((task) => {
            content += `- ${task.text}\n`;
        });
    } else {
        content += `(Tidak ada tugas yang tertunda)\n`;
    }
    content += `\n`;

    content += `KINERJA WAKTU\n`;
    content += `- Total planning time: ${summary.totalPlanning.toFixed(1)} jam\n`;
    content += `- Total actual time: ${summary.totalActual.toFixed(1)} jam\n`;
    content += `- Selisih plan vs actual: ${selisihWaktu.toFixed(1)} jam\n`;

    if (aiAnalysis && aiAnalysis.trim() && !aiAnalysis.startsWith("Gagal")) {
        content += `\n\n`;
        content += `ANALISA & SARAN DARI AI\n`;
        content += `==============================================\n`;
        content += `${aiAnalysis.trim()}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ringkasan-Kegiatan-${range}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pieChartData = useMemo(() => {
    if (!summary) return [];
    
    const completedTasks = summary.tasks.filter(t => t.completed && t.actualTime > 0);
    const totalActualCompleted = completedTasks.reduce((sum, t) => sum + t.actualTime, 0);
    
    if (totalActualCompleted === 0) return [];

    const colors = ['#eab308', '#22c55e', '#ef4444', '#3b82f6', '#a855f7', '#ec4899', '#f97316', '#6b7280'];
    
    return completedTasks.map((task, index) => ({
      label: task.text,
      value: task.actualTime,
      color: colors[index % colors.length],
    }));
  }, [summary]);

  const pendingTasks = useMemo(() => {
    return summary ? summary.tasks.filter(task => !task.completed) : [];
  }, [summary]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
      <p className="text-slate-500 mb-6">Ringkasan kegiatan Anda</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        <select 
          value={range} 
          onChange={(e) => setRange(e.target.value as 'kemarin' | 'today' | 'week' | 'month')}
          className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="kemarin">Kemarin</option>
          <option value="today">Hari ini</option>
          <option value="week">7 Hari Terakhir</option>
          <option value="month">Bulan ini</option>
        </select>
        <button 
          onClick={handleGenerateSummary}
          className="w-full sm:w-auto px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-colors"
        >
          Hasilkan Ringkasan
        </button>
        {summary && (
            <button
                onClick={handleDownload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-slate-800 transition-colors"
                aria-label="Download summary as text file"
              >
                <DocumentTextIcon className="w-4 h-4"/>
                <span>Download (.txt)</span>
              </button>
        )}
      </div>
      
      {summary && (
        <div className="space-y-8 animate-fade-in">
            {/* --- Key Metrics --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tugas</h3>
                    <p className="text-3xl font-bold">{summary.total}</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Selesai</h3>
                    <p className="text-3xl font-bold text-green-500">{summary.done}</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tertunda</h3>
                    <p className="text-3xl font-bold text-amber-500">{summary.pending}</p>
                </div>
            </div>
            
            {pendingTasks.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-2">Tugas Tertunda:</h3>
                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {pendingTasks.map(task => (
                            <li key={task.id} className="text-sm p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md text-amber-800 dark:text-amber-300">
                                {task.text}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {summary.total > 0 ? (
            <>
            {/* --- Charts --- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <h3 className="font-semibold mb-2">Distribusi Waktu Tugas Selesai (jam)</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg h-64 flex items-center justify-center">
                        <PieChart data={pieChartData} />
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <h3 className="font-semibold mb-2">Perbandingan Waktu (jam)</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg h-64">
                       <BarChart data={summary.tasks.map(t => ({ label: t.text, plan: t.planningTime, actual: t.actualTime }))} />
                    </div>
                </div>
            </div>

            {/* --- AI Analysis --- */}
            <div>
                <div className="flex flex-col sm:flex-row justify-start items-center gap-4">
                    <button 
                        onClick={handleGenerateAI}
                        disabled={isGeneratingAI}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                       <SparkIcon className="w-5 h-5" />
                       {isGeneratingAI ? 'Menganalisis...' : 'Analisa dan Saran AI'}
                    </button>
                </div>

                {isGeneratingAI && <div className="mt-4 text-center text-slate-500">Memproses data dengan Gemini...</div>}
                
                {aiAnalysis && (
                    <div className="mt-4 animate-fade-in">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Hasil Analisis AI</h4>
                        <div className="p-4 bg-indigo-50 dark:bg-slate-900/50 rounded-lg whitespace-pre-wrap font-mono text-sm leading-relaxed">
                            {aiAnalysis}
                        </div>
                    </div>
                )}
            </div>
            </>
            ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-slate-500">Tidak ada data tugas untuk ditampilkan pada rentang ini.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;