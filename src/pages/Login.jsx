import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Calendar, ArrowRight, ShieldCheck, BadgeCheck, ShieldAlert, Eye, EyeOff, Loader2, ChevronDown, ChevronUp, Sparkles, Ticket, TrendingUp, ScanLine } from 'lucide-react';

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
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

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
    <div className="relative min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-500 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)]" />

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 left-3/4 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl animate-pulse duration-[10s]" />
      <div className="absolute bottom-1/4 left-1/4 -z-10 h-[24rem] w-[24rem] rounded-full bg-indigo-500/10 blur-3xl animate-pulse duration-[7s]" />

      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 max-w-5xl w-full">
        
        {/* Left Side: Services & Project Info Banner */}
        <div className="flex-1 p-8 rounded-3xl glass-card border border-border/40 shadow-2xl flex flex-col justify-between space-y-8 animate-fade-in text-card-foreground">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <Sparkles size={11} className="animate-spin duration-300" />
                Featured Event Ecosystem
              </span>
              <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                Emitting Memories,<br />
                <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  Organizing Events.
                </span>
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                GatherFlow is a premium event orchestration platform empowering coordinators to emit credentials, handle instant checkouts, track seat allocations, and moderate global configurations.
              </p>
            </div>

            {/* Service Lists */}
            <div className="space-y-4 pt-2">
              {/* Feature 1 */}
              <div className="flex gap-3.5 items-start p-3 bg-muted/20 hover:bg-muted/30 border border-border/30 rounded-2xl transition-all duration-300">
                <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0 shadow-sm border border-violet-500/10">
                  <Ticket size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Interactive Ticketing Pipelines</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Check out seats securely with instant QR code generation, apply promotional codes, and generate printable PDF tickets.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-3.5 items-start p-3 bg-muted/20 hover:bg-muted/30 border border-border/30 rounded-2xl transition-all duration-300">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm border border-emerald-500/10">
                  <TrendingUp size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Dynamic Publisher Control Panel</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Establish custom ticket capacities and prices, draft announcements, configure promotional codes, and inspect financial metrics.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-3.5 items-start p-3 bg-muted/20 hover:bg-muted/30 border border-border/30 rounded-2xl transition-all duration-300">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm border border-indigo-500/10">
                  <ScanLine size={16} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Gate Check-In Scan Station</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Instantly verify and check in registered attendees at the venue gate using live ticket scanning.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 font-mono select-none">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Platform Services Active • GatherFlow 1.0.0
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-border/40 shadow-2xl space-y-6 animate-fade-in text-card-foreground self-center relative backdrop-blur-xl shrink-0">
          
          {/* Header Brand */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-extrabold text-2xl shadow-xl shadow-violet-500/25 relative group overflow-hidden select-none">
              <span className="relative z-10">G</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isRegister ? 'Sign up to register events and manage dashboard' : 'Enter credentials to manage your event workflows'}
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
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow transition-all"
                  />
                  <UserIcon className="absolute left-3 top-3.5 text-muted-foreground group-focus-within:text-violet-500 transition-colors duration-300" size={14} />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow transition-all"
                />
                <Mail className="absolute left-3 top-3.5 text-muted-foreground group-focus-within:text-violet-500 transition-colors duration-300" size={14} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow transition-all"
                />
                <Lock className="absolute left-3 top-3.5 text-muted-foreground group-focus-within:text-violet-500 transition-colors duration-300" size={14} />
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
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground input-glow transition-all"
                    />
                    <Lock className="absolute left-3 top-3.5 text-muted-foreground group-focus-within:text-violet-500 transition-colors duration-300" size={14} />
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
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Select System Role</label>
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
              className="w-full mt-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed select-none group"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Authorizing Credentials...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Initialize Account' : 'Sign In'}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Collapsible Sandbox Demo Credentials */}
          <div className="border-t border-border/40 pt-4 space-y-2.5">
            <button
              type="button"
              onClick={() => setShowDemoDrawer(!showDemoDrawer)}
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground font-semibold py-1 transition-colors cursor-pointer select-none"
            >
              <span className="flex items-center gap-1.5">
                <BadgeCheck size={14} className="text-violet-500" />
                <span>Looking for demo credentials?</span>
              </span>
              {showDemoDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showDemoDrawer && (
              <div className="grid grid-cols-3 gap-2 pt-1 animate-fade-in font-sans">
                <button
                  type="button"
                  onClick={() => handleFillCredentials('attendee@gatherflow.com', 'attendeepassword123')}
                  className="p-2.5 rounded-xl border border-border bg-card/60 text-center hover:border-violet-500 hover:bg-violet-500/5 transition-all cursor-pointer group"
                >
                  <span className="block text-[9px] font-bold text-violet-500">Attendee</span>
                  <span className="block text-[9px] text-muted-foreground group-hover:text-foreground mt-0.5">Auto-Fill</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFillCredentials('organizer@gatherflow.com', 'organizerpassword123')}
                  className="p-2.5 rounded-xl border border-border bg-card/60 text-center hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer group"
                >
                  <span className="block text-[9px] font-bold text-emerald-500">Organizer</span>
                  <span className="block text-[9px] text-muted-foreground group-hover:text-foreground mt-0.5">Auto-Fill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillCredentials('admin@gatherflow.com', 'adminpassword123')}
                  className="p-2.5 rounded-xl border border-border bg-card/60 text-center hover:border-indigo-500 hover:bg-indigo-500/5 transition-all cursor-pointer group"
                >
                  <span className="block text-[9px] font-bold text-indigo-500">Admin</span>
                  <span className="block text-[9px] text-muted-foreground group-hover:text-foreground mt-0.5">Auto-Fill</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-[10px] text-muted-foreground/60 text-center flex items-center justify-center gap-1 border-t border-border/20 pt-3 select-none">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Secure AES encryption enabled</span>
          </div>

        </div>
      </div>
    </div>
  );
}
