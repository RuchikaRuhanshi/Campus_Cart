import { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/user/login", form);
      // handle different response shapes
      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data || res.data?.data?.user;
      if (!token) {
        // fallback: if backend returned just success and token in res.data
        throw new Error('Missing auth token');
      }
      login(user, token);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      alert(msg);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      
      {/* Real Campus Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format" 
              alt="Campus backdrop" 
              className="w-full h-full object-cover opacity-45 dark:opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/70 to-[var(--bg-primary)] dark:from-black/45 dark:via-black/75 dark:to-[var(--bg-primary)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 md:p-10 glass-panel rounded-[32px] overflow-hidden animate-float-soft shadow-lg">
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-r from-[var(--accent)]/10 to-transparent blur-3xl" />
        <form onSubmit={submit} className="relative space-y-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent-secondary)] mb-3">CampusCart</p>
            <h1 className="text-4xl font-heading font-extrabold text-text-primary dark:text-white">Welcome back.</h1>
            <p className="mt-3 text-sm text-text-secondary max-w-sm mx-auto">Sign in to your campus marketplace and manage deals, messages, and listings.</p>
          </div>

          <div className="space-y-4">
            <input
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-sassy w-full"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-sassy w-full"
              required
            />
          </div>

          <button type="submit" className="w-full btn-sassy">Login</button>

          <p className="text-center text-sm text-text-secondary">
            New here? <a href="/register" className="font-bold text-[var(--accent-secondary)]">Create an account</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
 