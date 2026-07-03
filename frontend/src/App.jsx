import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login.jsx";

import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Items from "./pages/Items.jsx";
import Favorite from "./pages/Favorite.jsx";
import UserAccount from "./pages/UserAccount.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import SellItem from "./pages/SellItem.jsx";
import EditItem from "./pages/EditItem.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import UrgentFeed from "./pages/UrgentFeed.jsx";
import Heatmap from "./pages/Heatmap.jsx";

// ... imports
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import Lenis from '@studio-freight/lenis';

function App() {
  
  useEffect(() => {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
        lenis.destroy();
    };
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
       {/* ... existing Routes ... */}
       <Navbar />
       <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/items" element={<Items />} />
        <Route path="/favorite" element={<ProtectedRoute><Favorite /></ProtectedRoute>} />
        <Route path="/my-account" element={<ProtectedRoute><UserAccount /></ProtectedRoute>} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/items/create" element={<ProtectedRoute><SellItem /></ProtectedRoute>} />
        <Route path="/items/edit/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
        <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/urgent" element={<UrgentFeed />} />
        <Route path="/heatmap" element={<Heatmap />} />
      </Routes>
      </NotificationProvider>
    </ThemeProvider>
  );
}
// ... export

export default App;
 