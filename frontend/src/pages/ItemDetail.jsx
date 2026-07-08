import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { FiHeart, FiShoppingCart, FiShare2, FiStar, FiShield, FiArrowLeft, FiCheck } from "react-icons/fi";
import gsap from "gsap";

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, refreshUser } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    
    // Refs for GSAP
    const containerRef = useRef(null);
    
    // Fetch Data
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/item/${id}`);
                setItem(res.data?.data || null);
                if (res.data?.data?.images?.length > 0) {
                    setMainImage(res.data.data.images[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    // Simple Entrance Animations (No Shaking)
    useLayoutEffect(() => {
        if (!item || loading) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Simple Fade In & Slide Up
            tl.from(".animate-enter", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out"
            });

        }, containerRef);

        return () => ctx.revert();
    }, [loading, item]);


    const toggleFavorite = async () => {
        if (!isAuthenticated) return navigate('/login');
        
        try {
            const res = await api.post(`/user/favorite/${id}`);
            if (res.data.success) {
                 await refreshUser();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const buyItem = async () => {
        if (!isAuthenticated) return navigate('/login');
        if (user?._id === item.seller._id) return alert("You cannot buy your own item!");
        if(!confirm("Are you sure you want to place an order?")) return;

        try {
            await api.post(`/order/${id}`);
            alert("Order placed successfully!");
            navigate('/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Error');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try { await navigator.share({ title: item.title, url: window.location.href }); } catch (err) {}
        } else {
             navigator.clipboard.writeText(window.location.href);
             alert("Link copied!");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="w-8 h-8 border-4 border-[#8b6d48] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!item) return <div className="text-center p-20 text-red-500 font-bold">Item not found</div>;

    const isFavorite = user?.favorites?.some(f => (typeof f === 'string' ? f : f._id) === item._id) || false;

    return (
        <div ref={containerRef} className="min-h-screen bg-transparent text-text-primary dark:text-white transition-colors duration-500 overflow-x-hidden">
            
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
                <button 
                    onClick={() => navigate(-1)} 
                    className="animate-enter mb-8 flex items-center gap-2 text-text-secondary hover:text-[#8b6d48] transition-colors group font-medium"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
                    
                    {/* LEFT: Image Section (Smaller & Clean) */}
                    <div className="animate-enter flex flex-col gap-6">
                         <div className="relative w-full aspect-[4/5] md:aspect-square max-h-[500px] rounded-[32px] overflow-hidden panel-sassy flex items-center justify-center p-6">
                             <div className="absolute top-4 right-4 z-10">
                                 <div className="bg-[#8b6d48]/10 backdrop-blur-md border border-[#8b6d48]/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                     <FiShield className="text-[#8b6d48] w-3.5 h-3.5" />
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e5234] dark:text-[#e8d3b6]">Verified</span>
                                 </div>
                             </div>

                             <img 
                                src={mainImage} 
                                alt={item.title} 
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500 ease-out"
                             />
                         </div>

                         {/* Thumbnails */}
                         {item.images?.length > 1 && (
                            <div className="flex gap-3 justify-center">
                                {item.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setMainImage(img)}
                                        className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-[#8b6d48]' : 'border-transparent opacity-50 hover:opacity-100 hover:border-[#8b6d48]/60 dark:hover:border-[#a79e7d]'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                         )}
                    </div>

                    {/* RIGHT: Details Panel */}
                    <div className="flex flex-col animate-enter">
                        
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 rounded-full bg-[#f4ead2] dark:bg-[#263041] text-[#6b543d] dark:text-[#f3e2c4] text-xs font-bold uppercase tracking-widest">
                                {item.category}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                <FiStar className="fill-current w-3.5 h-3.5" />
                                <span className="text-xs font-bold">{item.seller?.averageRating?.toFixed(1) || "NR"}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-text-primary dark:text-white leading-[1.1] mb-6 tracking-tight">
                            {item.title}
                        </h1>

                        <div className="flex items-baseline gap-2 mb-8 border-b border-[#d8c9b2] dark:border-white/10 pb-8">
                            <span className="text-5xl font-bold text-[#8b6d48] dark:text-[#ecd8b1]">
                                ₹{item.price}
                            </span>
                        </div>

                        <div className="prose dark:prose-invert max-w-none mb-10 text-text-secondary dark:text-[#b8b18b] text-lg leading-relaxed">
                            {item.description}
                        </div>

                        {/* Seller Info (More Compact) */}
                        <div className="flex items-center gap-4 mb-10 p-4 rounded-3xl bg-[#f4ead2] dark:bg-[#1c2238]/80 border border-[#d8c9b2] dark:border-[#394254]">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6b5f49] to-[#3a3427] flex items-center justify-center text-white font-bold text-lg">
                                {item.seller?.name[0]}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-bold text-text-primary dark:text-white">{item.seller?.name}</p>
                                    <div className="flex gap-1">
                                        {item.seller?.isVerifiedStudent && (
                                            <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200/30 animate-pulse" title="Verified Student">
                                                <FiCheck className="w-2.5 h-2.5 stroke-[3]" /> Student
                                            </span>
                                        )}
                                        {item.seller?.isVerifiedSeller && (
                                            <span className="inline-flex items-center gap-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-amber-200/30 animate-pulse" title="Verified Seller">
                                                <FiStar className="w-2.5 h-2.5 fill-current" /> Seller
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-text-secondary dark:text-[#b8b18b]">{item.seller?.collegeName}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                            <button 
                                onClick={buyItem}
                                className="flex-1 h-14 rounded-3xl btn-sassy text-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <FiShoppingCart />
                                {user?._id === item.seller._id ? "Your Item" : "Buy Now"}
                            </button>

                            <div className="flex gap-4">
                                <button 
                                    onClick={toggleFavorite}
                                    className={`h-14 w-14 rounded-3xl border-2 flex items-center justify-center transition-all ${isFavorite ? 'border-[#8b6d48] bg-[#f4ead2] text-[#8b6d48]' : 'border-[#d2c4ab] hover:border-[#8b6d48] hover:text-[#8b6d48] text-text-secondary'}`}
                                >
                                    <FiHeart className={`text-xl ${isFavorite ? 'fill-current' : ''}`} />
                                </button>
                                <button 
                                    onClick={handleShare}
                                    className="h-14 w-14 rounded-3xl border-2 border-[#d2c4ab] hover:border-[#8b6d48] hover:text-[#8b6d48] text-text-secondary flex items-center justify-center transition-all"
                                >
                                    <FiShare2 className="text-xl" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;
 