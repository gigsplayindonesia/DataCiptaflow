import { Activity, Zap, CheckCircle2 } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';

export default function AdminBlockchain() {
  const userName = 'Admin';
  const points = 5000;
  const isAdmin = true;

  const blockchainStatus = {
    network: 'Polygon Mumbai Testnet',
    latestBlock: 42156789,
    gasPrice: '35.42',
    isHealthy: true,
    lastCheck: '2024-01-15 15:30:45',
    avgBlockTime: '2.5s',
    transactions24h: 125430,
  };

  const recentTransactions = [
    {
      id: 1,
      hash: '0x123abc456def789',
      documentName: 'Proposal.pdf',
      user: 'Budi Santoso',
      timestamp: '15 Januari 2024, 15:20',
      status: 'confirmed',
    },
    {
      id: 2,
      hash: '0x456def789abc123',
      documentName: 'Logo.png',
      user: 'Rini Wijaya',
      timestamp: '15 Januari 2024, 14:15',
      status: 'confirmed',
    },
    {
      id: 3,
      hash: '0x789abc123def456',
      documentName: 'Artikel.docx',
      user: 'Ahmad Hidayat',
      timestamp: '15 Januari 2024, 13:45',
      status: 'confirmed',
    },
  ];

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
                <p className="text-sm text-gray-600">Transaksi 24 Jam</p>
                <p className="font-semibold text-black text-lg">{blockchainStatus.transactions24h.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-black mb-6">Pendaftaran Dokumen Terbaru</h2>
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
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-sm font-mono text-gray-600">{tx.hash.substring(0, 12)}...</td>
                    <td className="px-4 py-4 text-sm text-black font-medium">{tx.documentName}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{tx.user}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{tx.timestamp}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        ✓ Dikonfirmasi
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
