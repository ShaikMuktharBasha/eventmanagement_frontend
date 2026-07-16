import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, SlidersHorizontal, ArrowRight, ShieldAlert, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

export default function Events({ onNavigate, initialFilters = {} }) {
  const socket = useSocket();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [dateType, setDateType] = useState('upcoming'); // default upcoming
  const [venueType, setVenueType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch events based on current filters
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (dateType) params.dateType = dateType;
      if (venueType) params.venueType = venueType;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const { data } = await axios.get('/api/events', { params });
      setEvents(data.events);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await axios.get('/api/categories');
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents();
  }, [search, category, dateType, venueType, minPrice, maxPrice]);

  // Sync initial filters
  useEffect(() => {
    if (initialFilters.search) setSearch(initialFilters.search);
    if (initialFilters.category) setCategory(initialFilters.category);
  }, [initialFilters]);

  // Real-time seat updates from Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleSeatUpdate = (data) => {
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt._id === data.eventId
            ? { ...evt, ticketsSold: data.ticketsSold, capacity: data.capacity }
            : evt
        )
      );
    };

    socket.on('seatUpdate', handleSeatUpdate);
    return () => {
      socket.off('seatUpdate', handleSeatUpdate);
    };
  }, [socket]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setDateType('upcoming');
    setVenueType('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="w-full py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Explore Events</h1>
        <p className="text-muted-foreground text-sm">
          Find and reserve tickets for concerts, conferences, and meetups in real-time.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters Panel */}
        <aside className="w-full lg:w-64 shrink-0 rounded-2xl border border-border/40 p-6 bg-card text-card-foreground shadow-md space-y-6 self-start">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="font-bold text-sm flex items-center gap-1.5">
              <SlidersHorizontal size={18} /> Filters
            </span>
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-violet-500 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Search Query */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Search</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-xl border border-border/40">
              <Search className="text-muted-foreground" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type keywords..."
                className="w-full bg-transparent text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-muted/40 rounded-xl border border-border/40 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-white">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name} className="bg-zinc-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Date Range</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setDateType('upcoming')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                  dateType === 'upcoming'
                    ? 'bg-violet-500/10 border-violet-500 text-violet-500'
                    : 'border-border/60 hover:bg-muted text-muted-foreground'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setDateType('past')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                  dateType === 'past'
                    ? 'bg-violet-500/10 border-violet-500 text-violet-500'
                    : 'border-border/60 hover:bg-muted text-muted-foreground'
                }`}
              >
                Past
              </button>
            </div>
          </div>

          {/* Venue Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Venue Type</label>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
              className="w-full p-2.5 bg-muted/40 rounded-xl border border-border/40 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-white">All Location Types</option>
              <option value="in-person" className="bg-zinc-900 text-white">In-Person</option>
              <option value="online" className="bg-zinc-900 text-white">Online / Virtual</option>
            </select>
          </div>

          {/* Ticket Price Slider / Inputs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Price Range ($)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full p-2 bg-muted/40 rounded-xl border border-border/40 text-xs text-center text-foreground focus:outline-none"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full p-2 bg-muted/40 rounded-xl border border-border/40 text-xs text-center text-foreground focus:outline-none"
              />
            </div>
          </div>
        </aside>

        {/* Events Grid / Listings */}
        <main className="flex-1 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-muted/40 animate-pulse border border-border/30" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl space-y-4">
              <ShieldAlert size={48} className="text-muted-foreground" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg">No Events Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We couldn't find any events matching your selected search query or filters. Try adjustments!
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => {
                const remainingSeats = event.capacity - event.ticketsSold;
                const percentageSold = (event.ticketsSold / event.capacity) * 100;
                const isSoldOut = remainingSeats <= 0;

                return (
                  <div
                    key={event._id}
                    onClick={() => onNavigate(`event-details:${event._id}`)}
                    className="group flex flex-col justify-between rounded-2xl border border-border/40 bg-card text-card-foreground overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:border-violet-500/20 hover:-translate-y-1.5 transition-all duration-300"
                  >
                    {/* Header Banner */}
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
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
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="rounded-lg bg-destructive px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Calendar size={14} />
                          {new Date(event.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
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

                      {/* Real-time Ticket Capacity bar */}
                      <div className="space-y-1.5 pt-2 border-t border-border/30">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-muted-foreground">Availability</span>
                          <span className={isSoldOut ? 'text-destructive' : remainingSeats < 10 ? 'text-amber-500' : 'text-emerald-500'}>
                            {isSoldOut ? 'No seats left' : `${remainingSeats} / ${event.capacity} seats left`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSoldOut
                                ? 'bg-destructive'
                                : percentageSold > 80
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, percentageSold)}%` }}
                          />
                        </div>
                      </div>

                      {/* Organizer info footer */}
                      <div className="flex items-center justify-between pt-2 text-xs">
                        <span className="text-muted-foreground">
                          By <span className="font-semibold text-foreground">{event.organizer?.name}</span>
                        </span>
                        <span className="text-violet-500 font-semibold flex items-center gap-1">
                          Details <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
