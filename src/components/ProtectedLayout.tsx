import { ReactNode } from 'react';
import Navbar from './Navbar';

interface ProtectedLayoutProps {
  children: ReactNode;
  userName: string;
  points: number;
  isAdmin?: boolean;
}

export default function ProtectedLayout({
  children,
  userName,
  points,
  isAdmin = false,
}: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar userName={userName} points={points} isAdmin={isAdmin} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
