import { useState } from "react";
import api from "../utils/api.js";;
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import LocationPicker from "../components/LocationPicker";

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    collegeName: "",
    branch: "",
    yearOfStudy: "",
    location: {
        address: "",
        coordinates: { lat: 0, lng: 0 }
    }
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (newLocation) => {
      if (typeof newLocation === 'function') {
          setForm(prev => ({ ...prev, location: newLocation(prev.location) }));
      } else {
          setForm(prev => ({ ...prev, location: newLocation }));
      }
  }

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/user/register", form);
      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data || res.data?.data?.user;
      if (!token) throw new Error('Missing auth token');
      login(user, token);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Registration failed';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-2xl p-10 card-sassy overflow-hidden bg-white dark:bg-[var(--bg-surface)]">
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-r from-[rgba(140,115,72,0.18)] via-[rgba(185,162,112,0.12)] to-[rgba(231,212,174,0.16)] blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] items-start">
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent-secondary)] mb-3">CampusMart</p>
              <h1 className="text-4xl font-heading font-extrabold text-text-primary dark:text-white">Register in minutes.</h1>
              <p className="mt-3 text-sm text-text-secondary max-w-xl mx-auto lg:mx-0">Create your campus account and start buying, selling, and connecting with students nearby.</p>
            </div>

            <div className="rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] p-5 shadow-sm">
              <p className="text-xs uppercase font-semibold tracking-[0.25em] mb-3 text-[var(--accent-secondary)]">Step {step} of 2</p>
              <h2 className="text-xl font-semibold text-text-primary dark:text-white">{step === 1 ? 'Create your profile' : 'Add campus details'}</h2>
              <p className="mt-2 text-sm text-text-secondary">{step === 1 ? 'Start with the basics and secure your account.' : 'Share the details buyers need to trust you.'}</p>
            </div>

            <div className="grid gap-4">
              {step === 1 ? (
                <>
                  <input name="name" placeholder="Enter your full name" value={form.name} onChange={handleChange} className="input-sassy w-full" required />
                  <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} className="input-sassy w-full" required />
                  <input name="mobileNo" placeholder="Enter your phone number" value={form.mobileNo} onChange={handleChange} className="input-sassy w-full" required />
                  <input name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} className="input-sassy w-full" required />
                  <button type="button" onClick={() => setStep(2)} className="w-full btn-sassy">Next</button>
                  <p className="text-center text-sm text-text-secondary">Already have an account? <Link to="/login" className="font-bold text-[var(--accent-secondary)]">Login</Link></p>
                </>
              ) : (
                <>
                  <input name="collegeName" placeholder="Enter your college name" value={form.collegeName} onChange={handleChange} className="input-sassy w-full" required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="branch" placeholder="Enter your branch" value={form.branch} onChange={handleChange} className="input-sassy w-full" required />
                    <input name="yearOfStudy" placeholder="e.g. 2nd Year" value={form.yearOfStudy} onChange={handleChange} className="input-sassy w-full" required />
                  </div>
                  <div className="space-y-3">
                    <input 
                      value={form.location.address} 
                      onChange={(e) => setForm({...form, location: { ...form.location, address: e.target.value }})}
                      placeholder="Type your city or area"
                      className="input-sassy w-full"
                    />
                    <div className="text-xs text-text-secondary">Mark your location on map:</div>
                    <LocationPicker location={form.location} setLocation={handleLocationChange} />
                  </div>
                  <div className="flex gap-4 flex-col md:flex-row">
                    <button type="button" onClick={() => setStep(1)} className="w-full rounded-3xl border border-[var(--border-color)] bg-white text-text-primary px-5 py-3 font-bold hover:bg-[#f4ead2] transition">Back</button>
                    <button type="submit" className="w-full btn-sassy">Register</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="hidden lg:block rounded-[32px] border border-[var(--border-color)] bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(15,10,28,0.85)] p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent-secondary)] mb-4">Why join?</p>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li className="rounded-3xl bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] p-4 border border-[var(--border-color)]">
                <strong className="block text-text-primary dark:text-white">Zero fees.</strong>
                Save more on every sale.
              </li>
              <li className="rounded-3xl bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] p-4 border border-[var(--border-color)]">
                <strong className="block text-text-primary dark:text-white">Verified campus community.</strong>
                Feel confident in every trade.
              </li>
              <li className="rounded-3xl bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] p-4 border border-[var(--border-color)]">
                <strong className="block text-text-primary dark:text-white">Easy setup.</strong>
                Get started with a few quick details.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Register;
 