import { useState } from 'react';
import { Upload, CheckCircle2, Plus, X } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';

export default function RegisterDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [coCreators, setCoCreators] = useState<string[]>(['']);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const userName = 'Budi Santoso';
  const points = 850;
  const registrationCost = 100;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFile(null);
      setDocumentTitle('');
      setCreator('');
      setCoCreators(['']);
      setAdditionalInfo('');
    }, 2000);
  };

  if (success) {
    return (
      <ProtectedLayout userName={userName} points={points}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-black mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-black mb-2">{t.documents.documentRegistered}</h2>
            <p className="text-gray-600 mb-8">
              Dokumen Anda telah berhasil didaftarkan di blockchain Polygon.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Certificate ID</p>
              <p className="font-mono text-lg text-black">CERT-20240115-ABC123DEF</p>
            </div>
            <div className="flex gap-4 justify-center">
              <a
                href="/certificate/CERT-20240115-ABC123DEF"
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
                Judul Dokumen<span className="text-red-500">*</span>
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
                  Creator<span className="text-red-500">*</span>
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
                  Co-Creator <span className="text-gray-500 text-xs font-normal">(opsional)</span>
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
                tambah Co-Creator
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-black mb-2">
                Informasi Lain <span className="text-gray-500 text-xs font-normal">(opsional)</span>
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
