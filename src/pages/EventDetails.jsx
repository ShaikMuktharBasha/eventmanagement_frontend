import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Calendar, MapPin, Clock, Heart, Share2, Star, CheckCircle2, Ticket, ChevronRight, X, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function EventDetails({ eventId, onNavigate }) {
  const { user, toggleWishlist } = useAuth();
  const socket = useSocket();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking details
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch Event Data
  const fetchEventDetails = async () => {
    try {
      const { data } = await axios.get(`/api/events/${eventId}`);
      setEventData(data);
      if (user) {
        setIsWishlisted(user.wishlist?.includes(eventId) || false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Event not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId, user]);

  // Real-time seat updates
  useEffect(() => {
    if (!socket) return;

    const handleSeatUpdate = (data) => {
      if (data.eventId === eventId) {
        setEventData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            event: { ...prev.event, ticketsSold: data.ticketsSold, capacity: data.capacity },
          };
        });
      }
    };

    socket.on('seatUpdate', handleSeatUpdate);
    return () => {
      socket.off('seatUpdate', handleSeatUpdate);
    };
  }, [socket, eventId]);

  const handleWishlistToggle = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      const wishlist = await toggleWishlist(eventId);
      setIsWishlisted(wishlist.includes(eventId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await axios.post('/api/bookings/apply-coupon', {
        code: couponCode,
        eventId,
      });
      setAppliedCoupon(data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Generate .ics file for calendar export
  const exportToCalendar = () => {
    if (!eventData?.event) return;
    const { event } = eventData;
    
    const title = event.title;
    const desc = event.description.replace(/\n/g, '\\n');
    const loc = event.venue;
    
    // Create UTC date formats (YYYYMMDDTHHMMSSZ)
    const startDate = new Date(event.date);
    const startStr = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Default to +2 hours duration
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${loc}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_event.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Step 1: Create pending booking
  const handleInitiateBooking = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setError('');
    try {
      const { data } = await axios.post('/api/bookings', {
        eventId,
        ticketQuantity,
        couponCode: appliedCoupon?.code,
      });
      setBookingId(data._id);
      setCheckoutModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  // Step 2: Simulated Checkout process
  const handlePaymentCheckout = async (mockSuccess) => {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      await axios.post(`/api/bookings/${bookingId}/checkout`, {
        paymentMethod: 'card',
        mockSuccess,
      });
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutModalOpen(false);
        onNavigate('my-tickets');
      }, 2000);
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    try {
      await axios.post(`/api/events/${eventId}/reviews`, {
        rating,
        comment,
      });
      setReviewSuccess(true);
      setComment('');
      setRating(5);
      fetchEventDetails(); // reload details
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Review submission failed');
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 text-center space-y-4 animate-pulse">
        <div className="h-64 bg-muted/40 rounded-2xl border border-border/30" />
        <div className="h-10 bg-muted/40 w-1/3 mx-auto rounded-lg" />
        <div className="h-4 bg-muted/40 w-1/2 mx-auto rounded-md" />
      </div>
    );
  }

  if (error && !eventData) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-destructive" />
        <h2 className="text-xl font-bold">Event Not Found</h2>
        <p className="text-muted-foreground text-sm">{error}</p>
        <button
          onClick={() => onNavigate('events')}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const { event, reviewsCount, averageRating } = eventData;
  const remainingSeats = event.capacity - event.ticketsSold;
  const isSoldOut = remainingSeats <= 0;
  const priceBeforeDiscount = event.price * ticketQuantity;
  let priceAfterDiscount = priceBeforeDiscount;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      priceAfterDiscount = Math.max(0, priceBeforeDiscount - (priceBeforeDiscount * appliedCoupon.discountValue) / 100);
    } else {
      priceAfterDiscount = Math.max(0, priceBeforeDiscount - appliedCoupon.discountValue);
    }
  }

  return (
    <div className="w-full py-8 space-y-12">
      {/* Event Header Banner */}
      <div className="relative h-96 w-full rounded-3xl overflow-hidden shadow-2xl border border-border/30">
        <img src={event.banner} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Banner Quick stats bar */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <span className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
              {event.category?.name}
            </span>
            <h1 className="text-2xl font-extrabold text-white sm:text-4xl md:text-5xl drop-shadow-md">
              {event.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className={`rounded-full p-3 backdrop-blur-md border shadow-md transition-all duration-200 cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-500/20 border-rose-500 text-rose-500 hover:bg-rose-500/30'
                  : 'bg-card/85 border-border/60 text-muted-foreground hover:text-rose-500'
              }`}
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={exportToCalendar}
              className="rounded-xl bg-card/85 hover:bg-muted text-card-foreground border border-border/60 px-4 py-2.5 text-xs font-bold backdrop-blur-md shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              Add to Calendar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Details, Venue, Reviews) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Event Details</h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Logistics Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border/40 bg-card text-card-foreground flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2 text-violet-500">
                <Calendar size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground font-semibold">Date</span>
                <span className="text-xs font-bold">
                  {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-card text-card-foreground flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2 text-violet-500">
                <Clock size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground font-semibold">Time</span>
                <span className="text-xs font-bold">{event.time}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-card text-card-foreground flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2 text-violet-500">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-muted-foreground font-semibold">Venue</span>
                <span className="text-xs font-bold truncate block" title={event.venue}>
                  {event.venue}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Mockup */}
          <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Location Preview</h3>
              <span className="text-xs text-violet-500 font-semibold flex items-center gap-0.5 cursor-pointer">
                Google Maps <ChevronRight size={14} />
              </span>
            </div>
            <div className="relative h-60 w-full rounded-xl overflow-hidden bg-muted flex flex-col justify-center items-center text-center p-6 border border-border/40">
              <MapPin size={32} className="text-violet-500 animate-bounce mb-2" />
              <h4 className="font-bold text-sm text-foreground">{event.venue}</h4>
              <p className="text-muted-foreground text-xs mt-1 max-w-sm">
                Map coordinates mock configured. Navigate to your ticket receipt to trigger Google Maps directions directly.
              </p>
              {/* Fake grid map lines */}
              <div className="absolute inset-0 opacity-5 grid grid-cols-10 grid-rows-10 pointer-events-none">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="border border-foreground" />
                ))}
              </div>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Attendee Reviews ({reviewsCount})</h3>
              <div className="flex items-center gap-1">
                <Star size={18} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold">{averageRating} / 5</span>
              </div>
            </div>

            {/* Leave Review Form */}
            {user?.role === 'attendee' && (
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-4">
                <h4 className="font-bold text-xs">Write a Review</h4>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-semibold">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRating(num)}
                        className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star size={18} fill={num <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience at this event..."
                  required
                  rows={3}
                  className="w-full p-3 rounded-xl bg-background border border-border/50 text-xs focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                />

                {reviewError && <p className="text-xs text-destructive">{reviewError}</p>}
                {reviewSuccess && <p className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> Review submitted successfully!</p>}

                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            )}

            {/* Reviews list */}
            <div className="space-y-4">
              {eventData.event.reviews?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No reviews submitted yet for this event.
                </p>
              ) : (
                eventData.event.reviews?.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-xl border border-border/30 bg-muted/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                          {rev.user?.name[0]}
                        </div>
                        <span className="font-semibold">{rev.user?.name}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Tickets Booking Card) */}
        <div className="space-y-6">
          <div className="sticky top-20 p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-xl space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Pricing</span>
              <div className="text-3xl font-extrabold text-foreground">
                {event.price === 0 ? <span className="text-emerald-500">FREE</span> : `$${event.price}`}
              </div>
            </div>

            {/* Seat Capacity indicators */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Seat Availability</span>
                <span className={isSoldOut ? 'text-destructive font-bold' : remainingSeats < 10 ? 'text-amber-500' : 'text-emerald-500'}>
                  {isSoldOut ? 'SOLD OUT' : `${remainingSeats} / ${event.capacity} seats left`}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSoldOut
                      ? 'bg-destructive'
                      : (event.ticketsSold / event.capacity) * 100 > 80
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, (event.ticketsSold / event.capacity) * 100)}%` }}
                />
              </div>
            </div>

            {!isSoldOut && (
              <div className="space-y-4">
                {/* Quantity input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Select Quantity</label>
                  <div className="flex items-center border border-border rounded-xl p-1 bg-muted/20">
                    <button
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center font-bold border border-transparent active:border-border cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-sm">{ticketQuantity}</span>
                    <button
                      onClick={() => setTicketQuantity(Math.min(remainingSeats, ticketQuantity + 1))}
                      className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center font-bold border border-transparent active:border-border cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Coupon Code section */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Discount Coupon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="ENTER CODE"
                      disabled={appliedCoupon}
                      className="w-full px-3 py-2 bg-muted/40 rounded-xl border border-border/40 text-xs focus:ring-2 focus:ring-violet-500/20 focus:outline-none uppercase font-semibold"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                        className="rounded-xl border border-rose-500 bg-rose-500/10 px-3 py-2 text-rose-500 text-xs font-semibold hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={couponLoading}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {couponError && <p className="text-[11px] text-rose-500">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 size={12} /> Coupon Applied: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% Off` : `$${appliedCoupon.discountValue} Off`}
                    </p>
                  )}
                </form>

                {/* Summary calculation */}
                <div className="border-t border-border/40 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Ticket(s)</span>
                    <span className="font-semibold">${priceBeforeDiscount}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-500 font-semibold">
                      <span>Discount</span>
                      <span>-${(priceBeforeDiscount - priceAfterDiscount).toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="border-border/30 my-1" />
                  <div className="flex justify-between text-sm font-extrabold">
                    <span>Total Amount</span>
                    <span>${priceAfterDiscount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleInitiateBooking}
                  className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ticket size={18} />
                  Book Tickets Now
                </button>
              </div>
            )}

            {isSoldOut && (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-muted text-muted-foreground font-semibold text-sm border border-border/60 cursor-not-allowed text-center"
              >
                Sold Out
              </button>
            )}

            <div className="text-[11px] text-muted-foreground text-center">
              Safe & Secure Payments. Fully simulated test credentials accepted.
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground animate-fade-in space-y-6">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold tracking-tight">Complete Payment Checkout</h3>
              <p className="text-xs text-muted-foreground">Confirm your reservation total of ${priceAfterDiscount.toFixed(2)}</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-3 text-xs">
              <h4 className="font-bold text-foreground">Order Details</h4>
              <div className="flex justify-between text-muted-foreground">
                <span>Event:</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">{event.title}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tickets:</span>
                <span className="font-semibold text-foreground">{ticketQuantity} Pass(es)</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2 text-sm font-extrabold text-foreground">
                <span>Amount:</span>
                <span>${priceAfterDiscount.toFixed(2)}</span>
              </div>
            </div>

            {checkoutError && <p className="text-xs text-rose-500 text-center">{checkoutError}</p>}
            {checkoutSuccess && (
              <p className="text-xs text-emerald-500 font-bold text-center flex items-center justify-center gap-1">
                <CheckCircle2 size={16} /> Payment Confirmed! Transferring passes...
              </p>
            )}

            {/* Test Payment triggers */}
            <div className="space-y-3">
              <button
                onClick={() => handlePaymentCheckout(true)}
                disabled={checkoutLoading || checkoutSuccess}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                Simulate Successful Card Payment
              </button>

              <button
                onClick={() => handlePaymentCheckout(false)}
                disabled={checkoutLoading || checkoutSuccess}
                className="w-full py-3 rounded-xl border border-rose-500 hover:bg-rose-500/10 text-rose-500 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                Simulate Declined Card Payment
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              By confirming, you execute booking logic, reserving your seat slot, generating validation QR barcodes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
