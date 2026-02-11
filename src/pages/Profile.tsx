import { useState } from 'react';
import { Save } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const userName = profile?.full_name || 'User';
  const points = profile?.points || 0;

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: username,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <ProtectedLayout userName={userName} points={points}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{t.profile.profileSettings}</h1>
          <p className="text-gray-600">{t.profile.manageAccount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm">{t.profile.profileUpdated}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                {t.profile.emailAddress}
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
              <p className="text-gray-600 text-xs mt-2">{t.profile.cannotBeChanged}</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-black mb-3">
                {t.profile.fullName}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-black mb-3">
                {t.profile.username}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-black hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? t.profile.saving : t.profile.saveChanges}</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-black mb-4">{t.profile.accountInformation}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.profile.accountType}</span>
                <span className="font-semibold text-black">{profile?.role === 'admin' ? 'Administrator' : 'Pengguna'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.profile.pointsBalance}</span>
                <span className="font-semibold text-black">{points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.profile.memberSince}</span>
                <span className="font-semibold text-black">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
