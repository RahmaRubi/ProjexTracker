import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ProgressBar from '../../components/ProgressBar';
import TaskCard from '../../components/TaskCard';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusConfig = {
  planning: { label: 'Planning', classes: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', classes: 'bg-blue-100 text-blue-700' },
  on_hold: { label: 'On Hold', classes: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700' },
};

const STATUS_OPTIONS = ['planning', 'in_progress', 'on_hold', 'completed'];

export default function ProjectDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'pending' });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      const [projRes, taskRes, docRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project_id=${id}`),
        api.get(`/documents?project_id=${id}`),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks || []);
      setDocuments(docRes.data.documents || []);
    } catch (err) {
      if (err.response?.status === 404) router.push('/projects');
      else toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/projects/${id}`, editForm);
      toast.success('Project updated!');
      setShowEditModal(false);
      fetchAll();
    } catch {
      toast.error('Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tasks', { ...taskForm, project_id: id });
      toast.success('Task added!');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'pending' });
      fetchAll();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', id);
    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <Layout>
        <div className="p-8 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-64 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-96 mb-8" />
          <div className="card p-6 mb-6 h-40" />
          <div className="card p-6 h-60" />
        </div>
      </Layout>
    );
  }

  if (!project) return null;

  const status = statusConfig[project.status] || statusConfig.planning;
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <Layout>
      <div className="p-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <a href="/projects" className="hover:text-gray-600">Projects</a>
          <span>/</span>
          <span className="text-gray-700 font-medium">{project.project_name}</span>
        </div>

        {/* Project Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{project.project_name}</h1>
                <span className={`badge ${status.classes}`}>{status.label}</span>
              </div>
              {project.description && (
                <p className="text-gray-500 text-sm mb-4">{project.description}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                <div>
                  <p className="text-gray-400 text-xs">Client</p>
                  <p className="font-medium text-gray-700">{project.client_name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Start Date</p>
                  <p className="font-medium text-gray-700">{formatDate(project.start_date)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Expected Completion</p>
                  <p className="font-medium text-gray-700">{formatDate(project.expected_completion)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Tasks</p>
                  <p className="font-medium text-gray-700">{taskStats.completed}/{taskStats.total} done</p>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => { setEditForm({ status: project.status, progress_percentage: project.progress_percentage }); setShowEditModal(true); }}
                className="btn-secondary shrink-0"
              >
                Edit Project
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="mt-6">
            <ProgressBar value={project.progress_percentage || 0} size="lg" />
          </div>
        </div>

        {/* Tasks Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Tasks</h2>
              <p className="text-xs text-gray-400 mt-0.5">{taskStats.completed} of {taskStats.total} completed</p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowTaskModal(true)} className="btn-primary text-xs px-3 py-1.5">
                + Add Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <TaskCard task={task} onUpdate={fetchAll} canEdit={true} />
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task.id)} className="text-gray-300 hover:text-red-400 text-sm px-1 shrink-0">✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Documents</h2>
              <p className="text-xs text-gray-400 mt-0.5">{documents.length} file{documents.length !== 1 ? 's' : ''}</p>
            </div>
            <label className={`btn-primary text-xs px-3 py-1.5 cursor-pointer ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No documents uploaded</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200">
                  <span className="text-lg">
                    {doc.file_name.match(/\.(pdf)$/i) ? '📄' : '🖼️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                    <p className="text-xs text-gray-400">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      download
                    >
                      Download
                    </a>
                    {isAdmin && (
                      <button onClick={() => handleDeleteDoc(doc.id)} className="text-gray-300 hover:text-red-400 text-sm px-1">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Update Project">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="label">Status</label>
            <select className="input" value={editForm.status || 'planning'} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Progress: {editForm.progress_percentage}%</label>
            <input type="range" min={0} max={100} value={editForm.progress_percentage || 0}
              onChange={e => setEditForm({ ...editForm, progress_percentage: Number(e.target.value) })}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setTaskForm({ title: '', description: '', status: 'pending' }); }}
        title="Add Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Optional description" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Adding...' : 'Add Task'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
