import { FileText, ExternalLink } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';

export default function MyDocuments() {
  const userName = 'Budi Santoso';
  const points = 850;

  const documents = [
    {
      id: 1,
      name: 'Proposal Bisnis Q4.pdf',
      type: 'application/pdf',
      size: '2.4 MB',
      date: '2024-01-15',
      hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      txHash: '0x123abc456def789',
      certificateId: 'CERT-20240115-ABC123',
      block: '42156789',
    },
    {
      id: 2,
      name: 'Desain Logo Terbaru.png',
      type: 'image/png',
      size: '1.8 MB',
      date: '2024-01-14',
      hash: 'x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4',
      txHash: '0x456def789abc123',
      certificateId: 'CERT-20240114-DEF456',
      block: '42156788',
    },
    {
      id: 3,
      name: 'Artikel Teknologi.docx',
      type: 'application/docx',
      size: '0.5 MB',
      date: '2024-01-13',
      hash: 'm1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6',
      txHash: '0x789abc123def456',
      certificateId: 'CERT-20240113-GHI789',
      block: '42156787',
    },
  ];

  return (
    <ProtectedLayout userName={userName} points={points}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">{t.nav.myDocuments}</h1>
            <p className="text-gray-600">Lihat semua dokumen terdaftar Anda</p>
          </div>
          <a
            href="/register-doc"
            className="bg-black hover:bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {t.nav.registerDocument}
          </a>
        </div>

        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-black">{doc.name}</h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
                <a
                  href={`/certificate/${doc.certificateId}`}
                  className="flex items-center space-x-2 bg-black hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <span>Sertifikat</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Document Hash</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{doc.hash.substring(0, 24)}...</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Transaction Hash</p>
                  <p className="font-mono text-sm text-gray-900">{doc.txHash}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Block Number</p>
                  <p className="font-semibold text-black">{doc.block}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Certificate ID</p>
                  <p className="font-mono text-sm text-gray-900">{doc.certificateId}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
