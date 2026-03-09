import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState(null); // null | 'client' | 'admin'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', adminCode: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'admin') payload.adminCode = form.adminCode;

      await api.post('/auth/register', payload);
      toast.success('Account created! Please sign in.');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">PT</div>
          <h1 className="text-2xl font-bold text-white">ProjexTracker</h1>
          <p className="text-blue-200 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Role selection */}
          {!role ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">Join as</h2>
              <p className="text-sm text-gray-500 text-center mb-6">Choose how you want to use ProjexTrack</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole('client')}
                  className="flex flex-col items-center gap-2 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-5 transition-all"
                >
                  <span className="text-3xl">👤</span>
                  <span className="font-semibold text-gray-800">Client</span>
                  <span className="text-xs text-gray-400 text-center">Track your projects and documents</span>
                </button>
                <button
                  onClick={() => setRole('admin')}
                  className="flex flex-col items-center gap-2 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-5 transition-all"
                >
                  <span className="text-3xl">🛠️</span>
                  <span className="font-semibold text-gray-800">Admin</span>
                  <span className="text-xs text-gray-400 text-center">Manage projects, tasks & clients</span>
                </button>
              </div>
              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/" className="text-blue-600 font-medium hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setRole(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  ←
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Sign up as {role === 'admin' ? 'Admin' : 'Client'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Full name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="label">Confirm password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>

                {role === 'admin' && (
                  <div>
                    <label className="label">Admin access code</label>
                    <input
                      type="password"
                      required
                      value={form.adminCode}
                      onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
                      className="input"
                      placeholder="Enter your admin code"
                    />
                    <p className="text-xs text-gray-400 mt-1">Contact your system administrator for this code.</p>
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 mt-2">
                  {submitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/" className="text-blue-600 font-medium hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
