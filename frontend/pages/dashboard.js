import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(res => {
      setProjects(res.data.projects || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: projects.length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
  };

  const avgProgress = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projects.length)
    : 0;

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">Here's an overview of your projects.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: stats.total, sub: 'All projects', color: 'border-blue-200 bg-blue-50' },
            { label: 'In Progress', value: stats.in_progress, sub: 'Active now', color: 'border-blue-200 bg-blue-50' },
            { label: 'Completed', value: stats.completed, sub: 'Finished', color: 'border-green-200 bg-green-50' },
            { label: 'Avg Progress', value: `${avgProgress}%`, sub: 'Overall', color: 'border-purple-200 bg-purple-50' },
          ].map((stat) => (
            <div key={stat.label} className={`card p-5 border-2 ${stat.color}`}>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <a href="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">No projects yet</p>
              {user?.role === 'admin' && (
                <a href="/projects" className="text-blue-600 text-sm hover:underline mt-1 block">
                  Create your first project →
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
