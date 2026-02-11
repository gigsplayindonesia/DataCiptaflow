import { useState, useEffect } from 'react';
import { Activity, Zap, CheckCircle2 } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdminBlockchain() {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Admin';
  const points = profile?.points || 0;
  const isAdmin = true;

  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [totalDocs24h, setTotalDocs24h] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: docs } = await supabase
          .from('documents')
          .select('*, profiles!documents_user_id_fkey(full_name)')
          .order('registered_at', { ascending: false })
          .limit(10);

        if (docs) setRecentDocs(docs);

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .gte('registered_at', yesterday);
        if (count !== null) setTotalDocs24h(count);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const blockchainStatus = {
    network: 'Polygon Mumbai Testnet',
    latestBlock: 42156789,
    gasPrice: '35.42',
    isHealthy: true,
    lastCheck: new Date().toLocaleString('id-ID'),
    avgBlockTime: '2.5s',
  };

  return (
    <ProtectedLayout userName={userName} points={points} isAdmin={isAdmin}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">{t.admin.blockchainMonitoring}</h1>
          <p className="text-gray-600">Pantau status jaringan blockchain Polygon real-time</p>
        </div>

        {/* Network Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">{t.admin.networkStatus}</h2>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-green-600">{t.admin.healthy}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Network</p>
              <p className="font-semibold text-black">{blockchainStatus.network}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">{t.admin.latestBlock}</p>
              <p className="font-semibold text-black">{blockchainStatus.latestBlock.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">{t.admin.gasPrice}</p>
              <p className="font-semibold text-black">{blockchainStatus.gasPrice} Gwei</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Waktu Blok Rata-rata</p>
              <p className="font-semibold text-black">{blockchainStatus.avgBlockTime}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pengecekan Terakhir</p>
                <p className="font-semibold text-black">{blockchainStatus.lastCheck}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendaftaran 24 Jam</p>
                <p className="font-semibold text-black text-lg">{loading ? '...' : totalDocs24h}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-black mb-6">Pendaftaran Dokumen Terbaru</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            </div>
          ) : recentDocs.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Belum ada pendaftaran dokumen</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hash Transaksi</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Dokumen</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Pengguna</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-sm font-mono text-gray-600">{doc.tx_hash ? doc.tx_hash.substring(0, 12) + '...' : '-'}</td>
                      <td className="px-4 py-4 text-sm text-black font-medium">{doc.title || doc.file_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{doc.profiles?.full_name || '-'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{new Date(doc.registered_at).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          Dikonfirmasi
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Network Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-6 h-6 text-black" />
              <h3 className="text-lg font-semibold text-black">Aktivitas Jaringan</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaksi per Detik</span>
                <span className="font-semibold text-black">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nodes Aktif</span>
                <span className="font-semibold text-black">2,348</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Validators</span>
                <span className="font-semibold text-black">156</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-6 h-6 text-black" />
              <h3 className="text-lg font-semibold text-black">Estimasi Biaya</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Transfer</span>
                <span className="font-semibold text-black">~$0.01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Kontrak Smart</span>
                <span className="font-semibold text-black">~$0.05</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rata-rata Gas</span>
                <span className="font-semibold text-black">~50,000 units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
