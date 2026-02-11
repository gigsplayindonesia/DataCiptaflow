import { Users, FileText, Coins, Activity } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';

export default function AdminDashboard() {
  const userName = 'Admin';
  const points = 5000;
  const isAdmin = true;

  const stats = [
    { label: t.admin.totalUsers, value: '1,245', icon: Users },
    { label: t.admin.totalDocuments, value: '8,962', icon: FileText },
    { label: t.admin.totalPointsInCirculation, value: '2.4M', icon: Coins },
    { label: 'Transaksi Hari Ini', value: '348', icon: Activity },
  ];

  const recentUsers = [
    { id: 1, name: 'Budi Santoso', email: 'budi@example.com', joined: '2024-01-15', status: 'active' },
    { id: 2, name: 'Rini Wijaya', email: 'rini@example.com', joined: '2024-01-14', status: 'active' },
    { id: 3, name: 'Ahmad Hidayat', email: 'ahmad@example.com', joined: '2024-01-13', status: 'active' },
  ];

  return (
    <ProtectedLayout userName={userName} points={points} isAdmin={isAdmin}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">{t.admin.adminDashboard}</h1>
          <p className="text-gray-600">{t.admin.platformStatistics}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-black" />
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-black">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Users */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-black mb-6">Pengguna Baru Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bergabung</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-sm font-medium text-black">{user.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{user.joined}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Aktif
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <a href="/admin/users" className="text-black hover:underline font-medium">
                        Lihat
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/admin/users" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
            <Users className="w-8 h-8 text-black mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Kelola Pengguna</h3>
            <p className="text-gray-600 text-sm">Lihat dan kelola semua pengguna</p>
          </a>
          <a href="/admin/settings" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
            <Activity className="w-8 h-8 text-black mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Pengaturan Sistem</h3>
            <p className="text-gray-600 text-sm">Konfigurasi platform</p>
          </a>
          <a href="/admin/blockchain" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
            <Coins className="w-8 h-8 text-black mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">Blockchain Monitor</h3>
            <p className="text-gray-600 text-sm">Status jaringan real-time</p>
          </a>
        </div>
      </div>
    </ProtectedLayout>
  );
}
