import React, { useState } from 'react';
import {useNavigate} from 'react-router';
import { useAuth } from './hook/useAuth';
import {useSelector} from 'react-redux';
import {Navigate} from 'react-router';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.auth.loading);

  const { handlelogin } = useAuth();

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(`Logging in with ${form.email}`);
    console.log('Login submit', {
      email: form.email,
      password: form.password,
    });

    await handlelogin(form);
    navigate('/');
  };

  if(!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative isolate overflow-hidden bg-slate-950 px-6 py-16 sm:px-16 lg:px-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300/90">Secure flow</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Sign in to your account.
            </h1>
            <p className="text-base leading-8 text-slate-400">
              Enter your email and password to continue.
            </p>
          </div>

          <section className="w-full max-w-2xl rounded-4xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_30px_80px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300/90">Login</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Sign in to your account</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Enter your email and password to continue.</p>
              <p className="mt-4 text-sm text-slate-400">
                New here?{' '}
                <a href="/register" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
                  Create an account
                </a>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-3xl bg-linear-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-cyan-500/40"
              >
                Login
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Login;