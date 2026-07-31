import React, { useState } from 'react';
import { Kanban, Plus } from 'lucide-react';
import { TASKS } from '../../data/simulationData';
import type { Task } from '../../data/simulationData';

export const TasksKanbanApp: React.FC = () => {
  const [taskList] = useState<Task[]>(TASKS);

  const columns: Task['status'][] = ['Backlog', 'In Progress', 'Blocked', 'Completed'];

  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Kanban Header */}
      <div className="h-12 bg-slate-900/80 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Kanban className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white">Linear Kanban Sprint Board — Sprint 1</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 overflow-x-auto p-6 flex space-x-6">
        {columns.map((colStatus) => {
          const colTasks = taskList.filter((t) => t.status === colStatus);
          return (
            <div key={colStatus} className="w-72 sm:w-80 bg-slate-950/60 rounded-2xl border border-white/10 p-4 flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    colStatus === 'Completed' ? 'bg-emerald-400' :
                    colStatus === 'Blocked' ? 'bg-red-500' :
                    colStatus === 'In Progress' ? 'bg-blue-400' : 'bg-slate-500'
                  }`} />
                  <span>{colStatus}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300 font-mono">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-white/10 hover:border-blue-500/50 transition-all shadow-md group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400">{task.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        task.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
                        task.priority === 'High' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-2 leading-snug group-hover:text-blue-300 transition-colors">
                      {task.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-normal mb-3">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <img src={task.assigneeAvatar} alt={task.assignee} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate max-w-[90px]">{task.assignee}</span>
                      </div>
                      <span className="text-slate-500 font-mono">{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
