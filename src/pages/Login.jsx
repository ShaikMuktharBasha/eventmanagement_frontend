import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Calendar, ArrowRight, ShieldCheck, HelpCircle, BadgeCheck, ShieldAlert, Eye, EyeOff, Loader2 } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isTyping) return;
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
      onNavigate('home');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (fillEmail, fillPass) => {
    if (isTyping) return;
    setIsTyping(true);
    setIsRegister(false);
    setError('');
    
    // Clear inputs first
    setEmail('');
    setPassword('');
    
    let currentEmail = '';
    let emailIdx = 0;
    
    const emailInterval = setInterval(() => {
      if (emailIdx < fillEmail.length) {
        currentEmail += fillEmail[emailIdx];
        setEmail(currentEmail);
        emailIdx++;
      } else {
        clearInterval(emailInterval);
        
        let currentPass = '';
        let passIdx = 0;
        const passInterval = setInterval(() => {
          if (passIdx < fillPass.length) {
            currentPass += fillPass[passIdx];
            setPassword(currentPass);
            passIdx++;
          } else {
            clearInterval(passInterval);
            setIsTyping(false);
          }
        }, 30);
      }
    }, 20);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-500">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-[35rem] w-[35rem] rounded-full bg-violet-600/10 blur-3xl animate-pulse duration-[8s]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[30rem] w-[30rem] rounded-full bg-indigo-500/10 blur-3xl animate-pulse duration-[12s]" />

      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 max-w-5xl w-full">
        
        {/* Left Card: Info panel */}
        <div className="flex-1 p-8 rounded-3xl glass-card border border-border/40 shadow-2xl flex flex-col justify-between space-y-8 animate-fade-in text-card-foreground">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-500/10 text-violet-500 border border-violet-500/20">
                GatherFlow System
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                Role-Based Gateways
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Explore custom dashboard metrics, payment integrations, real-time ticket emits, and dynamic checking features designed for each system actor.
              </p>
            </div>

            {/* Premium Role Cards */}
            <div className="space-y-4">
              {/* Attendee */}
              <div 
                onClick={() => handleFillCredentials('attendee@gatherflow.com', 'attendeepassword123')}
                className="p-4 bg-card/40 border border-border/40 rounded-2xl flex gap-4 items-start cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <UserIcon size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-violet-500 transition-colors">Attendee Dashboard</h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded">Try Demo</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Browse public event catalog, apply dynamic coupon codes, make secure orders, view QR-coded tickets, and submit community ratings.
                  </p>
                </div>
              </div>

              {/* Organizer */}
              <div 
                onClick={() => handleFillCredentials('organizer@gatherflow.com', 'organizerpassword123')}
                className="p-4 bg-card/40 border border-border/40 rounded-2xl flex gap-4 items-start cursor-pointer hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Calendar size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors">Organizer Console</h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Try Demo</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Instantly draft and publish listings, control seat pools, trigger ticket scans at entry, and monitor financial graphs.
                  </p>
                </div>
              </div>

              {/* Admin */}
              <div 
                onClick={() => handleFillCredentials('admin@gatherflow.com', 'adminpassword123')}
                className="p-4 bg-card/40 border border-border/40 rounded-2xl flex gap-4 items-start cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-indigo-500 transition-colors">System Admin Hub</h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">Try Demo</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Verify and approve event publications, control global configuration options, lock/unlock system profiles, and review system-wide logs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Credentials Helper info */}
          <div className="p-3.5 bg-muted/30 border border-border/30 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
              <BadgeCheck size={15} className="text-violet-500" /> Click any role card above to auto-type
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/70">Secure Sandbox Mode</span>
          </div>
        </div>

        {/* Right Card: Authentication Form */}
        <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-border/40 shadow-2xl space-y-6 animate-fade-in text-card-foreground self-center">
          
          {/* Header Brand */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-extrabold text-2xl shadow-xl shadow-violet-500/20 relative group overflow-hidden">
              <span className="relative z-10">G</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isRegister ? 'Unlock live planning and booking utilities' : 'Secure authorization gateway'}
              </p>
            </div>
          </div>

          {/* iOS-Style Sliding Tab Switcher */}
          <div className="relative grid grid-cols-2 p-1 bg-muted/40 border border-border/40 rounded-xl text-xs font-bold select-none">
            <div 
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-card rounded-lg shadow-sm transition-transform duration-300 ease-out"
              style={{
                transform: isRegister ? 'translateX(100%)' : 'translateX(0%)',
              }}
            />
            <button
              type="button"
              onClick={() => { if (!isTyping) { setIsRegister(false); setError(''); } }}
              className={`relative z-10 py-2.5 rounded-lg text-center transition-colors duration-300 cursor-pointer ${
                !isRegister ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { if (!isTyping) { setIsRegister(true); setError(''); } }}
              className={`relative z-10 py-2.5 rounded-lg text-center transition-colors duration-300 cursor-pointer ${
                isRegister ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive text-center font-bold flex items-center justify-center gap-1.5 animate-shake">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow transition-all"
                  />
                  <UserIcon className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-violet-500 transition-colors duration-300" size={14} />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow transition-all"
                />
                <Mail className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-violet-500 transition-colors duration-300" size={14} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow transition-all"
                />
                <Lock className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-violet-500 transition-colors duration-300" size={14} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Confirm Password</label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow transition-all"
                    />
                    <Lock className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-violet-500 transition-colors duration-300" size={14} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Select System Role</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRole('attendee')}
                      className={`py-2.5 px-3 border rounded-xl transition-all cursor-pointer text-center ${
                        role === 'attendee'
                          ? 'bg-violet-500/10 border-violet-500 text-violet-500 shadow-sm'
                          : 'border-border/60 hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      Attendee (Buyer)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('organizer')}
                      className={`py-2.5 px-3 border rounded-xl transition-all cursor-pointer text-center ${
                        role === 'organizer'
                          ? 'bg-violet-500/10 border-violet-500 text-violet-500 shadow-sm'
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
              disabled={loading || isTyping}
              className="w-full mt-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed select-none group"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Signing Secure Gateways...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Initialize Account' : 'Sign In'}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5 pt-2 border-t border-border/40 select-none">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Secure Node Validation Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
