import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

import {
  FiMenu,
  FiX,
  FiHome,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiLogOut,
  FiBox,
  FiSun,
  FiMoon,
  FiBell,
  FiMapPin,
  FiClock,
  FiTrendingUp
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, notifications } = useNotification();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 sm:h-20 bg-[var(--nav-bg)] shadow-sassy backdrop-blur-xl border-b border-[var(--border-color)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] shadow-md flex items-center justify-center text-white font-heading text-base font-black">
                CC
              </div>
              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent)] font-extrabold">CampusCart</p>
              </div>
            </Link>
          </div>

          {/* SIMPLIFIED DESKTOP NAVIGATION LINKS */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-1">
            <NavLinks mobile={false} isActive={isActive} user={user} setOpen={setOpen} />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <NotificationIcon unreadCount={unreadCount} notifications={notifications} showNotifications={showNotifications} setShowNotifications={setShowNotifications} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            {/* UNIFIED DASHBOARD SLIDE TOGGLE */}
            {user ? (
              <button
                onClick={() => setOpen(true)}
                className="cursor-pointer flex items-center gap-2 pl-1 pr-3 py-1 bg-[var(--bg-surface)]/80 hover:bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full transition-all duration-300"
                title="Open Dashboard"
              >
                {user.image ? (
                  <img src={user.image} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-sm font-bold">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <span className="hidden lg:inline text-sm font-bold text-slate-800 dark:text-slate-200">Dashboard</span>
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="rounded-full px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary transition">
                  Login
                </Link>
                <Link to="/register" className="btn-sassy text-xs uppercase tracking-wider font-extrabold px-5 py-2.5 shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle when not logged in */}
            {!user && (
              <button
                onClick={() => setOpen(true)}
                className="md:hidden p-2 text-text-primary dark:text-white hover:bg-[rgba(139,109,72,0.12)] dark:hover:bg-[rgba(184,177,139,0.15)] rounded-lg transition"
                aria-label="Open menu"
              >
                <FiMenu size={24} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300" onClick={() => setOpen(false)} />
      )}

      {/* DYNAMIC SIDE DASHBOARD DRAWER */}
      <aside className={`fixed top-0 right-0 h-full w-[88%] max-w-sm bg-[var(--bg-surface)] z-50 transform ${open ? "translate-x-0" : "translate-x-full"} transition-transform duration-500 ease-out shadow-2xl border-l border-[var(--border-color)]`}>
        <div className="flex flex-col h-full">
          <div className="px-6 h-20 flex items-center justify-between border-b border-[var(--border-color)]">
            <span className="font-bold text-lg text-slate-900 dark:text-white font-heading">Campus Dashboard</span>
            <button onClick={() => setOpen(false)} className="cursor-pointer p-2 rounded-full hover:bg-[var(--bg-primary)] transition text-slate-500 dark:text-slate-300" aria-label="Close menu">
              <FiX size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5" data-lenis-prevent>
            {/* User Profile Summary inside Slider */}
            {user && (
              <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl flex items-center gap-3">
                {user.image ? (
                  <img src={user.image} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-[var(--accent)]" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-lg font-black">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white leading-tight">{user.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-48">{user.email}</p>
                </div>
              </div>
            )}

            {/* Direct Sell Link Card in Dashboard */}
            <div className="p-4 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-secondary)]/5 border border-[var(--accent)]/20 rounded-2xl">
              <h5 className="font-bold text-sm text-[var(--accent)] mb-1">List items instantly</h5>
              <p className="text-xs text-slate-500 mb-3">Sell gadgets, textbooks, room swaps, or study materials to peers.</p>
              <Link
                to={user ? "/items/create" : "/login"}
                onClick={() => setOpen(false)}
                className="block text-center bg-[var(--accent)] hover:bg-[var(--accent-secondary)] text-white text-xs font-bold py-2 rounded-xl transition"
              >
                Create Listing
              </Link>
            </div>

            <div className="space-y-1">
              <span className="block px-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Navigations</span>
              <NavLinks mobile={true} isActive={isActive} user={user} setOpen={setOpen} />
            </div>

            <div className="mt-4 border-t border-[var(--border-color)] pt-4">
              {user ? (
                <button onClick={() => { setOpen(false); logout(); }} className="cursor-pointer w-full rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-300 px-4 py-3 font-semibold hover:bg-red-100 transition">
                  Logout Account
                </button>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={() => setOpen(false)} className="block rounded-full px-4 py-3 text-center bg-[var(--bg-primary)] text-text-primary dark:text-white font-semibold hover:opacity-90 transition">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block btn-sassy text-center uppercase tracking-wider text-xs font-extrabold w-full py-3.5">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="h-16 sm:h-20" />
    </>
  );
};

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      toggleTheme();
    }}
    className="p-2 rounded-full hover:bg-[var(--border-color)] transition cursor-pointer text-text-primary"
    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    type="button"
  >
    {theme === 'dark' ? <FiSun className="text-yellow-400" size={20} /> : <FiMoon className="text-text-primary" size={20} />}
  </button>
);

const NotificationIcon = ({ unreadCount, notifications, showNotifications, setShowNotifications }) => (
  <div className="relative">
    <button
      onClick={() => setShowNotifications(!showNotifications)}
      className="relative cursor-pointer hover:bg-[var(--border-color)] p-2 rounded-full transition outline-none"
    >
      <FiBell size={20} className="text-text-primary" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
          {unreadCount > 4 ? '4+' : unreadCount}
        </span>
      )}
    </button>

    {showNotifications && (
      <>
        <div className="fixed inset-0 z-90" onClick={() => setShowNotifications(false)} />
        <div className="absolute right-0 mt-2 w-80 dark:bg-slate-700 bg-white rounded-xl shadow-lg border border-border-color overflow-hidden z-100 animate-fade-in max-w-[90vw]">
          <div className="p-3 border-b border-border-color bg-surface">
            <h3 className="font-bold text-text-primary">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-text-secondary text-sm">No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.orderId}
                  to={`/order/${notif.orderId}`}
                  onClick={() => setShowNotifications(false)}
                  className="block p-3 hover:bg-[var(--bg-primary)] transition border-b border-border-color last:border-none"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-text-primary">{notif.senderName}</p>
                      <p className="text-xs text-text-secondary truncate max-w-45">{notif.lastMessage}</p>
                    </div>
                    {notif.count > 0 && (
                      <span className="bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold px-2 py-0.5 rounded-full">{notif.count} new</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </>
    )}
  </div>
);

const NavLinks = ({ mobile = false, isActive, user, setOpen }) => {
  const linkBaseClass = mobile
    ? "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
    : "relative px-3 py-2 text-base font-semibold transition-colors duration-200";

  const activeClass = mobile
    ? "bg-[var(--bg-primary)] text-text-primary dark:text-white font-bold"
    : "text-text-primary dark:text-white";

  const inactiveClass = mobile
    ? "text-text-secondary hover:bg-[var(--bg-primary)] hover:text-text-primary"
    : "text-text-secondary hover:text-text-primary";

  if (!mobile) {
    // Desktop NavLinks: Home, Urgent Feed, Market
    return (
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className={`${linkBaseClass} ${isActive("/") ? activeClass : inactiveClass}`}
        >
          <span>Home</span>
          {isActive("/") && <DesktopActiveIndicator />}
        </Link>

        <Link
          to="/urgent"
          className={`${linkBaseClass} ${isActive("/urgent") ? activeClass : inactiveClass}`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="inline-flex w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Urgent Feed</span>
          </div>
          {isActive("/urgent") && <DesktopActiveIndicator />}
        </Link>

        <Link
          to="/items"
          className={`${linkBaseClass} ${isActive("/items") ? activeClass : inactiveClass}`}
        >
          <span>Market</span>
          {isActive("/items") && <DesktopActiveIndicator />}
        </Link>

        <Link
          to="/analytics"
          className={`${linkBaseClass} ${isActive("/analytics") ? activeClass : inactiveClass}`}
        >
          <span>Stats</span>
          {isActive("/analytics") && <DesktopActiveIndicator />}
        </Link>
      </div>
    );
  }

  // Sliding Side Dashboard Drawer List
  return (
    <>
      <Link
        to="/"
        className={`${linkBaseClass} ${isActive("/") ? activeClass : inactiveClass}`}
        onClick={() => setOpen(false)}
      >
        <FiHome />
        <span>Home</span>
      </Link>

      <Link
        to="/items"
        className={`${linkBaseClass} ${isActive("/items") ? activeClass : inactiveClass}`}
        onClick={() => setOpen(false)}
      >
        <FiBox />
        <span>Market Catalog</span>
      </Link>

      <Link
        to="/urgent"
        className={`${linkBaseClass} ${isActive("/urgent") ? activeClass : inactiveClass}`}
        onClick={() => setOpen(false)}
      >
        <FiClock />
        <span>Urgent Feed</span>
      </Link>

      <Link
        to="/heatmap"
        className={`${linkBaseClass} ${isActive("/heatmap") ? activeClass : inactiveClass}`}
        onClick={() => setOpen(false)}
      >
        <FiMapPin />
        <span>Campus Map</span>
      </Link>

      <Link
        to="/analytics"
        className={`${linkBaseClass} ${isActive("/analytics") ? activeClass : inactiveClass}`}
        onClick={() => setOpen(false)}
      >
        <FiTrendingUp />
        <span>Stats & AI</span>
      </Link>

      {user && (
        <>
          <Link
            to="/orders"
            className={`${linkBaseClass} ${isActive("/orders") ? activeClass : inactiveClass}`}
            onClick={() => setOpen(false)}
          >
            <FiShoppingBag />
            <span>My Orders</span>
          </Link>

          <Link
            to="/favorite"
            className={`${linkBaseClass} ${isActive("/favorite") ? activeClass : inactiveClass}`}
            onClick={() => setOpen(false)}
          >
            <FiHeart />
            <span>Favorites</span>
          </Link>

          <Link
            to="/my-account"
            className={`${linkBaseClass} ${isActive("/my-account") ? activeClass : inactiveClass}`}
            onClick={() => setOpen(false)}
          >
            <FiUser />
            <span>My Account</span>
          </Link>
        </>
      )}
    </>
  );
};

const DesktopActiveIndicator = () => (
  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-full shadow-[0_0_10px_rgba(140,115,72,0.35)]" />
);

export default Navbar;
