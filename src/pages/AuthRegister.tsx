import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { t } from '../lib/translations';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.svg';

export default function AuthRegister() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t.messages.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.messages.confirmPassword);
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName, username);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl font-bold">&#10003;</span>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2">{t.auth.accountCreated}</h2>
          <p className="text-gray-600 mb-8">Silakan cek email Anda untuk konfirmasi akun, lalu masuk.</p>
          <a
            href="/login"
            className="inline-block bg-black hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            {t.auth.signInNow}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-12">
        <div>
          <img src={logo} alt="Registri Hak Cipta" className="h-16 w-auto mb-4" />
          <p className="text-lg text-gray-400 mt-2">Lindungi karya Anda dengan blockchain</p>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Pendaftaran Gratis</h3>
            <p className="text-gray-400">Dapatkan 1000 poin bonus untuk memulai</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Kontrol Penuh</h3>
            <p className="text-gray-400">Kelola dokumen dan poin Anda sendiri</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Dukungan Penuh</h3>
            <p className="text-gray-400">Bantuan tersedia kapan pun Anda membutuhkannya</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">{t.auth.createNewAccount}</h2>
            <p className="text-gray-600">{t.auth.registerToGetStarted}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-black mb-3">
                {t.auth.fullName}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Nama Anda"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-black mb-3">
                {t.auth.username}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="namapegguna"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-3">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="anda@contoh.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-3">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-3">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? t.messages.loading : t.auth.createAccount}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t.auth.alreadyHaveAccount}{' '}
              <a href="/login" className="text-black font-semibold hover:underline">
                {t.auth.signIn}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
