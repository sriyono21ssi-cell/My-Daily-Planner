import React, { useState, useRef, useMemo } from 'react';
import { Task } from '../types';
import TodoItem from './TodoItem';
import { PlusIcon } from './icons/PlusIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';

// Add a declaration for the global XLSX object provided by the script tag
declare const XLSX: any;

interface TodoListProps {
  selectedDate: Date;
  tasks: Task[];
  onAddTask: (taskData: { text: string; planningTime: number; actualTime: number; }) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  allTasks: Record<string, Task[]>;
  displayDate: Date;
  onImportTasks: (tasks: Record<string, Task[]>) => void;
}

const TodoList: React.FC<TodoListProps> = ({ selectedDate, tasks, onAddTask, onUpdateTask, onDeleteTask, allTasks, displayDate, onImportTasks }) => {
  const [newTask, setNewTask] = useState({ text: '', planningTime: ''});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.text.trim()) {
      onAddTask({
        text: newTask.text.trim(),
        planningTime: parseFloat(newTask.planningTime) || 0,
        actualTime: 0
      });
      setNewTask({ text: '', planningTime: ''});
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            const importedTasks: Record<string, Task[]> = {};

            json.forEach(row => {
                const dateStr = row['Tanggal'];
                const text = row['Tugas'];
                const status = row['Status'];
                const planningTime = row['Planning Time (jam)'];
                const actualTime = row['Actual Time (jam)'];
                const resultLink = row['Link Hasil Tugas'];

                const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                if (dateStr && text && dateRegex.test(String(dateStr))) {
                    const [day, month, year] = String(dateStr).split('/');
                    const dateKey = `${year}-${month}-${day}`;
                    
                    const newTask: Task = {
                        id: crypto.randomUUID(),
                        text: String(text),
                        completed: String(status).trim().toLowerCase() === 'selesai',
                        planningTime: parseFloat(String(planningTime)) || 0,
                        actualTime: parseFloat(String(actualTime)) || 0,
                        resultLink: resultLink ? String(resultLink) : undefined,
                    };
                    
                    if (!importedTasks[dateKey]) {
                        importedTasks[dateKey] = [];
                    }
                    importedTasks[dateKey].push(newTask);
                }
            });

            if (Object.keys(importedTasks).length > 0) {
                onImportTasks(importedTasks);
            } else {
                alert("No valid tasks found in the file. Please check the format.\nRequired columns: 'Tanggal', 'Tugas', 'Status', 'Planning Time (jam)', 'Actual Time (jam)', 'Link Hasil Tugas'.\n'Tanggal' must be in DD/MM/YYYY format.");
            }

        } catch (error) {
            console.error("Error parsing XLSX file:", error);
            alert("Failed to import tasks. The file might be corrupted or in an incorrect format.");
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadXLS = () => {
    const year = displayDate.getUTCFullYear();
    const month = displayDate.getUTCMonth();
    // Format month name using UTC to be consistent with the date object
    const monthString = displayDate.toLocaleString('id-ID', { month: 'long', timeZone: 'UTC' });
    
    const tasksToExport = Object.keys(allTasks)
      .filter(dateKey => {
        // Parse the dateKey string as a UTC date
        const taskDate = new Date(dateKey + 'T00:00:00Z');
        // Compare using UTC methods
        return taskDate.getUTCFullYear() === year && taskDate.getUTCMonth() === month;
      })
      .sort()
      .flatMap(dateKey => {
        const tasksOnDate = allTasks[dateKey];
        const [year, month, day] = dateKey.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        return tasksOnDate.map(task => ({
          'Tanggal': formattedDate,
          'Tugas': task.text,
          'Planning Time (jam)': task.planningTime,
          'Actual Time (jam)': task.actualTime,
          'Status': task.completed ? 'Selesai' : 'Belum Selesai',
          'Link Hasil Tugas': task.resultLink || '',
        }));
      });

    if (tasksToExport.length === 0) {
      alert(`Tidak ada tugas untuk diunduh pada bulan ${monthString} ${year}.`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(tasksToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Tugas ${monthString}`);
    
    const objectMaxLength = tasksToExport.reduce((acc, task) => {
        const len = task['Tugas'] ? task['Tugas'].length : 0;
        return len > acc ? len : acc;
    }, 0);
    worksheet["!cols"] = [ 
      { wch: 12 }, 
      { wch: Math.max(objectMaxLength + 5, 20) }, 
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
    ];

    XLSX.writeFile(workbook, `My-Daily-Planner-Tasks.xlsx`);
  };
  
  const { totalPlanningTime, totalActualTime } = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc.totalPlanningTime += task.planningTime;
      acc.totalActualTime += task.actualTime;
      return acc;
    }, { totalPlanningTime: 0, totalActualTime: 0 });
  }, [tasks]);
  
  const progress = totalPlanningTime > 0 ? Math.min(100, (totalActualTime / totalPlanningTime) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' })}
          </h2>
          <p className="text-slate-500">
            {selectedDate.toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Jakarta' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" style={{ display: 'none' }} />
            <button
                onClick={handleUploadClick}
                className="p-2 text-slate-500 hover:text-indigo-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Upload tasks from XLS"
            >
                <UploadIcon className="w-6 h-6" />
            </button>
            <button
                onClick={handleDownloadXLS}
                className="p-2 text-slate-500 hover:text-indigo-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Download tasks for the month as XLS"
            >
                <DownloadIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
      
      {tasks.length > 0 && (
          <div className="mb-4">
              <div className="flex justify-between items-center mb-2 text-xs text-slate-600 dark:text-slate-400">
                  <span>Total Direncanakan: <span className="font-semibold">{totalPlanningTime.toFixed(1)} jam</span></span>
                  <span>Total Aktual: <span className="font-semibold">{totalActualTime.toFixed(1)} jam</span></span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
              </div>
          </div>
      )}

      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map(task => (
              <TodoItem
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-slate-500">Belum ada tugas untuk hari ini. Tambahkan di bawah!</p>
          </div>
        )}
      </div>

      <form onSubmit={handleAddTask} className="mt-6 flex flex-col gap-3">
        <input
            name="text"
            type="text"
            value={newTask.text}
            onChange={handleInputChange}
            placeholder="Tambahkan tugas baru..."
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
        />
        <div className="flex items-center gap-3">
            <input
                name="planningTime"
                type="number"
                step="0.1"
                min="0"
                value={newTask.planningTime}
                onChange={handleInputChange}
                placeholder="Planning Time (berapa jam)"
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-transparent rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button type="submit" className="flex-shrink-0 p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800">
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
      </form>
    </div>
  );
};

export default TodoList;