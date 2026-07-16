import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Heart, ShieldAlert, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function Profile({ onNavigate }) {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [wishlistEvents, setWishlistEvents] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  // Fetch wishlisted events details
  const fetchWishlist = async () => {
    if (!user || user.wishlist?.length === 0) {
      setWishlistEvents([]);
      return;
    }
    setWishlistLoading(true);
    try {
      // Get events, filter manually by wishlist array
      const { data } = await axios.get('/api/events');
      const filtered = data.events.filter((e) => user.wishlist.includes(e._id));
      setWishlistEvents(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setAlertMessage('');
    setSuccessMessage('');

    if (password && password !== confirmPassword) {
      setAlertMessage('Passwords do not match');
      return;
    }

    try {
      const payload = { name, email, profilePicture };
      if (password) payload.password = password;

      await updateProfile(payload);
      setSuccessMessage('Profile details updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setAlertMessage(err || 'Failed to update profile details');
    }
  };

  return (
    <div className="w-full py-8 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Update Profile Form) */}
        <form onSubmit={handleSubmitProfile} className="lg:col-span-1 p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4 self-start">
          <h2 className="text-xl font-bold">Profile Settings</h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Profile Picture URL</label>
              <input
                type="url"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
                />
                <User className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
                />
                <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Change Password (Optional)</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
                />
                <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
                />
                <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
              </div>
            </div>
          </div>

          {alertMessage && <p className="text-xs text-rose-500">{alertMessage}</p>}
          {successMessage && <p className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> {successMessage}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
          >
            Update Profile
          </button>
        </form>

        {/* Right Column (Wishlist Grid) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-1.5">
            <Heart size={20} className="text-rose-500 fill-rose-500" /> My Saved Wishlist
          </h2>

          {wishlistLoading ? (
            <div className="text-center text-xs text-muted-foreground py-10">
              Retrieving wishlist events...
            </div>
          ) : wishlistEvents.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-12 space-y-3">
              <Heart size={36} className="mx-auto text-muted-foreground/50 animate-pulse" />
              <p>Your wishlist is empty. Browse events and heart some to save them!</p>
              <button
                onClick={() => onNavigate('events')}
                className="rounded-lg border border-border hover:bg-muted px-4 py-2 font-semibold transition-colors cursor-pointer"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlistEvents.map((e) => (
                <div
                  key={e._id}
                  onClick={() => onNavigate(`event-details:${e._id}`)}
                  className="group flex gap-4 p-4 rounded-xl border border-border/30 bg-muted/10 cursor-pointer hover:border-violet-500/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={e.banner} alt={e.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-sm truncate group-hover:text-violet-500 transition-colors" title={e.title}>
                      {e.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(e.date).toLocaleDateString()} • {e.time}
                    </p>
                    <span className="text-[11px] font-bold text-foreground">
                      {e.price === 0 ? 'FREE' : `$${e.price}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
