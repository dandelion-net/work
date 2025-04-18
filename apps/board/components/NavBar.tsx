'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

export default function NavBar() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-2 text-xl font-bold">
              Dandelion Board
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/problems">
              <Button variant="ghost">Browse Problems</Button>
            </Link>
            {isLoading ? (
              <Button disabled>Loading...</Button>
            ) : session ? (
              <>
                <Link href="/problems/new">
                  <Button variant="ghost">Share Problem</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}