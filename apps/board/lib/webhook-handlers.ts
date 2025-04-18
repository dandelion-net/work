import { WebhookEvent } from "./webhooks";
import { Problem, Solution, Vote, WeightedVote } from "@prisma/client";

export async function handleProblemCreated(problem: Problem): Promise<void> {
  await dispatchWebhookEvent({
    type: "problem.created",
    data: problem,
  });
}

export async function handleProblemUpdated(problem: Problem): Promise<void> {
  await dispatchWebhookEvent({
    type: "problem.updated",
    data: problem,
  });
}

export async function handleProblemDeleted(problem: Problem): Promise<void> {
  await dispatchWebhookEvent({
    type: "problem.deleted",
    data: problem,
  });
}

export async function handleSolutionCreated(solution: Solution): Promise<void> {
  await dispatchWebhookEvent({
    type: "solution.created",
    data: solution,
  });
}

export async function handleSolutionUpdated(solution: Solution): Promise<void> {
  await dispatchWebhookEvent({
    type: "solution.updated",
    data: solution,
  });
}

export async function handleSolutionDeleted(solution: Solution): Promise<void> {
  await dispatchWebhookEvent({
    type: "solution.deleted",
    data: solution,
  });
}

export async function handleVoteCreated(vote: Vote): Promise<void> {
  await dispatchWebhookEvent({
    type: "vote.created",
    data: vote,
  });
}

export async function handleVoteUpdated(vote: Vote): Promise<void> {
  await dispatchWebhookEvent({
    type: "vote.updated",
    data: vote,
  });
}

export async function handleWeightedVoteCreated(vote: WeightedVote): Promise<void> {
  await dispatchWebhookEvent({
    type: "weightedVote.created",
    data: vote,
  });
}

async function dispatchWebhookEvent(event: Omit<WebhookEvent, "timestamp">) {
  const { dispatchWebhook } = await import("./webhooks");
  await dispatchWebhook({
    ...event,
    timestamp: new Date().toISOString(),
  });
}