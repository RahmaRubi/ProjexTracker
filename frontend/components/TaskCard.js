import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', classes: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', classes: 'bg-blue-100 text-blue-600' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-600' },
};

const nextStatus = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' };

export default function TaskCard({ task, onUpdate, canEdit }) {
  const [updating, setUpdating] = useState(false);
  const status = statusConfig[task.status] || statusConfig.pending;

  const cycleStatus = async () => {
    if (!canEdit) return;
    setUpdating(true);
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus[task.status] });
      onUpdate();
    } catch {
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <button
        onClick={cycleStatus}
        disabled={updating || !canEdit}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          task.status === 'completed'
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-blue-500'
        } ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
        title={canEdit ? `Mark as ${nextStatus[task.status]?.replace('_', ' ')}` : ''}
      >
        {task.status === 'completed' && <span className="text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
        )}
      </div>

      <span className={`badge shrink-0 ${status.classes}`}>{status.label}</span>
    </div>
  );
}
