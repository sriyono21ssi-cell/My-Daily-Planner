import React from 'react';
import { SparkIcon } from './icons/SparkIcon';

interface HeaderProps {
    currentView: 'planner' | 'dashboard';
    onNavigate: (view: 'planner' | 'dashboard') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const navButtonClasses = (view: 'planner' | 'dashboard') => 
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      currentView === view 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
      : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
    }`;

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SparkIcon className="h-8 w-8 text-indigo-500" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
              My Daily Planner
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
              Rencanakan harimu, capai tujuanmu.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                <button onClick={() => onNavigate('planner')} className={navButtonClasses('planner')}>
                    Planner
                </button>
                <button onClick={() => onNavigate('dashboard')} className={navButtonClasses('dashboard')}>
                    Dashboard
                </button>
            </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;