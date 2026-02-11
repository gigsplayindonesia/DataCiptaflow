import { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function MyDocuments() {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'User';
  const points = profile?.points || 0;

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!profile) return;
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', profile.id)
        .order('registered_at', { ascending: false });

      if (data) setDocuments(data);
      setLoading(false);
    };
    fetchDocuments();
  }, [profile]);

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

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Memuat dokumen...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">{t.documents.noDocumentsYet}</h3>
            <p className="text-gray-600 mb-6">Mulai dengan mendaftarkan dokumen pertama Anda</p>
            <a
              href="/register-doc"
              className="inline-block bg-black hover:bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              {t.documents.registerFirstDocument}
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-black">{doc.title || doc.file_name}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{doc.file_type}</span>
                      <span>{'|'}</span>
                      <span>{doc.file_size}</span>
                      <span>{'|'}</span>
                      <span>{new Date(doc.registered_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <a
                    href={`/certificate/${doc.certificate_id}`}
                    className="flex items-center space-x-2 bg-black hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <span>Sertifikat</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Document Hash</p>
                    <p className="font-mono text-sm text-gray-900 break-all">{doc.document_hash ? doc.document_hash.substring(0, 24) + '...' : '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Transaction Hash</p>
                    <p className="font-mono text-sm text-gray-900">{doc.tx_hash || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Block Number</p>
                    <p className="font-semibold text-black">{doc.block_number || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Certificate ID</p>
                    <p className="font-mono text-sm text-gray-900">{doc.certificate_id || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
