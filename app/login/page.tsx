'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setIsLogin(true);
    }
  }, [searchParams]);

  const showConfirmMessage = searchParams.get('registered') === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Prijavite se' : 'Registrirajte se'}
          </h2>
        </div>
        {showConfirmMessage && (
          <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-3 rounded-lg text-center text-sm">
            Morate potvrditi svoju email adresu. Provjerite inbox i kliknite na link u poruci koju smo vam poslali.
          </div>
        )}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {isLogin ? <LoginForm /> : <RegisterForm />}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              {isLogin
                ? 'Nemate račun? Registrirajte se'
                : 'Već imate račun? Prijavite se'}
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-600 hover:text-gray-500">
              Povratak na početnu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

