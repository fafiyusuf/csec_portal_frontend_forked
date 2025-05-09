'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'You don\'t have permission to access this page.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {message}
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
          <Link
            href="/auth/login"
            className="block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
} 