'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent('/reset-lozinka')}`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess('Poslali smo link za reset lozinke na vas email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-soft py-12 px-4">
      <div className="container max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-elegant font-bold mb-2 text-center bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 text-transparent bg-clip-text">
          Zaboravljena lozinka
        </h1>
        <p className="text-center text-dark-700 mb-8">
          Unesite email i poslat cemo vam link za reset lozinke.
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
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-500 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-elegant"
          >
            {loading ? 'Slanje...' : 'Pošalji link za reset'}
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
