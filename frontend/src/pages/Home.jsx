import { Link } from "react-router-dom";
import { FiSearch, FiShield, FiArrowRight, FiCheckCircle, FiZap, FiMessageSquare, FiActivity, FiUserCheck, FiHeart } from "react-icons/fi";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from 'split-type';
import Lenis from '@studio-freight/lenis';
import graduatingStudentsImg from "../assets/graduating_students.png";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const { user } = useAuth();
    const heroRef = useRef(null);
    const deviceRef = useRef(null);
    const primaryBtnRef = useRef(null);
    const bentoRef = useRef(null);
    const inventoryRef = useRef(null);

    // Add home-page class to body on mount, remove on unmount
    useEffect(() => {
        document.body.classList.add("home-page");
        return () => {
            document.body.classList.remove("home-page");
        };
    }, []);

    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentImage, setCurrentImage] = useState(0);
    const images = [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format", // Opaque student collaboration
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format", // Tech students group
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format"  // University campus discussion
    ];

    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        { name: "Electronics", key: "electronics", icon: "💻" },
        { name: "Books & Study", key: "books", icon: "📚" },
        { name: "Dorm Essentials", key: "dorm", icon: "🏠" },
        { name: "Sports & Fitness", key: "sports", icon: "⚡" }
    ];

    // Scroll progress tracker for responsive neon spotlight
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                setScrollProgress(window.scrollY / totalScroll);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
        if (searchQuery) {
            items = items.filter(item =>
                item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredItems(items.slice(0, 8));
    }, [selectedCategory, searchQuery, allItems]);

    // Animate inventory items when they load/change
    useEffect(() => {
        if (filteredItems.length > 0) {
            gsap.fromTo(".inventory-item",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: "power2.out" }
            );
        }
    }, [filteredItems]);

    // Image Slider Interval
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    // Dynamic Trending Search terms from database
    const getTrendingTags = () => {
        if (!allItems || allItems.length === 0) {
            return ["MacBook", "Textbooks", "Bicycle", "Calculator"];
        }
        const counts = {};
        allItems.forEach(item => {
            if (item.category) {
                const cat = item.category.trim();
                counts[cat] = (counts[cat] || 0) + 2.0;
            }
            if (item.subCategory) {
                const sub = item.subCategory.trim();
                counts[sub] = (counts[sub] || 0) + 1.5;
            }
            if (item.title) {
                const words = item.title.split(/\s+/);
                words.forEach(word => {
                    const clean = word.replace(/[^a-zA-Z]/g, "");
                    if (clean.length > 3) {
                        const formatted = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
                        counts[formatted] = (counts[formatted] || 0) + 1.0;
                    }
                });
            }
        });
        const ignoreList = ["Item", "With", "From", "Here", "Some", "Used", "Good", "Very", "Brand", "Books"];
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0])
            .filter(tag => !ignoreList.includes(tag))
            .slice(0, 4);
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
        setSelectedCategory("");
    };

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
            const headlineEl = document.getElementById('hero-headline');
            if (headlineEl) {
                const headline = new SplitType(headlineEl, { types: 'chars, words' });
                if (headline.chars) {
                    gsap.from(headline.chars, {
                        y: 50,
                        opacity: 0,
                        rotateX: -90,
                        stagger: 0.02,
                        duration: 1,
                        ease: "power3.out",
                        delay: 0.2
                    });
                }
            }

            gsap.set(deviceRef.current, { rotationY: -10, rotationX: 5 });

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

            gsap.to(deviceRef.current, {
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                },
                y: 100,
                scale: 0.96,
                ease: "none"
            });



            gsap.from(".bento-box", {
                scrollTrigger: { trigger: bentoRef.current, start: "top 80%" },
                y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out"
            });


        });

        return () => {
            ctx.revert();
            lenis.destroy();
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-x-hidden font-sans selection:text-[var(--accent)] selection:bg-[var(--accent)]/20">

            {/* HERO SECTION */}
            <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-start pt-32 pb-20 px-6 sm:px-12 overflow-hidden hero-sassy z-10">

                {/* Background Aesthetics */}
                <div className="absolute inset-0 max-w-[100vw] overflow-hidden pointer-events-none">
                    {/* Light Beams */}
                    <div className="light-beam absolute top-0 left-[-20%] w-[1px] h-[150vh] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent rotate-45 blur-[1px]"></div>
                    <div className="light-beam absolute top-[-30%] left-0 w-[1px] h-[150vh] bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-[30deg] blur-[2px]"></div>
                    <div className="light-beam absolute top-[10%] right-[-10%] w-[1px] h-[150vh] bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent -rotate-[15deg] blur-[1px]"></div>

                    {/* Spotlight Corner Lights */}
                    <div className="absolute top-[-15%] left-[-15%] w-[550px] h-[550px] bg-[var(--accent)]/35 rounded-full blur-[130px]"></div>
                    <div className="absolute top-[-15%] right-[-15%] w-[550px] h-[550px] bg-[var(--accent-secondary)]/35 rounded-full blur-[130px]"></div>

                    {/* Subtle Glows */}
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]"></div>
                </div>

                {/* 1. TOP SECTION: Typography & Actions (Centered) */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto mb-12">
                    <h1 id="hero-headline" className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 dark:text-white leading-[1.05] mb-8">
                        Campus Exchange,<br />
                        <span className="text-slate-500 dark:text-[#999]">Re-imagined.</span>
                    </h1>

                    <p className="hero-content-reveal text-lg sm:text-xl text-slate-600 dark:text-[#888] max-w-2xl font-medium leading-relaxed mb-10">
                        A premium, secure secondary market designed exclusively for campus residents.
                        List, swap, and acquire gear instantly with zero commission.
                    </p>

                    {/* Interactive Search Bar Panel */}
                    <div className="hero-content-reveal w-full max-w-xl mb-6 relative">
                        <div className="flex items-center bg-[var(--bg-surface)]/80 dark:bg-[var(--bg-surface)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-3xl px-5 py-4 shadow-xl focus-within:ring-2 focus-within:ring-[var(--accent)] transition-all">
                            <FiSearch className="text-slate-400 text-2xl mr-4" />
                            <input
                                type="text"
                                placeholder="Search electronics, course materials, hostels swap..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full text-base font-medium placeholder-slate-400"
                            />
                        </div>
                        {/* Dynamic Trending Searches */}
                        <div className="flex flex-wrap gap-2.5 justify-center mt-4.5 text-xs">
                            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px] mt-1">Trending:</span>
                            {getTrendingTags().map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className="cursor-pointer bg-[var(--bg-surface)] border border-[var(--border-color)] px-3 py-1 rounded-full text-slate-600 dark:text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all font-semibold shadow-sm"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hero-content-reveal flex flex-col sm:flex-row items-center gap-5 mt-4">
                        <Link
                            to="/items"
                            ref={primaryBtnRef}
                            className="w-48 py-4 btn-sassy text-lg flex items-center justify-center active:scale-95 transition-transform"
                        >
                            Buy Now
                        </Link>

                        <Link
                            to={user ? "/items/create" : "/login"}
                            className="w-48 py-4 rounded-full border border-[var(--border-color)] bg-white/90 text-text-primary dark:bg-[var(--bg-surface)]/80 dark:text-white font-bold text-lg hover:bg-[var(--bg-primary)] dark:hover:bg-[var(--bg-surface)]/95 transition-colors duration-300 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            Sell Item
                        </Link>
                    </div>
                </div>

                {/* 2. BOTTOM SECTION: Tablet Mockup */}
                <div className="relative z-10 w-full max-w-[85vw] perspective-1000 px-4 mt-8">

                    {/* Upward Spotlight source directly above the picture panel */}
                    <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[75%] h-[150px] bg-gradient-to-t from-[var(--accent)]/20 via-[var(--accent)]/5 to-transparent blur-[50px] pointer-events-none rounded-[100%] z-20"></div>

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

            {/* BENTO GRID POWER FEATURES - Redesigned & Upgraded */}
            <section ref={bentoRef} className="relative z-10 py-24 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-[var(--accent)] bg-[var(--accent)]/15 px-3 py-1 rounded-full">
                        Built for Students
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold mt-4 text-slate-900 dark:text-white tracking-tight">
                        Ecosystem Capabilities
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* CARD 1: Intelligent Discovery */}
                    <div className="bento-box glass-panel border border-[var(--border-color)] rounded-[32px] p-8 hover:shadow-xl hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FiSearch size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Context-Aware Search</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Our semantic discovery engine understands course codes, shorthand, and abbreviations, matching you to exact academic materials instantly.
                            </p>
                        </div>
                        <div className="mt-6 -mx-8 -mb-8 overflow-hidden h-32 opacity-75 group-hover:opacity-100 transition-opacity">
                            <img src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1000&auto=format" alt="Academic Books" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* CARD 2: Safe Zones */}
                    <div className="bento-box glass-panel border border-[var(--border-color)] rounded-[32px] p-8 hover:shadow-xl hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FiShield size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Protected Swaps</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Coordinate transactions at pre-designated, highly visible university spots—like main libraries and central plazas.
                            </p>
                        </div>
                        <div className="mt-6 -mx-8 -mb-8 overflow-hidden h-32 opacity-75 group-hover:opacity-100 transition-opacity">
                            <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000&auto=format" alt="Safe Meetup Map" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* CARD 3: Zero Commission */}
                    <div className="bento-box glass-panel border border-[var(--border-color)] rounded-[32px] p-8 hover:shadow-xl hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="font-mono font-black text-lg">0%</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">100% Peer Revenue</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Keep every rupee of your sale. We charge zero listing fees, zero transaction fees, and zero commissions.
                            </p>
                        </div>
                        <div className="mt-6 -mx-8 -mb-8 overflow-hidden h-32 opacity-75 group-hover:opacity-100 transition-opacity">
                            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format" alt="Peer Exchange Transaction" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* CARD 4: Verified Network */}
                    <div className="bento-box glass-panel border border-[var(--border-color)] rounded-[32px] p-8 hover:shadow-xl hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FiUserCheck size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Exclusively Peers</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Access is strictly restricted to verified student accounts. No spammers, no third-party commercial sellers—just your campus community.
                            </p>
                        </div>
                    </div>

                    {/* CARD 5: Urgent Swaps */}
                    <div className="bento-box glass-panel border border-[var(--border-color)] rounded-[32px] p-8 hover:shadow-xl hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FiZap size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Urgent Swaps</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Need a lab coat or calculator right away? Post urgent requirements to the reverse feed for immediate campus matches.
                            </p>
                        </div>
                    </div>

                    {/* CARD 6: Live Conversations */}
                    <div className="bento-box glass-panel border border-[var(--border-color)] rounded-[32px] p-8 hover:shadow-xl hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FiMessageSquare size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Direct Negotiation</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Connect instantly with integrated chat rooms to negotiate prices, discuss items, and finalize safety swap details securely.
                            </p>
                        </div>
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
                            : 'bg-[var(--bg-surface)]/80 text-slate-600 border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
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
                                : 'bg-[var(--bg-surface)]/80 text-slate-600 border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
                                }`}
                        >
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
                            <Link to={`/item/${item._id}`} key={item._id} className="inventory-item group bg-[var(--bg-surface)]/80 dark:bg-[var(--bg-surface)]/60 border border-[var(--border-color)] rounded-3xl p-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
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
                                onClick={() => { setSelectedCategory(""); setSearchQuery(""); }}
                                className="mt-4 px-6 py-2 bg-[var(--accent)] text-white rounded-full text-sm font-bold"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Scroll-Responsive Neon Spotlight Orb that moves vertically on mouse scrolling */}
            <div
                className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-emerald-500/10 via-[var(--accent)]/10 to-amber-500/10 rounded-full blur-[110px] pointer-events-none transition-all duration-300 ease-out z-0"
                style={{ top: `${scrollProgress * 85}%`, left: '15%' }}
            ></div>

            {/* Dynamic Floating Blobs for Lower Page Sections */}
            <div className="absolute inset-x-0 bottom-0 top-[40%] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[120px] animate-blob-1"></div>
                <div className="absolute bottom-[30%] right-[-10%] w-[550px] h-[550px] bg-[var(--accent-secondary)]/5 rounded-full blur-[140px] animate-blob-2"></div>
            </div>

        </div>
    );
};

export default Home;