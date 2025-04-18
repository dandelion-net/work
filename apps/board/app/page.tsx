import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Award, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to the Discussion Board
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A place to share problems, find solutions, and engage with a community of problem solvers.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/problems">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Problems
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/problems/new">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Share a Problem
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pt-6">
              <div className="flow-root rounded-lg bg-card px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center rounded-md bg-primary p-3 shadow-lg">
                      <MessageSquare className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium tracking-tight">Share Problems</h3>
                  <p className="mt-5 text-base text-muted-foreground">
                    Post your challenges and get help from the community. Detailed descriptions help others understand and solve your problems.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root rounded-lg bg-card px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center rounded-md bg-primary p-3 shadow-lg">
                      <Users className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium tracking-tight">Community Solutions</h3>
                  <p className="mt-5 text-base text-muted-foreground">
                    Collaborate with others to find the best solutions. Multiple perspectives lead to better outcomes.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root rounded-lg bg-card px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center rounded-md bg-primary p-3 shadow-lg">
                      <Award className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium tracking-tight">Vote and Recognize</h3>
                  <p className="mt-5 text-base text-muted-foreground">
                    Upvote helpful solutions and recognize valuable contributions from community members.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root rounded-lg bg-card px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center rounded-md bg-primary p-3 shadow-lg">
                      <Shield className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium tracking-tight">Moderated Content</h3>
                  <p className="mt-5 text-base text-muted-foreground">
                    Quality content maintained through active moderation. Safe and productive discussions for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}