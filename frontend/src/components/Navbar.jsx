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
  FiBell
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
      <nav className="fixed top-0 inset-x-0 z-50 h-16 sm:h-20 bg-[rgba(255,255,255,0.86)] dark:bg-[rgba(8,6,18,0.92)] shadow-sassy backdrop-blur-xl border-b border-(--border-color) transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#836044] via-[#b09a6e] to-[#e8d5b5] shadow-lg shadow-[rgba(92,66,38,0.18)] flex items-center justify-center text-white font-heading text-lg font-black">
                CC
              </div>
              <div className="hidden sm:block">
                <p className="text-sm uppercase tracking-[0.35em] text-(--accent-secondary)">CampusCart</p>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center justify-center flex-1 space-x-6">
            <NavLinks mobile={false} isActive={isActive} user={user} setOpen={setOpen} />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <NotificationIcon unreadCount={unreadCount} notifications={notifications} showNotifications={showNotifications} setShowNotifications={setShowNotifications} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <Link to="/my-account" className="rounded-full border border-transparent bg-[rgba(139,109,72,0.12)] text-text-primary dark:text-white px-4 py-2 text-sm font-semibold hover:bg-[rgba(139,109,72,0.18)] transition">
                  Account
                </Link>
              ) : (
                <>
                  <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary dark:text-[#b8b194] hover:text-text-primary dark:hover:text-white transition">
                    Login
                  </Link>
                  <Link to="/register" className="rounded-full bg-gradient-to-r from-[#8b6d48] via-[#b8b18b] to-[#e7d4ae] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(92,66,38,0.2)] hover:opacity-95 transition">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 text-text-primary dark:text-white hover:bg-[rgba(139,109,72,0.12)] dark:hover:bg-[rgba(184,177,139,0.15)] rounded-lg transition"
              aria-label="Open menu"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 right-0 h-full w-[82%] max-w-sm bg-white dark:bg-[#0b0f1e] z-50 transform ${open ? "translate-x-0" : "translate-x-full"} transition-transform duration-500 ease-out shadow-2xl border-l border-slate-200 dark:border-white/10`}>
        <div className="flex flex-col h-full">
          <div className="px-6 h-20 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
            <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition text-slate-500 dark:text-slate-300" aria-label="Close menu">
              <FiX size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            <NavLinks mobile={true} isActive={isActive} user={user} setOpen={setOpen} />
            <div className="mt-4 border-t border-slate-200 dark:border-white/10 pt-4">
              {user ? (
                <button onClick={() => { setOpen(false); logout(); }} className="w-full rounded-3xl bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-300 px-4 py-3 font-semibold hover:bg-red-100 dark:hover:bg-red-900/20 transition">
                  Logout
                </button>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={() => setOpen(false)} className="block rounded-3xl px-4 py-3 text-center bg-slate-100 dark:bg-[#111421] text-text-primary dark:text-white font-semibold hover:bg-slate-200 dark:hover:bg-[#1c1f32] transition">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block rounded-3xl px-4 py-3 text-center bg-gradient-to-r from-[#8b6d48] via-[#b8b18b] to-[#e7d4ae] text-white font-semibold shadow-lg shadow-[rgba(92,66,38,0.2)] hover:opacity-95 transition">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="h-20" />
    </>
  );
};

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      toggleTheme();
    }}
    className="p-2 rounded-full hover:bg-[rgba(139,109,72,0.12)] dark:hover:bg-[rgba(184,177,139,0.15)] transition cursor-pointer text-text-primary"
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
      className="relative cursor-pointer hover:bg-[rgba(139,109,72,0.12)] dark:hover:bg-[rgba(184,177,139,0.15)] p-2 rounded-full transition outline-none"
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
                  className="block p-3 hover:bg-[#f2e7cd] dark:hover:bg-[rgba(184,177,139,0.12)] transition border-b border-border-color last:border-none"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-text-primary">{notif.senderName}</p>
                      <p className="text-xs text-text-secondary truncate max-w-45">{notif.lastMessage}</p>
                    </div>
                    {notif.count > 0 && (
                      <span className="bg-[#f4ead2] text-[#8b6d48] text-[10px] font-bold px-2 py-0.5 rounded-full">{notif.count} new</span>
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
    ? "bg-[#f2e7cd] dark:bg-white/10 text-text-primary dark:text-white font-bold"
    : "text-text-primary dark:text-white";

  const inactiveClass = mobile
    ? "text-text-secondary dark:text-[#b8b194] hover:bg-[#f2e7cd] dark:hover:bg-[rgba(184,177,139,0.12)] hover:text-text-primary dark:hover:text-white"
    : "text-text-secondary dark:text-[#b8b194] hover:text-text-primary dark:hover:text-white";

  return (
    <>
      <Link
        to="/"
        className={`${linkBaseClass} ${isActive("/") ? activeClass : inactiveClass}`}
        onClick={() => setOpen(false)}
      >
        <div className="flex items-center gap-2">
          {mobile && <FiHome />}
          <span>Home</span>
        </div>
        {!mobile && isActive("/") && <DesktopActiveIndicator />}
      </Link>

      {user ? (
        <>
          <Link
            to="/orders"
            className={`${linkBaseClass} ${isActive("/orders") ? activeClass : inactiveClass}`}
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center gap-2">
              {mobile && <FiShoppingBag />}
              <span>Orders</span>
            </div>
            {!mobile && isActive("/orders") && <DesktopActiveIndicator />}
          </Link>

          <Link
            to="/items"
            className={`${linkBaseClass} ${isActive("/items") ? activeClass : inactiveClass}`}
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center gap-2">
              {mobile && <FiBox />}
              <span>Market</span>
            </div>
            {!mobile && isActive("/items") && <DesktopActiveIndicator />}
          </Link>

          <Link
            to="/favorite"
            className={`${linkBaseClass} ${isActive("/favorite") ? activeClass : inactiveClass}`}
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center gap-2">
              {mobile && <FiHeart />}
              <span>Favorites</span>
            </div>
            {!mobile && isActive("/favorite") && <DesktopActiveIndicator />}
          </Link>

          <div className={`h-6 w-px bg-slate-200 dark:bg-white/10 mx-2 ${mobile ? 'hidden' : 'block'}`}></div>

          <Link
            to="/my-account"
            className={ mobile 
              ? `${linkBaseClass} ${isActive("/my-account") ? activeClass : inactiveClass}`
              : `flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full transition-all duration-200 border ${isActive("/my-account") ? "border-[#8b6d48]/30 bg-[#8b6d48]/10 text-[#8b6d48] dark:text-[#ecd8b1]" : "border-transparent hover:bg-[#f4ead2] dark:hover:bg-[rgba(184,177,139,0.12)] text-text-secondary dark:text-[#b8b194]"}`
            }
            onClick={() => setOpen(false)}
          >
            {user.image ? (
              <img src={user.image} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                <FiUser />
              </div>
            )}
            <span className="text-sm font-medium">Account</span>
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/items"
            className={`${linkBaseClass} ${isActive("/items") ? activeClass : inactiveClass}`}
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center gap-2">
              {mobile && <FiBox />}
              <span>Market</span>
            </div>
            {!mobile && isActive("/items") && <DesktopActiveIndicator />}
          </Link>
        </>
      )}
    </>
  );
}

const DesktopActiveIndicator = () => (
  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8b6d48] rounded-full shadow-[0_0_10px_rgba(139,109,72,0.35)]" />
);

export default Navbar; 