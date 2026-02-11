import { useState } from 'react';
import { Menu, X, LogOut, Coins, ChevronDown, Edit, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { t } from '../lib/translations';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.svg';

interface NavbarProps {
  userName: string;
  points: number;
  isAdmin?: boolean;
}

export default function Navbar({ userName, points, isAdmin = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userNavItems = [
    { name: t.nav.dashboard, href: '/dashboard' },
    { name: t.nav.registerDocument, href: '/register-doc' },
    { name: t.nav.verifyDocument, href: '/verify' },
    { name: t.nav.myDocuments, href: '/documents' },
    { name: t.nav.transactions, href: '/transactions' },
  ];

  const adminNavItems = [
    { name: t.nav.adminDashboard, href: '/admin' },
    { name: t.nav.users, href: '/admin/users' },
    { name: t.nav.settings, href: '/admin/settings' },
    { name: t.nav.blockchain, href: '/admin/blockchain' },
    { name: 'Banner Settings', href: '/admin/banners' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/dashboard" className="flex items-center hidden sm:flex">
            <img src={logo} alt="Registri Hak Cipta" className="h-10 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Points and Top Up */}
            {!isAdmin && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <Coins className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-semibold text-black">{points}</span>
                </div>
                <a
                  href="/topup"
                  className="flex items-center space-x-1 bg-black hover:bg-gray-900 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                >
                  <span>+</span>
                  <span>Top Up</span>
                </a>
                <button className="flex items-center justify-center w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* User Profile Dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {getInitials(userName)}
                </div>
                <span className="text-sm font-medium text-black">{userName.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <a
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-black transition"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit Profil</span>
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-black transition border-t border-gray-100 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Keluar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {item.name}
              </a>
            ))}
            <a
              href="/profile"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Edit Profile
            </a>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
