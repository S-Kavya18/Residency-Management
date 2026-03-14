import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { validateLogin } from '../utils/validationSchemas';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleReady, setGoogleReady] = useState(false);
  const [googleInit, setGoogleInit] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    const existingScript = document.getElementById('google-identity');
    if (existingScript) {
      setGoogleReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-identity';
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setGoogleReady(false);
    document.body.appendChild(script);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { errors: validationErrors, value } = validateLogin(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);

    const result = await login(value.email, value.password);

    if (result.success) {
      toast.success('Login successful!');
      const user = result.user || JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/resident');
      }
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  const handleGoogleCredential = async (credential) => {
    setGoogleLoading(true);
    const result = await googleLogin(credential);

    if (result.success) {
      toast.success('Logged in with Google');
      const user = result.user;
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/resident');
      }
    } else {
      toast.error(result.message);
    }
    setGoogleLoading(false);
  };

  const triggerGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Sign-In is not configured');
      return;
    }

    if (!googleReady || !window.google?.accounts?.id) {
      toast.error('Google Sign-In is not ready. Please try again.');
      return;
    }

    if (!googleInit) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (credential) {
            handleGoogleCredential(credential);
          } else {
            toast.error('Google sign-in was cancelled');
          }
        },
        ux_mode: 'popup',
        use_fedcm_for_prompt: false
      });
      setGoogleInit(true);
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const notDisplayed = notification.getNotDisplayedReason?.();
        const skipped = notification.getSkippedReason?.();
        console.warn('Google prompt blocked/skipped', { notDisplayed, skipped });
        toast.error('Google sign-in was blocked or cancelled. Check popup blockers or try again.');
      }
    });
  };

  return (
    <div className="min-h-screen landing-bg flex items-center justify-center px-4">
      <div
        className={`relative max-w-md w-full bg-white/90 border border-slate-200 rounded-2xl shadow-lg p-8 transition-all duration-700 ease-out transform ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.98]'}`}
      >
        <div className="absolute inset-x-10 -top-6 h-12 bg-gradient-to-r from-teal-600/80 via-teal-500/70 to-amber-300/80 rounded-full blur-2xl opacity-60" aria-hidden="true" />
        <h2 className="text-3xl font-display text-center text-slate-900 mb-8 fade-up">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6 stagger">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              placeholder="Enter your password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-2 rounded-lg font-semibold hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4">
          <button
            type="button"
            onClick={triggerGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 border border-slate-300 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#EA4335" d="M24 9.5c3.17 0 5.37 1.37 6.6 2.5l4.82-4.82C32.64 4.46 28.68 3 24 3 14.9 3 7.16 8.68 4.1 16.26l5.95 4.62C11.7 14.32 17.3 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.2-.42-4.71H24v9h12.65c-.55 2.96-2.2 5.47-4.71 7.16l7.32 5.68C43.95 38.44 46.5 31.95 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.05 28.88a14.5 14.5 0 0 1-.75-4.38c0-1.52.27-2.99.74-4.38l-5.95-4.62A23.44 23.44 0 0 0 1.5 24.5c0 3.8.9 7.38 2.5 10.5l6.05-6.12z"/>
              <path fill="#34A853" d="M24 46.5c6.48 0 11.92-2.13 15.9-5.82l-7.32-5.68c-2.01 1.35-4.58 2.16-8.58 2.16-6.7 0-12.3-4.82-14.35-11.29l-6.05 6.12C7.16 40.32 14.9 46.5 24 46.5z"/>
              <path fill="none" d="M1.5 1.5h45v45h-45z"/>
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-700 hover:text-teal-800 font-semibold">
            Register here
          </Link>
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
