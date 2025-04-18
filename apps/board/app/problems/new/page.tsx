"use client";

import ProblemForm from "@/components/problems/ProblemForm";

export default function NewProblemPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Share a Problem</h1>
      <ProblemForm />
    </div>
  );
}