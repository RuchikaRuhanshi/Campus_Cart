import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { FiSearch, FiMapPin, FiHeart, FiEye, FiClock, FiFilter, FiChevronDown } from "react-icons/fi";
import gsap from "gsap";

const Items = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") || "";
    const itemsRef = useRef(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

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
        result = result.filter((item) => item.category === filters.category);
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
                { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [filteredItems, loading]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'category') setIsCategoryOpen(false);
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
        <div className="min-h-screen bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)] pt-16 sm:pt-20 pb-12 px-4 md:px-8 transition-colors duration-300 font-sans">
        <div className="max-w-7xl mx-auto">
            
            {/* Search & Filter Section */}
            <div className="sticky top-16 sm:top-20 z-30 mb-8 mt-6">
                <div className="bg-[rgba(255,255,255,0.92)] dark:bg-[rgba(11,27,51,0.92)] backdrop-blur-xl rounded-3xl shadow-sassy border border-[var(--border-color)] p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search Input - Cool Glow Effect */}
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiSearch className="text-[var(--accent-secondary)] group-focus-within:text-[var(--accent)] transition-colors duration-300" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search the market..."
                                className="block w-full pl-11 pr-4 py-3 rounded-3xl bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(11,27,51,0.85)] border border-transparent focus:border-[var(--accent)] focus:bg-white dark:focus:bg-[rgba(11,27,51,0.95)] focus:ring-4 focus:ring-[rgba(139,109,72,0.1)] text-text-primary dark:text-white placeholder-[#9c8c70] transition-all duration-300 outline-none font-medium"
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>

                        {/* Filters Group */}
                        <div className="flex gap-2 pb-1 md:pb-0">
                            
                            {/* Custom Category Dropdown */}
                            <div className="relative min-w-[160px]">
                                <button 
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className="w-full h-full flex items-center justify-between px-4 py-3 rounded-3xl bg-[var(--bg-primary)] dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[rgba(92,66,38,0.15)] border border-transparent hover:border-[rgba(185,162,112,0.32)] dark:hover:border-[rgba(185,162,112,0.24)] text-text-primary dark:text-[var(--text-secondary)] font-medium transition-all duration-200"
                                >
                                    <span className="flex items-center gap-2 text-sm">
                                        <FiFilter size={16} className="text-[var(--accent)]" />
                                        {filters.category}
                                    </span>
                                    <FiChevronDown className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {/* Dropdown Menu */}
                                {isCategoryOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                                        <div className="absolute top-full right-0 mt-2 w-56 p-1 bg-surface dark:bg-[var(--bg-surface)] rounded-3xl shadow-2xl border border-border-color dark:border-white/10 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                            {categories.map(cat => (
                                                        <button
                                                    key={cat}
                                                    onClick={() => handleFilterChange("category", cat)}
                                                    className={`w-full text-left px-3 py-2 rounded-2xl text-sm font-medium transition-colors ${
                                                        filters.category === cat 
                                                            ? "bg-[var(--bg-primary)] dark:bg-[rgba(92,66,38,0.15)] text-[var(--accent)] dark:text-[var(--bg-primary)]" 
                                                            : "text-text-secondary dark:text-[var(--accent-secondary)] hover:bg-[rgba(229,220,190,0.9)] dark:hover:bg-[rgba(92,66,38,0.12)]"
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {/* Location Filter */}
                            <div className="relative flex-1 md:min-w-[220px]">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiMapPin className="text-[var(--accent)]" size={16} />
                                </div>
                                <input
                                    list="locations"
                                    placeholder="Location..."
                                    className="block w-full pl-10 pr-4 py-3 rounded-3xl bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(11,27,51,0.8)] border border-[var(--border-color)] hover:bg-[rgba(139,109,72,0.08)] dark:hover:bg-[rgba(184,177,139,0.12)] focus:border-[var(--accent)] focus:bg-white dark:focus:bg-[rgba(11,27,51,0.95)] focus:ring-4 focus:ring-[rgba(139,109,72,0.12)] text-text-primary dark:text-white font-medium placeholder:text-[#a1927a] dark:placeholder:text-[#9c8f7b] text-sm transition-all duration-300 outline-none"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange("location", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b6d48]"></div>
                </div>
            ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-surface/90 dark:bg-[var(--bg-surface)]/90 backdrop-blur-sm rounded-[32px] border border-dashed border-border-color dark:border-white/10 shadow-sassy">
                <div className="w-16 h-16 bg-[var(--bg-primary)] dark:bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="text-[var(--accent)]" size={24} />
                </div>
                <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">No items found</h3>
                <p className="text-text-secondary dark:text-[var(--text-secondary)] mb-6">Try adjusting your search or filters.</p>
                <button 
                    onClick={() => {setSearchParams({}); setFilters({category: "All", college: "", location: ""})}} 
                    className="w-full sm:w-auto mx-auto text-white bg-gradient-to-r from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--bg-primary)] px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-[var(--accent)]/20 hover:opacity-95"
                >
                    Clear Filters
                </button>
            </div>
            ) : (
            <div ref={itemsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                <Link
                    to={`/item/${item._id}`}
                    key={item._id}
                    className="group overflow-hidden rounded-[28px] border border-border-color bg-surface dark:bg-[var(--bg-surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--accent)]/15"
                >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[rgba(251,243,255,0.65)] dark:bg-[rgba(11,27,51,0.75)]">
                        <img
                            src={item.images?.[0] || "/placeholder.png"}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 text-[var(--text-primary)] text-xs font-semibold px-3 py-1 shadow-sm">
                            {item.category || 'Other'}
                        </span>
                        <span className="absolute bottom-4 left-4 inline-flex rounded-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-bold px-3 py-1.5 shadow-lg shadow-[var(--accent)]/20">
                            ₹{item.price.toLocaleString()}
                        </span>
                    </div>

                    <div className="p-5 space-y-3">
                        <h2 className="text-lg font-semibold text-text-primary dark:text-white line-clamp-2">{item.title}</h2>
                        <p className="text-sm text-text-secondary dark:text-[var(--accent-secondary)] line-clamp-2">{item.description || 'No description available.'}</p>

                        <div className="flex flex-col gap-2 pt-4 border-t border-[rgba(139,109,72,0.16)] text-sm">
                            <div className="flex items-center justify-between gap-2 text-text-secondary dark:text-[var(--accent-secondary)]">
                                <span className="font-medium text-[13px]">{item.seller?.name || 'Seller'}</span>
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] text-text-secondary dark:text-[var(--accent-secondary)]">
                                <FiMapPin size={14} className="text-[var(--accent)]" />
                                <span>{item.seller?.collegeName || 'Campus'}</span>
                            </div>
                        </div>
                    </div>
                </Link>
                ))}
            </div>
            )}
        </div>
        </div>
    );
};

export default Items;
 