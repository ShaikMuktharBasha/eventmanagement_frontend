import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="w-full py-8 space-y-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Support</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Have questions regarding ticketing, event listing validations, refunds, or technical support? Drop a message!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Contact details) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4">
            <h3 className="font-bold text-base">GatherFlow Headquarters</h3>
            
            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="flex gap-3 items-center">
                <MapPin size={18} className="text-violet-500 shrink-0" />
                <span>124 Innovation Way, Tech District, SF, California</span>
              </div>
              <div className="flex gap-3 items-center">
                <Mail size={18} className="text-violet-500 shrink-0" />
                <span>support@gatherflow.com</span>
              </div>
              <div className="flex gap-3 items-center">
                <Phone size={18} className="text-violet-500 shrink-0" />
                <span>+1 (555) 019-2834 (Mon-Fri 9AM-6PM PST)</span>
              </div>
            </div>
          </div>

          {/* Map Preview Mockup */}
          <div className="relative h-60 rounded-2xl overflow-hidden bg-muted border border-border/40 shadow-md flex items-center justify-center text-center p-6">
            <div className="z-10 space-y-2">
              <MapPin size={28} className="text-violet-500 mx-auto animate-bounce" />
              <h4 className="font-bold text-xs text-foreground">Interactive Map Preview</h4>
              <p className="text-muted-foreground text-[10px] max-w-xs">
                Silicon Valley Office Area coordinates mock configured. Map routes successfully wired.
              </p>
            </div>
            {/* Fake grid lines */}
            <div className="absolute inset-0 opacity-5 grid grid-cols-10 grid-rows-10 pointer-events-none">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-foreground" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Contact form) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4">
          <h3 className="font-bold text-base">Send Us a Message</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What can we help you with?"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your details, ticket booking codes, or query info..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>
          </div>

          {success && (
            <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle2 size={16} /> Thank you! Your support ticket message was sent successfully. We will follow up.
            </p>
          )}

          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-6 py-2.5 font-semibold text-white hover:bg-violet-500 transition-colors text-xs cursor-pointer shadow-lg shadow-violet-500/20"
          >
            Submit Message
          </button>
        </form>
      </div>
    </div>
  );
}
