import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyTickets from './pages/MyTickets';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import { Calendar, Mail, Globe } from 'lucide-react';

function MainAppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [initialFilters, setInitialFilters] = useState({});

  // Helper to parse dynamic route parameters (e.g. "event-details:XYZ")
  const renderPage = () => {
    if (currentPage.startsWith('event-details:')) {
      const id = currentPage.split(':')[1];
      return <EventDetails eventId={id} onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'home':
        return (
          <Home
            onNavigate={setCurrentPage}
            onSearchSelect={(filters) => {
              setInitialFilters(filters);
              setCurrentPage('events');
            }}
          />
        );
      case 'events':
        return <Events onNavigate={setCurrentPage} initialFilters={initialFilters} />;
      case 'my-tickets':
        return <MyTickets onNavigate={setCurrentPage} />;
      case 'organizer-dashboard':
        return <OrganizerDashboard onNavigate={setCurrentPage} />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'profile':
        return <Profile onNavigate={setCurrentPage} />;
      case 'contact':
        return <ContactUs />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  const handleNavigation = (page) => {
    // Clear search filters if navigating directly to browse events from elsewhere
    if (page === 'events') {
      setInitialFilters({});
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar onNavigate={handleNavigation} currentPage={currentPage} />
      
      {/* Main page wrapper */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-4">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-border/40 py-12 text-muted-foreground mt-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding Column */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-lg">
                  G
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  GatherFlow
                </span>
              </div>
              <p className="text-xs max-w-sm leading-relaxed">
                Empowering event planners to publish seat inventory, orchestrate payments, emit ticket vouchers, and verify attendees in real-time.
              </p>
            </div>

            {/* Platform links Column */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Explore</h4>
              <ul className="space-y-2">
                <li>
                  <span onClick={() => handleNavigation('events')} className="hover:text-violet-500 cursor-pointer transition-colors">
                    Browse Events
                  </span>
                </li>
                <li>
                  <span onClick={() => handleNavigation('contact')} className="hover:text-violet-500 cursor-pointer transition-colors">
                    Contact Support
                  </span>
                </li>
                <li>
                  <span onClick={() => handleNavigation('login')} className="hover:text-violet-500 cursor-pointer transition-colors">
                    Organizer Portal
                  </span>
                </li>
              </ul>
            </div>

            {/* Socials Column */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Follow Us</h4>
              <div className="flex gap-4">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-violet-500 transition-colors">
                  <svg className="h-5 w-5 hover:text-violet-500 transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="mailto:support@gatherflow.com" className="hover:text-violet-500 transition-colors">
                  <Mail size={20} />
                </a>
                <a href="https://gatherflow.com" target="_blank" rel="noreferrer" className="hover:text-violet-500 transition-colors">
                  <Globe size={20} />
                </a>
              </div>
            </div>
          </div>

          <hr className="my-8 border-border/40" />

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-semibold text-muted-foreground gap-4">
            <span>© {new Date().getFullYear()} GatherFlow Inc. All Rights Reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-violet-500 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-violet-500 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainAppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
