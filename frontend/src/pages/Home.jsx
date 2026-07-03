import { Link } from "react-router-dom";
import { FiSearch, FiShield, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from 'split-type';
import Lenis from '@studio-freight/lenis';
import api from "../utils/api";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const heroRef = useRef(null);
    const deviceRef = useRef(null);
    const primaryBtnRef = useRef(null);
    const bentoRef = useRef(null);
    const inventoryRef = useRef(null);

    const [currentImage, setCurrentImage] = useState(0);
    const images = [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format",
        "https://images.unsplash.com/photo-1550029402-226113b0c583?q=80&w=1000&auto=format"
    ];

    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    const categories = [
        { name: "Electronics", key: "electronics", icon: "💻" },
        { name: "Books & Study", key: "books", icon: "📚" },
        { name: "Dorm Essentials", key: "dorm", icon: "🏠" },
        { name: "Sports & Fitness", key: "sports", icon: "⚡" }
    ];

    // Fetch All Items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get("/item/all");
                if (res.data.success) {
                    setAllItems(res.data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch items:", err);
            }
        };
        fetchItems();
    }, []);

    // Filter Items
    useEffect(() => {
        let items = allItems;
        if (selectedCategory) {
            items = items.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase());
        }
        setFilteredItems(items.slice(0, 8));
    }, [selectedCategory, allItems]);

    // Image Slider Interval
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    useLayoutEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        const ctx = gsap.context(() => {
            const headline = new SplitType('#hero-headline', { types: 'chars, words' });

            gsap.set(deviceRef.current, { rotationY: -10, rotationX: 5 });

            gsap.from(headline.chars, {
                y: 50,
                opacity: 0,
                rotateX: -90,
                stagger: 0.02,
                duration: 1,
                ease: "power3.out",
                delay: 0.2
            });

            gsap.from(".hero-content-reveal", {
                y: 30,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                delay: 0.6,
                ease: "power2.out"
            });

            gsap.from(deviceRef.current, {
                x: 100,
                opacity: 0,
                rotationY: 20,
                duration: 1.5,
                delay: 0.4,
                ease: "power3.out"
            });

            gsap.to(".light-beam", {
                x: "100vw",
                y: "50vh",
                duration: "random(8, 12)",
                repeat: -1,
                ease: "none",
                opacity: 0,
                yoyo: true,
                stagger: {
                    amount: 5,
                    from: "random"
                }
            });

            const btn = primaryBtnRef.current;
            if (btn) {
                const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
                const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
                const mouseEnter = (e) => {
                    const { left, top, width, height } = btn.getBoundingClientRect();
                    const x = e.clientX - left - width / 2;
                    const y = e.clientY - top - height / 2;
                    xTo(x * 0.3);
                    yTo(y * 0.3);
                };
                const mouseLeave = () => {
                    xTo(0);
                    yTo(0);
                };

                btn.addEventListener('mousemove', mouseEnter);
                btn.addEventListener('mouseleave', mouseLeave);
            }

            const handleMouseMove = (e) => {
                if (!deviceRef.current) return;
                const xPct = (e.clientX / window.innerWidth) - 0.5;
                const yPct = (e.clientY / window.innerHeight) - 0.5;

                gsap.to(deviceRef.current, {
                    rotationY: xPct * 10,
                    rotationX: -yPct * 10,
                    duration: 1,
                    ease: "power2.out"
                });
            };
            heroRef.current?.addEventListener("mousemove", handleMouseMove);

            gsap.from(".bento-box", {
                scrollTrigger: { trigger: bentoRef.current, start: "top 80%" },
                y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out"
            });

            gsap.from(".category-btn", {
                scrollTrigger: { trigger: ".categories-section", start: "top 85%" },
                y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power2.out"
            });

            gsap.from(".inventory-item", {
                scrollTrigger: { trigger: inventoryRef.current, start: "top 85%" },
                y: 30, opacity: 0, duration: 0.6, stagger: 0.05, ease: "power2.out"
            });

        }, heroRef);

        return () => {
            ctx.revert();
            lenis.destroy();
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-[var(--bg-primary)] dark:bg-[var(--bg-primary)] transition-colors duration-500 overflow-x-hidden font-sans selection:text-[var(--accent)] selection:bg-[var(--accent)]/20">

            {/* Global Campus Fixed Backdrop */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1800&auto=format"
                    alt="Campus Background"
                    className="w-full h-full object-cover opacity-45 dark:opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/80 to-[var(--bg-primary)] dark:from-black/45 dark:via-black/85 dark:to-[var(--bg-primary)]"></div>
            </div>

            {/* HERO SECTION - Redesigned Sassy Style */}
            <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-start pt-32 pb-20 px-6 sm:px-12 overflow-hidden hero-sassy z-10">

                {/* Background Aesthetics */}
                <div className="absolute inset-0 max-w-[100vw] overflow-hidden pointer-events-none">
                    {/* Light Beams */}
                    <div className="light-beam absolute top-0 left-[-20%] w-[1px] h-[150vh] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent rotate-45 blur-[1px]"></div>
                    <div className="light-beam absolute top-[-30%] left-0 w-[1px] h-[150vh] bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-[30deg] blur-[2px]"></div>
                    <div className="light-beam absolute top-[10%] right-[-10%] w-[1px] h-[150vh] bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent -rotate-[15deg] blur-[1px]"></div>

                    {/* Spotlight Corner Lights */}
                    <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-[var(--accent)]/20 rounded-full blur-[110px]"></div>
                    <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[var(--accent-secondary)]/20 rounded-full blur-[110px]"></div>

                    {/* Subtle Glows */}
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]"></div>
                </div>

                {/* 1. TOP SECTION: Typography & Actions (Centered) */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto mb-16 sm:mb-24">
                    <h1 id="hero-headline" className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 dark:text-white leading-[1.05] mb-8">
                        Campus Commerce<br />
                        <span className="text-slate-500 dark:text-[#999]">Re-engineered.</span>
                    </h1>

                    <p className="hero-content-reveal text-lg sm:text-xl text-slate-600 dark:text-[#888] max-w-2xl font-medium leading-relaxed mb-10">
                        The intelligent secondary market for high-performance students.
                        Buy, sell, and liquidate gear instantly. Verified & Commission-free.
                    </p>

                    <div className="hero-content-reveal flex flex-col sm:flex-row items-center gap-5">
                        <Link
                            to="/items"
                            ref={primaryBtnRef}
                            className="w-48 py-4 btn-sassy text-lg flex items-center justify-center active:scale-95 transition-transform"
                        >
                            Buy Now
                        </Link>

                        <Link
                            to="/items"
                            className="w-48 py-4 rounded-full border border-[var(--border-color)] bg-white/90 text-text-primary dark:bg-[var(--bg-surface)]/80 dark:text-white font-bold text-lg hover:bg-[var(--bg-primary)] dark:hover:bg-[var(--bg-surface)]/95 transition-colors duration-300 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            Explore
                        </Link>
                    </div>
                </div>

                {/* 2. BOTTOM SECTION: Tablet Mockup (Reference Style) */}
                <div className="relative z-10 w-full max-w-[85vw] perspective-1000 px-4">
                    <div
                        ref={deviceRef}
                        className="relative w-full aspect-[2/1] bg-black rounded-[24px] md:rounded-[32px] border-[6px] md:border-[12px] border-slate-900 dark:border-white/10 shadow-2xl shadow-slate-950/10 overflow-hidden transform-style-3d group"
                    >
                        {/* Gloss Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent z-20 pointer-events-none mix-blend-overlay"></div>

                        {/* Image Slider */}
                        <div className="absolute inset-0 z-10 bg-black">
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-all duration-[1500ms] ease-out ${index === currentImage
                                        ? 'opacity-100 scale-100'
                                        : 'opacity-0 scale-105'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt="App Interface"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-black/30"></div>
                                </div>
                            ))}
                        </div>

                        {/* Floating Stats / Interaction Hints */}
                        <div className="absolute bottom-8 left-8 z-30 hidden md:flex flex-col gap-2">
                            <div className="px-4 py-2 bg-white/90 text-slate-900 dark:bg-black/60 dark:text-white backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-lg font-bold flex items-center gap-3 shadow-lg">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Market Activity
                            </div>
                        </div>

                    </div>

                    {/* Shadow/Glow under device */}
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-emerald-500/10 blur-[100px] rounded-[100%] pointer-events-none"></div>
                </div>
            </section>

            {/* BENTO GRID POWER FEATURES - Premium Redesign */}
            <section ref={bentoRef} className="relative z-10 py-24 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 gap-6 h-auto md:h-[550px]">

                    {/* CARD 1: Large Feature Card (Left) */}
                    <div className="bento-box col-span-1 md:col-span-2 row-auto md:row-span-2 relative overflow-hidden rounded-[32px] bg-white border border-slate-200 dark:bg-[var(--bg-surface)] dark:border-white/10 group transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:border-emerald-500/30">
                        {/* Hover Glow Gradient */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(800px_circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),rgba(16,185,129,0.06),transparent_40%)] z-0 pointer-events-none"></div>

                        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 z-10">
                            {/* 3D Tilt Element: Search Bar */}
                            <div className="tilt-element mb-auto transform-style-3d perspective-1000">
                                <div className="bg-slate-100 dark:bg-[var(--bg-surface)] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-lg backdrop-blur-md max-w-sm transform transition-transform group-hover:scale-105 duration-500">
                                    <FiSearch className="text-emerald-500 text-xl" />
                                    <div className="h-2 w-24 bg-slate-300 dark:bg-white/10 rounded-full"></div>
                                    <div className="h-2 w-16 bg-slate-300 dark:bg-white/10 rounded-full ml-auto"></div>
                                </div>
                                <div className="mt-4 ml-8 bg-slate-100 dark:bg-[var(--bg-surface)] border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-md max-w-[200px] opacity-60 backdrop-blur-sm">
                                    <div className="flex gap-2 mb-2">
                                        <div className="h-8 w-8 bg-emerald-500/20 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="h-2 w-full bg-slate-300 dark:bg-white/10 rounded-full mb-1"></div>
                                            <div className="h-2 w-1/2 bg-slate-300 dark:bg-white/10 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Intelligent Discovery</h3>
                                <p className="text-lg text-slate-600 dark:text-[#888] font-medium leading-relaxed max-w-md">
                                    Our semantic search engine understands campus context. Find "Engineering Books" even when they're listed as "Mech Textbooks".
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Small Value Card (Top Right 1) */}
                    <div className="bento-box col-span-1 md:col-span-1 bg-white border border-slate-200 dark:bg-[var(--bg-surface)] dark:border-white/10 rounded-[32px] p-8 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:border-emerald-500/30 relative overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <FiCheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Safe Zones</h3>
                            <p className="text-sm text-slate-600 dark:text-[#888]">Verified on-campus meetups.</p>
                        </div>
                        {/* Hover Glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(400px_circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),rgba(16,185,129,0.06),transparent_40%)] z-0 pointer-events-none"></div>
                    </div>

                    {/* CARD 3: Small Value Card (Top Right 2) */}
                    <div className="bento-box col-span-1 md:col-span-1 bg-white border border-slate-200 dark:bg-[var(--bg-surface)] dark:border-white/10 rounded-[32px] p-8 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:border-emerald-500/30 relative overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                            <span className="font-mono font-bold text-xl">0%</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Zero Fees</h3>
                            <p className="text-sm text-slate-600 dark:text-[#888]">Keep 100% of what you earn.</p>
                        </div>
                        {/* Hover Glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(59px_circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),rgba(59,130,246,0.06),transparent_40%)] z-0 pointer-events-none"></div>
                    </div>

                    {/* CARD 4: Wide Rectangle (Bottom Right) */}
                    <div className="bento-box col-span-1 md:col-span-2 bg-white border border-slate-200 dark:bg-[var(--bg-surface)] dark:border-white/10 rounded-[32px] p-8 md:px-12 flex flex-row items-center justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:border-emerald-500/30 relative overflow-hidden">
                        <div className="max-w-[50%] z-10">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Verified Students</h3>
                            <p className="text-slate-600 dark:text-[#888]">Exclusive ecosystem. No bots, no outsiders. Just real peers.</p>
                        </div>

                        {/* 3D Tilt Element: ID Card */}
                        <div className="tilt-element relative z-10 transform-style-3d perspective-1000 group-hover:-translate-y-2 transition-transform duration-500">
                            <div className="w-40 h-24 bg-gradient-to-br from-slate-900 to-black dark:from-emerald-900 dark:to-black rounded-xl border border-white/10 shadow-2xl flex flex-col p-3 relative overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-white/20 mb-2"></div>
                                <div className="h-1.5 w-20 bg-white/20 rounded-full mb-1"></div>
                                <div className="h-1.5 w-12 bg-white/10 rounded-full"></div>
                                <div className="absolute top-3 right-3 text-[8px] text-white/40 font-mono tracking-widest">CAMPUS CARD</div>
                                {/* Holographic Sheen */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 animate-pulse"></div>
                            </div>
                            {/* Decorative blurred card behind */}
                            <div className="absolute top-2 -right-4 w-40 h-24 bg-emerald-500/20 rounded-xl blur-md -z-10 rotate-6"></div>
                        </div>

                        {/* Hover Glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(600px_circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),rgba(16,185,129,0.06),transparent_40%)] z-0 pointer-events-none"></div>
                    </div>

                </div>
            </section>

            {/* DYNAMIC CATEGORY QUICK SWITCHER */}
            <section className="relative z-10 categories-section py-8 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Filter by Category</h2>
                    <p className="text-sm text-slate-500">Select a category to refine listed products below instantly.</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={() => setSelectedCategory("")}
                        className={`category-btn cursor-pointer px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all border ${selectedCategory === ""
                            ? 'bg-[var(--accent)] text-white border-transparent shadow-md'
                            : 'bg-[var(--bg-surface)] text-slate-600 border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
                            }`}
                    >
                        All Assets
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            className={`category-btn cursor-pointer px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all border ${selectedCategory.toLowerCase() === cat.key.toLowerCase()
                                ? 'bg-[var(--accent)] text-white border-transparent shadow-md'
                                : 'bg-[var(--bg-surface)] text-slate-600 border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
                                }`}
                        >
                            {cat.icon}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* DYNAMIC INVENTORY LISTING */}
            <section ref={inventoryRef} className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {selectedCategory ? `${selectedCategory} Catalog` : "Recently Added Assets"}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
                        </p>
                    </div>
                    <Link to="/items" className="text-[var(--accent)] font-bold hover:underline flex items-center gap-1">
                        View Complete Catalog <FiArrowRight />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <Link to={`/item/${item._id}`} key={item._id} className="inventory-item group bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-900">
                                        <img
                                            src={item.images?.[0] || item.image || 'https://via.placeholder.com/400x300?text=Campus+Cart'}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Campus+Item'}
                                        />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider block mb-1">
                                        {item.category}
                                    </span>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-base truncate mb-1">{item.title}</h3>
                                </div>
                                <div className="mt-4 flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                                    <span className="text-[var(--accent)] font-mono font-extrabold text-base">₹{item.price}</span>
                                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 bg-[var(--bg-primary)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                                        {item.subCategory || 'Active'}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl">
                            <p className="text-slate-500 font-semibold">No assets found matches your search or category selection.</p>
                            <button
                                onClick={() => { setSelectedCategory(""); }}
                                className="mt-4 px-6 py-2 bg-[var(--accent)] text-white rounded-full text-sm font-bold"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Dynamic Floating Blobs for Lower Page Sections */}
            <div className="absolute inset-x-0 bottom-0 top-[40%] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[120px] animate-blob-1"></div>
                <div className="absolute bottom-[30%] right-[-10%] w-[550px] h-[550px] bg-[var(--accent-secondary)]/5 rounded-full blur-[140px] animate-blob-2"></div>
            </div>

        </div>
    );
};

export default Home;