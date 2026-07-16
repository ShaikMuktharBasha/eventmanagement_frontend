import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Plus, Ticket, DollarSign, Percent, BarChart3, ShieldCheck, QrCode, AlertCircle, Edit, Trash } from 'lucide-react';
import axios from 'axios';

export default function OrganizerDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // for mock QR scanning select list

  // Forms
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: '',
    banner: '',
    venue: '',
    date: '',
    time: '',
    price: 0,
    capacity: 50,
  });
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    validUntil: '',
  });

  // Scanner Simulator
  const [scanBookingId, setScanBookingId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [scanLoading, setScanLoading] = useState(false);

  // Status Alerts
  const [eventAlert, setEventAlert] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');
  const [couponAlert, setCouponAlert] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const loadOrganizerData = async () => {
    try {
      const [analyticsRes, eventRes, couponRes, catRes, bookingRes] = await Promise.all([
        axios.get('/api/analytics/organizer'),
        axios.get('/api/events'), // will filter inside controller or manually
        axios.get('/api/coupons'),
        axios.get('/api/categories'),
        axios.get('/api/bookings'),
      ]);

      setMetrics(analyticsRes.data.metrics);
      setChartData(analyticsRes.data.eventBreakdown);
      setCoupons(couponRes.data);
      setCategories(catRes.data);
      setAllBookings(bookingRes.data);

      // Filter events belonging to this organizer
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
        setMyEvents(eventRes.data.events.filter((e) => e.organizer?._id === userInfo._id));
      }
    } catch (err) {
      console.error('Failed to load organizer data:', err);
    }
  };

  useEffect(() => {
    loadOrganizerData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventAlert('');
    setEventSuccess('');

    try {
      await axios.post('/api/events', eventForm);
      setEventSuccess('Event created successfully! Sent to admin review queue.');
      setEventForm({
        title: '',
        description: '',
        category: '',
        banner: '',
        venue: '',
        date: '',
        time: '',
        price: 0,
        capacity: 50,
      });
      loadOrganizerData();
    } catch (err) {
      setEventAlert(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponAlert('');
    setCouponSuccess('');

    try {
      await axios.post('/api/coupons', couponForm);
      setCouponSuccess('Discount coupon configured successfully!');
      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        validUntil: '',
      });
      loadOrganizerData();
    } catch (err) {
      setCouponAlert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event listing permanently?')) return;
    try {
      await axios.delete(`/api/events/${id}`);
      loadOrganizerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  // QR Scanning Simulation
  const handleQRScanSimulation = async (e) => {
    e.preventDefault();
    setScanResult(null);
    setScanError('');
    if (!scanBookingId) return;

    setScanLoading(true);
    try {
      const { data } = await axios.post('/api/bookings/scan-checkin', {
        bookingId: scanBookingId,
      });
      setScanResult(data);
    } catch (err) {
      setScanError(err.response?.data?.message || 'QR Ticket validation error');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="w-full py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Organizer Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Track sales analytics, publish events, configure coupons, and verify ticketholders.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border/40 gap-6 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'analytics' ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 size={16} /> Metrics & Graphs
        </button>
        <button
          onClick={() => setActiveTab('create-event')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'create-event' ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Plus size={16} /> Create Event
        </button>
        <button
          onClick={() => setActiveTab('manage-events')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'manage-events' ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar size={16} /> Manage Events ({myEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'coupons' ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Percent size={16} /> Coupons
        </button>
        <button
          onClick={() => setActiveTab('scan-checkin')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'scan-checkin' ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <QrCode size={16} /> Check-in Scanner
        </button>
      </div>

      {/* Tabs panels */}
      {activeTab === 'analytics' && metrics && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                <Calendar size={24} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Hosted Events</span>
                <span className="text-xl font-bold">{metrics.events}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                <Ticket size={24} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Tickets Sold</span>
                <span className="text-xl font-bold">{metrics.ticketsSold}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                <Percent size={24} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Occupancy Rate</span>
                <span className="text-xl font-bold">{metrics.occupancyRate}%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                <DollarSign size={24} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Revenue</span>
                <span className="text-xl font-bold">${metrics.revenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Recharts chart sales graph */}
          <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4">
            <h3 className="font-bold text-sm">Event Ticketing Breakdown</h3>
            <div className="h-80 w-full text-xs">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No ticket sales metrics logged yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="title" stroke="#6b7280" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ticketsSold" fill="#8b5cf6" name="Tickets Sold" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create-event' && (
        <form onSubmit={handleCreateEvent} className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-6 max-w-3xl animate-fade-in">
          <h2 className="text-xl font-bold">Publish New Event</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Event Title</label>
              <input
                type="text"
                required
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Jazz Concert Night"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <select
                required
                value={eventForm.category}
                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground cursor-pointer"
              >
                <option value="" className="bg-zinc-900 text-white">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id} className="bg-zinc-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Banner Image URL</label>
              <input
                type="url"
                value={eventForm.banner}
                onChange={(e) => setEventForm({ ...eventForm, banner: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Event Description</label>
              <textarea
                required
                rows={4}
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Describe details, schedules, lineups, highlights..."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Venue Location (Use 'online' for virtual)</label>
              <input
                type="text"
                required
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                placeholder="e.g. Madison Square or Zoom Link"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Date</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Start Time</label>
              <input
                type="text"
                required
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                placeholder="e.g. 7:00 PM - 10:00 PM"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Ticket Price ($ - 0 for Free)</label>
              <input
                type="number"
                required
                min={0}
                value={eventForm.price}
                onChange={(e) => setEventForm({ ...eventForm, price: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Max Ticket Capacity</label>
              <input
                type="number"
                required
                min={1}
                value={eventForm.capacity}
                onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>
          </div>

          {eventAlert && <p className="text-xs text-rose-500">{eventAlert}</p>}
          {eventSuccess && <p className="text-xs text-emerald-500">{eventSuccess}</p>}

          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500 transition-colors text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-500/20"
          >
            Submit for Approval
          </button>
        </form>
      )}

      {activeTab === 'manage-events' && (
        <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold">My Hosted Events</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Sales Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {myEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      You haven't listed any events. Click 'Create Event' to start!
                    </td>
                  </tr>
                ) : (
                  myEvents.map((e) => (
                    <tr key={e._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold">{e.title}</td>
                      <td className="py-3 px-4">
                        {new Date(e.date).toLocaleDateString()} at {e.time}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {e.price === 0 ? <span className="text-emerald-500">FREE</span> : `$${e.price}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{e.ticketsSold}</span> / {e.capacity} sold
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            e.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : e.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {e.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteEvent(e._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Coupon Creation Card */}
          <form onSubmit={handleCreateCoupon} className="lg:col-span-1 p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4 self-start">
            <h3 className="font-bold text-sm">Configure Promo Coupon</h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Coupon Code</label>
              <input
                type="text"
                required
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER50"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground uppercase font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Discount Type</label>
              <select
                value={couponForm.discountType}
                onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                className="w-full p-2 bg-background border border-border rounded-xl text-xs cursor-pointer focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Rate ($)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Discount Value</label>
              <input
                type="number"
                required
                min={1}
                value={couponForm.discountValue}
                onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Valid Until</label>
              <input
                type="date"
                required
                value={couponForm.validUntil}
                onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-violet-500/20 focus:outline-none text-xs text-foreground"
              />
            </div>

            {couponAlert && <p className="text-xs text-rose-500">{couponAlert}</p>}
            {couponSuccess && <p className="text-xs text-emerald-500">{couponSuccess}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
            >
              Create Coupon
            </button>
          </form>

          {/* Active Coupons List */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4">
            <h3 className="font-bold text-sm">Active Promotions</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">Discount</th>
                    <th className="py-2.5 px-4">Valid Until</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        No promotions active. Create one to support discounts!
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c._id}>
                        <td className="py-2.5 px-4 font-bold text-violet-500">{c.code}</td>
                        <td className="py-2.5 px-4 font-medium">
                          {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `$${c.discountValue} Off`}
                        </td>
                        <td className="py-2.5 px-4">
                          {new Date(c.validUntil).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              c.isActive && new Date(c.validUntil) >= new Date()
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {c.isActive && new Date(c.validUntil) >= new Date() ? 'ACTIVE' : 'EXPIRED'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scan-checkin' && (
        <div className="mx-auto max-w-2xl p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
              <QrCode size={24} />
            </div>
            <h2 className="text-xl font-bold">Attendee Check-in Station</h2>
            <p className="text-xs text-muted-foreground">
              Simulate entry scanner gates. Select a ticket booking to verify and check-in.
            </p>
          </div>

          <form onSubmit={handleQRScanSimulation} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Select Paid Booking to Scan</label>
              <select
                value={scanBookingId}
                onChange={(e) => setScanBookingId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none text-xs text-foreground cursor-pointer"
              >
                <option value="" className="bg-zinc-900 text-white">Select ticket pass...</option>
                {allBookings
                  .filter((b) => b.paymentStatus === 'paid')
                  .map((b) => (
                    <option key={b._id} value={b._id} className="bg-zinc-900 text-white">
                      {b.attendee?.name} - {b.event?.title} (Qty: {b.ticketQuantity}) [ID: {b._id.substring(0, 8)}...]
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={scanLoading || !scanBookingId}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              Simulate Camera QR Code Scan
            </button>
          </form>

          {scanLoading && <div className="text-center text-xs text-muted-foreground">Validating ticket QR code...</div>}
          
          {scanError && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-500 text-xs flex gap-2 items-start">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Invalid QR Pass</h4>
                <p className="mt-0.5">{scanError}</p>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-indigo-500 text-xs flex gap-2 items-start">
              <ShieldCheck size={18} className="shrink-0 mt-0.5 text-emerald-500" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-emerald-500">Ticket Verified & Checked-In!</h4>
                <p className="text-muted-foreground mt-1">
                  <strong>Attendee:</strong> {scanResult.booking.attendee?.name}
                </p>
                <p className="text-muted-foreground">
                  <strong>Event:</strong> {scanResult.booking.event?.title}
                </p>
                <p className="text-muted-foreground">
                  <strong>Passes:</strong> {scanResult.booking.ticketQuantity} Ticket(s)
                </p>
                <p className="text-muted-foreground">
                  <strong>Time:</strong> {new Date(scanResult.booking.checkInTime).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
