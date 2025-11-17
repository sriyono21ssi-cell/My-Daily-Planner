
import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { CheckIcon } from './icons/CheckIcon';

interface TodoItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState({
    text: task.text,
    planningTime: String(task.planningTime || 0),
    actualTime: String(task.actualTime || 0),
  });

  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      textInputRef.current?.focus();
      textInputRef.current?.select();
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (editState.text.trim()) {
      onUpdate({ 
        ...task, 
        text: editState.text.trim(),
        planningTime: parseFloat(editState.planningTime) || 0,
        actualTime: parseFloat(editState.actualTime) || 0,
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditState(prev => ({ ...prev, [name]: value }));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setEditState({
        text: task.text,
        planningTime: String(task.planningTime || 0),
        actualTime: String(task.actualTime || 0),
      });
      setIsEditing(false);
    }
  };

  const toggleComplete = () => {
    // If task is already completed, un-complete it.
    if (task.completed) {
      onUpdate({ ...task, completed: false });
      return;
    }

    // If task is not completed, we are completing it.
    let actualTime = task.actualTime;
    
    // If actualTime is not set (is 0), prompt the user.
    if (actualTime === 0) {
      const newActualTimeStr = prompt("Masukkan waktu aktual (jam) untuk tugas ini:", String(task.planningTime || '1'));
      
      // If user cancels the prompt
      if (newActualTimeStr === null) {
        return; 
      }
      
      const newActualTime = parseFloat(newActualTimeStr);
      
      // Validate input
      if (isNaN(newActualTime) || newActualTime < 0) {
        alert("Input tidak valid. Harap masukkan angka positif.");
        return;
      }
      actualTime = newActualTime;
    }
    
    // Update task to be completed with the actual time.
    onUpdate({ ...task, completed: true, actualTime });
  };
  
  return (
    <li className={`flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg transition-all`}>
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={toggleComplete}
          className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all
            ${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}
          `}
        >
          {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-grow">
          {isEditing ? (
            <input
              ref={textInputRef}
              type="text"
              name="text"
              value={editState.text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent focus:outline-none p-1 -m-1 rounded"
            />
          ) : (
            <span className={`transition-colors ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
              {task.text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing) handleUpdate();
            }}
            className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
            aria-label={isEditing ? 'Save changes' : 'Edit task'}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
            aria-label="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="pl-9 flex gap-2 text-sm">
            <div className="flex-1">
                <label className="text-xs text-slate-400">Planning (jam)</label>
                <input
                    type="number"
                    name="planningTime"
                    step="0.1"
                    min="0"
                    value={editState.planningTime}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none px-2 py-1"
                />
            </div>
             <div className="flex-1">
                <label className="text-xs text-slate-400">Actual (jam)</label>
                <input
                    type="number"
                    name="actualTime"
                    step="0.1"
                    min="0"
                    value={editState.actualTime}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none px-2 py-1"
                />
            </div>
        </div>
      ) : (
        <div className="pl-9">
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              Plan: <strong>{task.planningTime.toFixed(1)}j</strong>
            </span>
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
              Actual: <strong>{task.actualTime.toFixed(1)}j</strong>
            </span>
          </div>
          {task.completed ? (
            <p className="mt-1 text-[11px] text-green-600 dark:text-green-500 italic">
              note: tugas sudah selesai
            </p>
          ) : (
            task.actualTime === 0 && (
              <p className="mt-1 text-[11px] text-slate-500 italic">
                note: input actual time untuk menyelesaikan tugas
              </p>
            )
          )}
        </div>
      )}
    </li>
  );
};

export default TodoItem;