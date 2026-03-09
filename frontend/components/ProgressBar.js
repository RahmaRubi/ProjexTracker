export default function ProgressBar({ value = 0, size = 'md', showLabel = true }) {
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5';
  const color = value === 100 ? '#10b981' : value > 50 ? '#3b82f6' : value > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm text-gray-500">Progress</span>
          <span className="text-sm font-semibold text-gray-700">{value}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-700`}
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
