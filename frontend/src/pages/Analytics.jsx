import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiTrendingUp, FiAward, FiPieChart, FiCpu, FiUser, FiStar, FiChevronRight, FiZap, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Analytics = () => {
  const { isAuthenticated } = useAuth();

  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    completedTrades: 0,
    categoryStats: []
  });

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("stats"); // "stats", "leaderboard", "ai"

  // AI Predictor Form State
  const [predictForm, setPredictForm] = useState({
    title: "",
    category: "Books",
    price: ""
  });
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const categories = ["Books", "Electronics", "Clothing", "Furniture", "Sports", "Other"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, leadRes] = await Promise.all([
          api.get("/analytics/stats"),
          api.get("/analytics/leaderboard")
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (leadRes.data.success) {
          setLeaderboard(leadRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to use the AI Demand Predictor.");
      return;
    }
    try {
      setPredicting(true);
      const res = await api.post("/analytics/predict", predictForm);
      if (res.data.success) {
        setPrediction(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("AI Prediction failed. Please try again.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)] pt-24 pb-16 px-4 md:px-8 transition-colors duration-300 overflow-hidden font-sans">

      {/* Background Backdrop Art */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format"
          alt="Stats Analysis Backdrop"
          className="w-full h-full object-cover opacity-15 dark:opacity-5"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/80 to-[var(--bg-primary)] dark:from-black/10 dark:via-black/80 dark:to-[var(--bg-primary)]"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Page Title & Intro */}
        <div className="text-center md:text-left mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent)] font-extrabold mb-2">Campus Market Insights</p>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-text-primary dark:text-white leading-tight">Campus Stats & AI</h1>
          <p className="mt-3 text-text-secondary max-w-2xl text-sm md:text-base">
            Explore public trading stats, seller ranks, and use our smart AI engine to predict listing success, optimal pricing, and expected sale velocity.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center md:justify-start gap-2 mb-8 bg-[var(--bg-surface)] p-1.5 rounded-full border border-border-color w-fit mx-auto md:mx-0 shadow-sm">
          <button
            onClick={() => setActiveSubTab("stats")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition ${activeSubTab === "stats"
                ? "bg-gradient-to-r from-[#8b6d48] to-[#d4b16c] text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
              }`}
          >
            <span className="flex items-center gap-1.5 justify-center"><FiPieChart /> Market Stats</span>
          </button>
          <button
            onClick={() => setActiveSubTab("leaderboard")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition ${activeSubTab === "leaderboard"
                ? "bg-gradient-to-r from-[#8b6d48] to-[#d4b16c] text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
              }`}
          >
            <span className="flex items-center gap-1.5 justify-center"><FiAward /> Top Sellers</span>
          </button>
          <button
            onClick={() => setActiveSubTab("ai")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition ${activeSubTab === "ai"
                ? "bg-gradient-to-r from-[#8b6d48] to-[#d4b16c] text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
              }`}
          >
            <span className="flex items-center gap-1.5 justify-center"><FiCpu /> AI Predictor</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : (
          <>
            {/* SUBTAB 1: STATISTICS */}
            {activeSubTab === "stats" && (
              <div className="space-y-8 animate-fade-in">

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-surface border border-border-color p-6 rounded-[32px] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <p className="text-xs uppercase tracking-[0.25em] text-text-secondary font-bold mb-3">Total Traders</p>
                    <h3 className="text-4xl font-extrabold text-text-primary dark:text-white">{stats.totalUsers}</h3>
                    <p className="text-xs text-text-secondary mt-2">Active students registered on campus</p>
                  </div>

                  <div className="bg-surface border border-border-color p-6 rounded-[32px] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#ecd8b1]/20 dark:bg-[#ecd8b1]/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#8b6d48] font-bold mb-3">Active Listings</p>
                    <h3 className="text-4xl font-extrabold text-[#8b6d48] dark:text-[#ecd8b1]">{stats.activeListings}</h3>
                    <p className="text-xs text-text-secondary mt-2">Items currently listed for handshake deals</p>
                  </div>

                  <div className="bg-surface border border-border-color p-6 rounded-[32px] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold mb-3">Successful Handovers</p>
                    <h3 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.completedTrades}</h3>
                    <p className="text-xs text-text-secondary mt-2">Trades resolved and completed safely</p>
                  </div>
                </div>

                {/* Categories & Market Share */}
                <div className="bg-surface border border-border-color p-6 md:p-8 rounded-[32px] shadow-sm">
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                    <FiTrendingUp className="text-[var(--accent)]" /> Active Categories Distribution
                  </h3>
                  <div className="space-y-4 max-w-xl">
                    {stats.categoryStats.length === 0 ? (
                      <p className="text-sm text-text-secondary">No active listing data available yet.</p>
                    ) : (
                      stats.categoryStats.map((stat, i) => {
                        const total = stats.categoryStats.reduce((acc, curr) => acc + curr.count, 0);
                        const percentage = Math.round((stat.count / total) * 100) || 0;
                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-sm font-semibold text-text-primary">
                              <span>{stat.category}</span>
                              <span>{stat.count} items ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-[var(--bg-primary)] rounded-full h-3.5 border border-border-color overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#8b6d48] to-[#d4b16c] h-full rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 2: LEADERBOARD */}
            {activeSubTab === "leaderboard" && (
              <div className="bg-surface border border-border-color p-6 md:p-8 rounded-[32px] shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5 mb-6">
                  <FiAward size={24} className="text-amber-500" />
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Campus Top Traders</h3>
                    <p className="text-xs text-text-secondary">Ranked by Sales, Active Listings, and Rating Score</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-color text-xs uppercase tracking-wider text-text-secondary font-bold">
                        <th className="py-4 px-3 w-16 text-center">Rank</th>
                        <th className="py-4 px-4">Seller Details</th>
                        <th className="py-4 px-4 hidden md:table-cell">Branch & College</th>
                        <th className="py-4 px-4 text-center">Sales</th>
                        <th className="py-4 px-4 text-center">Rating</th>
                        <th className="py-4 px-4 text-right">Badge Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-text-secondary text-sm">No rankings compiled yet. Start trading to rank!</td>
                        </tr>
                      ) : (
                        leaderboard.map((seller, index) => (
                          <tr
                            key={seller._id}
                            className="border-b border-border-color/50 hover:bg-[rgba(139,109,72,0.03)] dark:hover:bg-[rgba(236,216,177,0.02)] transition duration-200"
                          >
                            <td className="py-4 px-3 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? "bg-amber-100 text-amber-800 border border-amber-300 font-extrabold shadow-sm" :
                                  index === 1 ? "bg-slate-200 text-slate-800 border border-slate-300 font-extrabold" :
                                    index === 2 ? "bg-orange-100 text-orange-800 border border-orange-200 font-extrabold" :
                                      "text-text-secondary"
                                }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#f4ead2] dark:bg-[var(--bg-surface)] text-[#8b6d48] flex items-center justify-center font-bold text-sm overflow-hidden border border-border-color">
                                  {seller.image ? (
                                    <img src={seller.image} alt={seller.name} className="w-full h-full object-cover" />
                                  ) : (
                                    seller.name?.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-text-primary block text-sm">{seller.name}</span>
                                  <span className="text-[10px] text-text-secondary block md:hidden truncate max-w-40">{seller.collegeName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell text-sm text-text-secondary">
                              <div>{seller.branch || "General"}</div>
                              <div className="text-xs text-text-secondary/70">{seller.collegeName}</div>
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-text-primary text-sm">
                              {seller.salesCount}
                            </td>
                            <td className="py-4 px-4 text-center text-sm">
                              <div className="flex items-center justify-center gap-1 font-bold text-[#8b6d48] dark:text-[#ecd8b1]">
                                <span>{seller.averageRating?.toFixed(1) || "0.0"}</span>
                                <FiStar size={12} className="fill-current" />
                              </div>
                              <span className="text-[10px] text-text-secondary">({seller.ratingCount} reviews)</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r ${seller.badgeColor} text-white shadow-sm`}>
                                {seller.badgeTitle}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB 3: AI DEMAND PREDICTOR */}
            {activeSubTab === "ai" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">

                {/* Predictor Form */}
                <div className="bg-surface border border-border-color p-6 md:p-8 rounded-[32px] shadow-sm">
                  <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <FiZap className="text-amber-500" /> AI Demand Predictor Engine
                  </h3>
                  <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                    Planning to sell? Enter your listing title, category, and proposed price. Our AI will analyze historical catalog transactions to estimate buyer interest, sale velocity, and pricing suggestions.
                  </p>

                  <form onSubmit={handlePredictSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-widest text-text-secondary mb-2">Item Title</label>
                      <input
                        type="text"
                        placeholder="e.g. 5th Ed HC Verma Physics Book"
                        required
                        value={predictForm.title}
                        onChange={e => setPredictForm({ ...predictForm, title: e.target.value })}
                        className="w-full bg-[var(--bg-primary)] p-4 rounded-3xl border border-border-color focus:ring-1 focus:ring-[#8b6d48] outline-none text-text-primary font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-widest text-text-secondary mb-2">Category</label>
                        <select
                          value={predictForm.category}
                          onChange={e => setPredictForm({ ...predictForm, category: e.target.value })}
                          className="w-full bg-[var(--bg-primary)] p-4 rounded-3xl border border-border-color focus:ring-1 focus:ring-[#8b6d48] outline-none text-text-primary font-medium"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-widest text-text-secondary mb-2">Proposed Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 350"
                          required
                          value={predictForm.price}
                          onChange={e => setPredictForm({ ...predictForm, price: e.target.value })}
                          className="w-full bg-[var(--bg-primary)] p-4 rounded-3xl border border-border-color focus:ring-1 focus:ring-[#8b6d48] outline-none text-text-primary font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={predicting}
                      className="w-full py-3.5 mt-2 rounded-full bg-gradient-to-r from-[#8b6d48] via-[#b8b18b] to-[#e7d4ae] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-95 transition"
                    >
                      {predicting ? "Analyzing Catalog..." : "Predict Demand & Price"}
                    </button>
                  </form>
                </div>

                {/* Prediction Result Display */}
                <div className="bg-surface border border-border-color p-6 md:p-8 rounded-[32px] shadow-sm flex flex-col justify-center min-h-[300px] relative overflow-hidden">
                  {prediction ? (
                    <div className="space-y-6 animate-fade-in relative z-10">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                          AI Assessment Complete
                        </span>
                        <h3 className="text-2xl font-bold text-text-primary mt-3">Prediction Summary</h3>
                      </div>

                      {/* Score Indicator */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[var(--bg-primary)] rounded-3xl border border-border-color text-center">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Demand Score</p>
                          <p className="text-3xl font-extrabold text-[var(--accent)] mt-1">{prediction.demandScore}%</p>
                          <span className="text-xs font-semibold text-text-primary block mt-1">{prediction.demandIndex}</span>
                        </div>
                        <div className="p-4 bg-[var(--bg-primary)] rounded-3xl border border-border-color text-center flex flex-col justify-center">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Expected Sell Velocity</p>
                          <p className="text-xl font-bold text-text-primary mt-2">{prediction.expectedSellTime}</p>
                        </div>
                      </div>

                      {/* Pricing Range Recommendations */}
                      <div className="p-5 bg-gradient-to-br from-[#f4ead2] to-white dark:from-[rgba(92,66,38,0.12)] dark:to-[var(--bg-surface)] rounded-3xl border border-border-color">
                        <p className="text-xs uppercase font-bold tracking-widest text-[#8b6d48] dark:text-[#ecd8b1]">AI Suggested Fair Price Range</p>
                        <p className="text-2xl font-extrabold text-text-primary mt-1">₹{prediction.recommendedPriceRange.min} - ₹{prediction.recommendedPriceRange.max}</p>
                        <span className="text-xs text-text-secondary block mt-1">Based on pricing filters for similar campus items</span>
                      </div>

                      {/* AI Optimization Tips */}
                      <div className="space-y-3">
                        <p className="text-xs uppercase font-bold tracking-widest text-text-secondary">Actionable Listing Tips</p>
                        <ul className="space-y-2">
                          {prediction.aiTips.map((tip, index) => (
                            <li key={index} className="flex gap-2 text-sm text-text-primary leading-snug">
                              <FiCheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FiCpu size={48} className="mx-auto text-slate-300 dark:text-slate-700 animate-pulse mb-4" />
                      <h4 className="font-bold text-lg text-text-primary mb-1">Awaiting Prediction Inputs</h4>
                      <p className="text-sm text-text-secondary max-w-xs mx-auto">Fill out the predictor form to generate transaction graphs, estimated velocities, and optimal selling ranges.</p>
                    </div>
                  )}

                  {/* Decorative AI Circuit Grid */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5 dark:opacity-10 z-0">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="10%" y1="10%" x2="90%" y2="10%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                      <line x1="90%" y1="10%" x2="90%" y2="90%" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                      <circle cx="10%" cy="10%" r="5" fill="currentColor" />
                      <circle cx="90%" cy="90%" r="5" fill="currentColor" />
                    </svg>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Analytics;
