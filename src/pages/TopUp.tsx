import { useState, useEffect } from 'react';
import { Zap, Check } from 'lucide-react';
import ProtectedLayout from '../components/ProtectedLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TopUp() {
  const { profile, refreshProfile } = useAuth();
  const userName = profile?.full_name || 'User';
  const currentPoints = profile?.points || 0;

  const [pointPrice, setPointPrice] = useState(1000);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const quickOptions = [
    { points: 25, price: 25000 },
    { points: 50, price: 50000 },
    { points: 100, price: 100000 },
    { points: 250, price: 250000 },
    { points: 500, price: 500000 },
    { points: 1000, price: 1000000 },
  ];

  const [selectedPoints, setSelectedPoints] = useState<number | null>(null);
  const [manualPoints, setManualPoints] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'point_price')
        .single();
      if (data) setPointPrice(parseInt(data.value));
    };
    fetchSettings();
  }, []);

  const finalPoints = selectedPoints || (manualPoints ? parseInt(manualPoints) : 0);
  const subtotal = finalPoints * pointPrice;
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const totalPayment = subtotal - discount;

  const handleQuickSelect = (points: number) => {
    setSelectedPoints(points);
    setManualPoints(points.toString());
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualPoints(value);
    setSelectedPoints(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');

    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (!data) {
      setCouponError('Kupon tidak valid atau sudah kadaluarsa');
      setAppliedCoupon(null);
      return;
    }

    if (data.max_uses > 0 && data.used_count >= data.max_uses) {
      setCouponError('Kupon sudah habis digunakan');
      setAppliedCoupon(null);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('Kupon sudah kadaluarsa');
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon({
      code: data.code,
      discount: data.discount_percent,
    });
  };

  const handlePayment = async () => {
    if (!profile || !finalPoints || finalPoints < 25) return;

    setProcessing(true);
    try {
      const newBalance = currentPoints + finalPoints;

      await supabase.from('profiles').update({ points: newBalance }).eq('id', profile.id);

      await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'topup',
        description: `Top-up ${finalPoints} poin`,
        amount: finalPoints,
        balance_after: newBalance,
      });

      // Update coupon usage if applicable
      if (appliedCoupon) {
        await supabase
          .from('coupons')
          .update({ used_count: supabase.rpc ? undefined : 0 })
          .eq('code', appliedCoupon.code);

        // Increment used_count
        const { data: couponData } = await supabase
          .from('coupons')
          .select('used_count')
          .eq('code', appliedCoupon.code)
          .single();

        if (couponData) {
          await supabase
            .from('coupons')
            .update({ used_count: couponData.used_count + 1 })
            .eq('code', appliedCoupon.code);
        }
      }

      await refreshProfile();
      setSuccessMessage(`Berhasil menambahkan ${finalPoints} poin! Saldo baru Anda: ${newBalance} poin`);
      setSelectedPoints(null);
      setManualPoints('');
      setCouponCode('');
      setAppliedCoupon(null);
    } catch (error) {
      console.error('Top-up error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const isValidPoints = finalPoints >= 25;

  return (
    <ProtectedLayout userName={userName} points={profile?.points || 0}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">Top-up Poin</h1>
          <p className="text-gray-600">Tambah saldo poin Anda untuk menggunakan fitur DataCipta</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8">
          {/* Current Balance Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Saldo Poin Saat ini:</span> {profile?.points || 0} poin |
              <span className="font-semibold"> Harga Poin:</span> Rp. {pointPrice.toLocaleString('id-ID')}/poin
            </p>
          </div>

          {/* Quick Selection */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-black" />
              <h2 className="text-lg font-semibold text-black">Pilihan Cepat</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickOptions.map((option) => (
                <button
                  key={option.points}
                  onClick={() => handleQuickSelect(option.points)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedPoints === option.points
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-black hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{option.points} poin</div>
                  <div className="text-sm">{formatCurrency(option.price)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-gray-500 text-sm font-medium">Atau</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Manual Input */}
          <div>
            <label className="flex items-center space-x-2 mb-3">
              <span className="text-black font-semibold">Jumlah Poin</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={manualPoints}
              onChange={handleManualInputChange}
              placeholder="Minimal 25 poin"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
            />
            <p className="text-xs text-gray-500 mt-2">Minimal top-up: 25 poin</p>
          </div>

          {/* Coupon Section */}
          <div>
            <label className="flex items-center space-x-2 mb-3">
              <span className="text-black font-semibold">Kupon Diskon</span>
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                placeholder="Masukan kode kupon"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Apply</span>
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-red-600 mt-2">{couponError}</p>
            )}
            {appliedCoupon && (
              <p className="text-xs text-green-600 mt-2">Kupon &quot;{appliedCoupon.code}&quot; berhasil diterapkan ({appliedCoupon.discount}% diskon)</p>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-3 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Harga per poin</span>
              <span>{formatCurrency(pointPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Diskon</span>
                <span className="text-red-600">- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-lg font-bold text-black border-t border-gray-200 pt-3">
              <span>Total Pembayaran</span>
              <span>{formatCurrency(totalPayment)}</span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={!isValidPoints || processing}
            className="w-full py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>{processing ? 'Memproses...' : 'Bayar Sekarang'}</span>
          </button>
        </div>
      </div>
    </ProtectedLayout>
  );
}
