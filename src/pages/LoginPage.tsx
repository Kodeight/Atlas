import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // If already authenticated, redirect to admin dashboard
    const checkAuth = async () => {
      try {
        const response = await fetch('/admin/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const user = await response.json();
          navigate('/admin');
        }
      } catch {
        // Not authenticated, continue
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3EA] text-[#151515] px-4">
      <div className="bg-white w-full max-w-[440px] p-8 sm:p-10 rounded-xl shadow-xl border border-[#E7E3DA]">
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://atlasdz.ifree.page/wp-content/uploads/2026/07/ATLAS-logo-2.png"
            alt="Atlas"
            className="w-12 h-12 object-contain mb-3"
            loading="eager"
          />
          <h2 className="text-2xl font-bold text-[#1F5742] text-center">
            {language === 'fr' ? 'Connexion Admin' : 'Admin Login'}
          </h2>
          <p className="text-sm text-[#6D6D6D] mt-2 text-center">
            {language === 'fr' ? 'Connectez-vous à votre tableau de bord Atlas' : 'Sign in to your Atlas dashboard'}
          </p>
        </div>

        {error && (
          <div className="bg-[#F7F3EA] text-[#1F5742] p-3 rounded-md mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#1F5742]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 5a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#151515] mb-2">
              {language === 'fr' ? 'Email' : 'Email'}
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#1F5742] transition-colors"
              placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151515] mb-2">
              {language === 'fr' ? 'Mot de passe' : 'Password'}
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-[#E7E3DA] rounded-lg focus:outline-none focus:border-[#1F5742] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full min-h-[48px] py-3.5 px-6 bg-[#1F5742] text-white font-semibold rounded-lg hover:bg-[#164030] focus:outline-none focus:ring-2 focus:ring-[#1F5742]/30 transition-colors flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
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