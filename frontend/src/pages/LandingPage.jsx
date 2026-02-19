import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEmailClick = (event) => {
    if (!user) {
      event.preventDefault();
      navigate('/login');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'staff':
        return '/staff';
      case 'resident':
        return '/resident';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen landing-bg text-slate-900">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-teal-700">Smart Residency</p>
              <h1 className="text-2xl sm:text-3xl font-display text-slate-900">RSM Lakshmini Residency</h1>
              <p className="text-sm text-slate-600">Premium managed living in Tiruchendur</p>
            </div>
            <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <a href="#services" className="text-slate-700 hover:text-teal-700">Services</a>
              <a href="#platform" className="text-slate-700 hover:text-teal-700">Platform</a>
              <a href="#process" className="text-slate-700 hover:text-teal-700">How It Works</a>
              <a href="#contact" className="text-slate-700 hover:text-teal-700">Contact</a>
              {user ? (
                <Link
                  to={getDashboardLink()}
                  className="px-4 py-2 bg-teal-700 text-white rounded-full hover:bg-teal-800"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 border border-teal-700 text-teal-700 rounded-full hover:bg-teal-50"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <section className="hero-banner relative text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 text-center space-y-6">
          <div className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold tracking-[0.28em] uppercase bg-white/10 border border-white/25 rounded-full">RSM Lakshmi Residency</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">Welcome to RSM Lakshmi Residency</h2>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">Perfect blend of convenience and comfort</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="tel:+914463222333"
              className="px-6 sm:px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full shadow-lg shadow-emerald-500/25"
            >
              Click Here To Call
            </a>
            <a
              href="#contact"
              className="px-6 sm:px-8 py-3 bg-white/90 text-slate-900 font-semibold rounded-full hover:bg-white"
            >
              Need help? Chat with us
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="fade-up space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
              Designed for modern residency management
            </div>
            <h2 className="text-4xl sm:text-5xl font-display text-slate-900 leading-tight">
              Premium living, streamlined operations, real-time visibility.
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
              A unified platform for residents, staff, and administrators. From smart room
              allocation to responsive support, we keep every touchpoint crisp, transparent,
              and reliable.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#platform"
                className="px-6 py-3 bg-teal-700 text-white rounded-full font-semibold hover:bg-teal-800"
              >
                Explore the platform
              </a>
              <a
                href="#contact"
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-white"
              >
                Talk to us
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-semibold text-slate-700">
              <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-display text-slate-900">10K+</p>
                <p className="text-slate-600">Service requests handled</p>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-display text-slate-900">98%</p>
                <p className="text-slate-600">On-time resolutions</p>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-display text-slate-900">24/7</p>
                <p className="text-slate-600">Resident support</p>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-display text-slate-900">360°</p>
                <p className="text-slate-600">Operational view</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 border border-slate-200 rounded-3xl p-8 shadow-lg float-slow space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-teal-700 font-semibold">Reliability first</p>
                <h3 className="text-2xl font-display text-slate-900">What sets us apart</h3>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">ISO mindset</span>
            </div>
            <ul className="space-y-4 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-700" aria-hidden />
                Live availability and structured approvals keep occupancy accurate.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-700" aria-hidden />
                SLA-driven complaint routing with staff accountability and audit logs.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-700" aria-hidden />
                Integrated food, housekeeping, and resident services with clear ownership.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-700" aria-hidden />
                Secure authentication, role-based access, and privacy-first data handling.
              </li>
            </ul>
          </div>
        </section>

        <section id="platform" className="space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-teal-700">Unified platform</p>
            <h3 className="text-3xl font-display text-slate-900">Built for every role</h3>
            <p className="text-slate-700 max-w-3xl">
              Clear, outcome-focused workflows tailored to administrators, residents, and staff.
              Each workspace is optimized for speed, clarity, and accountability.
            </p>
          </div>
          <div className="stagger grid gap-6 md:grid-cols-3">
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-semibold text-teal-700">Administrators</p>
              <h4 className="mt-2 text-xl font-display text-slate-900">Operational control</h4>
              <p className="mt-3 text-slate-700">
                Portfolio dashboards, approvals, escalations, and structured checkouts with full audit trails.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-full bg-slate-100">Occupancy insights</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">Staff routing</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">Compliance logs</span>
              </div>
            </div>
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-semibold text-teal-700">Residents</p>
              <h4 className="mt-2 text-xl font-display text-slate-900">Effortless living</h4>
              <p className="mt-3 text-slate-700">
                Apply for rooms, request housekeeping, manage food plans, and track complaints from one console.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-full bg-slate-100">Self-service</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">Real-time status</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">Secure login</span>
              </div>
            </div>
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-semibold text-teal-700">Staff</p>
              <h4 className="mt-2 text-xl font-display text-slate-900">Clear priorities</h4>
              <p className="mt-3 text-slate-700">
                Personalized queues for complaints and tasks, with time-boxed SLAs and progress tracking.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-full bg-slate-100">Assigned queue</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">SLA focus</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">Activity logs</span>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-teal-700">Hospitality-grade services</p>
            <h3 className="text-3xl font-display text-slate-900">What residents get</h3>
            <p className="text-slate-700 max-w-3xl">
              From move-in to daily comfort, every service is orchestrated with transparent timelines and clear ownership.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xl font-display text-slate-900">Core living</h4>
              <p className="text-slate-700">Smart room allocation, early checkout with reasons, and real-time availability to plan with confidence.</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">Availability lock</span>
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-800">Planned stays</span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800">Early checkout</span>
              </div>
            </div>
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xl font-display text-slate-900">Daily services</h4>
              <p className="text-slate-700">Integrated food plans, housekeeping requests, and rapid complaint routing to the right department.</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800">Food subscriptions</span>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800">Housekeeping</span>
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800">Issue tracking</span>
              </div>
            </div>
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xl font-display text-slate-900">Support & assurance</h4>
              <p className="text-slate-700">SLA-backed complaint handling, proactive updates, and archived history for full transparency.</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-full bg-slate-100">Live status</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">Escalations</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">Audit trail</span>
              </div>
            </div>
            <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xl font-display text-slate-900">Amenities</h4>
              <p className="text-slate-700">Airy rooms, AC/non-AC options, secure premises, and common areas designed for comfort and productivity.</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1 rounded-full bg-slate-100">AC / Non-AC</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">High-speed Wi-Fi</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">24/7 security</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">Common lounges</span>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-teal-700">Simple onboarding</p>
            <h3 className="text-3xl font-display text-slate-900">How it works</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Apply or sign in', detail: 'Residents submit an application or log in for instant access to services.', tag: 'Step 1' },
              { title: 'Allocate & confirm', detail: 'Admins review availability, approve requests, and lock in rooms with audit logs.', tag: 'Step 2' },
              { title: 'Live, track, resolve', detail: 'Raise requests, monitor progress, and stay updated with clear SLAs.', tag: 'Step 3' }
            ].map((item) => (
              <div key={item.title} className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <span className="text-xs font-semibold text-teal-700">{item.tag}</span>
                <h4 className="text-lg font-display text-slate-900">{item.title}</h4>
                <p className="text-slate-700">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="location" className="space-y-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-teal-700">Find us</p>
            <h3 className="text-3xl font-display text-slate-900">Visit RSM Lakshmini Residency</h3>
            <p className="text-slate-700 max-w-2xl">
              Located in the heart of Tiruchendur. Book a walkthrough to see rooms, amenities, and how our team operates.
            </p>
          </div>
          <div className="bg-white/90 border border-slate-200 rounded-3xl p-4 shadow-sm">
            <div className="h-80 w-full rounded-2xl overflow-hidden">
              <iframe
                title="RSM Lakshmini Residency location"
                src="https://www.google.com/maps?q=8.495237308642478,78.1251139262977&z=18&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section id="contact" className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-10 shadow-lg grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Visit us</p>
              <h3 className="text-3xl font-display">Schedule a walkthrough</h3>
              <p className="text-slate-200 max-w-2xl">
                See the property, meet the team, and explore how our platform keeps operations lean
                while residents stay delighted.
              </p>
              <div className="text-lg font-semibold">53/1, VOC Street, Tiruchendur-628215</div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4">
              <h4 className="text-xl font-display">Talk to our team</h4>
              <p className="text-slate-200 text-sm">Share what you need—occupancy targets, service SLAs, or a tailored move-in plan.</p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <a
                  href={user ? 'mailto:kavyas.23aid@kongu.edu' : '#'}
                  onClick={handleEmailClick}
                  className="px-4 py-2 bg-white text-slate-900 rounded-full hover:bg-amber-100"
                >
                  Email us
                </a>
                <a
                  href="tel:+914463222333"
                  className="px-4 py-2 border border-white text-white rounded-full hover:bg-white/10 inline-flex items-center gap-2"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M4 4h4l2 5-3 2c1.5 3 4 5.5 7 7l2-3 5 2v4c0 1-1 2-2 2C9.82 23 1 14.18 1 3 1 2 2 1 3 1h4l2 5-3 2c1.5 3 4 5.5 7 7l2-3 5 2v4" />
                  </svg>
                  +91 4463 222333
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
          <span>© RSM Lakshmini Residency — Premium living crafted for Tiruchendur</span>
          <span>Secure | Transparent | Service-first</span>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};

export default LandingPage;
