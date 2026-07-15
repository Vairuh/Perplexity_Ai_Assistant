import React, { useState } from 'react';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(`Registering ${form.username}`);
    console.log('Register submit', {
      username: form.username,
      email: form.email,
      password: form.password,
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative isolate overflow-hidden bg-slate-950 px-6 py-16 sm:px-16 lg:px-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300/90">Secure flow</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Create your account.
            </h1>
            <p className="text-base leading-8 text-slate-400">
              Register with email, username, and password.
            </p>
          </div>

          <section className="w-full max-w-2xl rounded-4xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_30px_80px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300/90">Register</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Create a new account</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Enter a username, email, and password to get started.</p>
              <p className="mt-4 text-sm text-slate-400">
                Already registered?{' '}
                <a href="/login" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
                  Sign in here
                </a>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-200">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Your username"
                />
              </div>

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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Create a password"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-3xl bg-linear-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-cyan-500/40"
              >
                Register
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Register;
