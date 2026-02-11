import { useState, useEffect } from 'react';
import { FileText, Layers, CheckCircle2, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { createClient } from '@supabase/supabase-js';

export default function Dashboard() {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  // Dummy data
  const userName = 'Budi Santoso';
  const points = 850;

  // Banner state
  const [staticBanner, setStaticBanner] = useState<any>(null);
  const [dynamicBanners, setDynamicBanners] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (dynamicBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % dynamicBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [dynamicBanners.length]);

  // Fetch banners from database
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const [staticRes, dynamicRes] = await Promise.all([
          supabase.from('banners_static').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('banners_dynamic').select('*').eq('is_active', true).order('display_order', { ascending: true }),
        ]);

        if (staticRes.data) setStaticBanner(staticRes.data);
        if (dynamicRes.data) setDynamicBanners(dynamicRes.data);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleBannerClick = (url: string, behavior: string) => {
    if (url && url !== '#') {
      if (behavior === 'new_tab') {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + dynamicBanners.length) % dynamicBanners.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % dynamicBanners.length);
  };

  const stats = [
    { label: 'Total Dokumen Terdaftar', value: '100', icon: FileText, color: 'text-black' },
    { label: 'Saldo Saat Ini', value: '200', icon: Layers, color: 'text-black' },
    { label: 'Verifikasi Dokumen', value: '20', icon: CheckCircle2, color: 'text-black' },
    { label: 'Sertifikat', value: '100', icon: Award, color: 'text-black' },
  ];

  const recentDocuments = [
    {
      id: 1,
      name: 'Proposal Bisnis Q4.pdf',
      date: '2024-01-15',
      hash: 'a1b2c3d4...e5f6g7h8',
      status: 'verified',
    },
    {
      id: 2,
      name: 'Desain Logo Terbaru.png',
      date: '2024-01-14',
      hash: 'x9y8z7w6...v5u4t3s2',
      status: 'verified',
    },
    {
      id: 3,
      name: 'Artikel Teknologi.docx',
      date: '2024-01-13',
      hash: 'm1n2o3p4...q5r6s7t8',
      status: 'verified',
    },
  ];

  const recentActivity = [
    { id: 1, type: 'registration', desc: 'Bonus pendaftaran', amount: '+1000', date: '2024-01-01' },
    { id: 2, type: 'document', desc: 'Pendaftaran dokumen', amount: '-100', date: '2024-01-10' },
    { id: 3, type: 'document', desc: 'Pendaftaran dokumen', amount: '-100', date: '2024-01-12' },
  ];

  return (
    <ProtectedLayout userName={userName} points={points}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">{t.dashboard.welcome}, {userName.split(' ')[0]}</h1>
          <p className="text-gray-600">Kelola dokumen dan poin Anda dari satu dasbor</p>
        </div>

        {/* Banner Section */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Static Banner */}
            {staticBanner && (
              <button
                onClick={() => handleBannerClick(staticBanner.destination_url, staticBanner.link_behavior)}
                className="overflow-hidden rounded-xl h-48 md:h-56 hover:shadow-lg transition"
              >
                <img
                  src={staticBanner.image_url}
                  alt="Banner"
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              </button>
            )}

            {/* Right Dynamic Banner Slider */}
            {dynamicBanners.length > 0 && (
              <div className="relative group">
                <button
                  onClick={() => handleBannerClick(dynamicBanners[currentSlideIndex].destination_url, dynamicBanners[currentSlideIndex].link_behavior)}
                  className="overflow-hidden rounded-xl w-full h-48 md:h-56"
                >
                  <img
                    src={dynamicBanners[currentSlideIndex].image_url}
                    alt="Slider Banner"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Navigation Buttons */}
                {dynamicBanners.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                      {dynamicBanners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlideIndex(index)}
                          className={`w-2 h-2 rounded-full transition ${
                            index === currentSlideIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold text-black mb-1">{stat.value}</p>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Documents & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Documents */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">{t.dashboard.recentDocuments}</h2>
              <a href="/documents" className="text-black hover:underline text-sm font-medium flex items-center space-x-1">
                <span>{t.dashboard.viewAll}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-black">{doc.name}</h3>
                      <p className="text-xs text-gray-600 font-mono mt-1">{doc.hash}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                      ✓ Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{doc.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">{t.dashboard.recentActivity}</h2>
              <a href="/transactions" className="text-black hover:underline text-sm font-medium flex items-center space-x-1">
                <span>{t.dashboard.viewAll}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-black">{activity.desc}</h3>
                    <span className={`font-bold ${activity.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.amount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{activity.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/register-doc"
            className="bg-black hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-lg transition text-center"
          >
            {t.documents.registerDocument}
          </a>
          <a
            href="/verify"
            className="bg-gray-100 hover:bg-gray-200 text-black font-semibold py-4 px-6 rounded-lg transition text-center border border-gray-300"
          >
            {t.documents.verifyDocument}
          </a>
        </div>
      </div>
    </ProtectedLayout>
  );
}
