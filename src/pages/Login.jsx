import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Calendar, ArrowRight, ShieldCheck, HelpCircle, BadgeCheck, ShieldAlert } from 'lucide-react';

export default function Login({ onNavigate }) {
  const { login, register } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('attendee'); // default
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      // Successful login/register redirects home
      onNavigate('home');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setIsRegister(false); // automatically switch to sign in view
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/3 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Side-by-Side Flex Layout */}
      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 max-w-5xl w-full">
        
        {/* Left Side: Roles Description & Seeded Accounts Guide */}
        <div className="flex-1 p-8 rounded-3xl glass-card border border-border/40 shadow-2xl flex flex-col justify-between space-y-6 animate-fade-in text-card-foreground">
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              GatherFlow User Roles
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore the system features by using our pre-seeded accounts. Click on any credential box below to automatically fill the login form.
            </p>

            {/* Roles Descriptions */}
            <div className="space-y-3.5 pt-2">
              {/* Attendee Info */}
              <div className="p-3 bg-muted/20 border border-border/30 rounded-xl flex gap-3 items-start">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                  <UserIcon size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Attendee (Buyer)</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Browse and search events, apply promo codes, checkout tickets, download entries as PDF files with active QR codes, and rate events.
                  </p>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="p-3 bg-muted/20 border border-border/30 rounded-xl flex gap-3 items-start">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Organizer (Publisher)</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Publish event listings, set ticket price/capacities, configure discount codes, track sales charts, and scan tickets with the check-in station.
                  </p>
                </div>
              </div>

              {/* Admin Info */}
              <div className="p-3 bg-muted/20 border border-border/30 rounded-xl flex gap-3 items-start">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">System Administrator</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Approve/reject pending event listings, view global system statistics, configure categories, and block/unblock user accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Click to Fill Test Accounts */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <BadgeCheck size={16} className="text-violet-500" /> Click to Fill Test Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillCredentials('attendee@gatherflow.com', 'attendeepassword123')}
                className="p-2.5 rounded-xl border border-border bg-card/60 text-left hover:border-violet-500 hover:bg-violet-500/5 transition-all cursor-pointer group"
              >
                <span className="block text-[9px] font-bold text-violet-500">Attendee</span>
                <span className="block text-[10px] text-muted-foreground truncate group-hover:text-foreground font-mono mt-0.5">attendee@...</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleFillCredentials('organizer@gatherflow.com', 'organizerpassword123')}
                className="p-2.5 rounded-xl border border-border bg-card/60 text-left hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer group"
              >
                <span className="block text-[9px] font-bold text-emerald-500">Organizer</span>
                <span className="block text-[10px] text-muted-foreground truncate group-hover:text-foreground font-mono mt-0.5">organizer@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('admin@gatherflow.com', 'adminpassword123')}
                className="p-2.5 rounded-xl border border-border bg-card/60 text-left hover:border-indigo-500 hover:bg-indigo-500/5 transition-all cursor-pointer group"
              >
                <span className="block text-[9px] font-bold text-indigo-500">Admin</span>
                <span className="block text-[10px] text-muted-foreground truncate group-hover:text-foreground font-mono mt-0.5">admin@...</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms Card */}
        <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-border/40 shadow-2xl space-y-6 animate-fade-in text-card-foreground self-center">
          {/* Brand header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xl shadow-lg shadow-violet-500/20">
              G
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              {isRegister ? 'Create your account' : 'Sign in to GatherFlow'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isRegister ? 'Access booking pipelines and publish listings' : 'Book tickets and manage passes in real-time'}
            </p>
          </div>

          {/* Tab switch */}
          <div className="grid grid-cols-2 p-1 bg-muted/40 border border-border/40 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                !isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                isRegister ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form panel */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-rose-500 text-center font-semibold">{error}</p>}

            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow"
                  />
                  <UserIcon className="absolute left-3 top-3 text-muted-foreground" size={14} />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow"
                />
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={14} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow"
                />
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={14} />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow"
                    />
                    <Lock className="absolute left-3 top-3 text-muted-foreground" size={14} />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Select Role Type</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRole('attendee')}
                      className={`py-2 px-3 border rounded-xl transition-all cursor-pointer text-center ${
                        role === 'attendee'
                          ? 'bg-violet-500/10 border-violet-500 text-violet-500'
                          : 'border-border/60 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      Attendee (Buyer)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('organizer')}
                      className={`py-2 px-3 border rounded-xl transition-all cursor-pointer text-center ${
                        role === 'organizer'
                          ? 'bg-violet-500/10 border-violet-500 text-violet-500'
                          : 'border-border/60 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      Organizer (Publisher)
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            Secured authentication nodes loaded.
          </div>
        </div>
      </div>
    </div>
  );
}
