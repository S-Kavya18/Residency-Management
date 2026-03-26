import { useEffect, useRef, useState } from 'react';
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
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleInitErrorShown, setGoogleInitErrorShown] = useState(false);
  const googleButtonRef = useRef(null);
  const googleScriptRetryCount = useRef(0);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const loadGoogleScript = () => {
    const existingScript = document.getElementById('google-identity');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-identity';
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setGoogleReady(false);
    document.body.appendChild(script);
  };

  useEffect(() => {
    setMounted(true);
    loadGoogleScript();
  }, []);

  useEffect(() => {
    if (!googleReady) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Sign-In is not configured');
      return;
    }

    if (!window.google?.accounts?.id) {
      if (googleScriptRetryCount.current < 2) {
        googleScriptRetryCount.current += 1;
        setGoogleReady(false);
        loadGoogleScript();
        return;
      }
      if (!googleInitErrorShown) {
        toast.error('Google Sign-In failed to load. Please refresh and try again.');
        setGoogleInitErrorShown(true);
      }
      return;
    }

    setGoogleInitErrorShown(false);

    try {
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
        use_fedcm_for_prompt: true,
        cancel_on_tap_outside: false
      });

      if (googleButtonRef.current && !googleButtonRendered) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          text: 'continue_with',
          shape: 'pill',
          size: 'large',
          width: 360
        });
        setGoogleButtonRendered(true);
      }
    } catch (err) {
      console.error('Failed to initialize Google Sign-In', err);
      toast.error('Google Sign-In failed to initialize. Please refresh and try again.');
      setGoogleReady(false);
    }
  }, [googleReady, googleButtonRendered, googleInitErrorShown]);

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
          {googleReady ? (
            <div
              ref={googleButtonRef}
              className={`flex justify-center ${googleLoading ? 'opacity-60 pointer-events-none' : ''}`}
              aria-busy={googleLoading}
            />
          ) : (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2 border border-slate-300 py-2 rounded-lg font-semibold text-slate-500 bg-slate-50 cursor-not-allowed"
            >
              Continue with Google (loading)
            </button>
          )}
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
