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
    <div className="min-h-screen bg-[#fbf3ff] dark:bg-[var(--bg-primary)] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md p-10 card-sassy overflow-hidden bg-white dark:bg-[var(--bg-surface)]">
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-r from-[rgba(140,115,72,0.18)] via-[rgba(185,162,112,0.12)] to-[rgba(231,212,174,0.16)] blur-3xl" />
        <div className="relative space-y-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent-secondary)] mb-3">CampusMart</p>
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
            />
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-sassy w-full"
            />
          </div>

          <button className="w-full btn-sassy">Login</button>

          <p className="text-center text-sm text-text-secondary">
            New here? <a href="/register" className="font-bold text-[var(--accent-secondary)]">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
 