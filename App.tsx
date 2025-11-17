import React, { useState, useMemo } from 'react';
import Calendar from './components/Calendar';
import TodoList from './components/TodoList';
import Header from './components/Header';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Task, SummaryData } from './types';
import Dashboard from './components/Dashboard';

const getJakartaCurrentDate = (): Date => {
  const now = new Date();
  // Use a reliable format (en-CA is YYYY-MM-DD) to get date parts for the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
  const jakartaDateString = formatter.format(now);
  // Create a new Date object in UTC from this string.
  // Appending 'T00:00:00Z' ensures it's interpreted as midnight UTC,
  // preventing any local browser timezone offset from affecting the date.
  return new Date(`${jakartaDateString}T00:00:00Z`);
};

// This function works correctly because all Date objects used in the app
// are now created as UTC dates (e.g., via getJakartaCurrentDate or new Date(Date.UTC(...)))
// so toISOString() will reflect the correct date components.
const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const App: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Record<string, Task[]>>('tasks', {});
  const today = getJakartaCurrentDate();
  const [selectedDate, setSelectedDate] = useState(today);
  
  // Initialize displayDate to the first of the month of today's date
  const [displayDate, setDisplayDate] = useState(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const [view, setView] = useState<'planner' | 'dashboard'>('planner');

  // State for Dashboard caching
  const [dashboardRange, setDashboardRange] = useState<'kemarin' | 'today' | 'week' | 'month'>('today');
  const [dashboardSummary, setDashboardSummary] = useState<SummaryData | null>(null);
  const [dashboardAiAnalysis, setDashboardAiAnalysis] = useState<string>('');
  const [isGeneratingAIDashboard, setIsGeneratingAIDashboard] = useState(false);

  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  const tasksForSelectedDate = useMemo(() => {
    return tasks[selectedDateKey] || [];
  }, [tasks, selectedDateKey]);

  const handleAddTask = (taskData: { text: string; planningTime: number; actualTime: number; }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: taskData.text,
      completed: false,
      planningTime: taskData.planningTime,
      actualTime: taskData.actualTime,
    };
    const updatedTasks = {
      ...tasks,
      [selectedDateKey]: [...tasksForSelectedDate, newTask],
    };
    setTasks(updatedTasks);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasksList = tasksForSelectedDate.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    const updatedTasks = {
      ...tasks,
      [selectedDateKey]: updatedTasksList,
    };
    setTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasksList = tasksForSelectedDate.filter(task => task.id !== taskId);
    const updatedTasks = {
      ...tasks,
      [selectedDateKey]: updatedTasksList,
    };
    setTasks(updatedTasks);
  };
  
  const handleImportTasks = (importedTasks: Record<string, Task[]>) => {
    const newTasks = { ...tasks };
    let taskCount = 0;
    for (const dateKey in importedTasks) {
        const existingTasksForDate = newTasks[dateKey] || [];
        const newTasksForDate = importedTasks[dateKey];
        taskCount += newTasksForDate.length;
        // Simple append, could add de-duplication later if needed
        newTasks[dateKey] = [...existingTasksForDate, ...newTasksForDate];
    }
    setTasks(newTasks);
    alert(`${taskCount} tasks imported successfully!`);
  };
  
  const handleNavigate = (newView: 'planner' | 'dashboard') => {
    setView(newView);
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header currentView={view} onNavigate={handleNavigate} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {view === 'planner' ? (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-6">
              <Calendar
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                tasks={tasks}
                displayDate={displayDate}
                onDisplayDateChange={setDisplayDate}
                today={today}
              />
            </div>
            <div className="lg:col-span-2">
              <TodoList
                key={selectedDateKey}
                selectedDate={selectedDate}
                tasks={tasksForSelectedDate}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                allTasks={tasks}
                displayDate={displayDate}
                onImportTasks={handleImportTasks}
              />
            </div>
          </div>
        ) : (
          <Dashboard 
            allTasks={tasks}
            range={dashboardRange}
            setRange={setDashboardRange}
            summary={dashboardSummary}
            setSummary={setDashboardSummary}
            aiAnalysis={dashboardAiAnalysis}
            setAiAnalysis={setDashboardAiAnalysis}
            isGeneratingAI={isGeneratingAIDashboard}
            setIsGeneratingAI={setIsGeneratingAIDashboard}
          />
        )}
      </main>
      <footer className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">
        ©2025 by sriyono iono | @otomatiscuan
      </footer>
    </div>
  );
};

export default App;
