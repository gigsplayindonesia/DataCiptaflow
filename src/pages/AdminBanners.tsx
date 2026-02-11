import { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, Save, X, Plus, GripVertical } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminBanners() {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Admin';
  const points = profile?.points || 0;

  // Static Banner State
  const [staticBanner, setStaticBanner] = useState<any>(null);
  const [staticEditing, setStaticEditing] = useState(false);
  const [staticForm, setStaticForm] = useState({
    image_url: '',
    destination_url: '',
    link_behavior: 'new_tab' as 'new_tab' | 'same_tab',
    is_active: true,
  });

  // Dynamic Banners State
  const [dynamicBanners, setDynamicBanners] = useState<any[]>([]);
  const [showAddDynamic, setShowAddDynamic] = useState(false);
  const [dynamicForm, setDynamicForm] = useState({
    image_url: '',
    destination_url: '',
    link_behavior: 'new_tab' as 'new_tab' | 'same_tab',
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch banners
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const [staticRes, dynamicRes] = await Promise.all([
        supabase.from('banners_static').select('*').maybeSingle(),
        supabase.from('banners_dynamic').select('*').order('display_order', { ascending: true }),
      ]);

      if (staticRes.data) setStaticBanner(staticRes.data);
      if (dynamicRes.data) setDynamicBanners(dynamicRes.data);
    } catch (error) {
      showMessage('error', 'Gagal memuat banner');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Static Banner Handlers
  const handleStaticEdit = () => {
    if (staticBanner) {
      setStaticForm({
        image_url: staticBanner.image_url,
        destination_url: staticBanner.destination_url || '',
        link_behavior: staticBanner.link_behavior,
        is_active: staticBanner.is_active,
      });
      setStaticEditing(true);
    }
  };

  const handleStaticSave = async () => {
    try {
      if (staticBanner) {
        await supabase
          .from('banners_static')
          .update({
            ...staticForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', staticBanner.id);
      } else {
        await supabase.from('banners_static').insert([staticForm]);
      }

      setStaticEditing(false);
      await fetchBanners();
      showMessage('success', 'Banner statis berhasil disimpan');
    } catch (error) {
      showMessage('error', 'Gagal menyimpan banner statis');
    }
  };

  const handleStaticDelete = async () => {
    if (!staticBanner) return;
    if (!confirm('Hapus banner statis?')) return;

    try {
      await supabase.from('banners_static').delete().eq('id', staticBanner.id);
      setStaticBanner(null);
      setStaticEditing(false);
      showMessage('success', 'Banner statis berhasil dihapus');
    } catch (error) {
      showMessage('error', 'Gagal menghapus banner statis');
    }
  };

  // Dynamic Banner Handlers
  const handleAddDynamic = async () => {
    if (!dynamicForm.image_url) {
      showMessage('error', 'URL gambar wajib diisi');
      return;
    }

    try {
      const maxOrder = dynamicBanners.length > 0 ? Math.max(...dynamicBanners.map(b => b.display_order)) : 0;

      await supabase.from('banners_dynamic').insert([
        {
          ...dynamicForm,
          display_order: maxOrder + 1,
          is_active: true,
        },
      ]);

      setDynamicForm({
        image_url: '',
        destination_url: '',
        link_behavior: 'new_tab',
      });
      setShowAddDynamic(false);
      await fetchBanners();
      showMessage('success', 'Banner slider berhasil ditambahkan');
    } catch (error) {
      showMessage('error', 'Gagal menambahkan banner slider');
    }
  };

  const handleDeleteDynamic = async (id: string) => {
    if (!confirm('Hapus banner slider ini?')) return;

    try {
      await supabase.from('banners_dynamic').delete().eq('id', id);
      await fetchBanners();
      showMessage('success', 'Banner slider berhasil dihapus');
    } catch (error) {
      showMessage('error', 'Gagal menghapus banner slider');
    }
  };

  const handleReorderDynamic = async (id: string, direction: 'up' | 'down') => {
    const index = dynamicBanners.findIndex(b => b.id === id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === dynamicBanners.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const banner1 = dynamicBanners[index];
    const banner2 = dynamicBanners[swapIndex];

    try {
      await Promise.all([
        supabase.from('banners_dynamic').update({ display_order: banner2.display_order }).eq('id', banner1.id),
        supabase.from('banners_dynamic').update({ display_order: banner1.display_order }).eq('id', banner2.id),
      ]);

      await fetchBanners();
    } catch (error) {
      showMessage('error', 'Gagal mengurutkan banner');
    }
  };

  if (loading) {
    return (
      <ProtectedLayout userName={userName} points={points}>
        <div className="text-center py-12">
          <p className="text-gray-600">Memuat...</p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout userName={userName} points={points}>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">Pengaturan Banner</h1>
          <p className="text-gray-600">Kelola banner statis dan dinamis di dasbor pengguna</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Static Banner Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-black">Banner Statis (Kiri)</h2>

          {!staticEditing ? (
            <div className="space-y-4">
              {staticBanner ? (
                <div className="space-y-4">
                  <img
                    src={staticBanner.image_url}
                    alt="Static Banner"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">URL Tujuan</p>
                      <p className="font-medium text-black break-all">{staticBanner.destination_url || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Perilaku Link</p>
                      <p className="font-medium text-black">
                        {staticBanner.link_behavior === 'new_tab' ? 'Tab Baru' : 'Tab Sama'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleStaticEdit}
                      className="flex-1 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition flex items-center justify-center space-x-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleStaticDelete}
                      className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleStaticEdit}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition flex items-center justify-center space-x-2 text-gray-600 hover:text-black"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tambah Banner Statis</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">URL Gambar</label>
                <input
                  type="text"
                  value={staticForm.image_url}
                  onChange={(e) => setStaticForm({ ...staticForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">URL Tujuan (Opsional)</label>
                <input
                  type="text"
                  value={staticForm.destination_url}
                  onChange={(e) => setStaticForm({ ...staticForm, destination_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Perilaku Link</label>
                <select
                  value={staticForm.link_behavior}
                  onChange={(e) => setStaticForm({ ...staticForm, link_behavior: e.target.value as 'new_tab' | 'same_tab' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="new_tab">Buka di Tab Baru</option>
                  <option value="same_tab">Buka di Tab Sama</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleStaticSave}
                  className="flex-1 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
                </button>
                <button
                  onClick={() => setStaticEditing(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Banners Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">Banner Dinamis - Slider (Kanan)</h2>
            {!showAddDynamic && dynamicBanners.length < 10 && (
              <button
                onClick={() => setShowAddDynamic(true)}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            )}
          </div>

          {showAddDynamic && (
            <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50">
              <h3 className="font-semibold text-black">Tambah Banner Slider</h3>
              <div>
                <label className="block text-sm font-medium text-black mb-2">URL Gambar</label>
                <input
                  type="text"
                  value={dynamicForm.image_url}
                  onChange={(e) => setDynamicForm({ ...dynamicForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">URL Tujuan (Opsional)</label>
                <input
                  type="text"
                  value={dynamicForm.destination_url}
                  onChange={(e) => setDynamicForm({ ...dynamicForm, destination_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Perilaku Link</label>
                <select
                  value={dynamicForm.link_behavior}
                  onChange={(e) => setDynamicForm({ ...dynamicForm, link_behavior: e.target.value as 'new_tab' | 'same_tab' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="new_tab">Buka di Tab Baru</option>
                  <option value="same_tab">Buka di Tab Sama</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddDynamic}
                  className="flex-1 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan</span>
                </button>
                <button
                  onClick={() => setShowAddDynamic(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-medium transition flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>
              </div>
            </div>
          )}

          {dynamicBanners.length > 0 ? (
            <div className="space-y-3">
              {dynamicBanners.map((banner, index) => (
                <div key={banner.id} className="border border-gray-200 rounded-lg p-4 flex items-start space-x-4 hover:bg-gray-50">
                  <img
                    src={banner.image_url}
                    alt="Slider Banner"
                    className="w-24 h-24 object-cover rounded border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">Urutan: #{index + 1}</p>
                    <p className="text-sm font-medium text-black truncate mb-1">
                      {banner.destination_url || '(Tanpa link)'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {banner.link_behavior === 'new_tab' ? 'Tab Baru' : 'Tab Sama'}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 flex-shrink-0">
                    {index > 0 && (
                      <button
                        onClick={() => handleReorderDynamic(banner.id, 'up')}
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Pindah ke atas"
                      >
                        ↑
                      </button>
                    )}
                    {index < dynamicBanners.length - 1 && (
                      <button
                        onClick={() => handleReorderDynamic(banner.id, 'down')}
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title="Pindah ke bawah"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDynamic(banner.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">Belum ada banner slider</p>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
