import { useEffect, useState } from "react";
import api from "../utils/api";
import { FiClock, FiPlus, FiAlertCircle, FiMessageSquare, FiX, FiCheck } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const getUserId = (u) => {
  if (!u) return null;
  if (typeof u === 'string') return u;
  return u._id || u.id;
};

const UrgentFeed = () => {
  const { isAuthenticated, user: currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [helpRequest, setHelpRequest] = useState(null); // Request to help

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Books",
    urgency: "Tomorrow",
  });

  const categories = ["Books", "Electronics", "Dorm", "Sports", "Other"];
  const urgencies = ["Tonight", "Tomorrow", "Within 3 Days", "Flexible"];

  // Fetch Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/urgent/all");
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to post a request.");
      return;
    }

    try {
      const res = await api.post("/urgent/add", form);
      if (res.data.success) {
        setIsModalOpen(false);
        setForm({ title: "", description: "", category: "Books", urgency: "Tomorrow" });
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to post request");
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await api.put(`/urgent/${id}/resolve`);
      if (res.data.success) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to resolve request");
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Books": return "📚";
      case "Electronics": return "💻";
      case "Dorm": return "🏠";
      case "Sports": return "⚽";
      default: return "✨";
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-8 transition-colors duration-300 overflow-hidden font-sans">

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header Banner with real university campus sunset backdrop */}
        <div className="relative rounded-[32px] overflow-hidden p-8 sm:p-12 text-white shadow-xl mb-10 bg-black">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format"
              alt="Campus sunset plaza"
              className="w-full h-full object-cover opacity-35 dark:opacity-55 scale-105 filter blur-[0.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Reverse Marketplace</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 mb-4 tracking-tight leading-none">Need Something Urgently?</h1>
            <p className="text-white/95 text-base sm:text-lg font-medium">
              Don't wait for a seller to post it. Tell the campus what you need—whether it's exam prep sheets, calculators, or moving help—and get instant responses from nearby peers.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer mt-6 inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-50 transition-colors font-bold px-6 py-3 rounded-full shadow-lg"
            >
              <FiPlus /> Post a Request
            </button>
          </div>
        </div>

        {/* Feed Listing */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] shadow-sm">
            <FiAlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Feed is empty</h3>
            <p className="text-slate-500 mb-6">No active requests on campus right now. Be the first to post!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer bg-[var(--accent)] text-white font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Post Request
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Massive category background watermark */}
                <div className="absolute right-4 bottom-4 text-[100px] opacity-[0.05] dark:opacity-[0.03] select-none pointer-events-none transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                  {getCategoryIcon(req.category)}
                </div>

                {/* Urgent Tag Indicator */}
                <div className={`absolute top-0 left-0 w-2 h-full ${req.urgency === "Tonight" ? "bg-red-500" :
                  req.urgency === "Tomorrow" ? "bg-amber-500" : "bg-[var(--accent)]"
                  }`} />

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 ml-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                      <span className="text-[var(--accent)]">{req.category}</span>
                      <span className="text-slate-400">•</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-white ${req.urgency === "Tonight" ? "bg-red-500" :
                        req.urgency === "Tomorrow" ? "bg-amber-500" : "bg-[var(--accent)]"
                        }`}>
                        <FiClock size={12} /> {req.urgency}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{req.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{req.description}</p>

                    <div className="flex items-center gap-3 mt-4 text-sm text-slate-500">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] flex items-center justify-center font-bold text-xs uppercase text-[var(--accent)] border border-[var(--border-color)]">
                        {req.user?.name ? req.user.name[0] : "?"}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{req.user?.name || "Student"}</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span>{req.user?.collegeName || "Campus Location"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 self-stretch sm:self-center justify-center">
                    {currentUser && getUserId(currentUser) === getUserId(req.user) ? (
                      <button
                        onClick={() => handleResolve(req._id)}
                        className="cursor-pointer px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                      >
                        <FiCheck /> Resolve Request
                      </button>
                    ) : (
                      <button
                        onClick={() => setHelpRequest(req)}
                        className="cursor-pointer px-6 py-3 bg-[var(--accent)] hover:opacity-95 text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-opacity"
                      >
                        <FiMessageSquare /> I Can Help!
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Post Request */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] max-w-lg w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg-primary)] transition-colors text-slate-400"
              >
                <FiX size={20} />
              </button>

              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Request an Item</h2>
              <p className="text-slate-500 mb-6 text-sm">Need a study guide, tools, or quick favor? Post it here so peers can reach out.</p>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">What do you need?</label>
                  <input
                    type="text"
                    placeholder="e.g. Scientific Calculator for exam"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-sassy w-full bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Details / Context</label>
                  <textarea
                    placeholder="Describe it, e.g. I have my math mid-term tomorrow morning at 9 AM and forgot my calc in the hostel."
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-sassy w-full bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input-sassy w-full bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)]"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Urgency</label>
                    <select
                      value={form.urgency}
                      onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                      className="input-sassy w-full bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)]"
                    >
                      {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full mt-6 py-4 btn-sassy font-bold text-lg">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Offer Help / Contact Info */}
        {helpRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] max-w-md w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setHelpRequest(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg-primary)] transition-colors text-slate-400"
              >
                <FiX size={20} />
              </button>

              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Offer to Help</h2>
              <p className="text-slate-500 mb-6 text-sm">Contact the student directly using WhatsApp, Call, or Email to arrange the details.</p>

              <div className="space-y-4">
                <div className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)]">
                  <div className="text-xs uppercase font-bold tracking-widest text-[var(--accent)] mb-1">Request Details</div>
                  <div className="font-bold text-slate-800 dark:text-white">{helpRequest.title}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{helpRequest.description}</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Contact Student</label>
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`tel:${helpRequest.user?.mobileNo}`}
                        className="block text-center py-3 bg-[var(--accent)] hover:opacity-95 text-white font-bold rounded-2xl shadow-sm transition-opacity text-sm truncate px-1"
                      >
                        Call: {helpRequest.user?.mobileNo}
                      </a>
                      <a
                        href={`https://wa.me/${helpRequest.user?.mobileNo?.startsWith('+') ? helpRequest.user.mobileNo.replace('+', '') : (helpRequest.user?.mobileNo?.length === 10 ? '91' + helpRequest.user.mobileNo : helpRequest.user?.mobileNo)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-sm"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Send Email</label>
                    <a
                      href={`mailto:${helpRequest.user?.email}?subject=CampusMart: I can help with your request: ${helpRequest.title}`}
                      className="block w-full text-center py-3 border border-[var(--border-color)] hover:bg-[var(--bg-primary)] text-slate-700 dark:text-white font-bold rounded-2xl transition-colors"
                    >
                      Send Email: {helpRequest.user?.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] bg-[var(--accent)]/5 rounded-full blur-[110px] animate-blob-1"></div>
          <div className="absolute bottom-[30%] right-[-15%] w-[500px] h-[500px] bg-[var(--accent-secondary)]/5 rounded-full blur-[130px] animate-blob-2"></div>
        </div>
      </div>
    </div>
  );
};

export default UrgentFeed;
