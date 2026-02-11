import { useState } from 'react';
import { Save } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';

export default function AdminSettings() {
  const userName = 'Admin';
  const points = 5000;
  const isAdmin = true;

  const [settings, setSettings] = useState({
    platformName: 'Registri Hak Cipta Polygon',
    registrationBonus: '1000',
    documentRegistrationCost: '100',
    maxFileSize: '50',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

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
                value={settings.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
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
                  value={settings.registrationBonus}
                  onChange={(e) => handleChange('registrationBonus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  {t.admin.documentRegistrationCost}
                </label>
                <input
                  type="number"
                  value={settings.documentRegistrationCost}
                  onChange={(e) => handleChange('documentRegistrationCost', e.target.value)}
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
                value={settings.maxFileSize}
                onChange={(e) => handleChange('maxFileSize', e.target.value)}
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
