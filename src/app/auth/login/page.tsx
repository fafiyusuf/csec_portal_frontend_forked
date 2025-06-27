'use client';

import LoginForm from '@/components/form/LoginForm';
import { useUserStore } from '@/stores/userStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/button';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, isAuthenticated } = useUserStore();
  const [showTestInfo, setShowTestInfo] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl) {
        // Remove any query parameters from the callback URL
        const cleanUrl = callbackUrl.split('?')[0];
        const decodedUrl = decodeURIComponent(cleanUrl);
        router.replace(decodedUrl);
      } else {
        router.replace('/main/dashboard');
      }
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = async (values: { email: string; password: string; rememberMe: boolean }) => {
    try {
      // Set loading state before login
      if (!isLoading) useUserStore.setState({ isLoading: true });
      const success = await login(values.email, values.password, values.rememberMe);
      
      if (success) {
        toast.success('Login successful! Redirecting...');
        const callbackUrl = searchParams.get('callbackUrl');
        if (callbackUrl) {
          // Remove any query parameters from the callback URL
          const cleanUrl = callbackUrl.split('?')[0];
          const decodedUrl = decodeURIComponent(cleanUrl);
          router.replace(decodedUrl);
        } else {
          router.replace('/main/dashboard');
        }
      } else {
        toast.error(error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(error || 'Login failed');
    } finally {
      // Always reset loading state after login attempt
      useUserStore.setState({ isLoading: false });
    }
  };

  // Prevent flash of login page when authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md dark:border dark:border-gray-700 dark:shadow-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">CSEC ASTU</h1>
            <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300">Welcome 👋</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Please login here</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
      {/* Floating Test Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="lg" variant="default" onClick={() => setShowTestInfo(true)}>
          Test
        </Button>
      </div>
      {/* Modal or Alert for Test Info */}
      {showTestInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white"></h3>
            <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-2">
              <li><b>Member:</b> haibi@g.com</li>
              <li><b> Head:</b> lelomohammed@gmail.com</li>
              <li><b>President:</b> kiyakebe@gmail.com</li>
              <li><b>Password for all:</b> Pass@123</li>
            </ul>
            <Button className="mt-4 w-full" variant="outline" onClick={() => setShowTestInfo(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}