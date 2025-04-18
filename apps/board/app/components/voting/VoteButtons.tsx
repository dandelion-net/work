import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoteButtonsProps {
  problemId?: string;
  solutionId?: string;
  commentId?: string;
  initialVoteValue?: number;
  onVoteChange?: (newValue: number) => void;
}

export default function VoteButtons({
  problemId,
  solutionId,
  commentId,
  initialVoteValue = 0,
  onVoteChange,
}: VoteButtonsProps) {
  const [voteValue, setVoteValue] = useState(initialVoteValue);
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();

  const handleVote = async (value: number) => {
    if (isVoting) return;
    setIsVoting(true);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value,
          problemId,
          solutionId,
          commentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }

      setVoteValue(value);
      onVoteChange?.(value);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={voteValue === 1 ? "text-green-600" : ""}
      >
        <ThumbsUp className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={voteValue === -1 ? "text-red-600" : ""}
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>
    </div>
  );
}