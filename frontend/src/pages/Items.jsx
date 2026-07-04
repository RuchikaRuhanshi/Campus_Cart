import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { FiSearch, FiMapPin, FiHeart, FiEye, FiClock, FiFilter, FiChevronDown, FiCheck, FiTag, FiBookOpen, FiActivity } from "react-icons/fi";
import gsap from "gsap";

const Items = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") || "";
    const itemsRef = useRef(null);

    const [filters, setFilters] = useState({
        category: "All",
        college: "",
        location: ""
    });

    const categories = ["All", "Electronics", "Books", "Clothing", "Furniture", "Sports", "Other"];

    // Fetch Items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get("/item/all");
                if (res.data.success) {
                    setItems(res.data.data);
                    setFilteredItems(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = items;
        // Search
        if (search) {
            result = result.filter(
                (item) =>
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        // Category
        if (filters.category !== "All") {
            result = result.filter((item) => item.category?.toLowerCase() === filters.category.toLowerCase());
        }
        // College
        if (filters.college) {
            result = result.filter(item => 
                item.seller?.collegeName?.toLowerCase().includes(filters.college.toLowerCase())
            );
        }
        // Location
        if (filters.location) {
            result = result.filter(item => 
                item.seller?.location?.address?.toLowerCase().includes(filters.location.toLowerCase())
            );
        }
        setFilteredItems(result);
    }, [search, filters, items]);

    // GSAP Stagger Animation when filteredItems change
    useLayoutEffect(() => {
        if (itemsRef.current && filteredItems.length > 0) {
            gsap.fromTo(itemsRef.current.children, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [filteredItems, loading]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }

    const handleSearchChange = (e) => {
        const term = e.target.value;
        const newParams = new URLSearchParams(searchParams);
        if (term) {
            newParams.set("search", term);
        } else {
            newParams.delete("search");
        }
        setSearchParams(newParams);
    }

    return (
        <div className="relative min-h-screen bg-transparent dark:bg-[var(--bg-primary)] pt-24 pb-16 px-4 md:px-8 transition-colors duration-300 font-sans overflow-hidden">

            {/* Global Campus Fixed Backdrop */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img 
                    src="https://images.unsplash.com/photo-1498243691581-b145c3f54a91?q=80&w=1800&auto=format" 
                    alt="Campus Library Background" 
                    className="w-full h-full object-cover opacity-20 dark:opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-[var(--bg-primary)]/35 to-[var(--bg-primary)]/70 dark:from-black/45 dark:via-black/85 dark:to-[var(--bg-primary)]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Modern Banner section to occupy top space */}
                <div className="relative rounded-[32px] border border-[var(--border-color)] p-8 mb-10 overflow-hidden shadow-sm bg-[var(--bg-surface)]">
                    {/* Background real campus photography */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <img 
                            src="https://images.unsplash.com/photo-1498243691581-b145c3f54a91?q=80&w=1200&auto=format" 
                            alt="Marketplace campus hall" 
                            className="w-full h-full object-cover opacity-20 dark:opacity-10 scale-105 filter blur-[0.5px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-transparent"></div>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">
                                Realtime Catalog
                            </span>
                            <h1 className="text-3xl font-extrabold mt-3 text-slate-900 dark:text-white leading-none">
                                Student Marketplace
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                                Browse authentic listings from verified campus peers. Use the side filters to refine your lookup.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-[var(--bg-surface)] px-5 py-3 rounded-2xl border border-[var(--border-color)] text-center shadow-sm">
                                <div className="text-xl font-bold text-[var(--accent)]">{items.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Listings</div>
                            </div>
                            <div className="bg-[var(--bg-surface)] px-5 py-3 rounded-2xl border border-[var(--border-color)] text-center shadow-sm">
                                <div className="text-xl font-bold text-emerald-500">100%</div>
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Peers</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dual Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* LEFT COLUMN: Sidebar Filters & Info (Occupy Space) */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Categories List Card */}
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm">
                            <h3 className="text-sm uppercase font-bold tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <FiFilter className="text-[var(--accent)]" /> Categories
                            </h3>
                            <div className="space-y-1.5">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleFilterChange("category", cat)}
                                        className={`w-full cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                            filters.category.toLowerCase() === cat.toLowerCase()
                                                ? "bg-[var(--accent)] text-white shadow-sm"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-[var(--bg-primary)] dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        <span>{cat}</span>
                                        {filters.category.toLowerCase() === cat.toLowerCase() && <FiCheck size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location and College Filters Card */}
                        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm space-y-4">
                            <h3 className="text-sm uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
                                <FiMapPin className="text-[var(--accent)]" /> Location Filters
                            </h3>
                            
                            <div>
                                <label className="block text-xs text-slate-400 font-bold mb-2 uppercase">Specific Area</label>
                                <div className="relative">
                                    <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Hostel, block..."
                                        className="input-sassy w-full !pl-9 text-sm"
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange("location", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 font-bold mb-2 uppercase">College / Campus</label>
                                <div className="relative">
                                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="e.g. IT College..."
                                        className="input-sassy w-full !pl-9 text-sm"
                                        value={filters.college}
                                        onChange={(e) => handleFilterChange("college", e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    setSearchParams({}); 
                                    setFilters({category: "All", college: "", location: ""});
                                }}
                                className="w-full py-3 border border-[var(--border-color)] hover:bg-[var(--bg-primary)] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-colors"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Search + Catalog Grid */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Search Bar Row */}
                        <div className="relative group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-[var(--accent)] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search marketplace listings..."
                                className="input-sassy w-full !pl-12 text-base !pr-4"
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)]"></div>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-20 bg-[var(--bg-surface)] rounded-[32px] border border-dashed border-[var(--border-color)] shadow-sm">
                                <FiSearch className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">No matches found</h3>
                                <p className="text-sm text-slate-500 mb-6">No active listings match your current filters.</p>
                                <button 
                                    onClick={() => {
                                        setSearchParams({}); 
                                        setFilters({category: "All", college: "", location: ""});
                                    }} 
                                    className="bg-[var(--accent)] text-white font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div ref={itemsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {filteredItems.map((item) => (
                                    <Link
                                        to={`/item/${item._id}`}
                                        key={item._id}
                                        className="group overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                                            <img
                                                src={item.images?.[0] || 'https://via.placeholder.com/400x300?text=Campus+Cart'}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Campus+Cart'}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            
                                            <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-white/90 text-slate-900 text-[10px] font-bold px-2.5 py-0.5 shadow-sm">
                                                {item.category || 'Other'}
                                            </span>
                                            
                                            <span className="absolute bottom-4 left-4 inline-flex rounded-full bg-[var(--accent)] text-white text-sm font-bold px-3 py-1 shadow-md">
                                                ₹{item.price.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="p-5 space-y-3">
                                            <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                                                {item.title}
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {item.description || 'No description available.'}
                                            </p>

                                            <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-color)] text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                        {item.seller?.name || 'Seller'}
                                                        {item.seller?.isVerifiedSeller && (
                                                            <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 p-0.5 rounded-full" title="Verified Seller">
                                                                <FiCheck size={8} />
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FiMapPin className="text-[var(--accent)]" size={12} />
                                                    <span className="truncate">{item.seller?.collegeName || 'Campus Spot'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
            {/* Dynamic Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                 <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] bg-[var(--accent)]/5 rounded-full blur-[110px] animate-blob-1"></div>
                 <div className="absolute bottom-[30%] right-[-15%] w-[500px] h-[500px] bg-[var(--accent-secondary)]/5 rounded-full blur-[130px] animate-blob-2"></div>
            </div>
        </div>
    );
};

export default Items;