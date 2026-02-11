import { useState, useEffect } from 'react';
import { Users, FileText, Coins, Activity } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Admin';
  const points = profile?.points || 0;
  const isAdmin = true;

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [todayTx, setTodayTx] = useState(0);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, docsRes, profilesRes, recentUsersRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('documents').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('points'),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        if (usersRes.count !== null) setTotalUsers(usersRes.count);
        if (docsRes.count !== null) setTotalDocuments(docsRes.count);
        if (profilesRes.data) {
          const sum = profilesRes.data.reduce((acc: number, p: any) => acc + (p.points || 0), 0);
          setTotalPoints(sum);
        }
        if (recentUsersRes.data) setRecentUsers(recentUsersRes.data);

        // Today's transactions
        const today = new Date().toISOString().split('T')[0];
        const { count: txCount } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today);
        if (txCount !== null) setTodayTx(txCount);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: t.admin.totalUsers, value: totalUsers.toLocaleString(), icon: Users },
    { label: t.admin.totalDocuments, value: totalDocuments.toLocaleString(), icon: FileText },
    { label: t.admin.totalPointsInCirculation, value: totalPoints.toLocaleString(), icon: Coins },
    { label: 'Transaksi Hari Ini', value: todayTx.toLocaleString(), icon: Activity },
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
                <p className="text-3xl font-bold text-black">{loading ? '...' : stat.value}</p>
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
                    <td className="px-4 py-4 text-sm font-medium text-black">{user.full_name || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
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
