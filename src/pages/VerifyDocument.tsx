import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, XCircle } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function VerifyDocument() {
  const { profile, refreshProfile } = useAuth();
  const userName = profile?.full_name || 'User';
  const points = profile?.points || 0;

  const [activeTab, setActiveTab] = useState<'file' | 'hash'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [hashError, setHashError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verificationCost, setVerificationCost] = useState(10);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'verification_cost')
        .single();
      if (data) setVerificationCost(parseInt(data.value));
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const validateHash = (hashValue: string) => {
    if (!hashValue.trim()) {
      setHashError('Hash dokumen harus diisi');
      return false;
    }
    if (!/^[a-fA-F0-9]{64}$/.test(hashValue.trim())) {
      setHashError('Hash harus berupa SHA-256 yang valid (64 karakter heksadesimal)');
      return false;
    }
    setHashError('');
    return true;
  };

  const verifyByHash = async (docHash: string) => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data: doc } = await supabase
        .from('documents')
        .select('*, profiles!documents_user_id_fkey(full_name)')
        .eq('document_hash', docHash)
        .maybeSingle();

      // Deduct verification cost
      const newBalance = points - verificationCost;
      await supabase.from('profiles').update({ points: newBalance }).eq('id', profile.id);
      await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'verification',
        description: `Verifikasi dokumen`,
        amount: -verificationCost,
        balance_after: newBalance,
      });
      await refreshProfile();

      if (doc) {
        setResult({
          verified: true,
          documentName: doc.title || doc.file_name,
          registeredBy: doc.profiles?.full_name || 'Unknown',
          date: new Date(doc.registered_at).toLocaleDateString('id-ID'),
          txHash: doc.tx_hash,
          certificateId: doc.certificate_id,
          hash: doc.document_hash,
        });
      } else {
        setResult({
          verified: false,
          hash: docHash,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const fileHash = await computeFileHash(file);
    await verifyByHash(fileHash);
  };

  const handleVerifyHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateHash(hash)) return;
    await verifyByHash(hash.trim());
  };

  return (
    <ProtectedLayout userName={userName} points={profile?.points || 0}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{t.documents.verifyDocument}</h1>
          <p className="text-gray-600">Verifikasi integritas dan keaslian dokumen yang telah terdaftar di blockchain</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <p className="text-black text-sm">
              <strong>Biaya Verifikasi:</strong> {verificationCost} poin | <strong>Saldo Anda:</strong> {profile?.points || 0} poin
            </p>
          </div>

          <div className="mb-8 bg-gray-100 rounded-lg p-1 flex gap-2">
            <button
              onClick={() => {
                setActiveTab('file');
                setResult(null);
                setHashError('');
              }}
              className={`flex-1 py-3 px-4 font-semibold text-sm rounded-md transition ${
                activeTab === 'file'
                  ? 'bg-white text-black'
                  : 'bg-gray-100 text-gray-700 hover:text-black'
              }`}
            >
              Unggah File
            </button>
            <button
              onClick={() => {
                setActiveTab('hash');
                setResult(null);
                setHashError('');
              }}
              className={`flex-1 py-3 px-4 font-semibold text-sm rounded-md transition ${
                activeTab === 'hash'
                  ? 'bg-white text-black'
                  : 'bg-gray-100 text-gray-700 hover:text-black'
              }`}
            >
              Masukan Hash
            </button>
          </div>

          {activeTab === 'file' && (
            <form onSubmit={handleVerifyFile}>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-black mb-4">
                  {'Pilih Dokumen '}<span className="text-gray-600 font-normal">(semua jenis file)</span>
                </label>
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleFileChange({ target: { files: e.dataTransfer.files } } as any);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-black transition cursor-pointer"
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="verify-upload"
                  />
                  <label htmlFor="verify-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-900 mb-2 font-medium">
                      {file ? file.name : 'Klik untuk mengunggah atau tarik dan lepaskan'}
                    </p>
                    <p className="text-gray-600 text-sm">Mendukung semua jenis file</p>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || loading || (profile?.points || 0) < verificationCost}
                className="w-full bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-lg transition"
              >
                {loading ? 'Memverifikasi...' : `Verifikasi Dokumen (${verificationCost} poin)`}
              </button>
            </form>
          )}

          {activeTab === 'hash' && (
            <form onSubmit={handleVerifyHash}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-4">
                  {'#Masukan Hash Dokumen'}
                </label>
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => {
                    setHash(e.target.value);
                    if (hashError) {
                      setHashError('');
                    }
                  }}
                  placeholder="Masukkan hash SHA-256 dari dokumen yang ingin Anda verifikasi"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-black transition ${
                    hashError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {hashError && (
                  <p className="text-red-500 text-sm mt-2">{hashError}</p>
                )}
                <p className="text-gray-600 text-sm mt-3">
                  Masukkan hash yang dihasilkan saat dokumen didaftarkan
                </p>
              </div>

              <button
                type="submit"
                disabled={!hash || loading || (profile?.points || 0) < verificationCost}
                className="w-full bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-lg transition"
              >
                {loading ? 'Memverifikasi...' : `Verifikasi Dokumen (${verificationCost} poin)`}
              </button>
            </form>
          )}

          {result && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-center mb-6">
                {result.verified ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-black mb-2">{t.documents.verified}</h2>
                    <p className="text-gray-600">Dokumen ini terdaftar di blockchain</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-black mb-2">{t.documents.notVerified}</h2>
                    <p className="text-gray-600">Dokumen ini tidak terdaftar dalam sistem</p>
                  </>
                )}
              </div>

              {result.verified && (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Nama Dokumen</p>
                    <p className="font-medium text-black">{result.documentName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Didaftarkan Oleh</p>
                    <p className="font-medium text-black">{result.registeredBy}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Tanggal Pendaftaran</p>
                    <p className="font-medium text-black">{result.date}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
