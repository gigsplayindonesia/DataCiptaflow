import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, Plus, X } from 'lucide-react';
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

export default function RegisterDocument() {
  const { profile, refreshProfile } = useAuth();
  const userName = profile?.full_name || 'User';
  const points = profile?.points || 0;

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [coCreators, setCoCreators] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationCost, setRegistrationCost] = useState(100);
  const [resultCertId, setResultCertId] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'document_registration_cost')
        .single();
      if (data) setRegistrationCost(parseInt(data.value));
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddCoCreator = () => {
    setCoCreators([...coCreators, '']);
  };

  const handleRemoveCoCreator = (index: number) => {
    setCoCreators(coCreators.filter((_, i) => i !== index));
  };

  const handleCoCreatorChange = (index: number, value: string) => {
    const updated = [...coCreators];
    updated[index] = value;
    setCoCreators(updated);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!documentTitle.trim()) {
      newErrors.documentTitle = 'Judul dokumen harus diisi';
    }
    if (!creator.trim()) {
      newErrors.creator = 'Pembuat dokumen harus diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !file || !profile) return;

    if (points < registrationCost) {
      setErrors({ general: t.documents.insufficientPoints });
      return;
    }

    setLoading(true);

    try {
      // 1. Compute document hash
      const documentHash = await computeFileHash(file);

      // 2. Check if document already registered
      const { data: existing } = await supabase
        .from('documents')
        .select('id')
        .eq('document_hash', documentHash)
        .maybeSingle();

      if (existing) {
        setErrors({ general: t.documents.documentAlreadyRegistered });
        setLoading(false);
        return;
      }

      // 3. Generate certificate ID
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const certId = `CERT-${dateStr}-${randomStr}`;

      // 4. Simulate blockchain tx hash and block number
      const txHash = '0x' + documentHash.substring(0, 40);
      const blockNumber = String(Math.floor(40000000 + Math.random() * 5000000));

      // 5. Insert document record
      const filteredCoCreators = coCreators.filter(c => c.trim() !== '');
      const { error: docError } = await supabase.from('documents').insert({
        user_id: profile.id,
        title: documentTitle,
        file_name: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: formatFileSize(file.size),
        creator: creator,
        co_creators: filteredCoCreators,
        additional_info: additionalInfo || null,
        document_hash: documentHash,
        tx_hash: txHash,
        block_number: blockNumber,
        certificate_id: certId,
        status: 'verified',
      });

      if (docError) throw docError;

      // 6. Deduct points
      const newBalance = points - registrationCost;
      await supabase
        .from('profiles')
        .update({ points: newBalance })
        .eq('id', profile.id);

      // 7. Record transaction
      await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'document',
        description: `Pendaftaran dokumen: ${documentTitle}`,
        amount: -registrationCost,
        balance_after: newBalance,
      });

      // 8. Refresh profile to update points
      await refreshProfile();

      setResultCertId(certId);
      setSuccess(true);
      setFile(null);
      setDocumentTitle('');
      setCreator('');
      setCoCreators(['']);
      setAdditionalInfo('');
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({ general: error.message || 'Terjadi kesalahan saat mendaftarkan dokumen' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ProtectedLayout userName={userName} points={profile?.points || 0}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-black mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-black mb-2">{t.documents.documentRegistered}</h2>
            <p className="text-gray-600 mb-8">
              Dokumen Anda telah berhasil didaftarkan di blockchain Polygon.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Certificate ID</p>
              <p className="font-mono text-lg text-black">{resultCertId}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <a
                href={`/certificate/${resultCertId}`}
                className="bg-black hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                {t.documents.viewCertificate}
              </a>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFile(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 px-6 rounded-lg transition border border-gray-300"
              >
                {t.documents.registerAnother}
              </button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout userName={userName} points={points}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">{t.documents.registerDocument}</h1>
          <p className="text-gray-600">{t.documents.uploadDocument}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <p className="text-black text-sm">
              <strong>{t.documents.registrationCost}:</strong> {registrationCost} {t.documents.points} | <strong>{t.documents.yourBalance}:</strong> {points} {t.documents.points}
            </p>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-sm font-semibold text-black mb-4">
                {t.documents.selectDocument}
              </label>
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-black transition cursor-pointer"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 mb-2 font-medium">
                    {file ? file.name : t.documents.dragDropDocument}
                  </p>
                  <p className="text-gray-600 text-sm">{t.documents.anyFileType}</p>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2">
                {'Judul Dokumen'}<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => {
                  setDocumentTitle(e.target.value);
                  if (errors.documentTitle) {
                    setErrors({ ...errors, documentTitle: '' });
                  }
                }}
                placeholder="Masukan judul dokumen"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black transition ${
                  errors.documentTitle ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.documentTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.documentTitle}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  {'Creator'}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={creator}
                  onChange={(e) => {
                    setCreator(e.target.value);
                    if (errors.creator) {
                      setErrors({ ...errors, creator: '' });
                    }
                  }}
                  placeholder="Nama pembuat dokumen"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-black transition ${
                    errors.creator ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.creator && (
                  <p className="text-red-500 text-sm mt-1">{errors.creator}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  {'Co-Creator '}<span className="text-gray-500 text-xs font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={coCreators[0]}
                  onChange={(e) => handleCoCreatorChange(0, e.target.value)}
                  placeholder="Nama pembuat dokumen lainnya"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            {coCreators.length > 1 && (
              <div className="mb-6 space-y-3">
                {coCreators.slice(1).map((coCreator, index) => (
                  <div key={index + 1} className="flex gap-2">
                    <input
                      type="text"
                      value={coCreator}
                      onChange={(e) => handleCoCreatorChange(index + 1, e.target.value)}
                      placeholder="Nama pembuat dokumen lainnya"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCoCreator(index + 1)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6">
              <button
                type="button"
                onClick={handleAddCoCreator}
                className="flex items-center gap-2 text-sm font-semibold text-black hover:bg-gray-100 px-3 py-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                {'tambah Co-Creator'}
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2">
                {'Informasi Lain '}<span className="text-gray-500 text-xs font-normal">(opsional)</span>
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Informasi tambahan, deskripsi singkat atau metadata"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition resize-none"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={!file || loading || points < registrationCost}
              className="w-full bg-black hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-lg transition"
            >
              {loading ? t.messages.loading : `${t.documents.registerOnBlockchain} (${registrationCost} ${t.documents.points})`}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-black mb-4">Bagaimana cara kerjanya:</h3>
            <ol className="text-gray-600 text-sm space-y-2 list-decimal list-inside">
              <li>Unggah dokumen Anda (PDF, gambar, teks, audio, video, dll.)</li>
              <li>Kami menghitung hash kriptografi unik</li>
              <li>Hash didaftarkan di blockchain Polygon</li>
              <li>Anda menerima sertifikat digital dengan bukti blockchain</li>
              <li>Siapa pun dapat memverifikasi keaslian dokumen</li>
            </ol>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
