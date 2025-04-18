"use client";

import ProblemList from "@/components/problems/ProblemList";

export default function ProblemsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Browse Problems</h1>
      <ProblemList />
    </div>
  );
}