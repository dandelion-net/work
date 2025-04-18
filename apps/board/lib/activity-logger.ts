import { prisma } from "./db";

export type EntityType = "problem" | "solution" | "comment" | "vote" | "weightedVote" | "user";
export type ActionType = 
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "role_change"
  | "vote"
  | "weighted_vote";

interface LogActivityParams {
  action: ActionType;
  entityType: EntityType;
  entityId: string;
  userId: string;
  metadata?: Record<string, any>;
  problemId?: string;
  solutionId?: string;
  commentId?: string;
  voteId?: string;
  weightedVoteId?: string;
}

export async function logActivity({
  action,
  entityType,
  entityId,
  userId,
  metadata,
  problemId,
  solutionId,
  commentId,
  voteId,
  weightedVoteId,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        metadata,
        problemId,
        solutionId,
        commentId,
        voteId,
        weightedVoteId,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}