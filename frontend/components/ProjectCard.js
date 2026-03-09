import Link from 'next/link';

const statusConfig = {
  planning: { label: 'Planning', classes: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', classes: 'bg-blue-100 text-blue-700' },
  on_hold: { label: 'On Hold', classes: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700' },
};

export default function ProjectCard({ project }) {
  const status = statusConfig[project.status] || statusConfig.planning;
  const progress = project.progress_percentage || 0;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <Link href={`/projects/${project.id}`} className="card block p-5 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{project.project_name}</h3>
        <span className={`badge ml-2 shrink-0 ${status.classes}`}>{status.label}</span>
      </div>

      {project.description && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: progress === 100 ? '#10b981' : progress > 50 ? '#3b82f6' : '#f59e0b',
            }}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Start</p>
          <p className="text-xs font-medium text-gray-600">{formatDate(project.start_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Due</p>
          <p className="text-xs font-medium text-gray-600">{formatDate(project.expected_completion)}</p>
        </div>
      </div>

      {project.client_name && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Client: <span className="text-gray-600 font-medium">{project.client_name}</span></p>
        </div>
      )}
    </Link>
  );
}
