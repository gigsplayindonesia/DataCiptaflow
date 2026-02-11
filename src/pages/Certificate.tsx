import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, ExternalLink } from 'lucide-react';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';

export default function Certificate() {
  const { id } = useParams();
  const [certificateData, setCertificateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id) { setNotFound(true); setLoading(false); return; }

      const { data: doc } = await supabase
        .from('documents')
        .select('*, profiles!documents_user_id_fkey(full_name)')
        .eq('certificate_id', id)
        .maybeSingle();

      if (!doc) {
        setNotFound(true);
      } else {
        setCertificateData({
          documentName: doc.title || doc.file_name,
          fileType: doc.file_type,
          fileSize: doc.file_size,
          registeredBy: doc.profiles?.full_name || 'Unknown',
          registeredDate: new Date(doc.registered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          documentHash: doc.document_hash,
          transactionHash: doc.tx_hash,
          blockNumber: doc.block_number,
          certificateId: doc.certificate_id,
          blockchainTimestamp: new Date(doc.registered_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
        });
      }
      setLoading(false);
    };
    fetchCertificate();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Memuat sertifikat...</p>
        </div>
      </div>
    );
  }

  if (notFound || !certificateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">{t.certificates.certificateNotFound}</h2>
          <p className="text-gray-600 mb-6">{t.certificates.certificateDoesNotExist}</p>
          <a href="/documents" className="bg-black hover:bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg transition">
            Kembali ke Dokumen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/documents" className="text-black hover:text-gray-700 font-semibold">
            {'<-'} Kembali ke Dokumen
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
              Dikeluarkan oleh Datacipta Copyright Registry - Didukung oleh Teknologi Blockchain Polygon.
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
