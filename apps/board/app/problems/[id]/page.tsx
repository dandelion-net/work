"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import VoteButtons from "@/components/voting/VoteButtons";
import SolutionForm from "@/components/solutions/SolutionForm";

interface Problem {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
  solutions: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      name: string;
      email: string;
    };
    _count: {
      votes: number;
    };
  }>;
  _count: {
    votes: number;
    solutions: number;
  };
}

export default function ProblemPage() {
  const params = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${params.id}`);
      if (!response.ok) {
        throw new Error("Problem not found");
      }
      const data = await response.json();
      setProblem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load problem");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-muted-foreground">{error || "Problem not found"}</p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Posted by {problem.author.name || problem.author.email} on{" "}
              {new Date(problem.createdAt).toLocaleDateString()}
            </p>
            <div className="prose max-w-none mb-4">
              <p>{problem.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {problem._count.solutions} solutions
              </span>
              <span className="text-sm text-muted-foreground">
                {problem._count.votes} votes
              </span>
              <span
                className={`text-sm font-medium ${
                  problem.status === "OPEN"
                    ? "text-green-600"
                    : problem.status === "RESOLVED"
                    ? "text-blue-600"
                    : "text-yellow-600"
                }`}
              >
                {problem.status}
              </span>
            </div>
          </div>
          <VoteButtons problemId={problem.id} />
        </div>
      </Card>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Solutions</h2>
        <SolutionForm problemId={problem.id} onSolutionSubmitted={fetchProblem} />

        {problem.solutions.length > 0 ? (
          <div className="space-y-4">
            {problem.solutions.map((solution) => (
              <Card key={solution.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Posted by {solution.author.name || solution.author.email} on{" "}
                      {new Date(solution.createdAt).toLocaleDateString()}
                    </p>
                    <p>{solution.content}</p>
                  </div>
                  <VoteButtons solutionId={solution.id} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No solutions yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}