import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, DollarSign, BarChart3, Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [metrics, setMetrics] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);

  const loadAdminData = async () => {
    try {
      const [analyticsRes, eventRes, userRes] = await Promise.all([
        axios.get('/api/analytics/admin'),
        axios.get('/api/events?status=pending'), // get pending events
        axios.get('/api/analytics/users'),
      ]);

      setMetrics(analyticsRes.data.metrics);
      setCategoryData(analyticsRes.data.categoryData);
      setSalesTrend(analyticsRes.data.salesTrend);
      setPendingEvents(eventRes.data.events);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveReject = async (id, status) => {
    try {
      await axios.put(`/api/events/${id}/status`, { status });
      alert(`Event status updated: ${status}`);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleBlock = async (id, currentBlocked) => {
    const action = currentBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await axios.put(`/api/analytics/users/${id}/block`, { isBlocked: !currentBlocked });
      alert(`User account has been ${action}ed`);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user block state');
    }
  };

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ef4444'];

  return (
    <div className="w-full py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">System Administration</h1>
        <p className="text-muted-foreground text-sm">
          Audit upcoming listings, manage user block lists, and analyze platform metrics.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border/40 gap-6 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'analytics' ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 size={16} /> Global Analytics
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'approvals' ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar size={16} /> Approvals Queue ({pendingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'users' ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users size={16} /> User Management ({users.length})
        </button>
      </div>

      {/* Dashboard analytics */}
      {activeTab === 'analytics' && metrics && (
        <div className="space-y-8 animate-fade-in">
          {/* System metric summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Total Users</span>
                <span className="text-xl font-bold">{metrics.users.total}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                <Calendar size={24} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Approved Events</span>
                <span className="text-xl font-bold">{metrics.events.approved}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                <Calendar size={24} className="text-amber-500" />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Pending Approvals</span>
                <span className="text-xl font-bold text-amber-500">{metrics.events.pending}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
                <DollarSign size={24} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Total Sales</span>
                <span className="text-xl font-bold">${metrics.revenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Trends Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4">
              <h3 className="font-bold text-sm">Platform Revenue Growth</h3>
              <div className="h-80 w-full text-xs">
                {salesTrend.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No transactions captured.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#8b5cf6" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Categories Split Pie Chart */}
            <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4">
              <h3 className="font-bold text-sm">Category distribution</h3>
              <div className="h-80 w-full text-xs flex flex-col justify-center items-center">
                {categoryData.length === 0 ? (
                  <div className="text-muted-foreground">No events recorded.</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="70%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 w-full pt-4">
                      {categoryData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="truncate max-w-[100px] text-[10px] text-muted-foreground font-semibold">
                            {item.name}: <strong>{item.count}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approvals tab queue */}
      {activeTab === 'approvals' && (
        <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold">Pending Approvals Queue</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Tickets/Price</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {pendingEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      Great job! The event review queue is completely empty.
                    </td>
                  </tr>
                ) : (
                  pendingEvents.map((e) => (
                    <tr key={e._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-foreground">{e.title}</h4>
                          <p className="text-muted-foreground text-[11px] max-w-sm line-clamp-1">{e.description}</p>
                          <span className="inline-block text-[10px] text-muted-foreground">{new Date(e.date).toLocaleDateString()} at {e.time}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold">{e.organizer?.name}</td>
                      <td className="py-4 px-4 truncate max-w-[120px]">{e.venue}</td>
                      <td className="py-4 px-4 font-medium">
                        Capacity: {e.capacity} / ${e.price} ea
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleApproveReject(e._id, 'approved')}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white rounded-lg text-emerald-500 transition-all cursor-pointer"
                          title="Approve Event"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleApproveReject(e._id, 'rejected')}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-lg text-rose-500 transition-all cursor-pointer"
                          title="Reject Event"
                        >
                          <X size={16} />
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

      {/* Users table */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold">Manage Platform Accounts</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold">{u.name}</td>
                    <td className="py-3.5 px-4">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-muted-foreground capitalize">{u.role}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          u.isBlocked
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-[10px] transition-all cursor-pointer flex items-center gap-1 ml-auto border ${
                            u.isBlocked
                              ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10'
                              : 'border-rose-500 text-rose-500 hover:bg-rose-500/10'
                          }`}
                        >
                          {u.isBlocked ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                          {u.isBlocked ? 'Unblock User' : 'Block User'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold italic">Admin Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
