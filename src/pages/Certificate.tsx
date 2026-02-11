import { useParams } from 'react-router-dom';
import { Download, ExternalLink } from 'lucide-react';
import { t } from '../lib/translations';

export default function Certificate() {
  const { id } = useParams();

  const certificateData = {
    documentName: 'Proposal Bisnis Q4.pdf',
    fileType: 'application/pdf',
    fileSize: '2.4 MB',
    registeredBy: 'Budi Santoso',
    registeredDate: '15 Januari 2024',
    documentHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    transactionHash: '0x123abc456def789ghi012jkl345mno678pqr901',
    blockNumber: '42156789',
    certificateId: 'CERT-20240115-ABC123',
    blockchainTimestamp: '15 Januari 2024, 10:30:45 UTC',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/documents" className="text-black hover:text-gray-700 font-semibold">
            ← Kembali ke Dokumen
          </a>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-black hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg transition print:hidden"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div id="certificate" className="bg-white border-8 border-black rounded-2xl p-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-black rounded-2xl mb-6">
              <span className="text-white font-bold text-2xl">RC</span>
            </div>
            <h1 className="text-4xl font-bold text-black mb-2">{t.certificates.certificateOfAuthenticity}</h1>
            <p className="text-gray-600 text-lg">{t.certificates.blockchainCopyrightRegistration}</p>
          </div>

          {/* Message */}
          <div className="border-t-2 border-black pt-8 mb-8">
            <p className="text-center text-gray-700 text-lg leading-relaxed mb-8">
              {t.certificates.certificateMessage}
            </p>

            {/* Document Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-2">Nama Dokumen</p>
                <p className="text-xl text-black font-semibold">{certificateData.documentName}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Jenis File</p>
                  <p className="text-black font-semibold">{certificateData.fileType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Ukuran File</p>
                  <p className="text-black font-semibold">{certificateData.fileSize}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-2">Didaftarkan Oleh</p>
                <p className="text-black font-semibold">{certificateData.registeredBy}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold mb-2">Tanggal Pendaftaran</p>
                <p className="text-black font-semibold">{certificateData.registeredDate}</p>
              </div>

              {/* Blockchain Verification Section */}
              <div className="bg-black text-white rounded-lg p-6 mt-8">
                <p className="text-lg font-semibold mb-4">Verifikasi Blockchain</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-300 mb-2">Document Hash (SHA-256)</p>
                    <p className="font-mono text-sm break-all text-gray-100">{certificateData.documentHash}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-300 mb-2">Transaction Hash</p>
                    <p className="font-mono text-sm break-all text-gray-100">{certificateData.transactionHash}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-300 mb-2">Nomor Blok</p>
                      <p className="font-semibold text-white">{certificateData.blockNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300 mb-2">Waktu Blockchain</p>
                      <p className="font-semibold text-white text-sm">{certificateData.blockchainTimestamp}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-300 mb-2">ID Sertifikat</p>
                    <p className="font-mono font-bold text-2xl text-white">{certificateData.certificateId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black pt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Sertifikat ini dapat diverifikasi kapan saja dengan mengunggah dokumen asli ke sistem verifikasi kami.
            </p>
            <p className="text-gray-500 text-xs">
              Dikeluarkan oleh Datacipta Copyright Registry • Didukung oleh Teknologi Blockchain Polygon.
            </p>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 text-center space-y-4 print:hidden">
          <a
            href={`https://polygonscan.com/tx/${certificateData.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-black hover:text-gray-700 font-semibold"
          >
            <span>Lihat di Polygonscan</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
