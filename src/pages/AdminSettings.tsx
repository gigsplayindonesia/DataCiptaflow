import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminSettings() {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Admin';
  const points = profile?.points || 0;
  const isAdmin = true;

  const [settings, setSettings] = useState({
    platform_name: '',
    registration_bonus: '',
    document_registration_cost: '',
    max_file_size: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('key, value');

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s: any) => { map[s.key] = s.value; });
        setSettings({
          platform_name: map.platform_name || 'Registri Hak Cipta Polygon',
          registration_bonus: map.registration_bonus || '1000',
          document_registration_cost: map.document_registration_cost || '100',
          max_file_size: map.max_file_size || '50',
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from('system_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key)
      );

      await Promise.all(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout userName={userName} points={points} isAdmin={isAdmin}>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Memuat pengaturan...</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout userName={userName} points={points} isAdmin={isAdmin}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">{t.admin.systemConfiguration}</h1>
          <p className="text-gray-600">Kelola pengaturan platform</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm">Pengaturan berhasil disimpan!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                {t.admin.platformName}
              </label>
              <input
                type="text"
                value={settings.platform_name}
                onChange={(e) => handleChange('platform_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  {t.admin.registrationBonus}
                </label>
                <input
                  type="number"
                  value={settings.registration_bonus}
                  onChange={(e) => handleChange('registration_bonus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  {t.admin.documentRegistrationCost}
                </label>
                <input
                  type="number"
                  value={settings.document_registration_cost}
                  onChange={(e) => handleChange('document_registration_cost', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                {t.admin.maxFileSize} (MB)
              </label>
              <input
                type="number"
                value={settings.max_file_size}
                onChange={(e) => handleChange('max_file_size', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-black hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? t.admin.saving : t.admin.save}</span>
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-black mb-4">Tentang Pengaturan</h3>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>Bonus Pendaftaran: Poin yang diberikan kepada pengguna baru saat mendaftar</li>
            <li>Biaya Pendaftaran Dokumen: Poin yang dikurangkan saat pengguna mendaftarkan dokumen</li>
            <li>Ukuran File Maksimal: Ukuran file maksimal yang dapat diunggah pengguna</li>
          </ul>
        </div>
      </div>
    </ProtectedLayout>
  );
}
