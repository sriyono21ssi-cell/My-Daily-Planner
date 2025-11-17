import React, { useMemo } from 'react';
import { Task } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Record<string, Task[]>;
  displayDate: Date;
  onDisplayDateChange: (date: Date) => void;
  today: Date;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, tasks, displayDate, onDisplayDateChange, today }) => {
  // This function must be identical to the one in App.tsx to ensure key consistency
  const formatDateKey = (date: Date): string => date.toISOString().split('T')[0];

  const daysInMonth = useMemo(() => {
    const year = displayDate.getUTCFullYear();
    const month = displayDate.getUTCMonth();
    const days = [];
    // Use UTC date to avoid timezone shifts from local browser time
    let date = new Date(Date.UTC(year, month, 1));
    while (date.getUTCMonth() === month) {
      days.push(new Date(date));
      date.setUTCDate(date.getUTCDate() + 1);
    }
    return days;
  }, [displayDate]);

  const firstDayOfMonth = useMemo(() => {
    const date = new Date(Date.UTC(displayDate.getUTCFullYear(), displayDate.getUTCMonth(), 1));
    return date.getUTCDay(); // getUTCDay() is correct for UTC dates (Sun=0, Mon=1...)
  }, [displayDate]);

  const changeMonth = (offset: number) => {
    const newDisplayDate = new Date(Date.UTC(displayDate.getUTCFullYear(), displayDate.getUTCMonth() + offset, 1));
    onDisplayDateChange(newDisplayDate);
  };
  
  const todayKey = formatDateKey(today);
  const selectedDateKey = formatDateKey(selectedDate);
  
  const weekDays = useMemo(() => {
    const days = [];
    // Start from a known Sunday to ensure the week order matches the layout (Sun-Sat)
    const date = new Date(Date.UTC(2021, 0, 3)); 
    for (let i = 0; i < 7; i++) {
        days.push(date.toLocaleString('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' }));
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return days;
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">&lt;</button>
        <h2 className="font-semibold text-lg">{displayDate.toLocaleString('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm text-slate-500">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-2">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        {daysInMonth.map(day => {
          const dayKey = formatDateKey(day);
          const isToday = dayKey === todayKey;
          const isSelected = dayKey === selectedDateKey;
          const hasTasks = tasks[dayKey] && tasks[dayKey].length > 0;

          return (
            <button
              key={day.toString()}
              onClick={() => onDateChange(day)}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${isSelected ? 'bg-indigo-500 text-white' : ''}
                ${!isSelected && isToday ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200' : ''}
                ${!isSelected && !isToday ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : ''}
              `}
            >
              {day.getUTCDate()}
              {hasTasks && <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
