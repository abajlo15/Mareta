'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function UserMenu() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const loadUserRole = async (authUser: User | null) => {
      setUser(authUser);

      if (!authUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      const adminFromProfile = profile?.role === 'admin';
      const adminFromMetadata =
        (authUser.app_metadata?.role as string) === 'admin';

      setIsAdmin(adminFromProfile || adminFromMetadata);
      setLoading(false);
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      loadUserRole(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const username = user?.email?.includes('@')
    ? user.email.split('@')[0]
    : user?.email ?? 'Korisnik';

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      startTransition(() => {
        router.push('/');
        router.refresh();
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-200 shadow-elegant font-medium"
      >
        Prijava
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-elegant">
          {user.email?.charAt(0).toUpperCase()}
        </div>
      </button>
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium text-gray-900 truncate" title={user.email ?? ''}>
                {username}
              </p>
            </div>
            <Link
              href="/profil"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMenu(false)}
            >
              Moj profil
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMenu(false)}
            >
              Moje narudžbe
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                Na admin panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-wait"
            >
              {logoutLoading ? 'Odjavljivanje...' : 'Odjavi se'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

