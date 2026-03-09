import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ProjectCard from '../../components/ProjectCard';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['planning', 'in_progress', 'on_hold', 'completed'];

const defaultForm = {
  project_name: '',
  description: '',
  status: 'planning',
  progress_percentage: 0,
  start_date: '',
  expected_completion: '',
  client_id: '',
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchProjects = () => {
    api.get('/projects').then(res => setProjects(res.data.projects || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'admin') {
      api.get('/projects/clients').then(res => setClients(res.data.clients || []));
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm(defaultForm);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 text-sm mt-1">{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + New Project
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5 animate-pulse h-48">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-4xl mb-3">🏗️</div>
            <p className="text-gray-500">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(defaultForm); }} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input className="input" required value={form.project_name}
              onChange={e => setForm({ ...form, project_name: e.target.value })}
              placeholder="e.g. Downtown Office Renovation" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Project description..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Progress %</label>
              <input type="number" className="input" min={0} max={100} value={form.progress_percentage}
                onChange={e => setForm({ ...form, progress_percentage: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="label">Expected Completion</label>
              <input type="date" className="input" value={form.expected_completion}
                onChange={e => setForm({ ...form, expected_completion: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Assign Client</label>
            <select className="input" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
              <option value="">— Select client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(defaultForm); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
