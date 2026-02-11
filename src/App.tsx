import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLogin from './pages/AuthLogin';
import AuthRegister from './pages/AuthRegister';
import Dashboard from './pages/Dashboard';
import RegisterDocument from './pages/RegisterDocument';
import VerifyDocument from './pages/VerifyDocument';
import MyDocuments from './pages/MyDocuments';
import Transactions from './pages/Transactions';
import TopUp from './pages/TopUp';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminBlockchain from './pages/AdminBlockchain';
import AdminBanners from './pages/AdminBanners';
import Certificate from './pages/Certificate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthLogin />} />
        <Route path="/register" element={<AuthRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register-doc" element={<RegisterDocument />} />
        <Route path="/verify" element={<VerifyDocument />} />
        <Route path="/documents" element={<MyDocuments />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/topup" element={<TopUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/blockchain" element={<AdminBlockchain />} />
        <Route path="/admin/banners" element={<AdminBanners />} />
        <Route path="/certificate/:id" element={<Certificate />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
