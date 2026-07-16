import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, ArrowRight, Star, Plus, ShieldCheck, Ticket } from 'lucide-react';
import axios from 'axios';

export default function Home({ onNavigate, onSearchSelect }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, catRes] = await Promise.all([
          axios.get('/api/events'),
          axios.get('/api/categories'),
        ]);
        setEvents(eventRes.data.events.slice(0, 3)); // show top 3 featured
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearchSelect({ search: searchQuery, category: selectedCategory });
  };

  const selectCategory = (catName) => {
    onSearchSelect({ search: '', category: catName });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-24">
        {/* Background glow ornaments */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 -z-10 h-96 w-96 -translate-x-1/3 -translate-y-1/3 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="w-full text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Experience the Future of{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
                Live Events
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground">
              Discover concerts, hackathons, sports tournaments, and conferences. Book tickets in real-time, generate secure QR passes, and enjoy seamless entry.
            </p>
          </div>

          {/* Search Form Panel */}
          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-4xl p-4 rounded-2xl glass-card flex flex-col md:flex-row gap-3 shadow-2xl glow-purple animate-fade-in"
          >
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-xl border border-border/30">
              <Search className="text-muted-foreground shrink-0" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event name, venue, keywords..."
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/80 text-foreground"
              />
            </div>

            {/* Category Select */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-xl border border-border/30">
              <Calendar className="text-muted-foreground shrink-0" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-foreground outline-none border-none select-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900 text-white">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name} className="bg-zinc-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              Search Events
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by Category</h2>
          <p className="text-muted-foreground text-sm">Find events categorized by your specific interests</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => selectCategory(cat.name)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl glass-card cursor-pointer border border-border/50 hover:border-violet-500/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                <Calendar size={24} />
              </div>
              <span className="mt-4 font-semibold text-sm group-hover:text-violet-500 transition-colors text-center text-card-foreground">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events Grid */}
      <section className="w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured Events</h2>
            <p className="text-muted-foreground text-sm">Handpicked events happening soon near you</p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="flex items-center gap-1.5 text-sm font-semibold text-violet-500 hover:text-violet-600 group cursor-pointer"
          >
            View all events
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-muted/40 animate-pulse border border-border/30" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border/60 rounded-2xl text-muted-foreground">
            No approved events found. Organizers can register and create some!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => onNavigate(`event-details:${event._id}`)}
                className="group flex flex-col rounded-2xl border border-border/40 bg-card text-card-foreground overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:border-violet-500/20 hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Banner image */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 rounded-lg bg-card/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-violet-500 shadow-md">
                    {event.category?.name || 'Event'}
                  </div>
                  {event.price === 0 ? (
                    <div className="absolute bottom-3 left-3 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      FREE
                    </div>
                  ) : (
                    <div className="absolute bottom-3 left-3 rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      ${event.price}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Calendar size={14} />
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      <span>•</span>
                      <span>{event.time}</span>
                    </div>

                    <h3 className="font-bold text-lg group-hover:text-violet-500 transition-colors line-clamp-1">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={14} className="shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground">
                      By <span className="font-semibold text-foreground">{event.organizer?.name}</span>
                    </span>
                    <span className="text-violet-500 font-semibold flex items-center gap-1">
                      Book Now <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How GatherFlow Works</h2>
          <p className="text-muted-foreground text-sm">Three quick steps to register and scan tickets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl glass-card border border-border/50 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
              <Plus size={24} />
            </div>
            <h3 className="font-bold text-lg text-card-foreground">1. Find or Create Events</h3>
            <p className="text-sm text-muted-foreground">
              Attendees can search upcoming shows. Organizers can list new events, set ticket tiers and customize capacities.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-border/50 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
              <Ticket size={24} />
            </div>
            <h3 className="font-bold text-lg text-card-foreground">2. Book & Apply Coupons</h3>
            <p className="text-sm text-muted-foreground">
              Select tickets, enter discount promo codes, checkout securely via integrated mock card processor, and receive confirmations.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-border/50 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-card-foreground">3. Download PDF QR Pass</h3>
            <p className="text-sm text-muted-foreground">
              Download your electronic entry ticket as a PDF document. Scan the QR code at the door for instant checking.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Attendee Testimonials</h2>
          <p className="text-muted-foreground text-sm">Join thousands of happy ticket holders globally</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Sarah Connor',
              role: 'Concert Fanatic',
              quote: 'GatherFlow made ticket purchase incredibly simple. The real-time seat update showed exactly how many tickets were left, and checkout took 10 seconds. Highly recommend!',
            },
            {
              name: 'Devin Page',
              role: 'Organizer at TechMeet',
              quote: 'As an organizer, the analytics graphs are lifesavers. I can monitor live ticket capacity and scanning ticket QR passes via my laptop camera is incredibly smooth.',
            },
            {
              name: 'Liam Vance',
              role: 'Attendee',
              quote: 'Loved the PDF ticket download feature! The design of the tickets looks great and contains a clear QR code which verified at the venue immediately. 5 stars.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-panel border border-border/40 space-y-4 flex flex-col justify-between text-card-foreground">
              <p className="text-sm italic text-muted-foreground">"{item.quote}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 text-violet-500 font-bold">
                  {item.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{item.name}</h4>
                  <span className="text-xs text-muted-foreground">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
