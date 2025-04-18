"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SolutionFormProps {
  problemId: string;
  onSolutionSubmitted?: () => void;
}

export default function SolutionForm({ problemId, onSolutionSubmitted }: SolutionFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/solutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          problemId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit solution");
      }

      setContent("");
      toast({
        title: "Success",
        description: "Solution submitted successfully",
      });
      onSolutionSubmitted?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit solution",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Solution</CardTitle>
        <CardDescription>
          Help solve this problem by sharing your solution with the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="solution"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Your Solution
            </label>
            <Textarea
              id="solution"
              placeholder="Describe your solution in detail..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[150px]"
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Solution"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}