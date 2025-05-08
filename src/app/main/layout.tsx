'use client';
import LoadingSpinner from '@/components/LoadingSpinner';
import Sidebar from '@/components/layouts/Sidebar';
import TopHeader from '@/components/layouts/TopHeader';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
//test
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isInitialized, isAuthenticated, isLoading, initialize } = useUserStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize().finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (!isCheckingAuth && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isCheckingAuth, isLoading, isAuthenticated, router]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileMenuOpen(false);
  };

  if (isCheckingAuth || (!isInitialized && isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-gray-900">
        <LoadingSpinner />
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Initializing application...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 lg:z-0 pointer-events-auto">
        <Sidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 w-full lg:ml-64">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800">
          <TopHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        </div>
        
        {/* Page Content */}
        <main className="p-4 sm:p-6 dark:bg-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}