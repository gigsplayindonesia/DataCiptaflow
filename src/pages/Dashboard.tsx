import { useState, useEffect } from 'react';
import { FileText, Layers, CheckCircle2, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { t } from '../lib/translations';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'User';
  const points = profile?.points || 0;

  // Banner state
  const [staticBanner, setStaticBanner] = useState<any>(null);
  const [dynamicBanners, setDynamicBanners] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Real data state
  const [docCount, setDocCount] = useState(0);
  const [verifyCount, setVerifyCount] = useState(0);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (dynamicBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % dynamicBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [dynamicBanners.length]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      try {
        const [staticRes, dynamicRes, docsRes, txRes] = await Promise.all([
          supabase.from('banners_static').select('*').eq('is_active', true).maybeSingle(),
          supabase.from('banners_dynamic').select('*').eq('is_active', true).order('display_order', { ascending: true }),
          supabase.from('documents').select('*').eq('user_id', profile.id).order('registered_at', { ascending: false }).limit(3),
          supabase.from('transactions').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(3),
        ]);

        if (staticRes.data) setStaticBanner(staticRes.data);
        if (dynamicRes.data) setDynamicBanners(dynamicRes.data);
        if (docsRes.data) {
          setRecentDocuments(docsRes.data);
          setDocCount(docsRes.data.length);
          // Count verified docs
          const verified = docsRes.data.filter((d: any) => d.status === 'verified');
          setVerifyCount(verified.length);
        }
        if (txRes.data) setRecentActivity(txRes.data);

        // Get total doc count
        const { count } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);
        if (count !== null) setDocCount(count);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

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
    { label: 'Total Dokumen Terdaftar', value: String(docCount), icon: FileText, color: 'text-black' },
    { label: 'Saldo Saat Ini', value: String(points), icon: Layers, color: 'text-black' },
    { label: 'Verifikasi Dokumen', value: String(verifyCount), icon: CheckCircle2, color: 'text-black' },
    { label: 'Sertifikat', value: String(docCount), icon: Award, color: 'text-black' },
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
              {recentDocuments.length > 0 ? recentDocuments.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-black">{doc.title || doc.file_name}</h3>
                      <p className="text-xs text-gray-600 font-mono mt-1">{doc.document_hash ? doc.document_hash.substring(0, 24) + '...' : '-'}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                      {doc.status === 'verified' ? 'Terverifikasi' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{new Date(doc.registered_at).toLocaleDateString('id-ID')}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">{t.dashboard.noDocuments}</p>
              )}
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
              {recentActivity.length > 0 ? recentActivity.map((activity) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-black">{activity.description}</h3>
                    <span className={`font-bold ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.amount > 0 ? '+' : ''}{activity.amount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{new Date(activity.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">{t.dashboard.noActivity}</p>
              )}
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
