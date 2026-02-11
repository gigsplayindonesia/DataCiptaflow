import { useState, useEffect } from 'react';
import { Edit, MoreVertical, Save, X } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminUsers() {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Admin';
  const points = profile?.points || 0;
  const isAdmin = true;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setEditingUser(user.id);
    setEditPoints(String(user.points));
    setEditStatus(user.status);
  };

  const handleSave = async (userId: string) => {
    try {
      const oldUser = users.find(u => u.id === userId);
      const newPoints = parseInt(editPoints);
      const pointDiff = newPoints - (oldUser?.points || 0);

      await supabase
        .from('profiles')
        .update({ points: newPoints, status: editStatus })
        .eq('id', userId);

      // Record point adjustment transaction if points changed
      if (pointDiff !== 0) {
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'adjustment',
          description: `Penyesuaian admin: ${pointDiff > 0 ? '+' : ''}${pointDiff} poin`,
          amount: pointDiff,
          balance_after: newPoints,
        });
      }

      setEditingUser(null);
      await fetchUsers();
      showMessage('success', 'Pengguna berhasil diperbarui');
    } catch (error) {
      showMessage('error', 'Gagal memperbarui pengguna');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <ProtectedLayout userName={userName} points={points} isAdmin={isAdmin}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">{t.admin.userManagement}</h1>
            <p className="text-gray-600">{t.admin.manageUsers}</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-sm">Memuat pengguna...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t.profile.fullName}</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t.admin.email}</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t.admin.points}</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bergabung</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t.admin.status}</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t.admin.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-sm font-medium text-black">{user.full_name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-black">
                        {editingUser === user.id ? (
                          <input
                            type="number"
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          user.points
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-4 text-sm">
                        {editingUser === user.id ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {editingUser === user.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSave(user.id)}
                              className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded transition"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-black hover:text-gray-700 p-2 hover:bg-gray-100 rounded transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
