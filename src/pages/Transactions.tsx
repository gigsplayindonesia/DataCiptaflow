import { TrendingUp, TrendingDown, Layers, Plus, Minus, ArrowLeftRight } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';

export default function Transactions() {
  const userName = 'Budi Santoso';
  const points = 850;

  const transactions = [
    { id: 1, type: 'registration', desc: 'Bonus pendaftaran', amount: 1000, date: '2024-01-01', balance: 1000 },
    { id: 2, type: 'document', desc: 'Pendaftaran dokumen: Proposal.pdf', amount: -100, date: '2024-01-10', balance: 900 },
    { id: 3, type: 'document', desc: 'Pendaftaran dokumen: Logo.png', amount: -100, date: '2024-01-12', balance: 800 },
    { id: 4, type: 'topup', desc: 'Top-up manual', amount: 200, date: '2024-01-14', balance: 1000 },
    { id: 5, type: 'document', desc: 'Pendaftaran dokumen: Artikel.docx', amount: -100, date: '2024-01-15', balance: 900 },
    { id: 6, type: 'adjustment', desc: 'Penyesuaian admin', amount: -50, date: '2024-01-16', balance: 850 },
  ];

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      registration: 'Bonus Pendaftaran',
      document: 'Pendaftaran Dokumen',
      topup: 'Top-up Poin',
      adjustment: 'Penyesuaian Admin',
    };
    return labels[type] || type;
  };

  const statsCards = [
    { label: 'Saldo Poin Saat Ini', value: '200', icon: Layers },
    { label: 'Total Poin Didapat', value: '+250', icon: Plus },
    { label: 'Total Poin Digunakan', value: '-50', icon: Minus },
    { label: 'Total Transaksi', value: '4', icon: ArrowLeftRight },
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{tx.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{tx.desc}</td>
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
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-black">{tx.balance}</td>
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
