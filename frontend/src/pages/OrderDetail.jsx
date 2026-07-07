import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { io } from "socket.io-client";
import { FiSend, FiMessageSquare, FiInfo, FiTruck, FiStar, FiX } from "react-icons/fi";

const OrderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { markAsRead } = useNotification();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const socket = useRef(null);
    const scrollRef = useRef(null);

    const [showRateModal, setShowRateModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [rateLoading, setRateLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/order/details/${id}`);
                setOrder(res.data.data);
                
                const chatRes = await api.get(`/chat/${id}`);
                setMessages(chatRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        markAsRead(id);

        socket.current = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true
        });
        socket.current.emit("join_room", id);

        socket.current.on("receive_message", (msg) => {
            setMessages((prev) => [...prev, msg]);
            markAsRead(id);
        });

        socket.current.on("error", (msg) => {
            alert(msg);
        });

        return () => {
            socket.current.disconnect();
        };
    }, [id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || messages.length >= 20) return;

        socket.current.emit("send_message", {
            orderId: id,
            senderId: user._id,
            content: newMessage.trim()
        });
        setNewMessage("");
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setRateLoading(true);
        try {
            await api.post("/review/create", {
                orderId: id,
                rating,
                comment
            });
            setShowRateModal(false);
            // Refresh order logic locally or re-fetch
            setOrder(prev => ({ ...prev, isReviewed: true }));
            alert("Review submitted successfully!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to submit review");
        } finally {
            setRateLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading order...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

    const isConfirmed = order.status === "CONFIRMED" || order.status === "COMPLETED";

    return (
        <div className="relative min-h-screen bg-transparent pt-24 pb-16 px-4 transition-colors duration-300 overflow-hidden font-sans">

            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 relative z-10">
                
                {/* Order Summary */}
                <div className="md:col-span-1 space-y-6">
<div className="bg-surface p-6 rounded-[32px] shadow-sassy border border-border-color">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <FiInfo className="text-[#8b6d48]" /> Order Details
                    </h2>
                    <div className="aspect-square rounded-[28px] overflow-hidden mb-4 bg-[#f4ead2] dark:bg-[var(--bg-surface)]">
                        <img src={order.item?.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-lg text-text-primary uppercase tracking-tight">{order.item?.title}</h3>
                    <p className="text-[#8b6d48] font-bold text-xl mt-1">₹{order.item?.price}</p>
                        
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Status:</span>
                                <span className="font-bold text-emerald-600">{order.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Buyer:</span>
                                <span className="text-text-primary">{order.buyer?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Seller:</span>
                                <span className="text-text-primary">{order.seller?.name}</span>
                            </div>
                            </div>
                        </div>

                        {order.status === "COMPLETED" && !order.isReviewed && user._id === order.buyer?._id && (
                            <button 
                                onClick={() => setShowRateModal(true)}
                                className="w-full mt-4 bg-yellow-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-yellow-200 hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                            >
                                <FiStar className="fill-current" /> Rate Seller
                            </button>
                        )}
                        {order.isReviewed && (
                             <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-center text-sm font-bold border border-green-100">
                                 ✓ You rated this seller
                             </div>
                        )}


                    <div className="bg-[#f4ead2] dark:bg-[rgba(92,66,38,0.12)] p-6 rounded-[32px] border border-[#d8c9b2] dark:border-[var(--border-color)]">
                         <h3 className="font-bold text-[#8b6d48] dark:text-[#ecd8b1] flex items-center gap-2 mb-2">
                             <FiTruck /> Chat Purpose
                         </h3>
                         <p className="text-sm text-text-secondary dark:text-[#b8b194] leading-relaxed">
                             Decide on handover details or whether you need a delivery partner. 
                             <span className="block mt-2 font-bold italic">Limit: 20 messages per order.</span>
                         </p>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="md:col-span-2 flex flex-col h-[600px] bg-surface rounded-3xl shadow-sm border border-border-color overflow-hidden">
                    <div className="p-4 border-b border-border-color bg-[#f4ead2] dark:bg-[#1d1138]/60 flex justify-between items-center">
                        <h2 className="font-bold text-text-primary flex items-center gap-2">
                            <FiMessageSquare className="text-[#8b6d48]" /> Order Chat
                        </h2>
                        <span className="text-xs bg-[#f4ead2] text-[#8b6d48] px-3 py-1 rounded-full font-bold">
                            {messages.length} / 20 MSGS
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {!isConfirmed ? (
                            <div className="h-full flex items-center justify-center text-center text-[#8b6d48] bg-[#f4ead2] dark:bg-[#111c2c]/40 rounded-[28px] p-6">
                                <div>
                                    <FiMessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-semibold">Chat becomes available once the seller confirms the order.</p>
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Start your conversation...
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                                return (
                                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                                            isMe 
                                            ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-200 dark:shadow-none' 
                                            : 'bg-primary text-text-primary rounded-tl-none'
                                        }`}>
                                            <p className="font-bold text-[10px] mb-1 opacity-70 uppercase tracking-tighter">
                                                {isMe ? 'You' : msg.sender?.name}
                                            </p>
                                            <p>{msg.content}</p>
                                        </div>
                                        <span className="text-[10px] text-[#8b6d48] mt-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {isConfirmed && (
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-border-color bg-[#f4ead2] dark:bg-[#1f133f]/70">
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={messages.length >= 20 ? "Message limit reached" : "Type your message..."}
                                    disabled={messages.length >= 20}
                                    className="flex-1 bg-surface border border-border-color rounded-3xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8b6d48] transition disabled:opacity-50 text-text-primary"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim() || messages.length >= 20}
                                    className="bg-[#8b6d48] text-white p-3 rounded-3xl hover:bg-[#7a5d3f] transition disabled:opacity-50 shadow-lg shadow-[#8b6d48]/20 dark:shadow-none"
                                >
                                    <FiSend />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Rating Modal */}
            {showRateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-text-primary">Rate Experience</h3>
                            <button onClick={() => setShowRateModal(false)} className="text-text-secondary hover:text-text-primary"><FiX size={24}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="text-4xl focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <FiStar 
                                            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-[#8e7aac]"} 
                                        />
                                    </button>
                                ))}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Comment (Optional)</label>
                                <textarea
                                    className="w-full bg-primary border border-border-color rounded-3xl p-3 text-text-primary outline-none focus:ring-2 focus:ring-[#8b6d48] transition resize-none"
                                    rows="3"
                                    placeholder="How was your experience with this seller?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={rateLoading}
                                className="w-full bg-[#8b6d48] text-white font-bold py-3 rounded-3xl shadow-lg shadow-[#8b6d48]/20 hover:bg-[#7a5d3f] transition disabled:opacity-50"
                            >
                                {rateLoading ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Dynamic Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                 <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] bg-[var(--accent)]/5 rounded-full blur-[110px] animate-blob-1"></div>
                 <div className="absolute bottom-[30%] right-[-15%] w-[500px] h-[500px] bg-[var(--accent-secondary)]/5 rounded-full blur-[130px] animate-blob-2"></div>
            </div>
        </div>
    );
};

export default OrderDetail;
 