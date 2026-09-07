import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface LoginCredentials {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { navigate, language, showToast } = useShop();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to admin dashboard.
    // A 401 here is the expected logged-out state: handle it silently
    // (no console error, no rejection). Only genuine failures are logged.
    const checkAuth = async () => {
      let response: Response;
      try {
        response = await fetch('/admin/api/auth/me', {
          credentials: 'include',
        });
      } catch (networkError) {
        console.error('Auth check failed: network error.', networkError);
        return;
      }
      if (response.status === 401) return;
      if (!response.ok) {
        console.error(`Auth check failed: unexpected status ${response.status}.`);
        return;
      }
      navigate('/admin');
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/admin/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        showToast(
          language === 'fr' ? 'Connexion réussie!' : 'Login successful!'
        );
        navigate('/admin');
      } else {
        const errorData = await response.json();
        setError(
          language === 'fr'
            ? errorData.message || 'Identifiants incorrects.'
            : errorData.message || 'Invalid credentials.'
        );
      }
    } catch {
      setError(
        language === 'fr' ? 'Une erreur réseau est survenue.' : 'A network error occurred.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Language comes from the persisted preference (admin header toggle),
  // falling back to the browser language, then French. No visible selector.
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3EA] text-[#151515] px-4 py-10">
      <div className="bg-white w-full max-w-[400px] p-8 sm:p-10 rounded-2xl shadow-[0_24px_60px_-24px_rgba(31,87,66,0.25)] border border-[#E7E3DA]">
        <div className="flex flex-col items-center mb-8">
          <span className="flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden bg-[#1F5742]/5 border border-[#E7E3DA] mb-4 p-2.5">
            <img
              src="https://atlasdz.ifree.page/wp-content/uploads/2026/07/ATLAS-logo-2.png"
              alt="Atlas"
              className="w-full h-full object-contain object-center"
              loading="eager"
            />
          </span>
          <h2 className="text-[26px] leading-tight font-semibold text-[#151515] text-center font-sans-ui tracking-tight">
            {language === 'fr' ? 'Connexion Admin' : 'Admin Login'}
          </h2>
          <p className="text-sm text-[#6D6D6D] mt-2 text-center font-sans-ui">
            {language === 'fr' ? 'Connectez-vous à votre tableau de bord Atlas' : 'Sign in to your Atlas dashboard'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans-ui px-4 py-3 rounded-xl mb-5 flex items-start gap-2.5"
          >
            <svg className="w-5 h-5 shrink-0 mt-px" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 7a1 1 0 100 2 1 1 0 000-2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-[#151515] font-sans-ui mb-2">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-[#E7E3DA] rounded-xl bg-[#FCFBF7] font-sans-ui focus:outline-none focus:border-[#1F5742] focus:ring-2 focus:ring-[#1F5742]/20 transition"
              placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-[#151515] font-sans-ui mb-2">
              {language === 'fr' ? 'Mot de passe' : 'Password'}
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
                className="w-full pl-4 pr-12 py-3 border border-[#E7E3DA] rounded-xl bg-[#FCFBF7] font-sans-ui focus:outline-none focus:border-[#1F5742] focus:ring-2 focus:ring-[#1F5742]/20 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword
                    ? language === 'fr'
                      ? 'Masquer le mot de passe'
                      : 'Hide password'
                    : language === 'fr'
                      ? 'Afficher le mot de passe'
                      : 'Show password'
                }
                title={
                  showPassword
                    ? language === 'fr'
                      ? 'Masquer le mot de passe'
                      : 'Hide password'
                    : language === 'fr'
                      ? 'Afficher le mot de passe'
                      : 'Show password'
                }
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#6D6D6D] hover:text-[#1F5742] hover:bg-[#F7F3EA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5742]/40 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full min-h-[52px] py-3.5 px-6 bg-[#1F5742] text-white font-semibold font-sans-ui rounded-xl hover:bg-[#164030] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5742]/40 focus-visible:ring-offset-2 transition flex items-center justify-center gap-2.5 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && (
              <span
                aria-hidden="true"
                className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
              />
            )}
            <span className="text-white">
              {isLoading
                ? language === 'fr'
                  ? 'Connexion en cours…'
                  : 'Logging in…'
                : language === 'fr'
                  ? 'Se connecter'
                  : 'Log in'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;