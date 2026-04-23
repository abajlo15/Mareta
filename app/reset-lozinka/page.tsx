'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Lozinka mora imati barem 6 znakova.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess('Lozinka je uspjesno promijenjena. Preusmjeravamo vas na prijavu...');
      setTimeout(() => router.push('/login'), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-soft py-12 px-4">
      <div className="container max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-elegant font-bold mb-2 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          Postavi novu lozinku
        </h1>
        <p className="text-center text-dark-700 mb-8">
          Unesite novu lozinku za svoj račun.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-elegant p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Nova lozinka
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Potvrdi lozinku
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-500 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-elegant"
          >
            {loading ? 'Spremanje...' : 'Spremi novu lozinku'}
          </button>

          <p className="text-center text-sm">
            <Link href="/login" className="text-primary-600 hover:text-primary-500">
              Povratak na prijavu
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
