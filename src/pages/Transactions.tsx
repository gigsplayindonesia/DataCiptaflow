import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Layers, Plus, Minus, ArrowLeftRight } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Transactions() {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'User';
  const points = profile?.points || 0;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!profile) return;
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (data) {
        setTransactions(data);
        let earned = 0;
        let spent = 0;
        data.forEach((tx: any) => {
          if (tx.amount > 0) earned += tx.amount;
          else spent += Math.abs(tx.amount);
        });
        setTotalEarned(earned);
        setTotalSpent(spent);
      }
      setLoading(false);
    };
    fetchTransactions();
  }, [profile]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      registration: 'Bonus Pendaftaran',
      document: 'Pendaftaran Dokumen',
      verification: 'Verifikasi Dokumen',
      topup: 'Top-up Poin',
      adjustment: 'Penyesuaian Admin',
    };
    return labels[type] || type;
  };

  const statsCards = [
    { label: 'Saldo Poin Saat Ini', value: String(points), icon: Layers },
    { label: 'Total Poin Didapat', value: `+${totalEarned}`, icon: Plus },
    { label: 'Total Poin Digunakan', value: `-${totalSpent}`, icon: Minus },
    { label: 'Total Transaksi', value: String(transactions.length), icon: ArrowLeftRight },
  ];

  return (
    <ProtectedLayout userName={userName} points={points}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">{t.transactions.transactionHistory}</h1>
          <p className="text-gray-600">{t.transactions.completePointLedger}</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold text-black mb-1">{card.value}</p>
                    <p className="text-gray-600 text-sm">{card.label}</p>
                  </div>
                  <Icon className="w-8 h-8 text-black" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-sm">Memuat transaksi...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeftRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">{t.transactions.noTransactions}</h3>
              <p className="text-gray-600">{t.transactions.transactionHistoryAppears}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t.transactions.date}</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t.transactions.type}</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t.transactions.description}</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t.transactions.amount}</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t.transactions.balanceAfter}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(tx.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getTypeLabel(tx.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{tx.description}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">
                        <div className="flex items-center justify-end space-x-1">
                          {tx.amount > 0 ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">+{tx.amount}</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-red-600" />
                              <span className="text-red-600">{tx.amount}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-black">{tx.balance_after}</td>
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
