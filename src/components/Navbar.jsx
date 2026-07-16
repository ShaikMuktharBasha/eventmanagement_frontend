import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Sun, Moon, LogOut, User as UserIcon, Calendar, Menu, X, Check } from 'lucide-react';
import axios from 'axios';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch notifications if logged in
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get('/api/analytics/notifications');
      setNotifications(data);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/analytics/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-border/40 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xl shadow-lg shadow-violet-500/20">
              G
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              GatherFlow
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <span
              onClick={() => onNavigate('home')}
              className={`cursor-pointer text-sm font-medium transition-colors hover:text-violet-500 ${currentPage === 'home' ? 'text-violet-500 font-semibold' : 'text-muted-foreground'}`}
            >
              Home
            </span>
            <span
              onClick={() => onNavigate('events')}
              className={`cursor-pointer text-sm font-medium transition-colors hover:text-violet-500 ${currentPage === 'events' ? 'text-violet-500 font-semibold' : 'text-muted-foreground'}`}
            >
              Browse Events
            </span>
            <span
              onClick={() => onNavigate('contact')}
              className={`cursor-pointer text-sm font-medium transition-colors hover:text-violet-500 ${currentPage === 'contact' ? 'text-violet-500 font-semibold' : 'text-muted-foreground'}`}
            >
              Contact Us
            </span>

            {user?.role === 'organizer' && (
              <span
                onClick={() => onNavigate('organizer-dashboard')}
                className={`cursor-pointer text-sm font-medium transition-colors hover:text-violet-500 ${currentPage === 'organizer-dashboard' ? 'text-violet-500 font-semibold' : 'text-muted-foreground'}`}
              >
                Organizer Panel
              </span>
            )}

            {user?.role === 'admin' && (
              <span
                onClick={() => onNavigate('admin-dashboard')}
                className={`cursor-pointer text-sm font-medium transition-colors hover:text-violet-500 ${currentPage === 'admin-dashboard' ? 'text-violet-500 font-semibold' : 'text-muted-foreground'}`}
              >
                Admin Panel
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 hover:bg-muted/80 text-muted-foreground transition-all duration-200"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                {/* Notification Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-full p-2 hover:bg-muted/80 text-muted-foreground transition-all"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl glow-purple animate-fade-in text-card-foreground">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
                        <span className="font-semibold text-sm">Notifications</span>
                        <span className="text-xs text-muted-foreground">{unreadCount} Unread</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-muted-foreground">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-2 rounded-lg text-xs transition-colors flex justify-between gap-2 items-start ${
                                notif.read ? 'bg-muted/30' : 'bg-violet-500/10 border-l-2 border-violet-500'
                              }`}
                            >
                              <div>
                                <h4 className="font-semibold">{notif.title}</h4>
                                <p className="text-muted-foreground mt-0.5">{notif.message}</p>
                              </div>
                              {!notif.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notif._id)}
                                  className="text-emerald-500 hover:text-emerald-600 shrink-0 mt-0.5"
                                  title="Mark as read"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile drop-down */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 hover:bg-muted/80 transition-all cursor-pointer"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-500">
                        <UserIcon size={16} />
                      </div>
                    )}
                    <span className="text-xs font-medium max-w-[80px] truncate">{user.name}</span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-xl animate-fade-in text-card-foreground">
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/80 transition-colors"
                      >
                        <UserIcon size={16} className="text-muted-foreground" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('my-tickets');
                          setProfileDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/80 transition-colors"
                      >
                        <Calendar size={16} className="text-muted-foreground" />
                        My Tickets
                      </button>
                      <hr className="my-1 border-border/50" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative rounded-full p-2 hover:bg-muted/80 text-muted-foreground transition-all"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-xl glow-purple animate-fade-in text-card-foreground">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
                      <span className="font-semibold text-xs">Notifications</span>
                      <span className="text-[10px] text-muted-foreground">{unreadCount} Unread</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-4 text-center text-[10px] text-muted-foreground">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`p-2 rounded-lg text-[10px] transition-colors flex justify-between gap-2 items-start ${
                              notif.read ? 'bg-muted/30' : 'bg-violet-500/10 border-l-2 border-violet-500'
                            }`}
                          >
                            <div>
                              <h4 className="font-semibold">{notif.title}</h4>
                              <p className="text-muted-foreground mt-0.5">{notif.message}</p>
                            </div>
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkAsRead(notif._id)}
                                className="text-emerald-500 hover:text-emerald-600 shrink-0 mt-0.5"
                              >
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 hover:bg-muted/80 text-muted-foreground"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-border/40 p-4 space-y-3 animate-fade-in text-card-foreground">
          <span
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className={`block px-3 py-2 rounded-lg text-base font-medium ${currentPage === 'home' ? 'bg-violet-500/10 text-violet-500' : 'text-muted-foreground'}`}
          >
            Home
          </span>
          <span
            onClick={() => { onNavigate('events'); setMobileMenuOpen(false); }}
            className={`block px-3 py-2 rounded-lg text-base font-medium ${currentPage === 'events' ? 'bg-violet-500/10 text-violet-500' : 'text-muted-foreground'}`}
          >
            Browse Events
          </span>
          <span
            onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
            className={`block px-3 py-2 rounded-lg text-base font-medium ${currentPage === 'contact' ? 'bg-violet-500/10 text-violet-500' : 'text-muted-foreground'}`}
          >
            Contact Us
          </span>

          {user?.role === 'organizer' && (
            <span
              onClick={() => { onNavigate('organizer-dashboard'); setMobileMenuOpen(false); }}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${currentPage === 'organizer-dashboard' ? 'bg-violet-500/10 text-violet-500' : 'text-muted-foreground'}`}
            >
              Organizer Panel
            </span>
          )}

          {user?.role === 'admin' && (
            <span
              onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${currentPage === 'admin-dashboard' ? 'bg-violet-500/10 text-violet-500' : 'text-muted-foreground'}`}
            >
              Admin Panel
            </span>
          )}

          <hr className="border-border/50" />

          {user ? (
            <div className="space-y-2">
              <span
                onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:bg-muted"
              >
                My Profile
              </span>
              <span
                onClick={() => { onNavigate('my-tickets'); setMobileMenuOpen(false); }}
                className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:bg-muted"
              >
                My Tickets
              </span>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
              className="w-full rounded-xl bg-violet-600 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-violet-500/20"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
