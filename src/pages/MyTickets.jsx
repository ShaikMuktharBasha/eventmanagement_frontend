import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Download, AlertCircle, ArrowLeft, Loader, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

export default function MyTickets({ onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/my-tickets');
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking and request a refund?')) return;
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      alert('Ticket cancelled successfully.');
      fetchMyBookings(); // reload
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel ticket');
    }
  };

  // Generate and download a PDF ticket using jsPDF
  const downloadPDFTicket = (booking) => {
    const { event, attendee, ticketQuantity, totalAmount, paymentId, qrCode } = booking;
    
    // Create new PDF Document (A5 size for ticket-like look)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    // Color theme
    const violetColor = '#6d28d9';
    const darkGray = '#1f2937';
    const lightGray = '#f3f4f6';

    // Header styling
    doc.setFillColor(109, 40, 217); // Violet-700
    doc.rect(0, 0, 148, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('GATHERFLOW ENTRY PASS', 15, 16);

    // Event title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('CONFIRMED TICKET', 105, 16, { align: 'right' });

    // Ticket Body
    doc.setTextColor(darkGray);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text(event.title, 15, 38);

    doc.setDrawColor(229, 231, 235);
    doc.line(15, 42, 133, 42);

    // Logistics Grid
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor('#6b7280');
    doc.text('DATE & TIME', 15, 49);
    doc.text('VENUE', 15, 61);
    doc.text('ATTENDEE', 15, 73);

    doc.setTextColor(darkGray);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${new Date(event.date).toLocaleDateString()} at ${event.time}`, 15, 53);
    doc.text(event.venue, 15, 65);
    doc.text(attendee.name, 15, 77);

    // Ticket Quantities / Costs
    doc.setFillColor(243, 244, 246);
    doc.rect(15, 83, 118, 14, 'F');
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    doc.text('PASS COUNT', 18, 89);
    doc.text('TOTAL PAID', 60, 89);
    doc.text('TRANSACTION ID', 95, 89);

    doc.setFont('Helvetica', 'bold');
    doc.text(`${ticketQuantity} Ticket(s)`, 18, 93);
    doc.text(`$${totalAmount.toFixed(2)}`, 60, 93);
    doc.text(paymentId || 'Simulated Card', 95, 93);

    // QR Code drawing (from base64 sent by Mongoose)
    if (qrCode) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('SCAN QR CODE AT VENUE', 74, 113, { align: 'center' });
      
      // Draw QR Code image
      doc.addImage(qrCode, 'PNG', 49, 116, 50, 50);
    }

    // Footnote
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'italic');
    doc.setTextColor('#9ca3af');
    doc.text('Thank you for booking with GatherFlow. Please bring a printed or electronic copy of this pass.', 74, 175, { align: 'center' });

    // Download file
    doc.save(`GatherFlow_Ticket_${event.title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="w-full py-8 space-y-8">
      {/* Back to Events Navigation link */}
      <button
        onClick={() => onNavigate('events')}
        className="flex items-center gap-1 text-xs font-semibold text-violet-500 hover:text-violet-600 transition-colors shrink-0 cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Events
      </button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My Booked Tickets</h1>
        <p className="text-muted-foreground text-sm">
          Access your electronic entry passes, check-in status, and download PDF receipts.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader className="animate-spin text-violet-500" size={32} />
          <span className="text-xs text-muted-foreground">Retrieving booking passes...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-dashed border-rose-500/50 bg-rose-500/5 text-rose-500 rounded-2xl">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl space-y-4">
          <Ticket size={48} className="text-muted-foreground animate-bounce" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg">No Tickets Booked</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You haven't purchased any event tickets yet. Explore upcoming events and book some!
            </p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-violet-500 transition-all cursor-pointer"
          >
            Explore Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const { event, _id, paymentStatus, checkInStatus, ticketQuantity, totalAmount } = booking;
            const isRefunded = paymentStatus === 'refunded';
            const isPaid = paymentStatus === 'paid';
            const isFailed = paymentStatus === 'failed';

            return (
              <div
                key={_id}
                className="flex flex-col justify-between p-6 rounded-2xl border border-border/40 bg-card text-card-foreground shadow-md space-y-6"
              >
                {/* Event header info */}
                <div className="flex gap-4 items-start">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img src={event.banner} alt={event.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold text-base truncate" title={event.title}>{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar size={14} />
                      <span>
                        {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'short' })} at {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate block max-w-[200px]" title={event.venue}>{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Grid metrics details */}
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/40 text-center text-xs">
                  <div className="space-y-1">
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Passes</span>
                    <span className="font-bold">{ticketQuantity} Ticket(s)</span>
                  </div>
                  
                  <div className="space-y-1 border-x border-border/40">
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Payment</span>
                    <span
                      className={`font-bold inline-block px-2 py-0.5 rounded-full text-[10px] ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : isRefunded
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {paymentStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Check-in</span>
                    <span
                      className={`font-bold inline-block px-2 py-0.5 rounded-full text-[10px] ${
                        checkInStatus
                          ? 'bg-indigo-500/10 text-indigo-500'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {checkInStatus ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* PDF & Cancel buttons */}
                <div className="flex justify-between items-center text-xs pt-1">
                  <div className="font-bold text-sm text-foreground">
                    Total: ${totalAmount.toFixed(2)}
                  </div>
                  
                  <div className="flex gap-2">
                    {isPaid && (
                      <>
                        <button
                          onClick={() => downloadPDFTicket(booking)}
                          className="rounded-xl border border-border hover:bg-muted px-4 py-2 font-semibold text-card-foreground transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Download size={14} /> PDF
                        </button>
                        {!checkInStatus && (
                          <button
                            onClick={() => handleCancelBooking(_id)}
                            className="rounded-xl border border-rose-500/50 hover:bg-rose-500/10 px-4 py-2 font-semibold text-rose-500 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                    {isRefunded && (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        <AlertCircle size={14} /> Refunded
                      </span>
                    )}
                    {isFailed && (
                      <span className="text-xs text-rose-500 font-semibold italic flex items-center gap-1">
                        Payment Failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
