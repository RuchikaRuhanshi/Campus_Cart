// Component displaying lists of orders created or received by the user
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { FiShoppingBag, FiMessageSquare, FiCheck, FiClock, FiInbox, FiTrendingUp, FiActivity } from "react-icons/fi";

const MyOrders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, completed

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/order/my');
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-transparent pt-32 pb-16 px-6 text-center">
        <div className="max-w-md mx-auto glass-panel p-8 rounded-[32px] border border-[var(--border-color)]">
          <FiShoppingBag className="mx-auto text-4xl text-[var(--accent)] mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">Please log in to track your campus deals and active swaps.</p>
          <Link to="/login" className="px-8 py-3 bg-[var(--accent)] text-white font-bold rounded-full hover:bg-[var(--accent-secondary)] transition-colors shadow-md">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-semibold">Loading your active orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="glass-panel p-6 rounded-2xl border border-red-500/20 text-center max-w-sm">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-full font-bold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return o.status === "PENDING" || o.status === "CONFIRMED";
    if (activeTab === "completed") return o.status === "COMPLETED";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "CONFIRMED":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING": return "⏳";
      case "CONFIRMED": return "🤝";
      case "COMPLETED": return "✅";
      default: return "📦";
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent pt-24 pb-16 px-4 md:px-8 transition-colors duration-300 font-sans overflow-hidden">
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Block */}
        <div className="relative rounded-[32px] border border-[var(--border-color)] p-8 mb-10 overflow-hidden shadow-sm bg-[var(--bg-surface)]">
            {/* Background real campus photography */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format" 
                    alt="Campus meetup zone" 
                    className="w-full h-full object-cover opacity-20 dark:opacity-20 scale-105 filter blur-[0.5px]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-transparent"></div>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                        <FiActivity className="animate-pulse" /> Peer-to-Peer Transactions
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 text-slate-900 dark:text-white leading-none">
                        Deals Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                        Monitor active exchanges, access transaction rooms, and coordinate safe meetup swaps with campus peers.
                    </p>
                </div>
            </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-8 bg-[#f4ead2]/40 dark:bg-black/40 p-1.5 rounded-full border border-[var(--border-color)] max-w-md">
            {[
              { id: "all", label: "All Deals", count: orders.length },
              { id: "pending", label: "Pending", count: orders.filter(o => o.status !== "COMPLETED").length },
              { id: "completed", label: "Completed", count: orders.filter(o => o.status === "COMPLETED").length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
        </div>

        {/* Orders Listing Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[32px] shadow-sm flex flex-col items-center justify-center">
             <FiInbox className="text-5xl text-slate-300 dark:text-slate-700 mb-4" />
             <p className="text-slate-500 font-bold text-lg">No matches found</p>
             <p className="text-slate-400 text-sm mt-1">You do not have any deals listed under this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map((o) => {
              const item = o.item || o.itemId || {};
              const isCompleted = o.status === "COMPLETED";
              const isConfirmed = o.status === "CONFIRMED";
              
              return (
                <div 
                  key={o._id} 
                  className="glass-panel border border-[var(--border-color)] bg-[var(--bg-surface)]/70 dark:bg-[var(--bg-surface)]/50 rounded-[32px] p-6 flex flex-col md:flex-row gap-6 justify-between items-stretch hover:shadow-lg hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Status Watermark */}
                  <div className="absolute right-48 bottom-4 text-8xl opacity-[0.05] dark:opacity-[0.03] select-none pointer-events-none transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 hidden md:block">
                    {getStatusIcon(o.status)}
                  </div>
                  <div className="flex gap-5 items-center flex-1">
                    <div className="h-24 w-24 rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-[#f4ead2] dark:bg-[var(--bg-surface)] shrink-0">
                      <img 
                        src={item.images?.[0] || item.image || 'https://via.placeholder.com/150'} 
                        alt={item.title || 'item'} 
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full border ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ID: #{o._id.substring(o._id.length - 6).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xl text-slate-900 dark:text-white truncate pr-4">
                        {item.title || 'Item'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        Seller: <span className="text-[var(--accent)] font-bold">{o.seller?.name || 'N/A'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">
                        Opened on: {new Date(o.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Transaction status progress indicator */}
                  <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-4 md:pt-0 md:pl-6 shrink-0 min-w-[200px]">
                    <div className="text-right w-full">
                      <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Deal Price</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{item.price}</div>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex items-center gap-1.5 my-3 w-full justify-end text-[10px] font-bold text-slate-400">
                      <span className={`w-2 h-2 rounded-full ${o.status ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                      <span className="h-0.5 w-6 bg-slate-300 dark:bg-slate-800"></span>
                      <span className={`w-2 h-2 rounded-full ${isConfirmed || isCompleted ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
                      <span className="h-0.5 w-6 bg-slate-300 dark:bg-slate-800"></span>
                      <span className={`w-2 h-2 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                    </div>

                    <Link 
                      to={`/order/${o._id}`} 
                      className="w-full py-2.5 bg-gradient-to-r from-[#b7986f] to-[#d4b16c] hover:from-[#d4b16c] hover:to-[#f1d8a1] text-text-primary text-center font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <FiMessageSquare /> Enter Transaction Room
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] bg-[var(--accent)]/5 rounded-full blur-[110px] animate-blob-1"></div>
           <div className="absolute bottom-[30%] right-[-15%] w-[500px] h-[500px] bg-[var(--accent-secondary)]/5 rounded-full blur-[130px] animate-blob-2"></div>
      </div>

    </div>
  );
};

export default MyOrders;