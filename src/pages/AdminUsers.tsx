import { Edit, Trash2, MoreVertical } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';

export default function AdminUsers() {
  const userName = 'Admin';
  const points = 5000;
  const isAdmin = true;

  const users = [
    { id: 1, name: 'Budi Santoso', email: 'budi@example.com', points: 850, joined: '2024-01-15', status: 'active' },
    { id: 2, name: 'Rini Wijaya', email: 'rini@example.com', points: 1200, joined: '2024-01-14', status: 'active' },
    { id: 3, name: 'Ahmad Hidayat', email: 'ahmad@example.com', points: 500, joined: '2024-01-13', status: 'inactive' },
    { id: 4, name: 'Siti Nurhaliza', email: 'siti@example.com', points: 2000, joined: '2024-01-12', status: 'active' },
    { id: 5, name: 'Hendra Gunawan', email: 'hendra@example.com', points: 1500, joined: '2024-01-11', status: 'active' },
  ];

  return (
    <ProtectedLayout userName={userName} points={points} isAdmin={isAdmin}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">{t.admin.userManagement}</h1>
            <p className="text-gray-600">{t.admin.manageUsers}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
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
                    <td className="px-4 py-4 text-sm font-medium text-black">{user.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-black">{user.points}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{user.joined}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button className="text-black hover:text-gray-700 p-2 hover:bg-gray-100 rounded transition">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-black hover:text-gray-700 p-2 hover:bg-gray-100 rounded transition">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
